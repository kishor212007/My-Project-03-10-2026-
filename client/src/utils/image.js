import { rgbToHex, rgbToHsl } from './color';

/**
 * Load an image from File, Blob, or URL into an HTML Image object
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = err => reject(new Error('Failed to load image: ' + err.message));

    if (typeof src === 'string') {
      img.src = src;
    } else if (src instanceof File || src instanceof Blob) {
      img.src = URL.createObjectURL(src);
    } else {
      reject(new Error('Unsupported image source type'));
    }
  });
}

/**
 * Quantize pixel colors and extract distinct dominant harmonious colors
 */
export async function extractColorsFromImage(imageSource, maxColors = 5) {
  const img = await loadImage(imageSource);

  // Resize canvas for high performance and noise reduction
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  const maxDimension = 200;
  let { width, height } = img;
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);

  ctx.drawImage(img, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height).data;
  const colorBuckets = new Map();

  // Quantize 8-bit channels to 5-bit (32 values) to cluster similar colors
  const step = 4; // Sample every 4th pixel for speed
  for (let i = 0; i < imgData.length; i += 4 * step) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];
    const a = imgData[i + 3];

    // Ignore transparent or near-black / near-white extremes in primary clustering
    if (a < 128) continue;

    // Bucket key by rounding to nearest 16
    const qr = Math.round(r / 24) * 24;
    const qg = Math.round(g / 24) * 24;
    const qb = Math.round(b / 24) * 24;
    const key = `${qr},${qg},${qb}`;

    const existing = colorBuckets.get(key) || { count: 0, r: 0, g: 0, b: 0 };
    existing.count += 1;
    existing.r += r;
    existing.g += g;
    existing.b += b;
    colorBuckets.set(key, existing);
  }

  // Calculate averaged colors for each bucket
  const candidates = [];
  for (const [, item] of colorBuckets.entries()) {
    const avgR = Math.round(item.r / item.count);
    const avgG = Math.round(item.g / item.count);
    const avgB = Math.round(item.b / item.count);
    const hsl = rgbToHsl(avgR, avgG, avgB);

    // Boost score for saturated, visually appealing colors while balancing prevalence
    const vibrancy = hsl.s / 100;
    const notTooDarkOrBright = (hsl.l > 15 && hsl.l < 85) ? 1.5 : 0.8;
    const score = item.count * (1 + vibrancy * 1.5) * notTooDarkOrBright;

    candidates.push({
      hex: rgbToHex(avgR, avgG, avgB),
      r: avgR,
      g: avgG,
      b: avgB,
      score,
      hsl
    });
  }

  // Sort by weighted visual importance
  candidates.sort((a, b) => b.score - a.score);

  // Filter out colors that are too close to already picked ones
  const selected = [];
  const minDistance = 45; // Euclidean color distance in RGB

  const colorDist = (c1, c2) => {
    return Math.sqrt(
      Math.pow(c1.r - c2.r, 2) +
      Math.pow(c1.g - c2.g, 2) +
      Math.pow(c1.b - c2.b, 2)
    );
  };

  for (const c of candidates) {
    if (selected.length >= maxColors) break;
    const isTooClose = selected.some(s => colorDist(s, c) < minDistance);
    if (!isTooClose) {
      selected.push(c);
    }
  }

  // If we couldn't get enough distinct colors, fill from candidates without minDistance filter
  if (selected.length < maxColors) {
    for (const c of candidates) {
      if (selected.length >= maxColors) break;
      if (!selected.some(s => s.hex === c.hex)) {
        selected.push(c);
      }
    }
  }

  // Fallback if image had very few colors
  while (selected.length < maxColors) {
    selected.push({ hex: selected[selected.length - 1]?.hex || '#4F46E5' });
  }

  return selected.map(s => s.hex);
}

/**
 * Pick color at specific canvas/image point
 */
export function pickColorAtPoint(canvas, x, y) {
  const ctx = canvas.getContext('2d');
  const pixel = ctx.getImageData(x, y, 1, 1).data;
  return rgbToHex(pixel[0], pixel[1], pixel[2]);
}
