import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Car, Compass, Scale, Calculator, Sparkles, Database, Info, Shield, X, ArrowRight } from 'lucide-react';

const STATIC_COMMANDS = [
  { id: 'page-home', title: 'Home Overview', subtitle: 'Cinematic hero and platform vision', path: '/', icon: Compass, category: 'Pages' },
  { id: 'page-vehicles', title: 'Discover Collection', subtitle: 'Curated 7-vehicle verified EV catalog', path: '/vehicles', icon: Car, category: 'Pages' },
  { id: 'page-compare', title: 'Compare Vehicles', subtitle: 'Side-by-side comparison with Recharts radar chart', path: '/compare', icon: Scale, category: 'Pages' },
  { id: 'page-quiz', title: 'Find Your AURA (Quiz)', subtitle: 'Signature feature: 5-question weighted recommendation', path: '/find-your-aura', icon: Sparkles, category: 'Signature Features' },
  { id: 'page-estimator', title: 'Cost & Range Estimator', subtitle: 'Signature feature: Real-world range, savings & CO2 impact', path: '/estimator', icon: Calculator, category: 'Signature Features' },
  { id: 'page-lookup', title: 'NHTSA Vehicle Data Lookup', subtitle: 'Live US DOT vPIC VIN decoding & model search', path: '/vehicle-lookup', icon: Database, category: 'External Data' },
  { id: 'page-garage', title: 'My Garage', subtitle: 'User saved vehicles and test-drive inquiries', path: '/garage', icon: Shield, category: 'User Account' },
  { id: 'page-about', title: 'About AURA', subtitle: 'Concept, engineering stack & college project disclaimer', path: '/about', icon: Info, category: 'Pages' }
];

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [vehicles, setVehicles] = useState([]);
  const inputRef = useRef(null);

  // Fetch catalog vehicles for direct jump
  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        if (data.vehicles) {
          setVehicles(data.vehicles);
        }
      })
      .catch(() => {});
  }, []);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent or dispatch
          window.dispatchEvent(new CustomEvent('open-aura-palette'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build combined items
  const vehicleCommands = vehicles.map(v => ({
    id: `veh-${v.slug}`,
    title: v.name,
    subtitle: `${v.manufacturer} • ${v.category} • ${v.rangeKmClaimed} km claimed`,
    path: `/vehicles/${v.slug}`,
    icon: Car,
    category: 'Vehicles'
  }));

  const allItems = [...STATIC_COMMANDS, ...vehicleCommands];

  const filteredItems = allItems.filter(item => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  const handleSelect = (item) => {
    navigate(item.path);
    onClose();
  };

  const handleKeyDownInInput = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  return (
    <div className="cmd-palette-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Command Palette">
      <div className="cmd-palette-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-medium)', gap: '0.75rem' }}>
          <Search size={20} color="var(--accent-cyan)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDownInInput}
            placeholder="Search vehicles, features, or jump to page... (Esc to close)"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '1.05rem',
              fontFamily: 'inherit'
            }}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '0.5rem 0' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No matches found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 1.25rem',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--accent-cyan-subtle)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--accent-cyan)' : 'var(--bg-surface)',
                      color: isSelected ? '#07080a' : 'var(--accent-cyan)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: 4, background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                        {item.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      {item.subtitle}
                    </div>
                  </div>
                  {isSelected && <ArrowRight size={16} color="var(--accent-cyan)" />}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div style={{ padding: '0.6rem 1.25rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Navigate with <kbd style={{ padding: '2px 5px', background: 'var(--bg-primary)', borderRadius: 3, border: '1px solid var(--border-subtle)' }}>↑</kbd> <kbd style={{ padding: '2px 5px', background: 'var(--bg-primary)', borderRadius: 3, border: '1px solid var(--border-subtle)' }}>↓</kbd></span>
          <span>Select with <kbd style={{ padding: '2px 5px', background: 'var(--bg-primary)', borderRadius: 3, border: '1px solid var(--border-subtle)' }}>Enter</kbd></span>
          <span>Close with <kbd style={{ padding: '2px 5px', background: 'var(--bg-primary)', borderRadius: 3, border: '1px solid var(--border-subtle)' }}>Esc</kbd></span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
