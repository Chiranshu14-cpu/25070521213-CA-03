import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, BatteryCharging, Gauge, Sparkles, Scale, Compass, CheckCircle2, ChevronDown } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [featuredVehicles, setFeaturedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());

  // Cursor follow light on hero
  const heroRef = useRef(null);
  const [spotlightPos, setSpotlightPos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    // Fetch featured vehicles
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        if (data.vehicles) {
          // Take top 3 or featured
          const featured = data.vehicles.filter(v => v.isFeatured);
          setFeaturedVehicles(featured.length > 0 ? featured : data.vehicles.slice(0, 3));
        }
      })
      .catch(err => console.warn('Featured vehicle load error:', err))
      .finally(() => setLoading(false));

    // Fetch saved vehicles if user is logged in
    if (user) {
      fetch('/api/saved-vehicles')
        .then(res => res.json())
        .then(data => {
          if (data.saved) {
            setSavedIds(new Set(data.saved.map(item => item.vehicle?._id || item.vehicle)));
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    setSpotlightPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleToggleSave = async (vehicle) => {
    const isCurrentlySaved = savedIds.has(vehicle._id);
    try {
      if (isCurrentlySaved) {
        const res = await fetch(`/api/saved-vehicles/${vehicle._id}`, { method: 'DELETE' });
        if (res.ok) {
          setSavedIds(prev => {
            const next = new Set(prev);
            next.delete(vehicle._id);
            return next;
          });
        }
      } else {
        const res = await fetch('/api/saved-vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleId: vehicle._id })
        });
        if (res.ok) {
          setSavedIds(prev => new Set(prev).add(vehicle._id));
        }
      }
    } catch (err) {
      console.warn('Toggle save failed:', err);
    }
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="hero-spotlight-container"
        style={{
          minHeight: 'calc(100vh - 72px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          padding: '4rem 0 3rem',
          backgroundColor: 'var(--bg-primary)',
          backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 242, 254, 0.12), transparent)'
        }}
      >
        {/* Soft Cursor Following Spotlight */}
        <div
          className="hero-spotlight"
          style={{
            left: `${spotlightPos.x}px`,
            top: `${spotlightPos.y}px`
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
            {/* Wordmark Pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span className="badge">
                <Sparkles size={13} />
                Next-Gen Automotive Discovery
              </span>
            </div>

            {/* Main Editorial Headline */}
            <h1 style={{ marginBottom: '1.4rem' }}>
              The future moves <span style={{ color: 'var(--accent-cyan)' }}>differently.</span>
            </h1>

            {/* Concise Electric Mobility Statement */}
            <p style={{ fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)', lineHeight: 1.7, maxWidth: 680, margin: '0 auto 2.5rem', color: 'var(--text-secondary)' }}>
              Explore the pinnacle of verified electric propulsion. Compare real-world ranges, analyze 800V charging architectures, and find the precise vehicle engineered for your journey.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
              <Link to="/vehicles" className="btn btn-primary btn-lg">
                Explore the Collection
                <ArrowRight size={18} />
              </Link>
              <Link to="/find-your-aura" className="btn btn-secondary btn-lg">
                <Sparkles size={18} color="var(--accent-cyan)" />
                Find Your AURA
              </Link>
            </div>
          </div>

          {/* Hero Vehicle Display Image with Cinematic Reflection */}
          <div style={{ marginTop: '3.5rem', position: 'relative', maxWidth: 1040, marginInline: 'auto' }}>
            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg), var(--shadow-cyan)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-secondary)',
              position: 'relative'
            }}>
              <img
                src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1600&q=85"
                alt="AURA Flagship Electric GT"
                style={{ width: '100%', height: 'auto', maxHeight: 520, objectFit: 'cover', display: 'block' }}
                loading="eager"
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(7, 8, 10, 0.95) 0%, rgba(7, 8, 10, 0.2) 50%, transparent 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '2.5rem'
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', gap: '1.5rem' }}>
                  <div>
                    <span className="badge" style={{ marginBottom: '0.5rem' }}>Flagship Architecture</span>
                    <h3 style={{ fontSize: '1.8rem', color: '#ffffff', margin: 0 }}>
                      Porsche Taycan Turbo GT
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0.3rem 0 0' }}>
                      800V Performance Architecture • 0-100 in 2.2s • 270 kW Ultra-Rapid DC
                    </p>
                  </div>
                  <Link to="/vehicles/porsche-taycan" className="btn btn-primary btn-sm">
                    Inspect Architecture <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
              <a
                href="#catalog-preview"
                aria-label="Scroll down to featured collection"
                style={{
                  color: 'var(--text-muted)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.75rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase'
                }}
              >
                <span>Scroll to Discover</span>
                <ChevronDown size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS & ENGINEERING HIGHLIGHTS STRIP */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '2.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>
                708 <span style={{ fontSize: '1.1rem' }}>KM</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Maximum Verified Claimed Range
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                18 <span style={{ fontSize: '1.1rem' }}>MIN</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Ultra-Rapid 10-80% DC Charging
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>
                100%
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Verified Official ARAI / OEM Benchmarks
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                ₹0
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Zero Emissions Tailpipe Footprint
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED COLLECTION PREVIEW */}
      <section id="catalog-preview" style={{ padding: '6rem 0', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', gap: '1.5rem' }}>
            <div>
              <span className="badge" style={{ marginBottom: '0.6rem' }}>Curated Portfolio</span>
              <h2>Featured Electric Vehicles</h2>
              <p style={{ maxWidth: 540, marginTop: '0.5rem' }}>
                Inspected against official ARAI and manufacturer benchmarks. Explore verified prices in ₹ and real-world performance.
              </p>
            </div>
            <Link to="/vehicles" className="btn btn-secondary">
              View Full 7-Vehicle Catalog <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading verified vehicles from MongoDB...
            </div>
          ) : (
            <div className="grid-catalog">
              {featuredVehicles.map(vehicle => (
                <VehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                  isSaved={savedIds.has(vehicle._id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. TECHNOLOGY & INNOVATION SHOWCASE */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 4rem' }}>
            <span className="badge" style={{ marginBottom: '0.6rem' }}>Core Innovation</span>
            <h2>Architectures Reshaping Mobility</h2>
            <p style={{ marginTop: '0.5rem' }}>
              How next-generation electric vehicles deliver higher thermodynamic efficiency and unprecedented charging speeds.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--accent-cyan-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                <BatteryCharging size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem' }}>800-Volt Charging</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Doubling system voltage from 400V to 800V reduces electric resistance losses, allowing sustained DC charging speeds of up to 350 kW and replenishing 100 km of range in under 5 minutes.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--accent-cyan-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                <Shield size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem' }}>Cell-to-Body Rigidity</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Integrating the battery pack directly as the structural floor panel elevates torsional stiffness above 40,000 Nm/degree while lowering the center of gravity for sports car handling.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--accent-cyan-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)' }}>
                <Gauge size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem' }}>Instant Vectoring</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Dual-motor electric all-wheel drive redistributes torque between axles in milliseconds, guaranteeing surgical traction in wet monsoonal conditions without mechanical differentials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SIGNATURE FEATURE TEASER: FIND YOUR AURA */}
      <section style={{
        padding: '6rem 0',
        backgroundColor: 'var(--bg-primary)',
        backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(0, 242, 254, 0.08), transparent 60%)'
      }}>
        <div className="container">
          <div className="glass-panel-elevated" style={{ padding: '3.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span className="badge" style={{ marginBottom: '0.75rem' }}>Signature Algorithm</span>
              <h2 style={{ fontSize: '2.4rem', marginBottom: '1rem' }}>
                Unsure which EV fits your routine?
              </h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                Take our 5-question dynamic match engine. We analyze your commute distance, charging access, and seating requirements against verified MongoDB specifications with 100% transparent scoring.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={18} color="var(--accent-cyan)" />
                  <span>No marketing bias — weighted mathematical calculation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={18} color="var(--accent-cyan)" />
                  <span>Personalized rationale and match percentage for each vehicle</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={18} color="var(--accent-cyan)" />
                  <span>Stores seamlessly to your My Garage when logged in</span>
                </div>
              </div>
              <Link to="/find-your-aura" className="btn btn-primary btn-lg">
                <Sparkles size={18} />
                Launch "Find Your AURA"
              </Link>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-medium)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem'
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Live Scoring Preview
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <span>Commute Suitability (Range Buffer)</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>30% Weight</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <span>Segment Budget Alignment</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>25% Weight</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <span>Performance & Acceleration</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>15% Weight</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <span>Cabin Space & Boot Capacity</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>15% Weight</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>DC Fast Charging Speed</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>15% Weight</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COMPARISON & ESTIMATOR STRIP */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Compare Teaser */}
            <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <Scale size={32} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
                <h3>Side-by-Side Comparison</h3>
                <p style={{ marginTop: '0.6rem', fontSize: '0.92rem' }}>
                  Evaluate battery capacities, boot space, 0-100 sprints, and prices. Features a dynamic Recharts Radar Chart mapping multidimensional performance.
                </p>
              </div>
              <Link to="/compare" className="btn btn-secondary" style={{ marginTop: '1.5rem', alignSelf: 'flex-start' }}>
                Open Comparison Matrix <ArrowRight size={15} />
              </Link>
            </div>

            {/* Estimator Teaser */}
            <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <Zap size={32} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
                <h3>Cost & Trip Estimator</h3>
                <p style={{ marginTop: '0.6rem', fontSize: '0.92rem' }}>
                  Model real-world road trips with custom electricity and petrol tariffs. View single-charge feasibility, charging stops, and yearly CO₂ offsets.
                </p>
              </div>
              <Link to="/estimator" className="btn btn-secondary" style={{ marginTop: '1.5rem', alignSelf: 'flex-start' }}>
                Calculate Running Costs <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section style={{ padding: '6rem 0', textAlign: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container-narrow">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Ready to test-drive tomorrow?
          </h2>
          <p style={{ maxWidth: 580, margin: '0 auto 2.5rem', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
            Schedule an experiential test drive inquiry with our verified partner specialists. Inspect high-voltage mobility in person.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/test-drive" className="btn btn-primary btn-lg">
              Request a Test Drive
              <ArrowRight size={18} />
            </Link>
            <Link to="/vehicles" className="btn btn-secondary btn-lg">
              Explore All 7 Vehicles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
