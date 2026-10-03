import React from 'react';
import { Sparkles, Keyboard } from 'lucide-react';

export function Footer() {
  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        padding: '1.25rem 1.5rem',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)'
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} color="var(--primary-500)" />
          <span>
            <strong>PaletteApp</strong> &mdash; Modern Color Suite &copy; {new Date().getFullYear()}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.85 }}>
            <Keyboard size={15} />
            <span>Shortcuts:</span>
            <kbd style={{ background: 'var(--bg-surface-hover)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)' }}>Space</kbd>
            <span>Generate</span>
            <kbd style={{ background: 'var(--bg-surface-hover)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)' }}>Click</kbd>
            <span>Copy Hex</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
