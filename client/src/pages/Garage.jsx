import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Heart, Calendar, Sparkles, Trash2, XCircle, ArrowRight, Clock, CheckCircle, Car } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import VehicleCard, { formatPriceINR } from '../components/VehicleCard';

const Garage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('saved'); // 'saved', 'requests', 'quiz'

  const [savedVehicles, setSavedVehicles] = useState([]);
  const [testDrives, setTestDrives] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadGarageData = async () => {
    setLoading(true);
    try {
      const [savedRes, tdRes, quizRes] = await Promise.all([
        fetch('/api/saved-vehicles'),
        fetch('/api/test-drive-requests'),
        fetch('/api/quiz/results')
      ]);

      if (savedRes.ok) {
        const data = await savedRes.json();
        setSavedVehicles(data.saved || []);
      }
      if (tdRes.ok) {
        const data = await tdRes.json();
        setTestDrives(data.requests || []);
      }
      if (quizRes.ok) {
        const data = await quizRes.json();
        setQuizHistory(data.results || []);
      }
    } catch (err) {
      console.warn('Error loading garage data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGarageData();
  }, []);

  const handleRemoveSaved = async (vehicleId) => {
    try {
      const res = await fetch(`/api/saved-vehicles/${vehicleId}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedVehicles(prev => prev.filter(item => (item.vehicle?._id || item.vehicle) !== vehicleId));
      }
    } catch (err) {
      console.warn('Remove saved error:', err);
    }
  };

  const handleCancelTestDrive = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this test-drive request?')) return;
    try {
      const res = await fetch(`/api/test-drive-requests/${requestId}/cancel`, { method: 'PATCH' });
      if (res.ok) {
        const data = await res.json();
        setTestDrives(prev => prev.map(req => req._id === requestId ? data.request : req));
      }
    } catch (err) {
      console.warn('Cancel request error:', err);
    }
  };

  // Compute derived statistics from real records
  const totalSavedCount = savedVehicles.length;
  const activeRequestsCount = testDrives.filter(td => td.status === 'pending').length;
  const avgRange = totalSavedCount > 0
    ? Math.round(savedVehicles.reduce((sum, item) => sum + (item.vehicle?.rangeKmClaimed || 0), 0) / totalSavedCount)
    : 0;

  return (
    <div style={{ padding: '3rem 0 6rem' }}>
      <div className="container">
        {/* Welcome Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '3rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              <Shield size={16} />
              Personal Hangar & Telemetry
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', margin: 0 }}>
              Welcome back, {user?.displayName}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
              Authenticated Member • Registered Email: {user?.email}
            </p>
          </div>

          {/* Quick Stats Pill Strip */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>
                {totalSavedCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Saved Fleet</div>
            </div>

            <div style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {activeRequestsCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Drives</div>
            </div>

            {avgRange > 0 && (
              <div style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>
                  {avgRange} <span style={{ fontSize: '0.8rem' }}>km</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Saved Range</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2.5rem',
          overflowX: 'auto'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            style={{
              padding: '0.85rem 1.2rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: activeTab === 'saved' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'saved' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <Heart size={16} />
            Saved Vehicles ({savedVehicles.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            style={{
              padding: '0.85rem 1.2rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: activeTab === 'requests' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'requests' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <Calendar size={16} />
            Test Drive Inquiries ({testDrives.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            style={{
              padding: '0.85rem 1.2rem',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: activeTab === 'quiz' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'quiz' ? '2px solid var(--accent-cyan)' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={16} />
            AURA Matches ({quizHistory.length})
          </button>
        </div>

        {/* Tab 1: Saved Vehicles */}
        {activeTab === 'saved' && (
          <div>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading saved fleet...
              </div>
            ) : savedVehicles.length === 0 ? (
              <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <Heart size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h3>Your Garage is Currently Empty</h3>
                <p style={{ maxWidth: 450, margin: '0.5rem auto 1.5rem', color: 'var(--text-secondary)' }}>
                  Browse our curated EV fleet and click the heart icon on any vehicle card to save models to your personal hangar.
                </p>
                <Link to="/vehicles" className="btn btn-primary">
                  Explore Electric Vehicles
                </Link>
              </div>
            ) : (
              <div className="grid-catalog">
                {savedVehicles.map(item => {
                  const vehicle = item.vehicle;
                  if (!vehicle) return null;
                  return (
                    <div key={item._id} style={{ position: 'relative' }}>
                      <VehicleCard
                        vehicle={vehicle}
                        isSaved={true}
                        onToggleSave={() => handleRemoveSaved(vehicle._id)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Test Drive Requests */}
        {activeTab === 'requests' && (
          <div>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading inquiries...
              </div>
            ) : testDrives.length === 0 ? (
              <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <Calendar size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h3>No Test Drive Requests Submitted</h3>
                <p style={{ maxWidth: 450, margin: '0.5rem auto 1.5rem', color: 'var(--text-secondary)' }}>
                  You have not submitted any test-drive requests yet. Choose an electric model and schedule an inquiry.
                </p>
                <Link to="/test-drive" className="btn btn-primary">
                  Request a Test Drive
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {testDrives.map(req => {
                  const vehicle = req.vehicle;
                  const isPending = req.status === 'pending';
                  const isContacted = req.status === 'contacted';
                  const isCancelled = req.status === 'cancelled';

                  const badgeColor = isPending
                    ? 'var(--status-warning)'
                    : isContacted
                    ? 'var(--status-success)'
                    : 'var(--text-muted)';

                  return (
                    <div
                      key={req._id}
                      className="glass-panel"
                      style={{
                        padding: '1.75rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1.5rem',
                        borderLeft: `4px solid ${badgeColor}`
                      }}
                    >
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        <div style={{
                          width: 48,
                          height: 48,
                          borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-cyan)'
                        }}>
                          <Car size={24} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
                              {vehicle ? vehicle.name : 'Unknown Vehicle'}
                            </h3>
                            <span
                              className="badge"
                              style={{
                                color: badgeColor,
                                borderColor: badgeColor,
                                background: 'transparent',
                                fontSize: '0.68rem'
                              }}
                            >
                              {req.status.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Scheduled for <strong>{new Date(req.preferredDate).toLocaleDateString()}</strong> • {req.timeWindow}
                          </div>
                          {req.message && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.35rem' }}>
                              Note: "{req.message}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cancel action if eligible */}
                      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                        {vehicle && (
                          <Link to={`/vehicles/${vehicle.slug}`} className="btn btn-secondary btn-sm">
                            View Vehicle
                          </Link>
                        )}
                        {isPending && (
                          <button
                            type="button"
                            onClick={() => handleCancelTestDrive(req._id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--status-error)' }}
                          >
                            <XCircle size={15} />
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Latest AURA Match Results */}
        {activeTab === 'quiz' && (
          <div>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading saved matches...
              </div>
            ) : quizHistory.length === 0 ? (
              <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <Sparkles size={44} color="var(--accent-cyan)" style={{ margin: '0 auto 1rem' }} />
                <h3>No Match History Found</h3>
                <p style={{ maxWidth: 450, margin: '0.5rem auto 1.5rem', color: 'var(--text-secondary)' }}>
                  Take our 5-question match engine to calculate which electric vehicle fits your daily commute and budget.
                </p>
                <Link to="/find-your-aura" className="btn btn-primary">
                  Launch "Find Your AURA" Quiz
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {quizHistory.map((entry, idx) => (
                  <div key={entry._id} className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
                      <div>
                        <span className="badge" style={{ marginBottom: '0.3rem' }}>
                          Assessment {idx === 0 ? '(Latest Run)' : `#${quizHistory.length - idx}`}
                        </span>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Computed on {new Date(entry.createdAt).toLocaleDateString()} with parameters: {entry.answers?.dailyDistance} km/day • Priority: {entry.answers?.topPriority}
                        </div>
                      </div>
                      <Link to="/find-your-aura" className="btn btn-secondary btn-sm">
                        Retake Assessment
                      </Link>
                    </div>

                    {/* Top 3 Ranked matches */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                      {entry.rankedResults?.slice(0, 3).map((match, rank) => (
                        <div
                          key={rank}
                          style={{
                            padding: '1.25rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-surface)',
                            border: rank === 0 ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: rank === 0 ? 'var(--accent-cyan)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                                Rank #{rank + 1} Match
                              </span>
                              <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>
                                {match.matchPercentage}%
                              </strong>
                            </div>
                            <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.35rem' }}>
                              {match.vehicleName}
                            </h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                              {match.reason}
                            </p>
                          </div>
                          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                            <Link to={`/vehicles/${match.vehicleSlug}`} className="btn btn-ghost btn-sm" style={{ padding: 0, color: 'var(--accent-cyan)' }}>
                              Inspect Model <ArrowRight size={14} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Garage;
