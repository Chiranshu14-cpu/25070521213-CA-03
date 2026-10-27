import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Scale, Zap, Clock, Gauge, ArrowUpRight, Check } from 'lucide-react';
import RangeRing from './RangeRing';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';

// Clean SVG Fallback for vehicles if external image is delayed or blocked
const fallbackVehicleSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="%230e121a"/><path d="M120 310 C 220 310, 260 210, 390 190 C 520 170, 620 220, 690 310 Z" fill="none" stroke="%2300f2fe" stroke-width="3" stroke-dasharray="8 6"/><circle cx="230" cy="310" r="45" fill="none" stroke="%2300f2fe" stroke-width="4"/><circle cx="580" cy="310" r="45" fill="none" stroke="%2300f2fe" stroke-width="4"/><text x="400" y="380" fill="%2394a3b8" font-family="sans-serif" font-size="18" text-anchor="middle">AURA VERIFIED VEHICLE</text></svg>`;

export const formatPriceINR = (num) => {
  if (!num) return 'Price on inquiry';
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} Lakh`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
};

const VehicleCard = ({ vehicle, isSaved = false, onToggleSave }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const [imgSrc, setImgSrc] = useState(vehicle.heroImage);
  const [saveLoading, setSaveLoading] = useState(false);

  const inCompare = isInCompare(vehicle.slug);

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(vehicle.slug);
    } else {
      addToCompare(vehicle);
    }
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login?redirect=/vehicles');
      return;
    }
    if (onToggleSave) {
      setSaveLoading(true);
      await onToggleSave(vehicle);
      setSaveLoading(false);
    }
  };

  return (
    <article
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Vehicle Image Banner */}
      <div style={{ position: 'relative', height: 210, width: '100%', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
        <img
          src={imgSrc}
          alt={vehicle.name}
          onError={() => setImgSrc(fallbackVehicleSvg)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1.0)'; }}
          loading="lazy"
        />

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, zIndex: 2 }}>
          <span className="badge">
            {vehicle.category}
          </span>
          {vehicle.isFeatured && (
            <span className="badge" style={{ borderColor: 'var(--status-warning)', color: 'var(--status-warning)', background: 'rgba(245, 158, 11, 0.1)' }}>
              Featured
            </span>
          )}
        </div>

        {/* Quick Action Overlay (Save & Compare) */}
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 8, zIndex: 2 }}>
          {/* Compare Button */}
          <button
            type="button"
            onClick={handleCompareClick}
            aria-label={inCompare ? 'Remove from comparison' : 'Add to comparison'}
            title={inCompare ? 'In Comparison' : 'Add to Compare'}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: inCompare ? 'var(--accent-cyan)' : 'var(--bg-glass)',
              color: inCompare ? '#07080a' : 'var(--text-primary)',
              border: `1px solid ${inCompare ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease'
            }}
          >
            {inCompare ? <Check size={16} strokeWidth={2.5} /> : <Scale size={16} />}
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={saveLoading}
            aria-label={isSaved ? 'Remove from saved garage' : 'Save to garage'}
            title={isSaved ? 'Saved in Garage' : 'Save to Garage'}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: isSaved ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-glass)',
              color: isSaved ? '#ef4444' : 'var(--text-primary)',
              border: `1px solid ${isSaved ? '#ef4444' : 'var(--border-subtle)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease'
            }}
          >
            <Heart size={16} fill={isSaved ? '#ef4444' : 'none'} />
          </button>
        </div>

        {/* Gradient shadow for text readability */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60,
          background: 'linear-gradient(to top, rgba(7, 8, 10, 0.9), transparent)',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '1rem' }}>
        {/* Title & Brand */}
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {vehicle.manufacturer}
          </span>
          <h3 style={{ margin: '0.2rem 0', fontSize: '1.25rem' }}>
            <Link to={`/vehicles/${vehicle.slug}`} style={{ color: 'var(--text-primary)' }}>
              {vehicle.name}
            </Link>
          </h3>
        </div>

        {/* Pricing */}
        <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            {formatPriceINR(vehicle.priceExShowroomINR)}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {vehicle.priceLabel}
          </div>
        </div>

        {/* Specs Overview with Range Ring */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {/* Animated Range Ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <RangeRing rangeKm={vehicle.rangeKmClaimed} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Claimed Range
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {vehicle.rangeLabel}
              </div>
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', textAlign: 'right' }}>
            {vehicle.acceleration0to100 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                <Gauge size={13} color="var(--accent-cyan)" />
                <span>0-100: <strong style={{ color: 'var(--text-primary)' }}>{vehicle.acceleration0to100}s</strong></span>
              </div>
            )}
            {vehicle.batteryKwh && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                <Zap size={13} color="var(--accent-cyan)" />
                <span>Battery: <strong style={{ color: 'var(--text-primary)' }}>{vehicle.batteryKwh} kWh</strong></span>
              </div>
            )}
            {vehicle.fastChargeMinutes && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                <Clock size={13} color="var(--accent-cyan)" />
                <span>10-80%: <strong style={{ color: 'var(--text-primary)' }}>{vehicle.fastChargeMinutes}m</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Footer CTAs */}
        <div style={{ marginTop: 'auto', paddingTop: '0.6rem', display: 'flex', gap: '0.6rem' }}>
          <Link
            to={`/vehicles/${vehicle.slug}`}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, fontSize: '0.82rem' }}
          >
            Explore Specs
            <ArrowUpRight size={14} />
          </Link>
          <Link
            to={`/test-drive?vehicle=${vehicle.slug}`}
            className="btn btn-primary btn-sm"
            style={{ fontSize: '0.82rem' }}
          >
            Test Drive
          </Link>
        </div>
      </div>
    </article>
  );
};

export default VehicleCard;
