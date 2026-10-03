import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Sliders
} from 'lucide-react';
import {
  getAccessibleTextColor,
  getColorName,
  getContrastRatio,
  getContrastRating
} from '../utils/color';

export function ColorColumn({
  color,
  index,
  isLocked,
  totalColors,
  onToggleLock,
  onUpdateColor,
  onRemoveColor,
  onMoveLeft,
  onMoveRight,
  onNotify
}) {
  const [copied, setCopied] = useState(false);
  const textColor = getAccessibleTextColor(color);
  const colorName = getColorName(color);

  // Contrast rating vs background text color
  const contrastRatio = getContrastRatio(color, textColor);
  const rating = getContrastRating(contrastRatio);

  const handleCopy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    if (onNotify) onNotify(`Copied ${color} to clipboard!`, 'success');
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="color-column"
      style={{
        backgroundColor: color,
        color: textColor
      }}
    >
      {/* Top Controls: Reorder & Remove */}
      <div className="color-top-actions">
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {index > 0 && (
            <button
              className="column-action-btn"
              onClick={onMoveLeft}
              title="Move left"
              style={{ color: textColor }}
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {index < totalColors - 1 && (
            <button
              className="column-action-btn"
              onClick={onMoveRight}
              title="Move right"
              style={{ color: textColor }}
            >
              <ChevronRight size={16} />
            </button>
          )}

          {totalColors > 2 && (
            <button
              className="column-action-btn"
              onClick={onRemoveColor}
              title="Remove color"
              style={{ color: textColor }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Middle Info: Hex Code, Name, Copy trigger */}
      <div className="color-middle-info" onClick={handleCopy} title="Click to copy hex">
        <span className="color-hex" style={{ color: textColor }}>
          {copied ? 'COPIED!' : color}
        </span>
        <span className="color-name" style={{ color: textColor }}>
          {colorName}
        </span>

        {/* Contrast Badge */}
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            color: '#ffffff',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
          title={`Contrast ratio ${contrastRatio}:1 (${rating.level})`}
        >
          <span>{contrastRatio}:1</span>
          <span style={{ color: rating.color }}>●</span>
          <span>{rating.level}</span>
        </div>
      </div>

      {/* Bottom Controls: Lock Toggle & Color Picker */}
      <div className="color-bottom-actions">
        {/* Native Color Picker trigger */}
        <label
          className="column-action-btn"
          style={{ color: textColor, cursor: 'pointer', position: 'relative' }}
          title="Pick custom color"
        >
          <Sliders size={18} />
          <input
            type="color"
            value={color}
            onChange={e => onUpdateColor(e.target.value)}
            style={{
              opacity: 0,
              position: 'absolute',
              width: 0,
              height: 0,
              pointerEvents: 'none'
            }}
          />
        </label>

        {/* Copy Button */}
        <button
          className="column-action-btn"
          onClick={handleCopy}
          title="Copy Hex"
          style={{ color: textColor }}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>

        {/* Lock Toggle Button */}
        <button
          className={`column-action-btn ${isLocked ? 'active' : ''}`}
          onClick={onToggleLock}
          title={isLocked ? 'Unlock color' : 'Lock color'}
          style={{ color: textColor }}
        >
          {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
        </button>
      </div>
    </div>
  );
}
