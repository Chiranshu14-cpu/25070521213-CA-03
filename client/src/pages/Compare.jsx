import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Plus, X, Check, ArrowRight, Info, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { useCompare } from '../context/CompareContext';
import { formatPriceINR } from '../components/VehicleCard';

const Compare = () => {
  const { compareList, removeFromCompare, addToCompare, clearCompare } = useCompare();
  const [allVehicles, setAllVehicles] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState('');

  // Fetch full catalog for the quick add dropdown
  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        if (data.vehicles) {
          setAllVehicles(data.vehicles);
          // If compare list is empty, pre-populate 2 vehicles for a great initial experience
          if (compareList.length === 0 && data.vehicles.length >= 2) {
            addToCompare(data.vehicles[0]);
            addToCompare(data.vehicles[1]);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!selectedToAdd) return;
    const v = allVehicles.find(item => item.slug === selectedToAdd || item._id === selectedToAdd);
    if (v) {
      addToCompare(v);
      setSelectedToAdd('');
    }
  };

  // Helper to determine best value for highlighting
  const getBest = (key, direction = 'max') => {
    if (compareList.length < 2) return null;
    const valid = compareList
      .map(v => v[key])
      .filter(val => val !== null && val !== undefined);
    if (valid.length === 0) return null;
    return direction === 'max' ? Math.max(...valid) : Math.min(...valid);
  };

  const bestRange = getBest('rangeKmClaimed', 'max');
  const bestAccel = getBest('acceleration0to100', 'min');
  const bestCharge = getBest('fastChargeMinutes', 'min');
  const bestBattery = getBest('batteryKwh', 'max');
  const bestBoot = getBest('bootSpaceL', 'max');

  // Prepare normalized data for Recharts Radar Chart
  // Scale all attributes to 0 - 100 for balanced visualization
  const radarData = [
    {
      metric: 'Range (km)',
      fullMark: 100,
      ...compareList.reduce((acc, v) => {
        acc[v.name] = Math.min(100, Math.round((v.rangeKmClaimed / 857) * 100));
        return acc;
      }, {})
    },
    {
      metric: 'Acceleration (0-100)',
      fullMark: 100,
      ...compareList.reduce((acc, v) => {
        // Invert: 2.5s -> 100, 10s -> 25
        const val = v.acceleration0to100 || 8.0;
        acc[v.name] = Math.max(20, Math.min(100, Math.round(110 - val * 10)));
        return acc;
      }, {})
    },
    {
      metric: 'Battery Size',
      fullMark: 100,
      ...compareList.reduce((acc, v) => {
        const val = v.batteryKwh || 75;
        acc[v.name] = Math.min(100, Math.round((val / 125) * 100));
        return acc;
      }, {})
    },
    {
      metric: 'Fast Charging',
      fullMark: 100,
      ...compareList.reduce((acc, v) => {
        // Invert: 18 mins -> 100, 60 mins -> 30
        const val = v.fastChargeMinutes || 50;
        acc[v.name] = Math.max(25, Math.min(100, Math.round(120 - val * 1.5)));
        return acc;
      }, {})
    },
    {
      metric: 'Cargo / Boot',
      fullMark: 100,
      ...compareList.reduce((acc, v) => {
        const val = v.dimensions?.bootSpaceL || 350;
        acc[v.name] = Math.min(100, Math.round((val / 550) * 100));
        return acc;
      }, {})
    }
  ];

  const radarColors = ['#00F2FE', '#f59e0b', '#10b981'];

  return (
    <div style={{ padding: '3rem 0 6rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', gap: '1.5rem' }}>
          <div>
            <span className="badge" style={{ marginBottom: '0.6rem' }}>Benchmarking</span>
            <h1 style={{ marginBottom: '0.5rem' }}>Vehicle Comparison Matrix</h1>
            <p style={{ maxWidth: 650, color: 'var(--text-secondary)' }}>
              Compare specifications, charging performance, and spatial dimensions side-by-side with verified metrics.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {compareList.length > 0 && (
              <button type="button" onClick={clearCompare} className="btn btn-ghost btn-sm">
                Clear All
              </button>
            )}
            <Link to="/vehicles" className="btn btn-secondary btn-sm">
              <Plus size={14} /> Add from Catalog
            </Link>
          </div>
        </div>

        {/* Quick Add Bar if fewer than 3 vehicles */}
        {compareList.length < 3 && (
          <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Add vehicle to comparison ({compareList.length}/3 selected):
            </span>
            <select
              value={selectedToAdd}
              onChange={(e) => setSelectedToAdd(e.target.value)}
              className="form-select"
              style={{ maxWidth: 320, padding: '0.55rem 0.9rem' }}
            >
              <option value="">Select a vehicle to compare...</option>
              {allVehicles
                .filter(v => !compareList.some(c => c._id === v._id))
                .map(v => (
                  <option key={v._id} value={v.slug}>
                    {v.name} ({v.manufacturer})
                  </option>
                ))}
            </select>
            <button
              type="button"
              onClick={handleAddVehicle}
              disabled={!selectedToAdd}
              className="btn btn-primary btn-sm"
            >
              Add Vehicle
            </button>
          </div>
        )}

        {compareList.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <Scale size={48} color="var(--accent-cyan)" style={{ margin: '0 auto 1.5rem' }} />
            <h2>No Vehicles in Comparison</h2>
            <p style={{ maxWidth: 450, margin: '0.5rem auto 1.5rem', color: 'var(--text-secondary)' }}>
              Select 2 or 3 vehicles from our catalog or dropdown to review their architectural specifications side-by-side.
            </p>
            <Link to="/vehicles" className="btn btn-primary">
              Browse Electric Vehicles
            </Link>
          </div>
        ) : (
          <>
            {/* 1. Radar Chart Section */}
            {compareList.length >= 2 && (
              <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem' }}>Multidimensional Performance Radar</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Normalized 0-100 radar comparison across verified technical metrics.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.85rem' }}>
                    {compareList.map((v, i) => (
                      <div key={v._id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: radarColors[i] }} />
                        <span style={{ fontWeight: 600 }}>{v.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recharts Container */}
                <div style={{ width: '100%', height: 380 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="var(--border-subtle)" />
                      <PolarAngleAxis dataKey="metric" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border-subtle)" tick={false} />
                      {compareList.map((v, i) => (
                        <Radar
                          key={v._id}
                          name={v.name}
                          dataKey={v.name}
                          stroke={radarColors[i]}
                          fill={radarColors[i]}
                          fillOpacity={0.22}
                        />
                      ))}
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-surface-elevated)',
                          borderColor: 'var(--border-bright)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Normalization Methodology Explanation */}
                <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Normalization Methodology: </strong>
                  To visualize divergent units on a single radar axis without skewing, each metric is mapped to a uniform 0-100 index.
                  <em> Range:</em> (Range ÷ 708 km) × 100.
                  <em> Acceleration:</em> Inverted scale where sub-3.0s scores 95-100 and &gt;9.0s scores 30.
                  <em> Battery:</em> (Battery kWh ÷ 85 kWh) × 100.
                  <em> Charging Speed:</em> Inverted scale rewarding shorter 10-80% times (18m = 95, 60m = 35).
                  <em> Cargo:</em> (Boot L ÷ 550 L) × 100.
                </div>
              </div>
            )}

            {/* 2. Side-by-Side Comparison Table (Responsive with mobile horizontal scroll) */}
            <div className="glass-panel" style={{ overflowX: 'auto', padding: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 620 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-medium)' }}>
                    <th style={{ padding: '1rem', width: '25%', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                      Specification
                    </th>
                    {compareList.map(v => (
                      <th key={v._id} style={{ padding: '1rem', width: `${75 / compareList.length}%`, verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {v.manufacturer}
                            </span>
                            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              <Link to={`/vehicles/${v.slug}`} style={{ color: 'inherit' }}>
                                {v.name}
                              </Link>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCompare(v.slug)}
                            aria-label={`Remove ${v.name} from comparison`}
                            style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div style={{ marginTop: '0.75rem' }}>
                          <Link to={`/test-drive?vehicle=${v.slug}`} className="btn btn-primary btn-sm" style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}>
                            Test Drive
                          </Link>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ fontSize: '0.92rem' }}>
                  {/* Category */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Segment</td>
                    {compareList.map(v => (
                      <td key={v._id} style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>
                        {v.category}
                      </td>
                    ))}
                  </tr>

                  {/* Price */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Ex-Showroom Price</td>
                    {compareList.map(v => (
                      <td key={v._id} style={{ padding: '0.85rem 1rem' }}>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                          {formatPriceINR(v.priceExShowroomINR)}
                        </strong>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>approximate</div>
                      </td>
                    ))}
                  </tr>

                  {/* Range */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Claimed Range</td>
                    {compareList.map(v => {
                      const isBest = v.rangeKmClaimed === bestRange;
                      return (
                        <td key={v._id} style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: isBest ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                            {v.rangeKmClaimed} km
                          </span>
                          {isBest && <span className="badge" style={{ marginLeft: 6, fontSize: '0.62rem' }}>Leader</span>}
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{v.rangeLabel}</div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Battery */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Battery Capacity</td>
                    {compareList.map(v => {
                      const isBest = v.batteryKwh && v.batteryKwh === bestBattery;
                      return (
                        <td key={v._id} style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 600, color: isBest ? 'var(--accent-cyan)' : 'inherit' }}>
                            {v.batteryKwh !== null ? `${v.batteryKwh} kWh` : 'Not available'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Acceleration */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>0-100 km/h Sprint</td>
                    {compareList.map(v => {
                      const isBest = v.acceleration0to100 && v.acceleration0to100 === bestAccel;
                      return (
                        <td key={v._id} style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 700, color: isBest ? 'var(--accent-cyan)' : 'inherit' }}>
                            {v.acceleration0to100 !== null ? `${v.acceleration0to100} s` : 'Not available'}
                          </span>
                          {isBest && <span className="badge" style={{ marginLeft: 6, fontSize: '0.62rem' }}>Fastest</span>}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Fast Charging */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>10-80% DC Charging</td>
                    {compareList.map(v => {
                      const isBest = v.fastChargeMinutes && v.fastChargeMinutes === bestCharge;
                      return (
                        <td key={v._id} style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: 600, color: isBest ? 'var(--accent-cyan)' : 'inherit' }}>
                            {v.fastChargeMinutes !== null ? `${v.fastChargeMinutes} mins` : 'Not available'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Top Speed */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Top Speed</td>
                    {compareList.map(v => (
                      <td key={v._id} style={{ padding: '0.85rem 1rem' }}>
                        {v.topSpeedKmh !== null ? `${v.topSpeedKmh} km/h` : 'Not available'}
                      </td>
                    ))}
                  </tr>

                  {/* Drive Type */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Drivetrain</td>
                    {compareList.map(v => (
                      <td key={v._id} style={{ padding: '0.85rem 1rem' }}>
                        {v.driveType}
                      </td>
                    ))}
                  </tr>

                  {/* Boot Space */}
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Boot Capacity</td>
                    {compareList.map(v => {
                      const boot = v.dimensions?.bootSpaceL;
                      const isBest = boot && boot === bestBoot;
                      return (
                        <td key={v._id} style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ fontWeight: isBest ? 700 : 400, color: isBest ? 'var(--accent-cyan)' : 'inherit' }}>
                            {boot ? `${boot} L` : 'Not available'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Seating */}
                  <tr>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>Seating</td>
                    {compareList.map(v => (
                      <td key={v._id} style={{ padding: '0.85rem 1rem' }}>
                        {v.seats} Seats
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Compare;
