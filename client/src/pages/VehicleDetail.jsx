import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Scale, Zap, Clock, Gauge, Compass, ShieldCheck, ArrowRight, Check, AlertCircle } from 'lucide-react';
import RangeRing from '../components/RangeRing';
import VehicleCard, { formatPriceINR } from '../components/VehicleCard';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';

const fallbackVehicleSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600"><rect width="1200" height="600" fill="%230e121a"/><path d="M200 420 C 350 420, 420 280, 600 250 C 780 220, 920 300, 1020 420 Z" fill="none" stroke="%2300f2fe" stroke-width="4" stroke-dasharray="10 8"/><circle cx="350" cy="420" r="60" fill="none" stroke="%2300f2fe" stroke-width="5"/><circle cx="870" cy="420" r="60" fill="none" stroke="%2300f2fe" stroke-width="5"/><text x="600" y="520" fill="%2394a3b8" font-family="sans-serif" font-size="24" text-anchor="middle">AURA VERIFIED VEHICLE</text></svg>`;

const VehicleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const [vehicle, setVehicle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/vehicles/${slug}`)
      .then(async res => {
        if (!res.ok) {
          throw new Error('Vehicle not found.');
        }
        return res.json();
      })
      .then(data => {
        setVehicle(data.vehicle);
        setRelated(data.related || []);
        setActiveImage(data.vehicle.heroImage);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Check if saved
  useEffect(() => {
    if (user && vehicle) {
      fetch('/api/saved-vehicles')
        .then(res => res.json())
        .then(data => {
          if (data.saved) {
            setIsSaved(data.saved.some(item => (item.vehicle?._id || item.vehicle) === vehicle._id));
          }
        })
        .catch(() => {});
    }
  }, [user, vehicle]);

  const handleToggleSave = async () => {
    if (!user) {
      navigate(`/login?redirect=/vehicles/${slug}`);
      return;
    }
    try {
      if (isSaved) {
        const res = await fetch(`/api/saved-vehicles/${vehicle._id}`, { method: 'DELETE' });
        if (res.ok) setIsSaved(false);
      } else {
        const res = await fetch('/api/saved-vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleId: vehicle._id })
        });
        if (res.ok) setIsSaved(true);
      }
    } catch (err) {
      console.warn('Save error:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '3px solid var(--border-medium)',
          borderTopColor: 'var(--accent-cyan)',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--status-error)" style={{ margin: '0 auto 1.5rem' }} />
        <h2>Vehicle Specification Not Found</h2>
        <p style={{ maxWidth: 500, margin: '0.5rem auto 2rem', color: 'var(--text-secondary)' }}>
          The requested vehicle model "{slug}" does not exist or has been removed from our catalog.
        </p>
        <Link to="/vehicles" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Discover
        </Link>
      </div>
    );
  }

  const inCompare = isInCompare(vehicle.slug);

  return (
    <div style={{ padding: '2rem 0 6rem' }}>
      <div className="container">
        {/* Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/vehicles" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} />
            Back to Vehicle Fleet
          </Link>
        </div>

        {/* Hero Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3rem', alignItems: 'start', marginBottom: '4rem' }}>
          {/* Gallery / Image Showcase */}
          <div>
            <div style={{
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-lg)',
              height: 400,
              position: 'relative'
            }}>
              <img
                src={activeImage}
                alt={vehicle.name}
                onError={(e) => { e.target.src = fallbackVehicleSvg; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
                <span className="badge">{vehicle.category}</span>
                <span className="badge badge-outline">{vehicle.driveType}</span>
              </div>
            </div>

            {/* Thumbnail switcher if extra images exist */}
            {(vehicle.exteriorImage || vehicle.interiorImage) && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveImage(vehicle.heroImage)}
                  style={{
                    flex: 1,
                    height: 70,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: activeImage === vehicle.heroImage ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    opacity: activeImage === vehicle.heroImage ? 1 : 0.6
                  }}
                >
                  <img src={vehicle.heroImage} alt="Main view" onError={(e) => { e.target.src = fallbackVehicleSvg; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
                {vehicle.exteriorImage && (
                  <button
                    type="button"
                    onClick={() => setActiveImage(vehicle.exteriorImage)}
                    style={{
                      flex: 1,
                      height: 70,
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: activeImage === vehicle.exteriorImage ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      opacity: activeImage === vehicle.exteriorImage ? 1 : 0.6
                    }}
                  >
                    <img src={vehicle.exteriorImage} alt="Exterior view" onError={(e) => { e.target.src = fallbackVehicleSvg; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                )}
                {vehicle.interiorImage && (
                  <button
                    type="button"
                    onClick={() => setActiveImage(vehicle.interiorImage)}
                    style={{
                      flex: 1,
                      height: 70,
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: activeImage === vehicle.interiorImage ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      opacity: activeImage === vehicle.interiorImage ? 1 : 0.6
                    }}
                  >
                    <img src={vehicle.interiorImage} alt="Interior view" onError={(e) => { e.target.src = fallbackVehicleSvg; }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Core Info & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {vehicle.manufacturer}
              </span>
              <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', margin: '0.2rem 0 0.5rem' }}>
                {vehicle.name}
              </h1>
              {vehicle.tagline && (
                <p style={{ fontSize: '1.05rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  "{vehicle.tagline}"
                </p>
              )}
            </div>

            {/* Price Box */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Ex-Showroom Price
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                {formatPriceINR(vehicle.priceExShowroomINR)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {vehicle.priceLabel}
              </div>
            </div>

            {/* Description */}
            <p style={{ lineHeight: 1.75, color: 'var(--text-secondary)' }}>
              {vehicle.description}
            </p>

            {/* Primary Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem' }}>
              <Link
                to={`/test-drive?vehicle=${vehicle.slug}`}
                className="btn btn-primary btn-lg"
                style={{ flex: 1, minWidth: 200 }}
              >
                Request a Test Drive
                <ArrowRight size={18} />
              </Link>
              <button
                type="button"
                onClick={() => inCompare ? removeFromCompare(vehicle.slug) : addToCompare(vehicle)}
                className="btn btn-secondary"
                style={{
                  borderColor: inCompare ? 'var(--accent-cyan)' : 'var(--border-medium)',
                  color: inCompare ? 'var(--accent-cyan)' : 'var(--text-primary)'
                }}
              >
                {inCompare ? <Check size={16} /> : <Scale size={16} />}
                {inCompare ? 'In Comparison' : 'Add to Compare'}
              </button>
              <button
                type="button"
                onClick={handleToggleSave}
                className="btn btn-secondary"
                style={{
                  borderColor: isSaved ? '#ef4444' : 'var(--border-medium)',
                  color: isSaved ? '#ef4444' : 'var(--text-primary)'
                }}
              >
                <Heart size={16} fill={isSaved ? '#ef4444' : 'none'} />
                {isSaved ? 'In Garage' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Verified Specifications Grid */}
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
            Verified Technical Specifications
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {/* Range */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
              <RangeRing rangeKm={vehicle.rangeKmClaimed} size={74} strokeWidth={6} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {vehicle.rangeLabel}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                  {vehicle.rangeKmClaimed} km
                </div>
              </div>
            </div>

            {/* Battery */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                <Zap size={20} />
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Battery Capacity</span>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {vehicle.batteryKwh !== null ? `${vehicle.batteryKwh} kWh` : 'Not available'}
              </div>
            </div>

            {/* Acceleration */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                <Gauge size={20} />
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>0-100 km/h</span>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {vehicle.acceleration0to100 !== null ? `${vehicle.acceleration0to100} s` : 'Not available'}
              </div>
            </div>

            {/* Fast Charge */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                <Clock size={20} />
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>DC Fast Charge (10-80%)</span>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {vehicle.fastChargeMinutes !== null ? `${vehicle.fastChargeMinutes} mins` : 'Not available'}
              </div>
            </div>

            {/* Power */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Peak Power</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {vehicle.powerBhp !== null ? `${vehicle.powerBhp} bhp` : 'Not available'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Torque: {vehicle.torqueNm !== null ? `${vehicle.torqueNm} Nm` : 'Not available'}
              </div>
            </div>

            {/* Top Speed */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Top Velocity</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {vehicle.topSpeedKmh !== null ? `${vehicle.topSpeedKmh} km/h` : 'Not available'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Drive: {vehicle.driveType}
              </div>
            </div>
          </div>
        </div>

        {/* Dimensions & Cabin Packaging */}
        {vehicle.dimensions && (
          <div className="glass-panel" style={{ padding: '2rem', marginBottom: '4rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.2rem' }}>Physical Dimensions & Packaging</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Length</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{vehicle.dimensions.lengthMm ? `${vehicle.dimensions.lengthMm} mm` : 'Not available'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Width</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{vehicle.dimensions.widthMm ? `${vehicle.dimensions.widthMm} mm` : 'Not available'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Height</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{vehicle.dimensions.heightMm ? `${vehicle.dimensions.heightMm} mm` : 'Not available'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wheelbase</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{vehicle.dimensions.wheelbaseMm ? `${vehicle.dimensions.wheelbaseMm} mm` : 'Not available'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Boot Space</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{vehicle.dimensions.bootSpaceL ? `${vehicle.dimensions.bootSpaceL} Litres` : 'Not available'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Seating Capacity</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{vehicle.seats} Occupants</div>
              </div>
            </div>
          </div>
        )}

        {/* Technology Highlights */}
        {vehicle.features && vehicle.features.length > 0 && (
          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Propulsion & Architecture Highlights</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {vehicle.features.map((feat, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '1.8rem' }}>
                  <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    {feat.title}
                  </div>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verified Data Sources */}
        <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--accent-cyan)" />
            Verified Source Audits
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
            Data for {vehicle.name} has been cross-referenced against the following official references:
          </p>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {vehicle.verifiedSources?.map((src, i) => (
              <li key={i}>{src}</li>
            ))}
          </ul>
        </div>

        {/* Related Vehicles */}
        {related.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Related Electric Models</h2>
            <div className="grid-catalog">
              {related.map(rel => (
                <VehicleCard key={rel._id} vehicle={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetail;
