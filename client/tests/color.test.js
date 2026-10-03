import { describe, it, expect } from 'vitest';
import {
  normalizeHex,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToHex,
  getLuminance,
  getContrastRatio,
  getContrastRating,
  getAccessibleTextColor,
  generatePalette,
  exportPalette
} from '../src/utils/color';

describe('Color Utility Functions', () => {
  describe('Hex and RGB conversions', () => {
    it('normalizes 3-digit hex to 6-digit hex', () => {
      expect(normalizeHex('#fff')).toBe('#FFFFFF');
      expect(normalizeHex('000')).toBe('#000000');
      expect(normalizeHex('#f5a')).toBe('#FF55AA');
    });

    it('correctly converts Hex to RGB', () => {
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('correctly converts RGB to Hex', () => {
      expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF');
      expect(rgbToHex(0, 0, 0)).toBe('#000000');
      expect(rgbToHex(255, 0, 128)).toBe('#FF0080');
    });
  });

  describe('HSL conversions', () => {
    it('correctly converts RGB to HSL', () => {
      expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 });
      expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 });
      expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
    });

    it('correctly converts HSL to Hex and back', () => {
      const hex = hslToHex(120, 100, 50); // Pure Green
      expect(hex).toBe('#00FF00');
    });
  });

  describe('WCAG 2.1 Contrast Calculations', () => {
    it('calculates 21:1 ratio between pure black and white', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBe(21);
    });

    it('calculates 1:1 ratio for identical colors', () => {
      const ratio = getContrastRatio('#6366F1', '#6366F1');
      expect(ratio).toBe(1);
    });

    it('assigns correct WCAG rating levels', () => {
      expect(getContrastRating(21).level).toBe('AAA');
      expect(getContrastRating(5).level).toBe('AA');
      expect(getContrastRating(3.5).level).toBe('AA Large');
      expect(getContrastRating(2).level).toBe('Fail');
    });

    it('picks accessible text color (dark vs light)', () => {
      expect(getAccessibleTextColor('#FFFFFF')).toBe('#0F172A');
      expect(getAccessibleTextColor('#000000')).toBe('#FFFFFF');
      expect(getAccessibleTextColor('#FCD34D')).toBe('#0F172A'); // Yellow bg -> Dark text
      expect(getAccessibleTextColor('#1E1B4B')).toBe('#FFFFFF'); // Deep Navy bg -> White text
    });
  });

  describe('Palette Generation and Harmonies', () => {
    it('generates the requested number of colors', () => {
      const palette5 = generatePalette('random', 5);
      expect(palette5).toHaveLength(5);
      palette5.forEach(hex => {
        expect(hex).toMatch(/^#[0-9A-F]{6}$/);
      });

      const palette3 = generatePalette('analogous', 3);
      expect(palette3).toHaveLength(3);
    });

    it('preserves locked color indices when generating', () => {
      const existing = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF'];
      const locked = [1, 3]; // Lock Green and Yellow
      const nextPalette = generatePalette('analogous', 5, existing, locked);

      expect(nextPalette[1]).toBe('#00FF00');
      expect(nextPalette[3]).toBe('#FFFF00');
    });
  });

  describe('Export Formatting', () => {
    it('exports CSS variables correctly', () => {
      const colors = ['#111111', '#222222', '#333333'];
      const css = exportPalette(colors, 'Dark Theme', 'css');
      expect(css).toContain('--color-dark-theme-1: #111111;');
      expect(css).toContain('--color-dark-theme-2: #222222;');
    });

    it('exports valid JSON structure', () => {
      const colors = ['#FF5733', '#33FF57'];
      const jsonStr = exportPalette(colors, 'Vibrant Mix', 'json');
      const parsed = JSON.parse(jsonStr);
      expect(parsed.title).toBe('Vibrant Mix');
      expect(parsed.colors).toEqual(colors);
    });

    it('exports valid SVG markup', () => {
      const colors = ['#AABBCC', '#DDEEFF'];
      const svg = exportPalette(colors, 'Pastel Sky', 'svg');
      expect(svg).toContain('<svg');
      expect(svg).toContain('fill="#AABBCC"');
      expect(svg).toContain('</svg>');
    });
  });
});
