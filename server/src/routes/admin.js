const express = require('express');
const router = express.Router();
const { getDb } = require('../db/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All routes in this router require authentication and admin role
router.use(authenticateToken, requireAdmin);

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  try {
    const db = getDb();
    const stats = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM palettes) AS total_palettes,
        (SELECT COUNT(*) FROM likes) AS total_likes
    `).get();

    return res.json({ stats });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: 'Failed to retrieve admin stats' });
  }
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  try {
    const db = getDb();
    const users = db.prepare(`
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.role, 
        u.created_at,
        (SELECT COUNT(*) FROM palettes p WHERE p.user_id = u.id) AS palettes_count,
        (SELECT COUNT(*) FROM likes l WHERE l.user_id = u.id) AS likes_given
      FROM users u
      ORDER BY u.created_at DESC
    `).all();

    return res.json({ users });
  } catch (error) {
    console.error('Admin get users error:', error);
    return res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', (req, res) => {
  try {
    const db = getDb();
    const targetUserId = parseInt(req.params.id, 10);

    if (isNaN(targetUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (targetUserId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }

    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(targetUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(targetUserId);

    return res.json({ message: `User ${user.username} deleted successfully`, id: targetUserId });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /api/admin/palettes
router.get('/palettes', (req, res) => {
  try {
    const db = getDb();
    const palettes = db.prepare(`
      SELECT 
        p.id, 
        p.title, 
        p.colors, 
        p.tags, 
        p.user_id, 
        p.created_at,
        u.username AS author,
        (SELECT COUNT(*) FROM likes l WHERE l.palette_id = p.id) AS likes_count
      FROM palettes p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `).all();

    const formatted = palettes.map(p => {
      let parsedColors = [];
      try { parsedColors = JSON.parse(p.colors); } catch (e) { parsedColors = []; }
      let parsedTags = [];
      try { parsedTags = JSON.parse(p.tags || '[]'); } catch (e) { parsedTags = []; }
      return {
        ...p,
        colors: parsedColors,
        tags: parsedTags
      };
    });

    return res.json({ palettes: formatted });
  } catch (error) {
    console.error('Admin get palettes error:', error);
    return res.status(500).json({ error: 'Failed to retrieve admin palettes' });
  }
});

// DELETE /api/admin/palettes/:id
router.delete('/palettes/:id', (req, res) => {
  try {
    const db = getDb();
    const paletteId = parseInt(req.params.id, 10);

    if (isNaN(paletteId)) {
      return res.status(400).json({ error: 'Invalid palette ID' });
    }

    const palette = db.prepare('SELECT id FROM palettes WHERE id = ?').get(paletteId);
    if (!palette) {
      return res.status(404).json({ error: 'Palette not found' });
    }

    db.prepare('DELETE FROM palettes WHERE id = ?').run(paletteId);

    return res.json({ message: 'Palette deleted by admin', id: paletteId });
  } catch (error) {
    console.error('Admin delete palette error:', error);
    return res.status(500).json({ error: 'Failed to delete palette' });
  }
});

module.exports = router;
