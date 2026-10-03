import React, { useState } from 'react';
import { X, Bookmark, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SavePaletteModal({ isOpen, onClose, colors, onSaveSuccess, onNotify, navigate }) {
  if (!isOpen) return null;

  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState(['modern', 'palette']);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Authentication Required</h2>
            <button className="btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          <div className="modal-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              You need to sign in or create an account to save custom palettes to your collection.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
              >
                Sign In Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (trimmed && !tags.includes(trimmed) && tags.length < 6) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = tagToRemove => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for your palette');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSaveSuccess({
        title: title.trim(),
        colors,
        tags
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save palette');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Save Palette to Collection</h2>
            <button type="button" className="btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className="modal-body">
            {error && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '0.875rem'
                }}
              >
                {error}
              </div>
            )}

            {/* Colors Preview */}
            <div style={{ height: '40px', display: 'flex', borderRadius: '10px', overflow: 'hidden' }}>
              {colors.map((c, i) => (
                <div key={i} style={{ flex: 1, backgroundColor: c }} title={c} />
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Palette Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Midnight Cyberpunk, Warm Autumn Sunset"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={60}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags (Max 6)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a tag and press enter (e.g. vibrant, UI)"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 6}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Tag Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="tag-badge"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Bookmark size={16} />
              <span>{isSubmitting ? 'Saving...' : 'Save Palette'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
