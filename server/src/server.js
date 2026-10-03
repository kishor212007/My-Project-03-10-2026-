require('dotenv').config();
const app = require('./app');
const { getDb } = require('./db/db');
const { seed } = require('./db/seed');

const PORT = process.env.PORT || 5000;

// Initialize database and verify schema
try {
  const db = getDb();
  console.log('Database initialized successfully.');

  // If database is brand new (0 users), seed sample data automatically
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    console.log('No users found in database. Running initial seed...');
    seed(db);
  }
} catch (error) {
  console.error('Fatal Error during database startup:', error);
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Palette App API Server running`);
  console.log(` Port: ${PORT}`);
  console.log(` Health: http://localhost:${PORT}/api/health`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});

module.exports = server;
