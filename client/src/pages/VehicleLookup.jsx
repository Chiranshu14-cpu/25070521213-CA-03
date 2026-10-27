import React, { useState } from 'react';
import { Search, Database, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';

const SAMPLE_VINS = [
  { label: 'Porsche Taycan (BEV)', vin: 'WP0AA2Y14MSA12345' },
  { label: 'Tesla Model 3 (BEV)', vin: '5YJ3E1EB8KF123456' },
  { label: 'BMW i4 (BEV)', vin: 'WBA33AW08NFM12345' },
  { label: 'Hyundai IONIQ 5', vin: 'KM8KR4AE8NU012345' }
];

const POPULAR_MAKES = ['Tesla', 'Porsche', 'BMW', 'Hyundai', 'Audi', 'Mercedes-Benz', 'Kia', 'Volvo'];

const VehicleLookup = () => {
  const [activeMode, setActiveMode] = useState('vin'); // 'vin' or 'make'
  const [vinInput, setVinInput] = useState('');
  const [makeInput, setMakeInput] = useState('Porsche');
  const [yearInput, setYearInput] = useState('2024');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vinResult, setVinResult] = useState(null);
  const [makeResult, setMakeResult] = useState(null);

  const handleVinLookup = async (vinToLookup) => {
    const targetVin = (vinToLookup || vinInput).trim().toUpperCase();
    if (!targetVin) return;

    if (targetVin.length !== 17) {
      setError('A standard VIN must be exactly 17 alphanumeric characters.');
      return;
    }

    setLoading(true);
    setError(null);
    setVinResult(null);

    try {
      const res = await fetch(`/api/vehicle-lookup?vin=${encodeURIComponent(targetVin)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to query NHTSA database.');
      }
      setVinResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeLookup = async (e) => {
    if (e) e.preventDefault();
    if (!makeInput.trim()) return;

    setLoading(true);
    setError(null);
    setMakeResult(null);

    try {
      const params = new URLSearchParams();
      params.append('make', makeInput.trim());
      if (yearInput.trim()) params.append('year', yearInput.trim());

      const res = await fetch(`/api/vehicle-lookup?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to query NHTSA models.');
      }
      setMakeResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3rem 0 6rem' }}>
      <div className="container-narrow">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
            <span className="badge">
              <Database size={13} />
              External Government Integration
            </span>
          </div>
          <h1 style={{ marginBottom: '0.6rem' }}>US NHTSA vPIC Vehicle Lookup</h1>
          <p style={{ maxWidth: 680, margin: '0 auto', color: 'var(--text-secondary)' }}>
            Real-time querying against the official United States Department of Transportation National Highway Traffic Safety Administration (NHTSA) database.
          </p>
        </div>

        {/* Supplementary Data Disclaimer */}
        <div style={{
          padding: '1.1rem 1.4rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '2rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center'
        }}>
          <ShieldCheck size={20} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
          <div>
            <strong>Supplementary Data Disclosure:</strong> This external tool interfaces with the US DOT vPIC REST API. It serves as an international vehicle identification benchmark and does not replace our local verified Indian EV catalog. If the US NHTSA server experiences downtime, AURA operates unimpeded.
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-surface)',
          padding: 4,
          borderRadius: 'var(--radius-full)',
          marginBottom: '2rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            onClick={() => { setActiveMode('vin'); setError(null); }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: 'var(--radius-full)',
              background: activeMode === 'vin' ? 'var(--bg-surface-elevated)' : 'transparent',
              color: activeMode === 'vin' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
          >
            Decode 17-Character VIN
          </button>
          <button
            type="button"
            onClick={() => { setActiveMode('make'); setError(null); }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: 'var(--radius-full)',
              background: activeMode === 'make' ? 'var(--bg-surface-elevated)' : 'transparent',
              color: activeMode === 'make' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
          >
            Query OEM Models by Make & Year
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--status-error)',
            color: 'var(--status-error)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '2rem',
            fontSize: '0.88rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* MODE 1: VIN DECODE */}
        {activeMode === 'vin' && (
          <div>
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label className="form-label">Vehicle Identification Number (VIN)</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    value={vinInput}
                    maxLength={17}
                    onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                    placeholder="Enter 17 alphanumeric characters (e.g. WP0AA2Y14MSA12345)"
                    className="form-input"
                    style={{ textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.08em', fontSize: '1rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleVinLookup(vinInput)}
                    disabled={loading || vinInput.length !== 17}
                    className="btn btn-primary"
                    style={{ minWidth: 140 }}
                  >
                    {loading ? 'Decoding...' : 'Decode VIN'}
                  </button>
                </div>
              </div>

              {/* Sample VIN Quick Buttons for Examiner Demo */}
              <div style={{ marginTop: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Quick Demo VINs:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {SAMPLE_VINS.map(s => (
                    <button
                      key={s.vin}
                      type="button"
                      onClick={() => {
                        setVinInput(s.vin);
                        handleVinLookup(s.vin);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* VIN Result Matrix */}
            {vinResult && (
              <div className="glass-panel-elevated" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                  <div>
                    <span className="badge" style={{ marginBottom: '0.3rem' }}>NHTSA vPIC Decoded Record</span>
                    <h3 style={{ fontSize: '1.4rem', margin: 0 }}>
                      {vinResult.modelYear} {vinResult.make} {vinResult.model}
                    </h3>
                  </div>
                  <div style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
                    VIN: {vinResult.vin}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Electrification Level</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                      {vinResult.electrificationLevel}
                    </div>
                  </div>

                  <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Primary Fuel Type</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem' }}>
                      {vinResult.fuelTypePrimary}
                    </div>
                  </div>

                  <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vehicle & Body Class</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem' }}>
                      {vinResult.vehicleType} • {vinResult.bodyClass}
                    </div>
                  </div>

                  <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manufacturer</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem' }}>
                      {vinResult.manufacturer}
                    </div>
                  </div>

                  <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Plant Country of Assembly</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem' }}>
                      {vinResult.plantCountry}
                    </div>
                  </div>

                  <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Drivetrain Configuration</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem' }}>
                      {vinResult.driveType} ({vinResult.doors} Doors)
                    </div>
                  </div>
                </div>

                {vinResult.nhtsaErrorText && vinResult.nhtsaErrorText !== '0 - VIN decoded clean. Check Digit (9th position) is correct' && (
                  <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    NHTSA Diagnostic Note: {vinResult.nhtsaErrorText}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MODE 2: MAKE / MODEL SEARCH */}
        {activeMode === 'make' && (
          <div>
            <form onSubmit={handleMakeLookup} className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Manufacturer (Make)</label>
                  <input
                    type="text"
                    value={makeInput}
                    onChange={(e) => setMakeInput(e.target.value)}
                    placeholder="e.g. Porsche, Tesla, BMW"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Model Year (Optional)</label>
                  <input
                    type="number"
                    value={yearInput}
                    onChange={(e) => setYearInput(e.target.value)}
                    placeholder="e.g. 2024"
                    min="1995"
                    max="2026"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Quick Make Selection Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                {POPULAR_MAKES.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMakeInput(m)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.5rem' }}
              >
                {loading ? 'Searching Models...' : 'Query NHTSA Catalog'}
              </button>
            </form>

            {/* Results Grid */}
            {makeResult && (
              <div className="glass-panel-elevated" style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>
                  <h3 style={{ fontSize: '1.3rem', margin: 0 }}>
                    NHTSA Models for {makeResult.make} ({makeResult.year})
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Retrieved {makeResult.count} registered models from US DOT
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.85rem' }}>
                  {makeResult.models.map(m => (
                    <div
                      key={m.modelId}
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.modelName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID #{m.modelId}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleLookup;
