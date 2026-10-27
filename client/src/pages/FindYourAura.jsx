import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, RotateCcw, Shield, HelpCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatPriceINR } from '../components/VehicleCard';

const QUESTIONS = [
  {
    id: 'dailyDistance',
    title: '1. What is your estimated average daily commute distance?',
    subtitle: 'Used to calculate required multi-day battery buffer and charging cycles.',
    options: [
      { label: 'Urban Short (~25 km / day)', value: 25, hint: 'City runabout, easy weekly charge' },
      { label: 'Moderate Commute (~50 km / day)', value: 50, hint: 'Typical metropolitan commute' },
      { label: 'Extended Commute (~90 km / day)', value: 90, hint: 'Inter-suburban or frequent highways' },
      { label: 'High Mileage (>140 km / day)', value: 140, hint: 'Requires high capacity battery buffer' }
    ]
  },
  {
    id: 'budgetRange',
    title: '2. What is your desired budget bracket?',
    subtitle: 'Mapped to verified approximate ex-showroom price ranges in ₹.',
    options: [
      { label: 'Accessible Tier (Under ₹25 Lakh)', value: 'budget', hint: 'Tata Nexon.ev, Mahindra XUV400' },
      { label: 'Executive Segment (₹25L – ₹55L)', value: 'mid', hint: 'BYD Seal, Hyundai IONIQ 5' },
      { label: 'Premium Luxury (₹55L – ₹90L)', value: 'premium', hint: 'Kia EV6, BMW i4' },
      { label: 'Flagship GT (> ₹90 Lakh)', value: 'luxury', hint: 'Porsche Taycan sports touring' },
      { label: 'Flexible / Any Budget', value: 'any', hint: 'Prioritize engineering excellence' }
    ]
  },
  {
    id: 'seatingNeeds',
    title: '3. What is your typical passenger cabin requirement?',
    subtitle: 'Ensures spatial packaging suits your household or luggage needs.',
    options: [
      { label: 'Up to 4 Occupants (Sport GT / Coupe)', value: 4, hint: 'Driver-focused sporting chassis' },
      { label: 'Standard 5 Passengers', value: 5, hint: 'Comfortable family sedan or crossover' },
      { label: 'Spacious 5+ with Maximum Legroom', value: 5, hint: 'Long wheelbase living space' }
    ]
  },
  {
    id: 'homeCharging',
    title: '4. Do you have dedicated overnight home charging infrastructure?',
    subtitle: 'Determines whether ultra-fast DC public charging is mission-critical.',
    options: [
      { label: 'Yes, Dedicated AC Wallbox at Home/Office', value: 'yes', hint: 'Daily overnight 100% top-up' },
      { label: 'No, Relying Primarily on Public DC Fast Chargers', value: 'no', hint: '800V fast-charging speed prioritized' }
    ]
  },
  {
    id: 'topPriority',
    title: '5. What is your absolute top vehicle priority?',
    subtitle: 'Directly adjusts scoring weight distribution to tailor rankings.',
    options: [
      { label: 'Maximum Range & Autonomy', value: 'range', hint: 'Elevates range weight to 45%' },
      { label: 'High Performance & Rapid Acceleration', value: 'performance', hint: 'Elevates 0-100 acceleration weight to 35%' },
      { label: 'Best Value & Running Cost Savings', value: 'price', hint: 'Elevates budget fit weight to 40%' },
      { label: 'Practicality & Boot Storage', value: 'space', hint: 'Elevates cargo and dimensions weight to 30%' }
    ]
  }
];

