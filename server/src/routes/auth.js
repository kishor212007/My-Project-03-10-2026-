const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { getDb } = require('../db/db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// Validation Schemas
const registerSchema = z.object({
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(30, 'Username cannot exceed 30 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().trim().email('Invalid email address').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100)
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const updateProfileSchema = z.object({
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  email: z.string().trim().email().max(100).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).max(100).optional()
}).refine(data => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Current password is required to set a new password',
  path: ['currentPassword']
});

// POST /api/auth/register
router.post('/register', authLimiter, validateBody(registerSchema), (req, res) => {
  try {
    const { username, email, password } = req.body;
    const db = getDb();

    // Check existing
    const existing = db.prepare('SELECT id, username, email FROM users WHERE username = ? OR email = ?').get(username, email.toLowerCase());
    if (existing) {
      if (existing.email.toLowerCase() === email.toLowerCase()) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }
      return res.status(409).json({ error: 'Username is already taken' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const insert = db.prepare(`
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, 'user')
    `);
    const result = insert.run(username, email.toLowerCase(), hashedPassword);
    const userId = result.lastInsertRowid;

    const user = {
      id: Number(userId),
      username,
      email: email.toLowerCase(),
      role: 'user',
      created_at: new Date().toISOString()
    };

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, validateBody(loginSchema), (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();

    const user = db.prepare('SELECT id, username, email, password, role, created_at FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...safeUser } = user;
    return res.json({
      message: 'Logged in successfully',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const stats = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM palettes WHERE user_id = ?) AS palettes_count,
        (SELECT COUNT(*) FROM likes WHERE user_id = ?) AS saved_count,
        (SELECT COUNT(*) FROM likes WHERE palette_id IN (SELECT id FROM palettes WHERE user_id = ?)) AS likes_received
    `).get(req.user.id, req.user.id, req.user.id);

    return res.json({
      user: {
        ...req.user,
        palettes_count: stats.palettes_count || 0,
        saved_count: stats.saved_count || 0,
        likes_received: stats.likes_received || 0
      }
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error retrieving user profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, validateBody(updateProfileSchema), (req, res) => {
  try {
    const db = getDb();
    const { username, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check unique email / username
    if (username && username !== user.username) {
      const existingUser = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, userId);
      if (existingUser) {
        return res.status(409).json({ error: 'Username is already taken' });
      }
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existingEmail = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email.toLowerCase(), userId);
      if (existingEmail) {
        return res.status(409).json({ error: 'Email is already in use by another account' });
      }
    }

    // Handle password change
    let updatedPasswordHash = user.password;
    if (newPassword) {
      const isMatch = bcrypt.compareSync(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password does not match' });
      }
      const salt = bcrypt.genSaltSync(10);
      updatedPasswordHash = bcrypt.hashSync(newPassword, salt);
    }

    const updatedUsername = username || user.username;
    const updatedEmail = email ? email.toLowerCase() : user.email;

    db.prepare(`
      UPDATE users 
      SET username = ?, email = ?, password = ?
      WHERE id = ?
    `).run(updatedUsername, updatedEmail, updatedPasswordHash, userId);

    const safeUser = {
      id: user.id,
      username: updatedUsername,
      email: updatedEmail,
      role: user.role,
      created_at: user.created_at
    };

    return res.json({
      message: 'Profile updated successfully',
      user: safeUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
