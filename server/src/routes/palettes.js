const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { getDb } = require('../db/db');
const { authenticateToken, optionalToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { createPaletteLimiter } = require('../middleware/rateLimiter');

// Validation Schemas
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const createPaletteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(60, 'Title cannot exceed 60 characters'),
  colors: z.array(z.string().regex(hexColorRegex, 'Invalid hex color format (e.g., #FF5733)'))
    .min(2, 'A palette must have at least 2 colors')
    .max(10, 'A palette can have at most 10 colors'),
  tags: z.array(z.string().trim().min(1).max(20)).max(6, 'Maximum 6 tags allowed').optional().default([])
});

// Helper to format palette row
function formatPaletteRow(row, currentUserId = null) {
  let parsedColors = [];
  try {
    parsedColors = JSON.parse(row.colors);
  } catch (e) {
    parsedColors = [];
  }

  let parsedTags = [];
  try {
    parsedTags = JSON.parse(row.tags || '[]');
  } catch (e) {
    parsedTags = [];
  }

  return {
    id: row.id,
    title: row.title,
    colors: parsedColors,
    tags: parsedTags,
    user_id: row.user_id,
    author: row.author || 'Anonymous',
    created_at: row.created_at,
    likes_count: Number(row.likes_count || 0),
    is_liked_by_me: Boolean(row.is_liked_by_me)
  };
}