const FindYourAura = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    dailyDistance: 50,
    budgetRange: 'mid',
    seatingNeeds: 5,
    homeCharging: 'yes',
    topPriority: 'range'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matchResults, setMatchResults] = useState(null);
  const [weights, setWeights] = useState(null);

  const handleSelectOption = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/quiz/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to compute matches.');
      }
      setMatchResults(data.results);
      setWeights(data.scoringWeights);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMatchResults(null);
    setCurrentStep(0);
  };

  const activeQuestion = QUESTIONS[currentStep];

  return (
    <div style={{ padding: '3rem 0 6rem' }}>
      <div className="container-narrow">
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge" style={{ marginBottom: '0.6rem' }}>Signature Algorithm</span>
          <h1 style={{ marginBottom: '0.6rem' }}>Find Your AURA</h1>
          <p style={{ maxWidth: 620, margin: '0 auto', color: 'var(--text-secondary)' }}>
            Transparent weighted recommendation engine. Five focused inputs mapped directly to verified vehicle engineering specifications.
          </p>
        </div>

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
            marginBottom: '2rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* RESULTS VIEW */}
        {matchResults ? (
          <div>
            <div className="glass-panel-elevated" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <span className="badge" style={{ marginBottom: '0.3rem' }}>Mathematical Match Calculated</span>
                  <h2 style={{ fontSize: '1.8rem', margin: 0 }}>
                    Recommended Electric Vehicles
                  </h2>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={handleReset} className="btn btn-secondary btn-sm">
                    <RotateCcw size={14} /> Retake Assessment
                  </button>
                  {user && (
                    <Link to="/garage" className="btn btn-primary btn-sm">
                      Saved to Garage <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>

              {/* Weight Distribution Transparent Card */}
              {weights && (
                <div style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '2rem',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  alignItems: 'center'
                }}>
                  <strong style={{ color: 'var(--accent-cyan)' }}>Applied Weights:</strong>
                  <span>Range: {weights.range}%</span>
                  <span>Budget: {weights.budget}%</span>
                  <span>Performance: {weights.performance}%</span>
                  <span>Space: {weights.practicality}%</span>
                  <span>Charging: {weights.charging}%</span>
                </div>
              )}

              {/* Ranked Vehicle List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {matchResults.map((result, index) => {
                  const isTopMatch = index === 0;
                  return (
                    <div
                      key={result.vehicleSlug}
                      style={{
                        padding: '1.75rem',
                        borderRadius: 'var(--radius-lg)',
                        background: isTopMatch ? 'rgba(0, 242, 254, 0.04)' : 'var(--bg-surface)',
                        border: isTopMatch ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1.5rem',
                        alignItems: 'center'
                      }}
                    >
                      {/* Left: Info */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                          <span
                            className="badge"
                            style={{
                              background: isTopMatch ? 'var(--accent-cyan)' : 'var(--bg-surface-elevated)',
                              color: isTopMatch ? '#07080a' : 'var(--text-secondary)',
                              fontWeight: 700
                            }}
                          >
                            Rank #{index + 1}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {result.category}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.4rem', margin: '0.2rem 0' }}>
                          <Link to={`/vehicles/${result.vehicleSlug}`} style={{ color: 'var(--text-primary)' }}>
                            {result.vehicleName}
                          </Link>
                        </h3>

                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0.4rem 0 0.8rem' }}>
                          {formatPriceINR(result.priceExShowroomINR)} • {result.rangeKmClaimed} km claimed
                        </div>

                        {/* Rationale Statement */}
                        <div style={{
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface-elevated)',
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.5,
                          borderLeft: '3px solid var(--accent-cyan)'
                        }}>
                          <strong>Matching Rationale:</strong> {result.reason}
                        </div>

                        {/* Missing fields notice if any */}
                        {result.missingFields && result.missingFields.length > 0 && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                            * Excluded missing unverified fields from score: {result.missingFields.join(', ')}
                          </div>
                        )}
                      </div>

                      {/* Right: Score Gauge & CTAs */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center' }}>
                        <div style={{
                          width: 90,
                          height: 90,
                          borderRadius: '50%',
                          border: '4px solid var(--accent-cyan)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isTopMatch ? '0 0 20px var(--accent-cyan-glow)' : 'none'
                        }}>
                          <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)' }}>
                            {result.matchPercentage}%
                          </span>
                          <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                            Match
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.6rem', width: '100%', maxWidth: 240 }}>
                          <Link to={`/vehicles/${result.vehicleSlug}`} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: '0.8rem' }}>
                            Details
                          </Link>
                          <Link to={`/test-drive?vehicle=${result.vehicleSlug}`} className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: '0.8rem' }}>
                            Test Drive
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transparent Algorithm Disclosure */}
            <div className="glass-panel" style={{ padding: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                <HelpCircle size={15} color="var(--accent-cyan)" />
                Algorithmic Transparency Formula
              </div>
              Total Score = Σ(Weight<sub>i</sub> × MetricScore<sub>i</sub>) ÷ TotalEvaluatedWeight.
              Metric scores are evaluated on verified numerical bounds (e.g. daily commute multiplied by a 3.5× multi-day battery buffer).
              Missing attributes are excluded entirely from the vehicle's denominator to guarantee unbiased evaluation.
            </div>
          </div>
        ) : (
          /* QUESTION STEPS VIEW */
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            {/* Progress Bar */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <span>Step {currentStep + 1} of {QUESTIONS.length}</span>
                <span>{Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}% Complete</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${((currentStep + 1) / QUESTIONS.length) * 100}%`,
                  background: 'var(--accent-cyan)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Current Question */}
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.45rem', marginBottom: '0.4rem' }}>
                {activeQuestion.title}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {activeQuestion.subtitle}
              </p>
            </div>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2.5rem' }}>
              {activeQuestion.options.map(opt => {
                const isSelected = answers[activeQuestion.id] === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => handleSelectOption(activeQuestion.id, opt.value)}
                    style={{
                      padding: '1.1rem 1.4rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--accent-cyan-subtle)' : 'var(--bg-surface)',
                      border: isSelected ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {opt.hint}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={18} color="var(--accent-cyan)" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="btn btn-ghost"
              >
                <ArrowLeft size={16} /> Previous
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="btn btn-primary btn-lg"
              >
                {loading ? 'Computing...' : currentStep === QUESTIONS.length - 1 ? 'Compute My Match' : 'Next Step'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindYourAura;
