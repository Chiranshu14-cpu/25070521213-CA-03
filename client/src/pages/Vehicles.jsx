import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, AlertCircle } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import { useAuth } from '../context/AuthContext';

const MANUFACTURERS = ['All', 'Porsche', 'BMW', 'Kia', 'Hyundai', 'BYD', 'Tata Motors', 'Mahindra'];
const BODY_TYPES = ['All', 'Sedan', 'SUV', 'Crossover'];
const SORT_OPTIONS = [
  { label: 'Featured & Premium', value: 'default' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Range: Highest First', value: 'range-desc' },
  { label: '0-100: Fastest First', value: 'acceleration-asc' }
];

const Vehicles = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState('All');
  const [selectedBodyType, setSelectedBodyType] = useState('All');
  const [selectedSort, setSelectedSort] = useState('default');
  const [savedIds, setSavedIds] = useState(new Set());

  // Fetch vehicles whenever filter criteria changes
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.append('search', search.trim());
        if (selectedManufacturer !== 'All') params.append('manufacturer', selectedManufacturer);
        if (selectedBodyType !== 'All') params.append('bodyType', selectedBodyType);
        if (selectedSort !== 'default') params.append('sort', selectedSort);

        const res = await fetch(`/api/vehicles?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to load vehicle catalog.');
        }
        const data = await res.json();
        setVehicles(data.vehicles || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchVehicles, 200);
    return () => clearTimeout(debounceTimer);
  }, [search, selectedManufacturer, selectedBodyType, selectedSort]);

  // Load saved vehicles for current user
  useEffect(() => {
    if (user) {
      fetch('/api/saved-vehicles')
        .then(res => res.json())
        .then(data => {
          if (data.saved) {
            setSavedIds(new Set(data.saved.map(item => item.vehicle?._id || item.vehicle)));
          }
        })
        .catch(() => {});
    } else {
      setSavedIds(new Set());
    }
  }, [user]);

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
      console.warn('Failed to toggle save:', err);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedManufacturer('All');
    setSelectedBodyType('All');
    setSelectedSort('default');
  };

  return (
    <div style={{ padding: '3rem 0 6rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="badge" style={{ marginBottom: '0.6rem' }}>Catalog</span>
          <h1 style={{ marginBottom: '0.6rem' }}>Discover the Electric Fleet</h1>
          <p style={{ maxWidth: 650, fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
            Curated selection of verified electric vehicles officially sold in India. Verified ARAI test figures, approximate ex-showroom pricing, and architecture details.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search model, OEM, or specs..."
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>

            {/* Manufacturer Dropdown */}
            <div>
              <select
                value={selectedManufacturer}
                onChange={(e) => setSelectedManufacturer(e.target.value)}
                className="form-select"
                aria-label="Filter by manufacturer"
              >
                {MANUFACTURERS.map(m => (
                  <option key={m} value={m}>
                    {m === 'All' ? 'All Manufacturers' : m}
                  </option>
                ))}
              </select>
            </div>

            {/* Body Type Dropdown */}
            <div>
              <select
                value={selectedBodyType}
                onChange={(e) => setSelectedBodyType(e.target.value)}
                className="form-select"
                aria-label="Filter by body type"
              >
                {BODY_TYPES.map(b => (
                  <option key={b} value={b}>
                    {b === 'All' ? 'All Body Types' : `${b}s`}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="form-select"
                aria-label="Sort vehicles"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Chips & Reset */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ color: 'var(--text-secondary)' }}>
              Showing <strong>{vehicles.length}</strong> verified electric vehicles
            </div>
            {(search || selectedManufacturer !== 'All' || selectedBodyType !== 'All' || selectedSort !== 'default') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn btn-ghost btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <RotateCcw size={13} />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Area */}
        {loading ? (
          <div style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '3px solid var(--border-medium)',
              borderTopColor: 'var(--accent-cyan)',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 1rem'
            }} />
            Loading verified catalog...
          </div>
        ) : error ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderColor: 'var(--status-error)' }}>
            <AlertCircle size={36} color="var(--status-error)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>Unable to fetch vehicles</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
            <button type="button" onClick={() => window.location.reload()} className="btn btn-primary">
              Retry Query
            </button>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <h3>No vehicles match the selected criteria</h3>
            <p style={{ maxWidth: 450, margin: '0.5rem auto 1.5rem', color: 'var(--text-muted)' }}>
              Try loosening your filters or resetting the search term to view the full collection.
            </p>
            <button type="button" onClick={handleResetFilters} className="btn btn-secondary">
              View All 7 Vehicles
            </button>
          </div>
        ) : (
          <div className="grid-catalog">
            {vehicles.map(vehicle => (
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
    </div>
  );
};

export default Vehicles;
