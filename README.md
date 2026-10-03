# PaletteApp &mdash; Modern Color Palette Generator & Community

A full-stack color palette generator with harmony engines, WCAG 2.1 accessibility matrix, image color extraction, community explore gallery, and multi-format exports.

![PaletteApp Preview](https://raw.githubusercontent.com/kishor212007/My-Project-03-10-2026-/main/preview.png)

---

## Features

- **Harmony Engines**: Generate random, analogous, monochromatic, triad, complementary, warm, cool, pastel, and neon palettes.
- **Color Locking**: Lock specific swatches with <kbd>L</kbd> or click the lock icon, and regenerate the rest with <kbd>Spacebar</kbd>.
- **Image-to-Palette Extractor**: Upload PNG/JPG/WebP images to extract 5 dominant colors with an interactive canvas eye-dropper.
- **WCAG 2.1 Contrast Matrix**: Test accessibility with AAA, AA, and AA Large contrast compliance ratings across all colors.
- **Multi-Format Export**: Export palettes to CSS Variables, Tailwind CSS, SVG files, JSON, or copy hex codes with 1 click.
- **Community Explore & Like**: Browse curated palettes, search by tags/title, like palettes, and save them to your account.
- **User Dashboard & Admin Panel**: Profile stats, password change, and full administrator moderation panel.
- **Sleek Themes**: Dark and light modes with custom CSS tokens and glassmorphism aesthetics.

---

## Tech Stack

- **Frontend**: React 18, Vite 6, Lucide Icons, Vanilla CSS Design System, Vitest.
- **Backend**: Node.js, Express, SQLite (`node:sqlite` / `better-sqlite3`), JWT Authentication, Zod Validation, Helmet, Rate Limiting, CORS.

---

## Quick Start

### 1. Backend Server
```bash
cd server
npm install
npm run seed     # Pre-populates sample palettes and demo accounts
npm start        # Starts Express server on http://localhost:5000
```

### 2. Frontend Client
```bash
cd client
npm install
npm run dev      # Starts Vite server on http://localhost:5173
```

---

## Demo Credentials

- **Demo User**: `demo@example.com` / `password123`
- **Admin User**: `admin@example.com` / `admin123`

---

## Running Tests

```bash
# Backend unit & integration tests (19 tests)
cd server && npm test

# Frontend unit & component tests (16 tests)
cd client && npm test

# Frontend production build
cd client && npm run build
```
