# AURA: Verified Vehicle Data Sources & Verification Audit
**Project:** AURA — Future of Mobility (CA-3)  
**Author:** Chiranshu Somkuwar  
**Database:** MongoDB (`aura.vehicles`)  
**Catalog Status:** 10 Verified Ultra-Luxury & Performance Electric Vehicles on Sale in India  

---

## 1. Verified Catalog Audit (10 Models Currently on Sale in India)

Every vehicle in the AURA catalog has been cross-referenced with official automotive manufacturer portals, Indian homologation bulletins, and ARAI / WLTP test cycles. Core specifications (range with standard, peak power, torque, battery capacity, fast charge times, approximate ex-showroom price, and seating) are verified.

| # | Model | Segment | Ex-Showroom (Approx) | Range & Test Cycle | Battery (kWh) | Power / Torque | 0–100 km/h | 10–80% DC | Seats | Status in India | Verified Sources |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Mercedes-Benz EQS 580 4MATIC** | Luxury Sedan | ₹1.62 Crore | 857 km (ARAI) / 677 km (WLTP) | 107.8 kWh | 516 bhp / 855 Nm | 4.3 s | 31 min (200 kW) | 5 | Active (Locally Assembled Pune) | Mercedes-Benz India, ARAI Homologation Certificate |
| 2 | **Mercedes-Maybach EQS 680 SUV** | Ultra-Luxury SUV | ₹2.25 Crore | 611 km (WLTP) | 122 kWh | 649 bhp / 950 Nm | 4.4 s | 31 min (200 kW) | 4 | Active (Launched Sept 2024) | Mercedes-Benz India, Autocar India |
| 3 | **Mercedes-Benz G-Class Electric (G 580 with EQ Technology)** | Off-Road Luxury SUV | ₹3.00 Crore | 473 km (WLTP) | 116 kWh | 579 bhp / 1,164 Nm | 4.7 s | 32 min (200 kW) | 5 | Active (Launched Jan 2025 CBU) | Mercedes-Benz India, Press Release |
| 4 | **BMW i7 xDrive60** | Luxury Flagship Sedan | ₹2.03 Crore | 625 km (WLTP) | 101.7 kWh | 536 bhp / 745 Nm | 4.7 s | 34 min (195 kW) | 5 | Active (CBU Import) | BMW India Official Technical Specs |
| 5 | **BMW iX xDrive50** | Luxury Crossover/SUV | ₹1.40 Crore | 635 km (WLTP) | 111.5 kWh | 516 bhp / 765 Nm | 4.6 s | 35 min (195 kW) | 5 | Active (CBU Import) | BMW India Official Portal |
| 6 | **Porsche Taycan** | Electric Grand Tourer | ₹1.61 Crore | 504 km (WLTP) | 79.2 kWh | 402 bhp / 345 Nm | 5.4 s | 22.5 min (270 kW 800V) | 4 | Active (CBU Import) | Porsche Centre India Official Specs |
| 7 | **Audi e-tron GT quattro** | Electric Grand Tourer | ₹1.72 Crore | 500 km (WLTP) | 93.4 kWh | 523 bhp / 640 Nm | 4.1 s | 22.5 min (270 kW 800V) | 4 | Active (CBU Import) | Audi India Official Guide |
| 8 | **Rolls-Royce Spectre** | Ultra-Luxury Coupe | ₹7.50 Crore | 530 km (WLTP) | 102 kWh | 577 bhp / 900 Nm | 4.5 s | 34 min (195 kW) | 4 | Active (Launched Jan 2024 CBU) | Rolls-Royce Motor Cars, Autocar India |
| 9 | **Audi Q8 55 e-tron** | Luxury SUV | ₹1.26 Crore | 582 km (WLTP) | 114 kWh | 402 bhp / 664 Nm | 5.6 s | 31 min (170 kW) | 5 | Active (CBU Import) | Audi India Official Portal |
| 10 | **Porsche Macan Electric (Macan 4)** | Performance SUV | ₹1.23 Crore | 613 km (WLTP) | 100 kWh | 402 bhp / 650 Nm | 5.2 s | 21 min (270 kW 800V) | 5 | Active (Launched Early 2024 CBU) | Porsche Centre India, ARAI/WLTP Data |

---

## 2. On-Sale Status & Backup Models Audit

All 10 primary requested models have been verified as **currently officially launched and available for customer ordering in India**. Therefore, no model needed to be replaced.

### Pre-Approved Backups (Held on Standby):
In the event any model's supply chain or homologation is suspended, the following replacements were vetted and held in reserve:
1. **Mercedes-Benz EQS SUV** (Verified backup for G 580 or Maybach EQS SUV)
2. **Mercedes-Benz EQE SUV** (Verified backup for Q8 e-tron / BMW iX)
3. **Mercedes-AMG EQS 53 4MATIC+** (Verified backup for Porsche Taycan / Audi e-tron GT)
4. **BMW i5 M60 xDrive** (Verified backup for BMW i7 / e-tron GT)
5. **BMW i4 eDrive40** (Verified backup for Macan Electric)
6. **BMW i7 M70 xDrive** (Verified backup for Rolls-Royce Spectre)
7. **Audi Q8 Sportback e-tron** (Verified backup for Audi Q8 e-tron)
8. **Audi RS e-tron GT** (Verified backup for Porsche Taycan)
9. **Porsche Cayenne Electric** (Unreleased global prototype — not eligible for active catalog)
10. **Mercedes-Benz CLA Electric** (Unreleased concept — not eligible for active catalog)

---

## 3. Data Integrity Principles
1. **Range Labelling:** The Mercedes-Benz EQS 580 is certified under the Automotive Research Association of India (ARAI) test standard (857 km). Other CBU models are labelled under the Worldwide Harmonised Light Vehicles Test Procedure (WLTP).
2. **Ex-Showroom Price Labelling:** All prices reflect approximate ex-showroom India figures and carry the mandatory disclaimer: *"ex-showroom, approximate, verify with manufacturer"*.
3. **Zero Placeholder Policy:** No specification field is invented. Where exact dimensions or boot volume differ by option pack, the baseline verified value is maintained.
