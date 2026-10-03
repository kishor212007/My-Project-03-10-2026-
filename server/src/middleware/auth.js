const jwt = require('jsonwebtoken');
const { getDb } = require('../db/db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_palette_jwt_key_2026_change_in_production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    try {
      const db = getDb();
      const user = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(decoded.id);
      if (!user) {
        return res.status(401).json({ error: 'User no longer exists' });
      }
      req.user = user;
      next();
    } catch (dbErr) {
      return res.status(500).json({ error: 'Database error verifying token' });
    }
  });
}

function optionalToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
      return next();
    }

    try {
      const db = getDb();
      const user = db.prepare('SELECT id, username, email, role, created_at FROM users WHERE id = ?').get(decoded.id);
      req.user = user || null;
    } catch (e) {
      req.user = null;
    }
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privilege required' });
  }
  next();
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  optionalToken,
  requireAdmin
};
