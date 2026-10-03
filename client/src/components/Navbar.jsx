import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Palette,
  Compass,
  Bookmark,
  Image as ImageIcon,
  Info,
  ShieldCheck,
  User,
  LogOut,
  Sun,
  Moon,
  LogIn,
  Menu,
  X
} from 'lucide-react';

export function Navbar({ activeRoute, navigate, openImageUpload }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = route => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="logo-container" onClick={() => handleNav('/')}>
          <div className="logo-icon">
            <Palette size={20} color="#ffffff" />
          </div>
          <span className="gradient-text">PaletteApp</span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          <button
            className={`nav-link ${activeRoute === '/' ? 'active' : ''}`}
            onClick={() => handleNav('/')}
            style={{ border: 'none', background: 'none' }}
          >
            <Palette size={16} />
            <span>Generator</span>
          </button>

          <button
            className={`nav-link ${activeRoute === '/explore' ? 'active' : ''}`}
            onClick={() => handleNav('/explore')}
            style={{ border: 'none', background: 'none' }}
          >
            <Compass size={16} />
            <span>Explore</span>
          </button>

          {isAuthenticated && (
            <button
              className={`nav-link ${activeRoute === '/saved' ? 'active' : ''}`}
              onClick={() => handleNav('/saved')}
              style={{ border: 'none', background: 'none' }}
            >
              <Bookmark size={16} />
              <span>Saved</span>
            </button>
          )}

          <button
            className="nav-link"
            onClick={() => {
              if (openImageUpload) openImageUpload();
              else handleNav('/?action=image');
            }}
            style={{ border: 'none', background: 'none' }}
            title="Extract palette from image"
          >
            <ImageIcon size={16} />
            <span>Image Extractor</span>
          </button>

          <button
            className={`nav-link ${activeRoute === '/about' ? 'active' : ''}`}
            onClick={() => handleNav('/about')}
            style={{ border: 'none', background: 'none' }}
          >
            <Info size={16} />
            <span>About</span>
          </button>

          {isAdmin && (
            <button
              className={`nav-link ${activeRoute === '/admin' ? 'active' : ''}`}
              onClick={() => handleNav('/admin')}
              style={{ border: 'none', background: 'none', color: '#ec4899' }}
            >
              <ShieldCheck size={16} />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Action Controls & User Status */}
        <div className="nav-actions">
          {/* Theme Switcher */}
          <button
            className="btn-icon"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Section */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className={`btn btn-secondary ${activeRoute === '/profile' ? 'active' : ''}`}
                onClick={() => handleNav('/profile')}
                style={{ padding: '0.45rem 0.85rem' }}
                title="View Profile & Stats"
              >
                <User size={16} />
                <span>{user.username}</span>
                {user.role === 'admin' && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      background: 'rgba(236, 72, 153, 0.2)',
                      color: '#ec4899',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}
                  >
                    ADMIN
                  </span>
                )}
              </button>

              <button
                className="btn-icon"
                onClick={logout}
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => handleNav('/login')}
              style={{ padding: '0.5rem 1rem' }}
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
