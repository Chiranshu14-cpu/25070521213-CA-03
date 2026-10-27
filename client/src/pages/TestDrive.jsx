import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Car, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TIME_WINDOWS = [
  'Morning (09:00 - 12:00)',
  'Afternoon (12:00 - 16:00)',
  'Evening (16:00 - 19:00)'
];

const TestDrive = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [selectedSlug, setSelectedSlug] = useState(searchParams.get('vehicle') || '');
  const [name, setName] = useState(user ? user.displayName : '');
  const [email, setEmail] = useState(user ? user.email : '');
  const [preferredDate, setPreferredDate] = useState('');
  const [timeWindow, setTimeWindow] = useState(TIME_WINDOWS[0]);
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        if (data.vehicles) {
          setVehicles(data.vehicles);
          if (!selectedSlug && data.vehicles.length > 0) {
            setSelectedSlug(data.vehicles[0].slug);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      if (!name) setName(user.displayName);
      if (!email) setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!selectedSlug) {
      setError('Please select a vehicle model.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/test-drive-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleSlug: selectedSlug,
          name,
          email,
          preferredDate,
          timeWindow,
          message
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit test drive request.');
      }

      setSuccessResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedVehicleObj = vehicles.find(v => v.slug === selectedSlug);

  return (
    <div style={{ padding: '3rem 0 6rem' }}>
      <div className="container-narrow">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge" style={{ marginBottom: '0.6rem' }}>Experience</span>
          <h1 style={{ marginBottom: '0.6rem' }}>Request an Electric Test Drive</h1>
          <p style={{ maxWidth: 600, margin: '0 auto', color: 'var(--text-secondary)' }}>
            Experience instant electric torque and cabin craftsmanship firsthand. Submit your schedule inquiry to receive contact from our vehicle specialist.
          </p>
        </div>

        {/* Clear Disclosure Notice */}
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5
        }}>
          <ShieldCheck size={20} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
          <div>
            <strong>Appointment Request Notice:</strong> Submitting this form creates a preliminary inquiry in our MongoDB registry. It is an expression of interest and does not guarantee immediate slot confirmation.
          </div>
        </div>

        {successResult ? (
          <div className="glass-panel-elevated" style={{ padding: '3rem', textAlign: 'center' }}>
            <CheckCircle2 size={54} color="var(--status-success)" style={{ margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>Request Lodged in Registry</h2>
            <p style={{ maxWidth: 520, margin: '0 auto 1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {successResult.message}
            </p>
            <div style={{
              maxWidth: 420,
              margin: '0 auto 2rem',
              padding: '1.25rem',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div><strong>Vehicle:</strong> {successResult.request?.vehicle?.name || selectedVehicleObj?.name}</div>
              <div><strong>Status:</strong> <span className="badge" style={{ fontSize: '0.7rem' }}>{successResult.request?.status}</span></div>
              <div><strong>Preferred Slot:</strong> {new Date(successResult.request?.preferredDate).toLocaleDateString()} ({successResult.request?.timeWindow})</div>
              <div><strong>Contact Email:</strong> {successResult.request?.email}</div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {user ? (
                <Link to="/garage" className="btn btn-primary">
                  View in My Garage <ArrowRight size={16} />
                </Link>
              ) : (
                <Link to="/vehicles" className="btn btn-primary">
                  Return to Fleet
                </Link>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2.5rem' }}>
            {error && (
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid var(--status-error)',
                color: 'var(--status-error)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                fontSize: '0.88rem'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Vehicle Selection */}
            <div className="form-group">
              <label className="form-label">Selected Vehicle Model *</label>
              <select
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
                required
                className="form-select"
              >
                {vehicles.map(v => (
                  <option key={v._id} value={v.slug}>
                    {v.name} ({v.manufacturer} • {v.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Name and Email */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chiranshu Somkuwar"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="form-input"
                />
              </div>
            </div>

            {/* Date and Time Window */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Preferred Date *</label>
                <input
                  type="date"
                  value={preferredDate}
                  min={minDateString}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Time Window *</label>
                <select
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  required
                  className="form-select"
                >
                  {TIME_WINDOWS.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Message */}
            <div className="form-group">
              <label className="form-label">Special Inquiries or Route Requests (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share any specific features you'd like to test (e.g. highway acceleration, regenerative braking, boot practicality)..."
                rows={4}
                className="form-textarea"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {submitting ? 'Lodging Request...' : 'Submit Test Drive Inquiry'}
              <ArrowRight size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TestDrive;
