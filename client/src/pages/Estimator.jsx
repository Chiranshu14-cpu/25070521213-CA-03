import React, { useState, useEffect } from 'react';
import { Calculator, Zap, Fuel, Leaf, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, Clock, Gauge } from 'lucide-react';
import { formatPriceINR } from '../components/VehicleCard';

const Estimator = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState('');

  // Editable parameters with sensible defaults in ₹
  const [tripDistanceKm, setTripDistanceKm] = useState(380);
  const [kmPerDay, setKmPerDay] = useState(45);
  const [electricityPricePerKwh, setElectricityPricePerKwh] = useState(8.5);
  const [petrolPricePerLitre, setPetrolPricePerLitre] = useState(104.0);
  const [petrolCarEfficiencyKmpl, setPetrolCarEfficiencyKmpl] = useState(14.0);
  const [realWorldRangeFactor, setRealWorldRangeFactor] = useState(0.82); // 82% of ARAI claimed

  const [loading, setLoading] = useState(false);
  const [estimation, setEstimation] = useState(null);

  // Load catalog
  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        if (data.vehicles && data.vehicles.length > 0) {
          setVehicles(data.vehicles);
          setSelectedSlug(data.vehicles[0].slug);
        }
      })
      .catch(() => {});
  }, []);

  // Compute estimation whenever inputs change
  useEffect(() => {
    if (!selectedSlug) return;

    const runCalculation = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/estimator/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleSlug: selectedSlug,
            tripDistanceKm,
            kmPerDay,
            electricityPricePerKwh,
            petrolPricePerLitre,
            petrolCarEfficiencyKmpl,
            realWorldRangeFactor
          })
        });

        if (res.ok) {
          const data = await res.json();
          setEstimation(data);
        }
      } catch (err) {
        console.warn('Estimator calculation error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(runCalculation, 150);
    return () => clearTimeout(debounceTimer);
  }, [selectedSlug, tripDistanceKm, kmPerDay, electricityPricePerKwh, petrolPricePerLitre, petrolCarEfficiencyKmpl, realWorldRangeFactor]);

  const selectedVehicleObj = vehicles.find(v => v.slug === selectedSlug);

  return (
    <div style={{ padding: '3rem 0 6rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge" style={{ marginBottom: '0.6rem' }}>Signature Tool</span>
          <h1 style={{ marginBottom: '0.6rem' }}>Cost & Range Feasibility Estimator</h1>
          <p style={{ maxWidth: 680, margin: '0 auto', color: 'var(--text-secondary)' }}>
            Model long-distance road trips, en-route DC charging stops, financial savings vs petrol, and ecological CO₂ mitigation using verified specifications.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
          {/* Controls Column (Left) */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={20} color="var(--accent-cyan)" />
              Simulation Inputs
            </h3>

            {/* Vehicle Selection */}
            <div className="form-group">
              <label className="form-label">Electric Vehicle Model</label>
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                className="form-select"
              >
                {vehicles.map(v => (
                  <option key={v._id} value={v.slug}>
                    {v.name} ({v.rangeKmClaimed} km claimed • {v.manufacturer})
                  </option>
                ))}
              </select>
            </div>

            {/* Trip Distance Slider */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Target Road Trip Distance</label>
                <strong style={{ color: 'var(--accent-cyan)' }}>{tripDistanceKm} km</strong>
              </div>
              <input
                type="range"
                min="50"
                max="1200"
                step="10"
                value={tripDistanceKm}
                onChange={(e) => setTripDistanceKm(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>50 km (Suburban)</span>
                <span>600 km (Intercity)</span>
                <span>1200 km (Cross-Country)</span>
              </div>
            </div>

            {/* Real World Discount Factor */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Conservative Real-World Factor</label>
                <strong style={{ color: 'var(--text-primary)' }}>{Math.round(realWorldRangeFactor * 100)}% of Claimed</strong>
              </div>
              <input
                type="range"
                min="0.65"
                max="0.95"
                step="0.01"
                value={realWorldRangeFactor}
                onChange={(e) => setRealWorldRangeFactor(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Accounts for highway wind resistance, AC climate control, and elevation changes.
              </div>
            </div>

            {/* Daily Distance */}
            <div className="form-group">
              <label className="form-label">Average Commute Distance (km / day)</label>
              <input
                type="number"
                value={kmPerDay}
                onChange={(e) => setKmPerDay(Number(e.target.value))}
                min="5"
                max="300"
                className="form-input"
              />
            </div>

            {/* Tariffs Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Electricity (₹/kWh)</label>
                <input
                  type="number"
                  value={electricityPricePerKwh}
                  onChange={(e) => setElectricityPricePerKwh(Number(e.target.value))}
                  step="0.5"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Petrol Price (₹/L)</label>
                <input
                  type="number"
                  value={petrolPricePerLitre}
                  onChange={(e) => setPetrolPricePerLitre(Number(e.target.value))}
                  step="0.5"
                  className="form-input"
                />
              </div>
            </div>

            {/* Petrol Mileage Baseline */}
            <div className="form-group">
              <label className="form-label">Petrol Car Mileage Baseline (km/L)</label>
              <input
                type="number"
                value={petrolCarEfficiencyKmpl}
                onChange={(e) => setPetrolCarEfficiencyKmpl(Number(e.target.value))}
                step="0.5"
                className="form-input"
              />
            </div>
          </div>

          {/* Results Column (Right) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {estimation ? (
              <>
                {/* 1. Single Charge Feasibility Card */}
                <div
                  className="glass-panel-elevated"
                  style={{
                    padding: '2rem',
                    borderLeft: `5px solid ${estimation.tripFeasibility.fitsOneCharge ? 'var(--status-success)' : 'var(--status-warning)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span className="badge" style={{ color: estimation.tripFeasibility.fitsOneCharge ? 'var(--status-success)' : 'var(--status-warning)', borderColor: 'currentColor' }}>
                      {estimation.tripFeasibility.fitsOneCharge ? 'Single-Charge Capable' : 'Charging Stops Required'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Trip: {estimation.tripFeasibility.tripDistanceKm} km
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>
                    {estimation.tripFeasibility.fitsOneCharge
                      ? 'Trip completed without stopping to charge!'
                      : `${estimation.tripFeasibility.chargingStopsNeeded} en-route fast charge stop(s) needed`}
                  </h2>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    Based on an estimated real-world highway range of <strong>{estimation.tripFeasibility.estimatedRealWorldRangeKm} km</strong> ({Math.round(realWorldRangeFactor * 100)}% of {estimation.vehicle.claimedRange} km claimed).
                  </p>

                  {!estimation.tripFeasibility.fitsOneCharge && (
                    <div style={{
                      marginTop: '1.25rem',
                      padding: '1rem',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      gap: '1.5rem',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={16} color="var(--accent-cyan)" />
                        <span>Approx. Charging Time: <strong>{estimation.tripFeasibility.estimatedChargingTimeMinutes} mins</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Zap size={16} color="var(--accent-cyan)" />
                        <span>Highway Legs: <strong>{estimation.tripFeasibility.chargingStopsNeeded + 1} Stints</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Financial Savings Card */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Fuel size={20} color="var(--accent-cyan)" />
                    Running Cost Economics ({estimation.financialSavings.yearlyKm.toLocaleString()} km / year)
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EV Running Cost</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)', margin: '0.2rem 0' }}>
                        ₹{estimation.financialSavings.evCostPerKm} <span style={{ fontSize: '0.8rem' }}>/ km</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        ₹{estimation.financialSavings.evYearlyCostINR.toLocaleString()} / year
                      </div>
                    </div>

                    <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Petrol Car Baseline</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)', margin: '0.2rem 0' }}>
                        ₹{estimation.financialSavings.petrolCostPerKm} <span style={{ fontSize: '0.8rem' }}>/ km</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        ₹{estimation.financialSavings.petrolYearlyCostINR.toLocaleString()} / year
                      </div>
                    </div>
                  </div>

                  {/* Net Savings Highlight */}
                  <div style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(0, 242, 254, 0.08)',
                    border: '1px solid var(--border-bright)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        Estimated Net Fuel Savings
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        ₹{estimation.financialSavings.yearlySavingsINR.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>saved per year</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>5-Year Cumulative</div>
                      <strong style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>
                        ₹{estimation.financialSavings.fiveYearSavingsINR.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 3. Ecological CO2 Offset Card */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Leaf size={20} color="var(--status-success)" />
                    Environmental CO₂ Footprint Mitigation
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                    <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net CO₂ Avoided Annually</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--status-success)', margin: '0.2rem 0' }}>
                        {estimation.environmentalImpact.netCo2SavedKg.toLocaleString()} <span style={{ fontSize: '0.85rem' }}>kg CO₂</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Accounts for ~0.71 kg/kWh Indian grid factor
                      </div>
                    </div>

                    <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Equivalent Trees Planted</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--status-success)', margin: '0.2rem 0' }}>
                        ~{estimation.environmentalImpact.equivalentTreesPlanted} <span style={{ fontSize: '0.85rem' }}>Mature Trees</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Based on ~22 kg CO₂ annual tree absorption
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Adjust the simulation controls on the left to compute live vehicle telemetry.
              </div>
            )}
          </div>
        </div>

        {/* Formulas & Assumptions Documentation */}
        <div className="glass-panel" style={{ marginTop: '3.5rem', padding: '2rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem', fontSize: '0.9rem' }}>
            <ShieldCheck size={18} color="var(--accent-cyan)" />
            Mathematical Equations & Verified Assumptions
          </div>
          <div>
            <strong>1. Real-World Range:</strong> <code>R_real = ClaimedRange × RangeFactor</code>. Default is 82% to mirror realistic highway consumption under air conditioning.
          </div>
          <div>
            <strong>2. Charging Stops Needed:</strong> If <code>TripDistance &gt; R_real</code>, stops = <code>Math.ceil((TripDistance - R_real) ÷ (R_real × 0.75))</code>, factoring in 10-80% highway buffer.
          </div>
          <div>
            <strong>3. Grid Emission Factor:</strong> Assumed at 0.71 kg CO₂ / kWh (Central Electricity Authority CEA baseline for India). Petrol emission factor taken at 2.31 kg CO₂ / litre.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estimator;
