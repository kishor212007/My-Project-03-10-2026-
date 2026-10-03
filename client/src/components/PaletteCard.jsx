import React, { useState } from 'react';
import { Heart, Copy, Check, Trash2, ExternalLink } from 'lucide-react';
import { getAccessibleTextColor } from '../utils/color';

export function PaletteCard({
  palette,
  currentUserId,
  isAdmin,
  onLike,
  onDelete,
  onTagClick,
  onOpenDetail,
  onNotify
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const isOwner = currentUserId && palette.user_id === currentUserId;
  const canDelete = isOwner || isAdmin;

  const handleCopySwatch = (color, index, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color);
    setCopiedIndex(index);
    if (onNotify) onNotify(`Copied ${color}!`, 'success');
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  const handleCopyAll = e => {
    e.stopPropagation();
    navigator.clipboard.writeText(palette.colors.join(', '));
    if (onNotify) onNotify('Copied all colors to clipboard!', 'success');
  };

  return (
    <div className="palette-card">
      {/* Visual Color Swatches */}
      <div className="palette-swatches" onClick={() => onOpenDetail(palette.id)}>
        {palette.colors.map((color, idx) => {
          const textColor = getAccessibleTextColor(color);
          const isCopied = copiedIndex === idx;

          return (
            <div
              key={idx}
              className="palette-swatch-bar"
              style={{ backgroundColor: color }}
              onClick={e => handleCopySwatch(color, idx, e)}
              title={`${color} (Click to copy)`}
            >
              {isCopied && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: textColor,
                    background: 'rgba(0,0,0,0.25)',
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}
                >
                  <Check size={14} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Palette Card Body */}
      <div className="palette-card-body">
        <div className="palette-card-header">
          <h3 className="palette-title" onClick={() => onOpenDetail(palette.id)}>
            {palette.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {/* Like Button */}
            <button
              className="btn-icon"
              style={{
                width: '32px',
                height: '32px',
                color: palette.is_liked_by_me ? '#ec4899' : 'var(--text-secondary)'
              }}
              onClick={() => onLike(palette.id)}
              title={palette.is_liked_by_me ? 'Unlike palette' : 'Like palette'}
            >
              <Heart
                size={16}
                fill={palette.is_liked_by_me ? '#ec4899' : 'none'}
              />
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {palette.likes_count}
            </span>

            {/* Copy All */}
            <button
              className="btn-icon"
              style={{ width: '32px', height: '32px' }}
              onClick={handleCopyAll}
              title="Copy all hex codes"
            >
              <Copy size={15} />
            </button>

            {/* Delete button */}
            {canDelete && onDelete && (
              <button
                className="btn-icon"
                style={{ width: '32px', height: '32px', color: '#ef4444' }}
                onClick={() => onDelete(palette.id)}
                title="Delete palette"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="palette-meta">
          <span>By {palette.author || 'Creator'}</span>
          <span>{palette.colors.length} colors</span>
        </div>

        {/* Tags */}
        {palette.tags && palette.tags.length > 0 && (
          <div className="palette-tags">
            {palette.tags.map((tag, idx) => (
              <span
                key={idx}
                className="tag-badge"
                onClick={() => onTagClick && onTagClick(tag)}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
