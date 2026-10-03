import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Code, Share2 } from 'lucide-react';
import { exportPalette } from '../utils/color';

export function ExportModal({ isOpen, onClose, palette, onNotify }) {
  if (!isOpen || !palette) return null;

  const [activeTab, setActiveTab] = useState('css');
  const [copied, setCopied] = useState(false);

  const colors = palette.colors || [];
  const title = palette.title || 'Color Palette';

  const content = exportPalette(colors, title, activeTab);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    if (onNotify) onNotify(`Copied ${activeTab.toUpperCase()} to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    let filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-palette`;
    let mimeType = 'text/plain';

    if (activeTab === 'svg') {
      filename += '.svg';
      mimeType = 'image/svg+xml';
    } else if (activeTab === 'json') {
      filename += '.json';
      mimeType = 'application/json';
    } else if (activeTab === 'css') {
      filename += '.css';
      mimeType = 'text/css';
    } else {
      filename += '.js';
      mimeType = 'application/javascript';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    if (onNotify) onNotify(`Downloaded ${filename}!`, 'success');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Export Palette</h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Swatch Preview Bar */}
          <div style={{ height: '36px', display: 'flex', borderRadius: '8px', overflow: 'hidden' }}>
            {colors.map((c, i) => (
              <div key={i} style={{ flex: 1, backgroundColor: c }} title={c} />
            ))}
          </div>

          {/* Export Format Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
            {[
              { id: 'css', label: 'CSS Variables' },
              { id: 'tailwind', label: 'Tailwind' },
              { id: 'svg', label: 'SVG File' },
              { id: 'json', label: 'JSON' },
              { id: 'text', label: 'Hex List' }
            ].map(tab => (
              <button
                key={tab.id}
                className={`btn btn-secondary ${activeTab === tab.id ? 'active' : ''}`}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  borderColor: activeTab === tab.id ? 'var(--primary-500)' : 'transparent',
                  background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface)'
                }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Code Output Area */}
          <div style={{ position: 'relative' }}>
            <textarea
              readOnly
              value={content}
              className="mono"
              rows={8}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                resize: 'none',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleDownload}>
            <Download size={16} />
            <span>Download</span>
          </button>
          <button className="btn btn-primary" onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
