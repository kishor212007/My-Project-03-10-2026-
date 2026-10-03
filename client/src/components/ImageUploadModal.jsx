import React, { useState, useRef } from 'react';
import { X, Upload, Pipette, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { extractColorsFromImage, pickColorAtPoint } from '../utils/image';
import { getAccessibleTextColor } from '../utils/color';

export function ImageUploadModal({ isOpen, onClose, onApplyPalette, onNotify }) {
  if (!isOpen) return null;

  const [imageSrc, setImageSrc] = useState(null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [pickedColor, setPickedColor] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (onNotify) onNotify('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      const url = URL.createObjectURL(file);
      setImageSrc(url);

      const colors = await extractColorsFromImage(file, 5);
      setExtractedColors(colors);
      if (onNotify) onNotify('Extracted 5 dominant colors from image!', 'success');
    } catch (err) {
      console.error(err);
      if (onNotify) onNotify('Failed to extract colors from image', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCanvasClick = e => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    try {
      const color = pickColorAtPoint(canvas, x, y);
      setPickedColor(color);
      // Replace the first unlocked or append
      if (extractedColors.length > 0) {
        const updated = [...extractedColors];
        updated[0] = color;
        setExtractedColors(updated);
      }
      if (onNotify) onNotify(`Sampled ${color} from image!`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = () => {
    if (extractedColors.length >= 2) {
      onApplyPalette(extractedColors);
      onClose();
      if (onNotify) onNotify('Applied image palette to Generator!', 'success');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ImageIcon size={20} color="var(--primary-500)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Extract Palette from Image</h2>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {!imageSrc ? (
            /* Upload Drop Area */
            <div
              style={{
                border: '2px dashed var(--border-subtle)',
                borderRadius: '16px',
                padding: '3rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--bg-surface-hover)',
                transition: 'all var(--transition-fast)'
              }}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--primary-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}
              >
                <Upload size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                Upload or Drop an Image
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                PNG, JPG, or WebP up to 10MB
              </p>
            </div>
          ) : (
            /* Image Preview & Interactive Color Picker */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  position: 'relative',
                  maxHeight: '280px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={imageSrc}
                  alt="Source"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '280px',
                    objectFit: 'contain'
                  }}
                  onLoad={e => {
                    const img = e.target;
                    const canvas = canvasRef.current;
                    if (canvas) {
                      canvas.width = img.naturalWidth;
                      canvas.height = img.naturalHeight;
                      const ctx = canvas.getContext('2d');
                      ctx.drawImage(img, 0, 0);
                    }
                  }}
                />
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'crosshair',
                    opacity: 0
                  }}
                  title="Click anywhere to sample color"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Tip: Click on any point in the image to sample custom colors with the eye-dropper.
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  Change Image
                </button>
              </div>

              {/* Extracted Swatches */}
              <div>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Extracted Palette:
                </h4>
                <div style={{ height: '60px', display: 'flex', borderRadius: '12px', overflow: 'hidden' }}>
                  {extractedColors.map((c, i) => {
                    const textColor = getAccessibleTextColor(c);
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          backgroundColor: c,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: textColor,
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        {c}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {extractedColors.length > 0 && (
            <button type="button" className="btn btn-primary" onClick={handleApply}>
              <Sparkles size={16} />
              <span>Apply to Generator</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
