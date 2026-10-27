# AURA: Future of Mobility — Comprehensive Viva & Technical Notes
**Author:** Chiranshu Somkuwar  
**Project:** Continuous Assessment 3 (CA-3) / End-Semester Project  
**Tech Stack:** React 18 + Vite, Node.js + Express, MongoDB + Mongoose, JWT + HttpOnly Cookies, Recharts, NHTSA vPIC REST API  

---

## 1. Directory Structure & Key Files

```
25070521213-CA-3 FLEXI/
│
├── client/                     # Frontend Application (React 18 + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI & Core Widgets
│   │   │   ├── Navbar.jsx      # Sticky glassmorphism header, search shortcut, theme toggle, auth links
│   │   │   ├── Footer.jsx      # Academic disclosure, sitemap, legal & data source attributions
│   │   │   ├── RangeRing.jsx   # Bespoke animated SVG ring showing vehicle range vs catalog maximum (708 km)
│   │   │   ├── VehicleCard.jsx # Premium automotive card with verified specs, price in ₹, compare/save actions
│   │   │   ├── CommandPalette.jsx # Ctrl+K universal quick jump to any vehicle or page
│   │   │   └── ProtectedRoute.jsx # Session security guard protecting /garage route
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # Global user session management (login, register, logout, me)
│   │   │   ├── CompareContext.jsx # LocalStorage persistence for up to 3 vehicles in comparison matrix
│   │   │   └── ThemeContext.jsx   # Dark obsidian / light titanium theme switcher persisted in localStorage
│   │   ├── pages/              # 11 Dedicated Pages
│   │   │   ├── Home.jsx           # Cinematic hero with cursor-following radial spotlight, stats, tech highlights
│   │   │   ├── Vehicles.jsx       # Curated 7-vehicle verified fleet with search, filters, and sort options
│   │   │   ├── VehicleDetail.jsx  # Reusable detailed specification matrix, 800V charging, dimensions, sources
│   │   │   ├── Compare.jsx        # Side-by-side spec comparison table + Recharts Radar Chart
│   │   │   ├── TestDrive.jsx      # Validated booking inquiry form submitting to MongoDB
│   │   │   ├── Auth.jsx           # Unified registration & login with client/server validation
│   │   │   ├── Garage.jsx         # User dashboard: saved fleet, test-drive inquiries, quiz match history
│   │   │   ├── VehicleLookup.jsx  # Official US NHTSA vPIC VIN decoder & model search
│   │   │   ├── About.jsx          # Academic concept, architecture breakdown, student project notice
│   │   │   ├── FindYourAura.jsx   # Signature Feature A: 5-question weighted recommendation engine
│   │   │   └── Estimator.jsx      # Signature Feature B: Cost, road trip charging feasibility, & CO2 offset
│   │   ├── App.jsx             # React Router 6 routing configuration & scroll-to-top handler
│   │   ├── main.jsx            # React root DOM hydration with wrapped Context Providers
│   │   └── index.css           # Custom CSS design system with Electric Cyan (#00F2FE) & dark mode tokens
│   ├── vite.config.js          # Vite config proxying /api requests to localhost:5000
│   └── package.json            # Client dependencies (React, Lucide, Recharts)
│
├── server/                     # Backend REST API (Node.js + Express + MongoDB)
│   ├── models/                 # Mongoose Data Schemas
│   │   ├── User.js             # User accounts, email uniqueness, bcrypt password hashing pre-save hook
│   │   ├── Vehicle.js          # Verified EV specifications, ARAI range, 800V metadata, approximate prices
│   │   ├── SavedVehicle.js     # User-Vehicle relation with compound unique index preventing duplicates
│   │   ├── TestDriveRequest.js # Test drive inquiries with status (pending, contacted, cancelled)
│   │   └── QuizResult.js       # User quiz match results with rankings, scores, and custom rationales
│   ├── routes/                 # Express Route Handlers
│   │   ├── auth.js             # Register, login, logout, me with HttpOnly cookie handling
│   │   ├── vehicles.js         # Curated catalog retrieval with regex search and filter criteria
│   │   ├── savedVehicles.js    # Protected CRUD for user saved fleet with ownership checks
│   │   ├── testDrives.js       # Test drive creation and cancellation with ownership guards
│   │   ├── lookup.js           # NHTSA vPIC proxy with 10-minute in-memory caching and timeout handling
│   │   ├── quiz.js             # Weighted scoring match algorithm over real MongoDB vehicle records
│   │   └── estimator.js        # Mathematical cost and highway charging calculation endpoint
│   ├── middleware/
│   │   └── auth.js             # requireAuth (mandatory) & optionalAuth (guest-friendly) token verifiers
│   ├── tests/
│   │   └── api.test.js         # 8 Jest + Supertest integration tests covering all critical auth & DB flows
│   ├── seed.js                 # Idempotent upsert script seeding the 7 verified Indian EV models
│   ├── server.js               # Express application entry, Helmet headers, CORS, rate limiting, MongoDB connection
│   └── package.json            # Backend dependencies (Express, Mongoose, JWT, bcryptjs, Jest, Supertest)
│
└── docs/                       # Academic Documentation
    └── VIVA_NOTES.md           # This document
```

