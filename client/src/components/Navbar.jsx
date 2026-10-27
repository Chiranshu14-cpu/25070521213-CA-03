import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, Search, Menu, X, Shield, LogOut, User, Scale, Sparkles, Calculator } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';

const Navbar = ({ onOpenCommandPalette }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { compareList } = useCompare();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Discover', path: '/vehicles' },
    {
      name: 'Compare',
      path: '/compare',
      badge: compareList.length > 0 ? compareList.length : null
    },
    { name: 'Find Your AURA', path: '/find-your-aura', highlight: true },
    { name: 'Estimator', path: '/estimator' },
    { name: 'NHTSA Data', path: '/vehicle-lookup' },
    { name: 'About', path: '/about' }
  ];

  return (
    <header className="navbar">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand / Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, var(--accent-cyan), #007094)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#07080a',
            fontWeight: 900,
            fontSize: '1.1rem',
            fontFamily: 'var(--font-display)',
            boxShadow: '0 0 15px var(--accent-cyan-glow)'
          }}>
            A
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.12em', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>
              AURA
            </span>
            <span style={{ fontSize: '0.62rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', lineHeight: 1.2 }}>
              Future of Mobility
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', gap: '1.6rem', alignItems: 'center' }} className="desktop-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              style={({ isActive }) => ({
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'color 0.2s ease',
                padding: '0.4rem 0'
              })}
            >
              {link.name}
              {link.badge && (
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: 'var(--accent-cyan)',
                  color: '#07080a',
                  fontSize: '0.65rem',
                  fontWeight: 700
                }}>
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Action Controls (Right) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Command Palette Trigger */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            aria-label="Open command palette"
            title="Search & Quick Actions (Ctrl+K)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.85rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={14} color="var(--accent-cyan)" />
            <span className="search-shortcut-text" style={{ display: 'none' }}>Search...</span>
            <kbd style={{
              fontSize: '0.65rem',
              padding: '2px 5px',
              borderRadius: '4px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)'
            }}>
              Ctrl+K
            </kbd>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Auth Controls */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to="/garage"
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 0.9rem' }}
                title="Go to My Garage"
              >
                <Shield size={14} color="var(--accent-cyan)" />
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName.split(' ')[0]}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                title="Sign Out"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 1rem' }}
            >
              <User size={14} />
              Sign In
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            className="mobile-hamburger-btn"
            style={{
              width: 38,
              height: 38,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: 'var(--bg-surface-elevated)',
          borderBottom: '1px solid var(--border-medium)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                fontSize: '1rem',
                fontWeight: 600,
                color: isActive ? 'var(--accent-cyan)' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0'
              })}
            >
              <span>{link.name}</span>
              {link.badge && (
                <span className="badge" style={{ fontSize: '0.7rem' }}>
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
          {user && (
            <Link
              to="/garage"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', marginTop: '0.5rem' }}
            >
              <Shield size={16} color="var(--accent-cyan)" />
              My Garage ({user.displayName})
            </Link>
          )}
        </div>
      )}

      {/* Embedded CSS for responsive breakpoint handling */}
      <style>{`
        @media (min-width: 880px) {
          .desktop-nav { display: flex !important; }
          .mobile-hamburger-btn { display: none !important; }
          .search-shortcut-text { display: inline !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
