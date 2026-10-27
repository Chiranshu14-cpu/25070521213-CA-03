import React, { useEffect, useState } from 'react';

const RangeRing = ({ rangeKm, maxRange = 708, size = 68, strokeWidth = 5 }) => {
  const [animatedOffset, setAnimatedOffset] = useState(0);

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, Math.round((rangeKm / maxRange) * 100)));
  const targetOffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    // Start empty, animate to target
    setAnimatedOffset(circumference);
    const timer = setTimeout(() => {
      setAnimatedOffset(targetOffset);
    }, 150);
    return () => clearTimeout(timer);
  }, [rangeKm, maxRange, circumference, targetOffset]);

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }} title={`${rangeKm} km (${percentage}% of 708 km catalog maximum)`}>
      <svg width={size} height={size} className="range-ring-svg">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-medium)"
          strokeWidth={strokeWidth}
        />
        {/* Animated accent circle */}
        <circle
          className="range-ring-circle"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--accent-cyan)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center', lineHeight: 1 }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {rangeKm}
        </span>
        <span style={{ display: 'block', fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          KM
        </span>
      </div>
    </div>
  );
};

export default RangeRing;