---

## 2. End-to-End Authentication Architecture

### How Password Hashing Works:
1. When a user submits registration details, the plain-text password is sent over POST to `/api/auth/register`.
2. In `User.js`, a Mongoose `pre('save')` hook intercepts the operation.
3. If the password was modified, it generates a salt with `bcrypt.genSalt(10)` and hashes the password via `bcrypt.hash(password, salt)`.
4. Plain-text passwords never touch the database. The `toJSON` method strips the password hash before sending the user object back.

### Session Management & HttpOnly Cookies:
1. Upon successful registration or login, the server signs a JSON Web Token (JWT) using `process.env.JWT_SECRET` with user payload `{ id, email, displayName }` expiring in 7 days.
2. The server attaches this token in an **`HttpOnly`** cookie named `token`:
   ```javascript
   res.cookie('token', token, {
     expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
     httpOnly: true, // Prevents JavaScript access (XSS mitigation)
     secure: process.env.NODE_ENV === 'production',
     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
   });
   ```
3. Because the cookie is `HttpOnly`, malicious scripts injected on the client cannot steal the authentication token.
4. On every subsequent request, the browser automatically transmits the cookie. The `requireAuth` middleware verifies the token and attaches `req.user`.

---

## 3. MongoDB Schema Design & Relationships

### Why MongoDB?
- Electric vehicle specifications often feature hierarchical nested properties (e.g., dimensions `lengthMm`, `widthMm`, `bootSpaceL`, and varied technology feature lists).
- MongoDB's BSON document model allows flexible schemas while enforcing strict validation rules via Mongoose.

### Collections & Entity Relationship Overview:
1. **`users`**: Master user credentials and display names.
2. **`vehicles`**: The single source of truth for all verified specifications, indexed uniquely by `slug`.
3. **`savedVehicles`**: A join collection with `user: ObjectId` referencing `User` and `vehicle: ObjectId` referencing `Vehicle`. A **compound unique index** `{ user: 1, vehicle: 1 }` prevents duplicate saves at the storage level.
4. **`testDriveRequests`**: Represents inquiries submitted by users. If logged in, references `user: ObjectId`. References `vehicle: ObjectId`. Status is strictly enumerated: `'pending' | 'contacted' | 'cancelled'`.
5. **`quizResults`**: Preserves user quiz submissions, storing the exact questions answered alongside the ranked vehicle match array.

---

## 4. Frontend-to-Backend Communication

### Vite Proxy Architecture:
In development, the React frontend runs on port `5173` and Express runs on port `5000`. To prevent CORS cross-origin cookie restrictions:
- In `client/vite.config.js`:
  ```javascript
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
  ```
- The browser sends requests to `http://localhost:5173/api/...`. Vite forwards these to `http://localhost:5000/api/...` behind the scenes. This treats all API calls as first-party requests.

---

## 5. External NHTSA vPIC Integration & Circuit Breaking

- **Endpoint**: `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{VIN}?format=json`
- **Proxy Service**: Handled in `server/routes/lookup.js` with a 7000ms timeout.
- **In-Memory Cache**: Responses are cached in a JavaScript `Map` with a 10-minute TTL to throttle repeated requests and accelerate response times.
- **Failure Isolation**: If NHTSA is down, slow, or returning errors, the Express route intercepts the Axios error and returns a clean `502 Bad Gateway` with a user-friendly message. The rest of the AURA platform (catalog, compare, garage, quiz) continues running with 0 downtime.

