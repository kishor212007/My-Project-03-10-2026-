const bcrypt = require('bcryptjs');
const { getDb } = require('./db');
require('dotenv').config();

function seed(dbParam) {
  const db = dbParam || getDb();
  console.log('--- Starting Database Seeding ---');

  // Clear existing data in correct order
  db.prepare('DELETE FROM likes').run();
  db.prepare('DELETE FROM palettes').run();
  db.prepare('DELETE FROM users').run();

  // Reset sqlite_sequence if exists
  try {
    db.prepare('DELETE FROM sqlite_sequence WHERE name IN ("users", "palettes", "likes")').run();
  } catch (err) {
    // Ignore if sqlite_sequence does not exist
  }

  const salt = bcrypt.genSaltSync(10);
  const demoHash = bcrypt.hashSync('password123', salt);
  const adminHash = bcrypt.hashSync('admin123', salt);

  // Insert Demo User
  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password, role)
    VALUES (?, ?, ?, ?)
  `);

  const demoUserResult = insertUser.run('demouser', 'demo@example.com', demoHash, 'user');
  const demoUserId = demoUserResult.lastInsertRowid;

  const adminUserResult = insertUser.run('admin', 'admin@example.com', adminHash, 'admin');
  const adminUserId = adminUserResult.lastInsertRowid;

  console.log(`Created users: demouser (ID: ${demoUserId}), admin (ID: ${adminUserId})`);

  // Insert 6 Curated Sample Palettes
  const samplePalettes = [
    {
      title: 'Sunset Horizon',
      colors: JSON.stringify(['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51']),
      tags: JSON.stringify(['sunset', 'warm', 'vintage']),
      user_id: demoUserId
    },
    {
      title: 'Cyberpunk Neon',
      colors: JSON.stringify(['#0d0d1a', '#0ff0fc', '#ff2a85', '#7000ff', '#ffe600']),
      tags: JSON.stringify(['neon', 'cyberpunk', 'dark']),
      user_id: adminUserId
    },
    {
      title: 'Nordic Forest',
      colors: JSON.stringify(['#2d3a3a', '#3b5249', '#519872', '#bec5ad', '#a4b494']),
      tags: JSON.stringify(['nature', 'earthy', 'minimal']),
      user_id: demoUserId
    },
    {
      title: 'Pastel Bakery',
      colors: JSON.stringify(['#ffb5a7', '#fcd5ce', '#f8edeb', '#f9dcc4', '#fec89a']),
      tags: JSON.stringify(['pastel', 'soft', 'sweet']),
      user_id: demoUserId
    },
    {
      title: 'Oceanic Depths',
      colors: JSON.stringify(['#03045e', '#023e8a', '#0077b6', '#0096c7', '#48cae4']),
      tags: JSON.stringify(['ocean', 'blue', 'cool']),
      user_id: adminUserId
    },
    {
      title: 'Berry Smoothie',
      colors: JSON.stringify(['#581845', '#900c3f', '#c70039', '#ff5733', '#ffc300']),
      tags: JSON.stringify(['berry', 'vibrant', 'gradient']),
      user_id: demoUserId
    }
  ];

  const insertPalette = db.prepare(`
    INSERT INTO palettes (title, colors, tags, user_id)
    VALUES (?, ?, ?, ?)
  `);

  const paletteIds = [];
  for (const p of samplePalettes) {
    const res = insertPalette.run(p.title, p.colors, p.tags, p.user_id);
    paletteIds.push(res.lastInsertRowid);
  }

  console.log(`Created ${paletteIds.length} sample palettes.`);

  // Seed sample likes
  const insertLike = db.prepare(`
    INSERT INTO likes (user_id, palette_id)
    VALUES (?, ?)
  `);

  // Demo user likes Sunset Horizon, Cyberpunk Neon, and Oceanic Depths
  insertLike.run(demoUserId, paletteIds[0]);
  insertLike.run(demoUserId, paletteIds[1]);
  insertLike.run(demoUserId, paletteIds[4]);

  // Admin user likes Sunset Horizon and Nordic Forest
  insertLike.run(adminUserId, paletteIds[0]);
  insertLike.run(adminUserId, paletteIds[2]);

  console.log('Sample likes inserted successfully.');
  console.log('--- Seeding Completed Successfully ---');
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
