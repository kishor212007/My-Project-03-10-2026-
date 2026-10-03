import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { PaletteCard } from '../components/PaletteCard';
import { Bookmark, Heart, FolderHeart, Sparkles } from 'lucide-react';

export function Saved({ navigate, onNotify }) {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('liked'); // 'liked' | 'mine'
  const [likedPalettes, setLikedPalettes] = useState([]);
  const [myPalettes, setMyPalettes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadSavedData() {
      try {
        setLoading(true);
        const [savedRes, mineRes] = await Promise.all([
          api.palettes.getSaved(),
          api.palettes.getMine()
        ]);
        setLikedPalettes(savedRes.palettes || []);
        setMyPalettes(mineRes.palettes || []);
      } catch (err) {
        console.error('Failed to load saved palettes:', err);
        if (onNotify) onNotify('Failed to load saved palettes', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadSavedData();
  }, [isAuthenticated, onNotify]);

  if (!isAuthenticated) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
        <FolderHeart size={48} color="var(--primary-500)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Sign In to View Saved Palettes</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 2rem auto' }}>
          Create an account or sign in to bookmark your favorite palettes, organize custom themes, and access your created color schemes.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Sign In Now
        </button>
      </div>
    );
  }

  const handleLike = async paletteId => {
    try {
      const res = await api.palettes.toggleLike(paletteId);
      // If unliking from saved tab, remove from likedPalettes
      if (!res.liked && activeTab === 'liked') {
        setLikedPalettes(prev => prev.filter(p => p.id !== paletteId));
      } else {
        setLikedPalettes(prev =>
          prev.map(p => (p.id === paletteId ? { ...p, is_liked_by_me: res.liked, likes_count: res.likes_count } : p))
        );
      }

      setMyPalettes(prev =>
        prev.map(p => (p.id === paletteId ? { ...p, is_liked_by_me: res.liked, likes_count: res.likes_count } : p))
      );
    } catch (err) {
      if (onNotify) onNotify(err.message || 'Failed to toggle like', 'error');
    }
  };

  const handleDelete = async paletteId => {
    if (!window.confirm('Are you sure you want to delete this palette?')) return;
    try {
      await api.palettes.delete(paletteId);
      setMyPalettes(prev => prev.filter(p => p.id !== paletteId));
      setLikedPalettes(prev => prev.filter(p => p.id !== paletteId));
      if (onNotify) onNotify('Palette deleted successfully', 'success');
    } catch (err) {
      if (onNotify) onNotify(err.message || 'Failed to delete palette', 'error');
    }
  };

  const currentList = activeTab === 'liked' ? likedPalettes : myPalettes;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Bookmark size={28} color="var(--primary-500)" />
          <h1 className="page-title">Your Collection</h1>
        </div>
        <p className="page-subtitle">
          Manage your saved bookmarks and palettes you've designed.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '2rem'
        }}
      >
        <button
          className="btn"
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'liked' ? '3px solid var(--primary-500)' : '3px solid transparent',
            borderRadius: 0,
            color: activeTab === 'liked' ? 'var(--primary-500)' : 'var(--text-secondary)',
            fontWeight: 700,
            padding: '0.75rem 1.25rem'
          }}
          onClick={() => setActiveTab('liked')}
        >
          <Heart size={16} />
          <span>Liked Palettes ({likedPalettes.length})</span>
        </button>

        <button
          className="btn"
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'mine' ? '3px solid var(--primary-500)' : '3px solid transparent',
            borderRadius: 0,
            color: activeTab === 'mine' ? 'var(--primary-500)' : 'var(--text-secondary)',
            fontWeight: 700,
            padding: '0.75rem 1.25rem'
          }}
          onClick={() => setActiveTab('mine')}
        >
          <FolderHeart size={16} />
          <span>My Creations ({myPalettes.length})</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
          Loading saved palettes...
        </div>
      ) : currentList.length === 0 ? (
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
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            {activeTab === 'liked' ? 'No Liked Palettes Yet' : 'No Created Palettes Yet'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            {activeTab === 'liked'
              ? 'Browse the Explore gallery or click the heart on any palette to bookmark it here.'
              : 'Use the generator to create custom color combinations and save them to your account.'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go to Generator
          </button>
        </div>
      ) : (
        <div className="palette-grid">
          {currentList.map(palette => (
            <PaletteCard
              key={palette.id}
              palette={palette}
              currentUserId={user ? user.id : null}
              isAdmin={isAdmin}
              onLike={handleLike}
              onDelete={handleDelete}
              onOpenDetail={id => navigate(`/palette/${id}`)}
              onNotify={onNotify}
            />
          ))}
        </div>
      )}
    </div>
  );
}
