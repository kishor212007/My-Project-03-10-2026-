import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ExportModal } from '../components/ExportModal';
import {
  hexToRgb,
  hexToHsl,
  getAccessibleTextColor,
  getContrastRatio,
  getContrastRating,
  getColorName
} from '../utils/color';
import {
  ArrowLeft,
  Heart,
  Share2,
  Copy,
  Check,
  Trash2,
  ShieldAlert,
  Calendar,
  User,
  Sliders
} from 'lucide-react';

export function PaletteDetail({ paletteId, navigate, onNotify }) {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [palette, setPalette] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedHex, setCopiedHex] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    async function loadPalette() {
      try {
        setLoading(true);
        setError('');
        const res = await api.palettes.get(paletteId);
        setPalette(res.palette);
      } catch (err) {
        setError(err.message || 'Palette not found');
      } finally {
        setLoading(false);
      }
    }

    if (paletteId) {
      loadPalette();
    }
  }, [paletteId]);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    if (onNotify) onNotify(`Copied ${label || text}!`, 'success');
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      if (onNotify) onNotify('Please sign in to like palettes', 'info');
      navigate('/login');
      return;
    }

    try {
      const res = await api.palettes.toggleLike(palette.id);
      setPalette(prev => ({
        ...prev,
        is_liked_by_me: res.liked,
        likes_count: res.likes_count
      }));
    } catch (err) {
      if (onNotify) onNotify(err.message || 'Failed to toggle like', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this palette?')) return;
    try {
      await api.palettes.delete(palette.id);
      if (onNotify) onNotify('Palette deleted successfully', 'success');
      navigate('/explore');
    } catch (err) {
      if (onNotify) onNotify(err.message || 'Failed to delete palette', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <h2>Loading palette details...</h2>
      </div>
    );
  }

  if (error || !palette) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <ShieldAlert size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2>{error || 'Palette Not Found'}</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem 0' }}>
          This palette may have been removed or the link is invalid.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/explore')}>
          Back to Explore
        </button>
      </div>
    );
  }

  const isOwner = user && palette.user_id === user.id;
  const canDelete = isOwner || isAdmin;
  const colors = palette.colors || [];

  return (
    <div className="page-container" style={{ maxWidth: '1100px' }}>
      {/* Back Button */}
      <button
        className="btn btn-secondary"
        style={{ marginBottom: '1.5rem', padding: '0.4rem 0.8rem' }}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Palette Title and Actions Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <h1 className="page-title" style={{ fontSize: '2.5rem' }}>
            {palette.title}
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              marginTop: '0.4rem'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={15} />
              <span>Created by {palette.author || 'Anonymous'}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={15} />
              <span>{new Date(palette.created_at).toLocaleDateString()}</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Like Button */}
          <button
            className="btn btn-secondary"
            onClick={handleLike}
            style={{ color: palette.is_liked_by_me ? '#ec4899' : 'inherit' }}
          >
            <Heart size={18} fill={palette.is_liked_by_me ? '#ec4899' : 'none'} />
            <span>{palette.likes_count} Likes</span>
          </button>

          {/* Export Button */}
          <button className="btn btn-primary" onClick={() => setIsExportOpen(true)}>
            <Share2 size={18} />
            <span>Export</span>
          </button>

          {/* Delete Button if authorized */}
          {canDelete && (
            <button className="btn btn-danger" onClick={handleDelete} title="Delete Palette">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Hero Swatches Banner */}
      <div
        style={{
          height: '200px',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '2.5rem'
        }}
      >
        {colors.map((color, idx) => {
          const textColor = getAccessibleTextColor(color);
          const isCopied = copiedHex === color;

          return (
            <div
              key={idx}
              style={{
                flex: 1,
                backgroundColor: color,
                color: textColor,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '1.5rem 1rem',
                cursor: 'pointer',
                transition: 'flex var(--transition-fast)'
              }}
              onClick={() => handleCopy(color, color)}
              title="Click to copy hex"
            >
              <span className="mono" style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                {isCopied ? 'COPIED!' : color}
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                {getColorName(color)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Color Details Cards */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem' }}>Color Codes & Formats</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {colors.map((color, idx) => {
            const rgb = hexToRgb(color);
            const hsl = hexToHsl(color);
            const textColor = getAccessibleTextColor(color);

            return (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div
                  style={{
                    height: '60px',
                    borderRadius: '10px',
                    backgroundColor: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: textColor,
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {color}
                </div>

                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
                    onClick={() => handleCopy(color, 'HEX')}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>HEX:</span>
                    <strong className="mono">{color}</strong>
                  </div>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
                    onClick={() => handleCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'RGB')}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>RGB:</span>
                    <strong className="mono">{`${rgb.r}, ${rgb.g}, ${rgb.b}`}</strong>
                  </div>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}
                    onClick={() => handleCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'HSL')}
                  >
                    <span style={{ color: 'var(--text-secondary)' }}>HSL:</span>
                    <strong className="mono">{`${hsl.h}°, ${hsl.s}%, ${hsl.l}%`}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WCAG Accessibility Contrast Matrix */}
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>WCAG 2.1 Accessibility Matrix</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Contrast ratios calculated between all colors in this palette for text and UI elements.
          (AAA &ge; 7:1, AA &ge; 4.5:1, AA Large &ge; 3:1).
        </p>

        <div className="table-container">
          <table className="contrast-matrix">
            <thead>
              <tr>
                <th style={{ background: 'var(--bg-surface)' }}>Background \ Text</th>
                {colors.map((c, i) => (
                  <th key={i} style={{ backgroundColor: c, color: getAccessibleTextColor(c), fontFamily: 'var(--font-mono)' }}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {colors.map((bg, rowIdx) => (
                <tr key={rowIdx}>
                  <td style={{ backgroundColor: bg, color: getAccessibleTextColor(bg), fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {bg}
                  </td>
                  {colors.map((fg, colIdx) => {
                    if (rowIdx === colIdx) {
                      return (
                        <td key={colIdx} style={{ color: 'var(--text-muted)' }}>
                          &mdash;
                        </td>
                      );
                    }
                    const ratio = getContrastRatio(bg, fg);
                    const rating = getContrastRating(ratio);

                    return (
                      <td key={colIdx}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                          <span className="mono" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{ratio}:1</span>
                          <span
                            className="contrast-chip"
                            style={{
                              backgroundColor: `${rating.color}25`,
                              color: rating.color,
                              border: `1px solid ${rating.color}50`
                            }}
                          >
                            {rating.level}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Dialog */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        palette={palette}
        onNotify={onNotify}
      />
    </div>
  );
}
