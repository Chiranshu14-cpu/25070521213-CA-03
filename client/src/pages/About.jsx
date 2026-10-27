import React from 'react';
import { ShieldCheck, Cpu, Code2, Database, Globe, CheckCircle2, UserCheck, Layers } from 'lucide-react';

const About = () => {
  return (
    <div style={{ padding: '3rem 0 6rem' }}>
      <div className="container-narrow">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge" style={{ marginBottom: '0.6rem' }}>Academic Project</span>
          <h1 style={{ marginBottom: '0.8rem' }}>About AURA: Future of Mobility</h1>
          <p style={{ maxWidth: 650, margin: '0 auto', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
            An engineering exploration into verified automotive discovery, cinematic user interfaces, and full-stack telemetry.
          </p>
        </div>

        {/* Primary Project Disclaimer Card */}
        <div className="glass-panel" style={{ padding: '2rem', borderColor: 'var(--accent-cyan)', marginBottom: '3rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.8rem' }}>
            <UserCheck size={24} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Academic Project Declaration</h3>
          </div>
          <p style={{ lineHeight: 1.7, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            <strong>AURA: Future of Mobility</strong> is developed by <strong>Chiranshu Somkuwar</strong> as an end-semester project (Continuous Assessment CA-3).
            It is an educational full-stack demonstration and not an official manufacturer, licensed dealership, or commercial booking platform.
            All vehicle technical figures (ranges, acceleration, charging speeds) represent official ARAI / manufacturer publication benchmarks.
          </p>
        </div>

        {/* Core Vision & Objectives */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.8rem' }}>
            <div style={{ color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
              <ShieldCheck size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Verified Truth in Data</h3>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
              Unlike generic templates that invent user reviews and arbitrary metrics, every vehicle specification in AURA is sourced from verified engineering certificates and labeled accordingly.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.8rem' }}>
            <div style={{ color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
              <Cpu size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Algorithmic Discovery</h3>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
              Signature feature "Find Your AURA" uses transparent weighted linear scoring across range buffers, budget constraints, and charging infrastructure readiness rather than black-box recommendations.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '1.8rem' }}>
            <div style={{ color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
              <Globe size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Government API Integration</h3>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6 }}>
              Direct REST integration with the official United States Department of Transportation NHTSA vPIC database, providing real-time 17-character VIN decoding with graceful circuit-breaking.
            </p>
          </div>
        </div>

        {/* Technology Stack Matrix */}
        <div className="glass-panel-elevated" style={{ padding: '2.5rem', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={22} color="var(--accent-cyan)" />
            Engineering Stack & Architecture
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div>
              <h4 style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Frontend</h4>
              <ul style={{ listStyle: 'none', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <li>• React 18 & Vite Bundler</li>
                <li>• React Router DOM 6</li>
                <li>• Recharts (Radar Visualizations)</li>
                <li>• Lucide React High-Tech Icons</li>
                <li>• Bespoke CSS Design System</li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Backend API</h4>
              <ul style={{ listStyle: 'none', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <li>• Node.js & Express.js REST API</li>
                <li>• Helmet Security Headers</li>
                <li>• Express Rate Limiting</li>
                <li>• HttpOnly JWT Cookie Authentication</li>
                <li>• Axios with Timeout Fallbacks</li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Persistence & Testing</h4>
              <ul style={{ listStyle: 'none', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <li>• MongoDB (5 collections)</li>
                <li>• Mongoose ODM</li>
                <li>• Jest & Supertest Integration Tests</li>
                <li>• Idempotent Data Seeding</li>
                <li>• MongoDB Compass Ready</li>
              </ul>
            </div>
          </div>
        </div>

        {/* viva points checklist */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Key Architectural Highlights for Viva</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={16} color="var(--accent-cyan)" />
              <span>Full separation of concerns: Vite dev proxy routes <code>/api</code> to Express, protecting backend secrets.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={16} color="var(--accent-cyan)" />
              <span>Passwords stored strictly as salted bcrypt hashes; unauthenticated attempts blocked by middleware.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={16} color="var(--accent-cyan)" />
              <span>Compound index on <code>(user, vehicle)</code> prevents duplicate garage records at the database level.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={16} color="var(--accent-cyan)" />
              <span>Graceful failure isolation: external NHTSA API downtime does not crash the core application.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