---

## 6. Mathematical Formulas for Signature Features

### Signature Feature A: "Find Your AURA" Match Algorithm
- **Weight Allocation**:
  - Base weights: Range (30%), Budget (25%), Performance (15%), Practicality/Space (15%), Charging (15%).
  - If the user selects a top priority (e.g., Range), that weight dynamically expands to 45% while maintaining normalized proportionality.
- **Formula**:
  $$\text{Match Percentage} = \text{round}\left(\frac{\sum (W_i \times S_i)}{\sum W_{\text{evaluated}}} \times 100\right)\%$$
  where $S_i \in [0, 1]$ represents the metric score.
- **Missing Field Handling**: If a specification (e.g., fast-charge time) is unverified or null for a vehicle, that weight $W_i$ is completely removed from the denominator, ensuring no vehicle is unfairly penalized for missing data.

### Signature Feature B: Cost & Range Estimator Formulas
- **Estimated Real-World Range**:
  $$R_{\text{real}} = \text{ClaimedRange} \times \text{RangeFactor} \quad (\text{default factor: } 0.82)$$
- **Charging Stops Required**:
  $$\text{Stops} = \begin{cases} 0 & \text{if } D_{\text{trip}} \le R_{\text{real}} \\ \lceil (D_{\text{trip}} - R_{\text{real}}) \div (R_{\text{real}} \times 0.75) \rceil & \text{if } D_{\text{trip}} > R_{\text{real}} \end{cases}$$
- **Annual Running Costs (in ₹)**:
  - $\text{EV Annual Cost} = \left(\frac{\text{Yearly km}}{100}\right) \times \text{EV kWh/100km} \times \text{Electricity Tariff (₹/kWh)}$
  - $\text{Petrol Annual Cost} = \left(\frac{\text{Yearly km}}{\text{Petrol Mileage (km/L)}}\right) \times \text{Petrol Price (₹/L)}$
  - $\text{Annual Fuel Savings} = \text{Petrol Annual Cost} - \text{EV Annual Cost}$
- **CO₂ Footprint Mitigation**:
  - Indian CEA Grid average factor: $\approx 0.71 \text{ kg CO}_2 / \text{kWh}$
  - Petrol combustion factor: $\approx 2.31 \text{ kg CO}_2 / \text{L}$
  - Net Avoided Carbon: $\text{Petrol CO}_2 - \text{EV CO}_2$ (kg CO₂ / year)
  - Equivalent Trees: $\approx \text{Net Avoided Carbon} \div 22 \text{ kg}$ (absorption per mature tree per year).

---

## 7. Common Examiner Viva Questions & Precise Answers

**Q1: Why did you choose HttpOnly cookies instead of storing JWT in localStorage?**  
*Answer:* Storing JWTs in `localStorage` makes them accessible to any JavaScript executing in the browser, leaving the session vulnerable to Cross-Site Scripting (XSS) attacks. `HttpOnly` cookies cannot be accessed or read by client-side scripts, protecting the session from token theft.

**Q2: How does your seed script ensure idempotency?**  
*Answer:* The seed script uses Mongoose's `findOneAndUpdate` with `{ upsert: true }` keyed by the unique vehicle `slug`. If the vehicle exists, its technical attributes are updated; if not, it is created. It never calls `deleteMany({})`, ensuring existing user accounts, saved vehicles, and test-drive inquiries are never destroyed.

**Q3: How does the comparison radar chart handle different units of measurement?**  
*Answer:* Acceleration is measured in seconds, range in kilometers, and battery in kWh. Passing raw numbers would skew the radar chart. We normalize all values onto a uniform 0–100 index before passing them to Recharts, using inverted scales where lower is better (e.g., 0-100 acceleration sprint and DC charging minutes).

**Q4: What happens if an external image link fails to load?**  
*Answer:* Every image tag features an `onError` fallback handler that replaces broken remote images with an inline SVG automotive blueprint graphic. The grid layout and cards remain intact.

**Q5: How do you enforce ownership when a user deletes a saved vehicle?**  
*Answer:* In `server/routes/savedVehicles.js`, the delete handler extracts the authenticated user ID directly from `req.user.id` (decoded from the verified JWT) and queries `{ _id: id, user: req.user.id }`. A user cannot pass another user's ID or delete another user's records.
