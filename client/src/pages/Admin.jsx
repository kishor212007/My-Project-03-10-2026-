import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Users, Palette, Heart, Trash2, ShieldAlert, RefreshCw } from 'lucide-react';

export function Admin({ navigate, onNotify }) {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [palettesList, setPalettesList] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'palettes'
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, palettesRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers(),
        api.admin.getPalettes()
      ]);
      setStats(statsRes.stats);
      setUsersList(usersRes.users || []);
      setPalettesList(palettesRes.palettes || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      if (onNotify) onNotify(err.message || 'Failed to load admin panel data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <ShieldAlert size={48} color="#ef4444" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 2rem auto' }}>
          This page is restricted to system administrators. Please sign in with an administrator account to continue.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Sign In as Admin
        </button>
      </div>
    );
  }

  const handleDeleteUser = async (targetUserId, targetUsername) => {
    if (targetUserId === user.id) {
      if (onNotify) onNotify('You cannot delete your own admin account', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${targetUsername}"? All their palettes will also be deleted.`)) {
      return;
    }

    try {
      await api.admin.deleteUser(targetUserId);
      setUsersList(prev => prev.filter(u => u.id !== targetUserId));
      setPalettesList(prev => prev.filter(p => p.user_id !== targetUserId));
      if (onNotify) onNotify(`User "${targetUsername}" deleted`, 'success');
      loadAdminData();
    } catch (err) {
      if (onNotify) onNotify(err.message || 'Failed to delete user', 'error');
    }
  };

  const handleDeletePalette = async (paletteId, title) => {
    if (!window.confirm(`Are you sure you want to delete palette "${title}"?`)) {
      return;
    }

    try {
      await api.admin.deletePalette(paletteId);
      setPalettesList(prev => prev.filter(p => p.id !== paletteId));
      if (onNotify) onNotify(`Palette "${title}" deleted`, 'success');
      loadAdminData();
    } catch (err) {
      if (onNotify) onNotify(err.message || 'Failed to delete palette', 'error');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={28} color="#ec4899" />
            <h1 className="page-title">Admin Management Panel</h1>
          </div>
          <p className="page-subtitle">Inspect registered users, manage palettes, and view system metrics.</p>
        </div>

        <button className="btn btn-secondary" onClick={loadAdminData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Banner */}
      {stats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem'
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.total_users}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Registered Users</div>
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(236, 72, 153, 0.15)',
                color: '#ec4899',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Palette size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.total_palettes}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Palettes</div>
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Heart size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stats.total_likes}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Community Likes</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem'
        }}
      >
        <button
          className="btn"
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '3px solid var(--primary-500)' : '3px solid transparent',
            borderRadius: 0,
            color: activeTab === 'users' ? 'var(--primary-500)' : 'var(--text-secondary)',
            fontWeight: 700,
            padding: '0.75rem 1.25rem'
          }}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          <span>Users ({usersList.length})</span>
        </button>

        <button
          className="btn"
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'palettes' ? '3px solid var(--primary-500)' : '3px solid transparent',
            borderRadius: 0,
            color: activeTab === 'palettes' ? 'var(--primary-500)' : 'var(--text-secondary)',
            fontWeight: 700,
            padding: '0.75rem 1.25rem'
          }}
          onClick={() => setActiveTab('palettes')}
        >
          <Palette size={16} />
          <span>Palettes ({palettesList.length})</span>
        </button>
      </div>

      {/* Tables */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
          Loading admin records...
        </div>
      ) : activeTab === 'users' ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Palettes</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id}>
                  <td className="mono" style={{ color: 'var(--text-muted)' }}>#{u.id}</td>
                  <td>
                    <strong>{u.username}</strong>
                    {u.id === user.id && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--primary-500)' }}>(You)</span>
                    )}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: u.role === 'admin' ? 'rgba(236, 72, 153, 0.2)' : 'var(--bg-surface-hover)',
                        color: u.role === 'admin' ? '#ec4899' : 'var(--text-secondary)'
                      }}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{u.palettes_count || 0}</td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    {u.id !== user.id && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        title="Delete user"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Colors Preview</th>
                <th>Title</th>
                <th>Author</th>
                <th>Likes</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {palettesList.map(p => (
                <tr key={p.id}>
                  <td className="mono" style={{ color: 'var(--text-muted)' }}>#{p.id}</td>
                  <td>
                    <div
                      style={{
                        display: 'flex',
                        height: '24px',
                        width: '120px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      onClick={() => navigate(`/palette/${p.id}`)}
                    >
                      {p.colors.map((c, i) => (
                        <div key={i} style={{ flex: 1, backgroundColor: c }} title={c} />
                      ))}
                    </div>
                  </td>
                  <td>
                    <strong
                      style={{ cursor: 'pointer', color: 'var(--text-main)' }}
                      onClick={() => navigate(`/palette/${p.id}`)}
                    >
                      {p.title}
                    </strong>
                  </td>
                  <td>{p.author || 'User'}</td>
                  <td>{p.likes_count || 0}</td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={() => handleDeletePalette(p.id, p.title)}
                      title="Delete palette"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