// GET /api/palettes (List with search, tag filter, sorting, pagination)
router.get('/', optionalToken, (req, res) => {
  try {
    const db = getDb();
    const currentUserId = req.user ? req.user.id : -1;
    const { search, tag, sort = 'newest', page = '1', limit = '12' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    let whereClauses = [];
    let params = [];

    if (search && search.trim()) {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      whereClauses.push('(LOWER(p.title) LIKE ? OR LOWER(p.tags) LIKE ?)');
      params.push(searchTerm, searchTerm);
    }

    if (tag && tag.trim()) {
      const tagTerm = `%${tag.trim().toLowerCase()}%`;
      whereClauses.push('LOWER(p.tags) LIKE ?');
      params.push(tagTerm);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let orderSql = 'ORDER BY p.created_at DESC';
    if (sort === 'popular') {
      orderSql = 'ORDER BY likes_count DESC, p.created_at DESC';
    } else if (sort === 'oldest') {
      orderSql = 'ORDER BY p.created_at ASC';
    }

    // Count total matching palettes
    const countSql = `
      SELECT COUNT(*) as count 
      FROM palettes p
      ${whereSql}
    `;
    const totalRow = db.prepare(countSql).get(...params);
    const total = totalRow ? totalRow.count : 0;

    // Fetch paginated palettes
    const querySql = `
      SELECT 
        p.id, 
        p.title, 
        p.colors, 
        p.tags, 
        p.user_id, 
        p.created_at,
        u.username AS author,
        (SELECT COUNT(*) FROM likes l WHERE l.palette_id = p.id) AS likes_count,
        (SELECT COUNT(*) FROM likes l WHERE l.palette_id = p.id AND l.user_id = ?) AS is_liked_by_me
      FROM palettes p
      JOIN users u ON p.user_id = u.id
      ${whereSql}
      ${orderSql}
      LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(querySql).all(currentUserId, ...params, limitNum, offset);
    const palettes = rows.map(r => formatPaletteRow(r, currentUserId));

    return res.json({
      palettes,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    console.error('List palettes error:', error);
    return res.status(500).json({ error: 'Failed to retrieve palettes' });
  }
});

// GET /api/palettes/mine (Palettes created by logged-in user)
router.get('/mine', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;

    const querySql = `
      SELECT 
        p.id, 
        p.title, 
        p.colors, 
        p.tags, 
        p.user_id, 
        p.created_at,
        u.username AS author,
        (SELECT COUNT(*) FROM likes l WHERE l.palette_id = p.id) AS likes_count,
        (SELECT COUNT(*) FROM likes l WHERE l.palette_id = p.id AND l.user_id = ?) AS is_liked_by_me
      FROM palettes p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `;

    const rows = db.prepare(querySql).all(userId, userId);
    const palettes = rows.map(r => formatPaletteRow(r, userId));

    return res.json({ palettes });
  } catch (error) {
    console.error('Mine palettes error:', error);
    return res.status(500).json({ error: 'Failed to retrieve your palettes' });
  }
});

// GET /api/palettes/saved (Palettes liked/saved by logged-in user)
router.get('/saved', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;

    const querySql = `
      SELECT 
        p.id, 
        p.title, 
        p.colors, 
        p.tags, 
        p.user_id, 
        p.created_at,
        u.username AS author,
        (SELECT COUNT(*) FROM likes l WHERE l.palette_id = p.id) AS likes_count,
        1 AS is_liked_by_me
      FROM likes lk
      JOIN palettes p ON lk.palette_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE lk.user_id = ?
      ORDER BY lk.created_at DESC
    `;

    const rows = db.prepare(querySql).all(userId);
    const palettes = rows.map(r => formatPaletteRow(r, userId));

    return res.json({ palettes });
  } catch (error) {
    console.error('Saved palettes error:', error);
    return res.status(500).json({ error: 'Failed to retrieve saved palettes' });
  }
});

// GET /api/palettes/:id (Single palette details)
router.get('/:id', optionalToken, (req, res) => {
  try {
    const db = getDb();
    const currentUserId = req.user ? req.user.id : -1;
    const paletteId = parseInt(req.params.id, 10);

    if (isNaN(paletteId)) {
      return res.status(400).json({ error: 'Invalid palette ID' });
    }

    const querySql = `
      SELECT 
        p.id, 
        p.title, 
        p.colors, 
        p.tags, 
        p.user_id, 
        p.created_at,
        u.username AS author,
        (SELECT COUNT(*) FROM likes l WHERE l.palette_id = p.id) AS likes_count,
        (SELECT COUNT(*) FROM likes l WHERE l.palette_id = p.id AND l.user_id = ?) AS is_liked_by_me
      FROM palettes p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `;

    const row = db.prepare(querySql).get(currentUserId, paletteId);
    if (!row) {
      return res.status(404).json({ error: 'Palette not found' });
    }

    return res.json({ palette: formatPaletteRow(row, currentUserId) });
  } catch (error) {
    console.error('Get palette error:', error);
    return res.status(500).json({ error: 'Failed to retrieve palette' });
  }
});

// POST /api/palettes (Create new palette)
router.post('/', authenticateToken, createPaletteLimiter, validateBody(createPaletteSchema), (req, res) => {
  try {
    const db = getDb();
    const { title, colors, tags } = req.body;
    const userId = req.user.id;

    // Normalize colors to uppercase hex
    const normalizedColors = colors.map(c => c.toUpperCase());
    // Normalize tags
    const normalizedTags = (tags || []).map(t => t.trim().toLowerCase()).filter(Boolean);

    const insertSql = `
      INSERT INTO palettes (title, colors, tags, user_id)
      VALUES (?, ?, ?, ?)
    `;

    const result = db.prepare(insertSql).run(
      title.trim(),
      JSON.stringify(normalizedColors),
      JSON.stringify(normalizedTags),
      userId
    );

    const newPaletteId = Number(result.lastInsertRowid);

    const createdPalette = {
      id: newPaletteId,
      title: title.trim(),
      colors: normalizedColors,
      tags: normalizedTags,
      user_id: userId,
      author: req.user.username,
      created_at: new Date().toISOString(),
      likes_count: 0,
      is_liked_by_me: false
    };

    return res.status(201).json({
      message: 'Palette created successfully',
      palette: createdPalette
    });
  } catch (error) {
    console.error('Create palette error:', error);
    return res.status(500).json({ error: 'Failed to create palette' });
  }
});

// DELETE /api/palettes/:id (Delete palette by owner or admin)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const paletteId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const userRole = req.user.role;

    if (isNaN(paletteId)) {
      return res.status(400).json({ error: 'Invalid palette ID' });
    }

    const palette = db.prepare('SELECT id, user_id FROM palettes WHERE id = ?').get(paletteId);
    if (!palette) {
      return res.status(404).json({ error: 'Palette not found' });
    }

    if (palette.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to delete this palette' });
    }

    db.prepare('DELETE FROM palettes WHERE id = ?').run(paletteId);

    return res.json({ message: 'Palette deleted successfully', id: paletteId });
  } catch (error) {
    console.error('Delete palette error:', error);
    return res.status(500).json({ error: 'Failed to delete palette' });
  }
});

// POST /api/palettes/:id/like (Toggle like / unlike)
router.post('/:id/like', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const paletteId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    if (isNaN(paletteId)) {
      return res.status(400).json({ error: 'Invalid palette ID' });
    }

    const palette = db.prepare('SELECT id FROM palettes WHERE id = ?').get(paletteId);
    if (!palette) {
      return res.status(404).json({ error: 'Palette not found' });
    }

    const existingLike = db.prepare('SELECT id FROM likes WHERE user_id = ? AND palette_id = ?').get(userId, paletteId);

    let liked = false;
    if (existingLike) {
      // Unlike
      db.prepare('DELETE FROM likes WHERE id = ?').run(existingLike.id);
      liked = false;
    } else {
      // Like
      db.prepare('INSERT INTO likes (user_id, palette_id) VALUES (?, ?)').run(userId, paletteId);
      liked = true;
    }

    const likesCountRow = db.prepare('SELECT COUNT(*) as count FROM likes WHERE palette_id = ?').get(paletteId);
    const likesCount = likesCountRow ? likesCountRow.count : 0;

    return res.json({
      message: liked ? 'Palette liked' : 'Palette unliked',
      liked,
      likes_count: likesCount
    });
  } catch (error) {
    console.error('Like palette error:', error);
    return res.status(500).json({ error: 'Failed to toggle like' });
  }
});

module.exports = router;
