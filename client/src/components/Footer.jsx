import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      marginTop: 'auto',
      backgroundColor: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '4rem 0 2rem'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          paddingBottom: '3rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {/* Brand Col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--accent-cyan), #007094)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#07080a',
                fontWeight: 900,
                fontSize: '0.9rem',
                fontFamily: 'var(--font-display)'
              }}>
                A
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
                AURA
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A high-precision discovery platform for next-generation electric mobility, engineered with verified engineering benchmarks and dynamic telemetry.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
              <Cpu size={14} />
              <span>Full-Stack CA-3 Academic Project</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Discovery
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li><Link to="/vehicles" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}>All EV Collection</Link></li>
              <li><Link to="/compare" style={{ color: 'var(--text-secondary)' }}>Compare Matrix</Link></li>
              <li><Link to="/find-your-aura" style={{ color: 'var(--accent-cyan)' }}>Find Your AURA (Quiz)</Link></li>
              <li><Link to="/estimator" style={{ color: 'var(--text-secondary)' }}>Cost & Range Estimator</Link></li>
              <li><Link to="/test-drive" style={{ color: 'var(--text-secondary)' }}>Test Drive Inquiry</Link></li>
            </ul>
          </div>

          {/* Technical Integrations */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Architecture
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <li><Link to="/vehicle-lookup" style={{ color: 'var(--text-secondary)' }}>NHTSA vPIC API</Link></li>
              <li><Link to="/about" style={{ color: 'var(--text-secondary)' }}>Engineering Stack</Link></li>
              <li><Link to="/garage" style={{ color: 'var(--text-secondary)' }}>MongoDB User Garage</Link></li>
              <li><a href="https://vpic.nhtsa.dot.gov/api/" target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>US DOT vPIC Portal <ArrowUpRight size={12} /></a></li>
            </ul>
          </div>

          {/* Academic Transparency Note */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Transparency
            </h4>
            <div style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.55
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.4rem' }}>
                <ShieldCheck size={14} color="var(--accent-cyan)" />
                Project Disclosure
              </div>
              Student project developed by <strong>Chiranshu Somkuwar</strong>. Not affiliated with any automotive OEM. Specifications reflect official ARAI certificates and manufacturer releases.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} AURA: Future of Mobility. Designed & Built by Chiranshu Somkuwar.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>React + Node.js + MongoDB</span>
            <span>REST API Verified</span>
            <span>Theme Toggle Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
