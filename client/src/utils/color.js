// Color utility library for PaletteApp

/**
 * Standardize hex string to 6-digit uppercase #RRGGBB
 */
export function normalizeHex(hex) {
  if (!hex || typeof hex !== 'string') return '#000000';
  let cleaned = hex.trim().replace(/^#/, '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
    return '#000000';
  }
  return '#' + cleaned.toUpperCase();
}

/**
 * Convert Hex to RGB object { r, g, b }
 */
export function hexToRgb(hex) {
  const norm = normalizeHex(hex).slice(1);
  const num = parseInt(norm, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Convert RGB components to Hex string
 */
export function rgbToHex(r, g, b) {
  const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = v => clamp(v).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB to HSL { h (0-360), s (0-100), l (0-100) }
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL { h (0-360), s (0-100), l (0-100) } to RGB { r, g, b }
 */
export function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hNorm = h / 360;

  return {
    r: Math.round(hue2rgb(p, q, hNorm + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hNorm) * 255),
    b: Math.round(hue2rgb(p, q, hNorm - 1 / 3) * 255)
  };
}

/**
 * Convert Hex directly to HSL
 */
export function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

/**
 * Convert HSL directly to Hex
 */
export function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/**
 * Generate a single random hex color
 */
export function generateRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Calculate relative luminance according to WCAG 2.1 specs
 */
export function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

/**
 * Calculate WCAG contrast ratio between two colors (1:1 to 21:1)
 */
export function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

/**
 * Evaluate WCAG contrast rating
 */
export function getContrastRating(ratio) {
  if (ratio >= 7.0) {
    return { level: 'AAA', normal: true, large: true, label: 'AAA Pass', color: '#10b981' };
  } else if (ratio >= 4.5) {
    return { level: 'AA', normal: true, large: true, label: 'AA Pass', color: '#06b6d4' };
  } else if (ratio >= 3.0) {
    return { level: 'AA Large', normal: false, large: true, label: 'AA Large', color: '#f59e0b' };
  }
  return { level: 'Fail', normal: false, large: false, label: 'Fail', color: '#ef4444' };
}

/**
 * Pick optimal text color (dark or light) for a given background
 */
export function getAccessibleTextColor(bgHex) {
  const whiteRatio = getContrastRatio(bgHex, '#FFFFFF');
  const darkRatio = getContrastRatio(bgHex, '#0F172A');
  return whiteRatio >= darkRatio ? '#FFFFFF' : '#0F172A';
}

/**
 * Generate full palette based on color harmonies
 */
export function generatePalette(harmonyType = 'random', count = 5, existingColors = [], lockedIndices = []) {
  const safeCount = Math.max(2, Math.min(10, count));
  const baseColors = [...existingColors];
  while (baseColors.length < safeCount) {
    baseColors.push(generateRandomColor());
  }

  // Anchor hue from first locked color or random
  let baseHue = Math.floor(Math.random() * 360);
  for (let i = 0; i < safeCount; i++) {
    if (lockedIndices.includes(i) && baseColors[i]) {
      baseHue = hexToHsl(baseColors[i]).h;
      break;
    }
  }

  const result = [];

  for (let i = 0; i < safeCount; i++) {
    if (lockedIndices.includes(i) && baseColors[i]) {
      result.push(normalizeHex(baseColors[i]));
      continue;
    }

    let h = baseHue;
    let s = 65;
    let l = 50;

    switch (harmonyType) {
      case 'analogous':
        // Steps of ~25 degrees
        h = (baseHue + (i - Math.floor(safeCount / 2)) * 28 + 360) % 360;
        s = 55 + (i % 3) * 15;
        l = 35 + ((i * 12) % 45);
        break;

      case 'monochromatic':
        h = baseHue;
        s = Math.max(30, 80 - i * 10);
        l = 20 + Math.round((70 / (safeCount - 1 || 1)) * i);
        break;

      case 'triad': {
        const triadAngles = [0, 120, 240, 30, 150, 270, 60, 180, 300];
        h = (baseHue + (triadAngles[i % triadAngles.length] || 0)) % 360;
        s = 60 + (i % 2) * 20;
        l = 40 + (i % 3) * 15;
        break;
      }

      case 'complementary': {
        const compAngles = [0, 180, 15, 195, 345, 165, 30, 210];
        h = (baseHue + compAngles[i % compAngles.length]) % 360;
        s = 65 + (i % 2) * 15;
        l = 35 + ((i * 15) % 40);
        break;
      }

      case 'warm':
        // Warm hues: 0-60 (red-orange-yellow) or 330-360 (pink/rose)
        h = (345 + (i * 15)) % 360;
        s = 65 + Math.floor(Math.random() * 25);
        l = 45 + Math.floor(Math.random() * 25);
        break;

      case 'cool':
        // Cool hues: 160-260 (cyan, blue, indigo, teal)
        h = 170 + ((i * 22) % 100);
        s = 55 + Math.floor(Math.random() * 30);
        l = 40 + Math.floor(Math.random() * 25);
        break;

      case 'pastel':
        h = Math.floor(Math.random() * 360);
        s = 55 + Math.floor(Math.random() * 20); // 55-75%
        l = 78 + Math.floor(Math.random() * 12); // 78-90% high lightness
        break;

      case 'neon':
        h = Math.floor(Math.random() * 360);
        s = 90 + Math.floor(Math.random() * 10); // 90-100% saturation
        l = 48 + Math.floor(Math.random() * 14); // 48-62%
        break;

      case 'random':
      default:
        h = Math.floor(Math.random() * 360);
        s = 40 + Math.floor(Math.random() * 50);
        l = 30 + Math.floor(Math.random() * 45);
        break;
    }

    result.push(hslToHex(h, s, l));
  }

  return result;
}

/**
 * Approximate color name resolver
 */
export function getColorName(hex) {
  const { h, s, l } = hexToHsl(hex);
  if (l < 12) return 'Black / Onyx';
  if (l > 92 && s < 15) return 'Snow White';
  if (s < 12) {
    if (l < 30) return 'Dark Slate';
    if (l < 70) return 'Neutral Gray';
    return 'Light Gray';
  }

  const hueNames = [
    { range: [0, 15], name: 'Red' },
    { range: [16, 45], name: 'Orange' },
    { range: [46, 70], name: 'Amber / Gold' },
    { range: [71, 150], name: 'Green' },
    { range: [151, 190], name: 'Teal / Cyan' },
    { range: [191, 255], name: 'Blue' },
    { range: [256, 290], name: 'Indigo / Violet' },
    { range: [291, 330], name: 'Magenta / Purple' },
    { range: [331, 360], name: 'Crimson / Rose' }
  ];

  let hueLabel = 'Color';
  for (const item of hueNames) {
    if (h >= item.range[0] && h <= item.range[1]) {
      hueLabel = item.name;
      break;
    }
  }

  let prefix = '';
  if (l < 30) prefix = 'Deep ';
  else if (l > 75) prefix = 'Soft Pastel ';
  else if (s > 80) prefix = 'Vivid ';

  return `${prefix}${hueLabel}`;
}

/**
 * Export helpers for multiple formats
 */
export function exportPalette(colors, title = 'Color Palette', format = 'css') {
  const safeTitle = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

  switch (format) {
    case 'css': {
      const vars = colors.map((c, i) => `  --color-${safeTitle}-${i + 1}: ${c};`).join('\n');
      return `:root {\n  /* ${title} */\n${vars}\n}`;
    }

    case 'tailwind': {
      const obj = colors.reduce((acc, c, i) => {
        acc[`${i + 1}00`] = c;
        return acc;
      }, {});
      return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        '${safeTitle}': ${JSON.stringify(obj, null, 2)}\n      }\n    }\n  }\n};`;
    }

    case 'json':
      return JSON.stringify({
        title,
        colors,
        createdAt: new Date().toISOString()
      }, null, 2);

    case 'svg': {
      const swatchWidth = 100;
      const height = 140;
      const totalWidth = colors.length * swatchWidth;
      const rects = colors.map((c, i) => {
        const x = i * swatchWidth;
        const textColor = getAccessibleTextColor(c);
        return `  <rect x="${x}" y="0" width="${swatchWidth}" height="100" fill="${c}" />\n  <text x="${x + swatchWidth / 2}" y="122" font-family="sans-serif" font-size="12" font-weight="bold" fill="#333333" text-anchor="middle">${c}</text>`;
      }).join('\n');

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height}" width="${totalWidth}" height="${height}">\n  <rect width="${totalWidth}" height="${height}" fill="#ffffff" />\n${rects}\n</svg>`;
    }

    case 'text':
    default:
      return colors.join(', ');
  }
}
