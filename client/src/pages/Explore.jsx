import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { PaletteCard } from '../components/PaletteCard';
import { Search, Compass, Sparkles, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

const POPULAR_TAGS = ['all', 'sunset', 'neon', 'nature', 'pastel', 'ocean', 'dark', 'warm', 'vintage'];

export function Explore({ navigate, onNotify }) {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [palettes, setPalettes] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [sort, setSort] = useState('popular');
  const [loading, setLoading] = useState(true);

  const fetchPalettes = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        sort,
        search: search.trim() || undefined,
        tag: activeTag !== 'all' ? activeTag : undefined
      };
      const res = await api.palettes.list(params);
      setPalettes(res.palettes || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load palettes:', err);
      if (onNotify) onNotify('Failed to load palettes from server', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, activeTag, onNotify]);

  useEffect(() => {
    fetchPalettes();
  }, [fetchPalettes]);

  const handleLike = async paletteId => {
    if (!isAuthenticated) {
      if (onNotify) onNotify('Please sign in to like palettes', 'info');
      navigate('/login');
      return;
    }

    try {
      const res = await api.palettes.toggleLike(paletteId);
      setPalettes(prev =>
        prev.map(p => {
          if (p.id === paletteId) {
            return {
              ...p,
              is_liked_by_me: res.liked,
              likes_count: res.likes_count
            };
          }
          return p;
        })
      );
    } catch (err) {
      if (onNotify) onNotify(err.message || 'Failed to toggle like', 'error');
    }
  };

  const handleDelete = async paletteId => {
    if (!window.confirm('Are you sure you want to delete this palette?')) return;
    try {
      await api.palettes.delete(paletteId);
      setPalettes(prev => prev.filter(p => p.id !== paletteId));
      if (onNotify) onNotify('Palette deleted successfully', 'success');
    } catch (err) {
      if (onNotify) onNotify(err.message || 'Failed to delete palette', 'error');
    }
  };

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Compass size={28} color="var(--primary-500)" />
          <h1 className="page-title">Explore Palettes</h1>
        </div>
        <p className="page-subtitle">
          Browse, like, and export thousands of color combinations curated by creators worldwide.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          background: 'var(--bg-card)',
          padding: '1.25rem',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search by title, style or colors..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Sort Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={sort}
            onChange={e => {
              setSort(e.target.value);
              setPage(1);
            }}
            style={{ width: 'auto' }}
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Popular Tag Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
        {POPULAR_TAGS.map(tag => (
          <button
            key={tag}
            className={`tag-badge ${activeTag === tag ? 'active' : ''}`}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.85rem',
              border: activeTag === tag ? '1px solid var(--primary-500)' : '1px solid var(--border-subtle)',
              background: activeTag === tag ? 'var(--primary-gradient)' : 'var(--bg-card)',
              color: activeTag === tag ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
            onClick={() => {
              setActiveTag(tag);
              setPage(1);
            }}
          >
            {tag === 'all' ? 'All Tags' : `#${tag}`}
          </button>
        ))}
      </div>

      {/* Palettes Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>Loading palettes...</div>
        </div>
      ) : palettes.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 1.5rem',
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <Sparkles size={40} color="var(--primary-500)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Palettes Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            We couldn't find any palettes matching your current filter. Try searching for something else or clear the filters.
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSearch('');
              setActiveTag('all');
              setPage(1);
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="palette-grid">
          {palettes.map(palette => (
            <PaletteCard
              key={palette.id}
              palette={palette}
              currentUserId={user ? user.id : null}
              isAdmin={isAdmin}
              onLike={handleLike}
              onDelete={handleDelete}
              onTagClick={t => {
                setActiveTag(t);
                setPage(1);
              }}
              onOpenDetail={id => navigate(`/palette/${id}`)}
              onNotify={onNotify}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginTop: '3rem'
          }}
        >
          <button
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Page {page} of {totalPages} ({total} palettes)
          </span>

          <button
            className="btn btn-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
