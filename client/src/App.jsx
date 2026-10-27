import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CommandPalette from './components/CommandPalette';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import Compare from './pages/Compare';
import TestDrive from './pages/TestDrive';
import Auth from './pages/Auth';
import Garage from './pages/Garage';
import VehicleLookup from './pages/VehicleLookup';
import About from './pages/About';
import FindYourAura from './pages/FindYourAura';
import Estimator from './pages/Estimator';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);

  useEffect(() => {
    const handleOpenCustom = () => setCmdPaletteOpen(true);
    window.addEventListener('open-aura-palette', handleOpenCustom);
    return () => window.removeEventListener('open-aura-palette', handleOpenCustom);
  }, []);

  return (
    <>
      <ScrollToTop />
      <Navbar onOpenCommandPalette={() => setCmdPaletteOpen(true)} />
      <CommandPalette isOpen={cmdPaletteOpen} onClose={() => setCmdPaletteOpen(false)} />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:slug" element={<VehicleDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/test-drive" element={<TestDrive />} />
          <Route path="/login" element={<Auth initialMode="login" />} />
          <Route path="/register" element={<Auth initialMode="register" />} />
          <Route
            path="/garage"
            element={
              <ProtectedRoute>
                <Garage />
              </ProtectedRoute>
            }
          />
          <Route path="/vehicle-lookup" element={<VehicleLookup />} />
          <Route path="/about" element={<About />} />
          <Route path="/find-your-aura" element={<FindYourAura />} />
          <Route path="/estimator" element={<Estimator />} />
          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', color: 'var(--accent-cyan)' }}>404</h1>
                <h2>Trajectory Lost</h2>
                <p style={{ maxWidth: 450, margin: '1rem auto 2rem', color: 'var(--text-secondary)' }}>
                  The requested coordinate does not exist in the AURA architecture.
                </p>
                <a href="/" className="btn btn-primary">Return to Base</a>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
