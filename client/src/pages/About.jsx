import React from 'react';
import { Palette, Eye, Keyboard, ShieldCheck, Sparkles, Code2 } from 'lucide-react';

export function About({ navigate }) {
  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <h1 className="page-title">About PaletteApp</h1>
        <p className="page-subtitle">
          Professional Color Palette Generator, Harmony Suite, and Accessibility Evaluation Tool.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Color Theory Section */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px',
            padding: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Palette size={24} color="var(--primary-500)" />
            <h2 style={{ fontSize: '1.4rem' }}>Color Theory & Harmony Engines</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.7' }}>
            PaletteApp uses computational color science algorithms based on the cylindrical <strong>HSL (Hue, Saturation, Lightness)</strong> and <strong>sRGB</strong> models to generate harmonious combinations:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.35rem', color: 'var(--primary-500)' }}>Analogous</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Colors positioned next to each other on the color wheel (~30° intervals). Creates serene, comfortable, cohesive designs.
              </p>
            </div>

            <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.35rem', color: '#a855f7' }}>Complementary</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Colors directly opposite each other on the 360° color wheel (180° offset). Delivers vibrant visual energy and punchy call-to-actions.
              </p>
            </div>

            <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.35rem', color: '#ec4899' }}>Monochromatic</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Variations in lightness and saturation of a single base hue. Ideal for clean, elegant software interfaces and brand systems.
              </p>
            </div>

            <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.35rem', color: '#06b6d4' }}>Triadic</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Three colors equally spaced around the 360° wheel (120° apart). Richly balanced while maintaining distinct character.
              </p>
            </div>
          </div>
        </div>

        {/* WCAG Accessibility Section */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px',
            padding: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Eye size={24} color="#10b981" />
            <h2 style={{ fontSize: '1.4rem' }}>WCAG 2.1 Accessibility Standards</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.7' }}>
            Accessibility shouldn't be an afterthought. Our real-time WCAG 2.1 matrix measures relative luminance ($L = 0.2126R + 0.7152G + 0.0722B$) to test readability across all screen types:
          </p>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="contrast-chip" style={{ background: '#10b98125', color: '#10b981', border: '1px solid #10b981' }}>
                AAA Pass (&ge; 7.0:1)
              </span>
              <span>Enhanced contrast level suitable for body text, small captions, and critical elements.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="contrast-chip" style={{ background: '#06b6d425', color: '#06b6d4', border: '1px solid #06b6d4' }}>
                AA Pass (&ge; 4.5:1)
              </span>
              <span>Standard minimum contrast requirement for normal text and user interface components.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="contrast-chip" style={{ background: '#f59e0b25', color: '#f59e0b', border: '1px solid #f59e0b' }}>
                AA Large (&ge; 3.0:1)
              </span>
              <span>Permissible for large headings (18pt+ or 14pt bold) and non-text visual indicators.</span>
            </li>
          </ul>
        </div>

        {/* Keyboard Shortcuts */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '20px',
            padding: '2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Keyboard size={24} color="#f59e0b" />
            <h2 style={{ fontSize: '1.4rem' }}>Keyboard Shortcuts</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: '10px' }}>
              <span>Generate New Palette</span>
              <kbd style={{ background: 'var(--bg-surface-hover)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)' }}>Space</kbd>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-surface)', borderRadius: '10px' }}>
              <span>Copy Hex Color</span>
              <kbd style={{ background: 'var(--bg-surface-hover)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)' }}>Click Hex</kbd>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }} onClick={() => navigate('/')}>
            <Sparkles size={18} />
            <span>Launch Generator</span>
          </button>
        </div>
      </div>
    </div>
  );
}
