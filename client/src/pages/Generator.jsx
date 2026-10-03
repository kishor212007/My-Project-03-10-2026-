import React, { useState, useEffect, useCallback } from 'react';
import { ColorColumn } from '../components/ColorColumn';
import { ExportModal } from '../components/ExportModal';
import { SavePaletteModal } from '../components/SavePaletteModal';
import { ImageUploadModal } from '../components/ImageUploadModal';
import {
  generatePalette,
  generateRandomColor
} from '../utils/color';
import { api } from '../utils/api';
import {
  Sparkles,
  Bookmark,
  Share2,
  Plus,
  Image as ImageIcon,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

export function Generator({ navigate, onNotify }) {
  const [colors, setColors] = useState(() =>
    generatePalette('random', 5)
  );
  const [lockedIndices, setLockedIndices] = useState([]);
  const [harmonyType, setHarmonyType] = useState('random');

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Generate new palette respecting locks
  const handleGenerate = useCallback(() => {
    setColors(prevColors =>
      generatePalette(harmonyType, prevColors.length, prevColors, lockedIndices)
    );
  }, [harmonyType, lockedIndices]);

  // Spacebar keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = e => {
      // Don't trigger if typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleGenerate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate]);

  // Toggle lock state for color index
  const toggleLock = index => {
    setLockedIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Update specific color from picker
  const handleUpdateColor = (index, newHex) => {
    setColors(prev => {
      const next = [...prev];
      next[index] = newHex.toUpperCase();
      return next;
    });
  };

  // Add new color
  const handleAddColor = () => {
    if (colors.length >= 10) {
      if (onNotify) onNotify('Maximum 10 colors reached', 'error');
      return;
    }
    setColors(prev => [...prev, generateRandomColor()]);
  };

  // Remove color
  const handleRemoveColor = index => {
    if (colors.length <= 2) {
      if (onNotify) onNotify('A palette needs at least 2 colors', 'error');
      return;
    }
    setColors(prev => prev.filter((_, i) => i !== index));
    setLockedIndices(prev =>
      prev.filter(i => i !== index).map(i => (i > index ? i - 1 : i))
    );
  };

  // Move color left
  const handleMoveLeft = index => {
    if (index <= 0) return;
    setColors(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
    // Adjust locked indices
    setLockedIndices(prev =>
      prev.map(i => {
        if (i === index) return index - 1;
        if (i === index - 1) return index;
        return i;
      })
    );
  };

  // Move color right
  const handleMoveRight = index => {
    if (index >= colors.length - 1) return;
    setColors(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
    // Adjust locked indices
    setLockedIndices(prev =>
      prev.map(i => {
        if (i === index) return index + 1;
        if (i === index + 1) return index;
        return i;
      })
    );
  };

  // Save palette handler
  const handleSavePalette = async paletteData => {
    await api.palettes.create(paletteData);
    if (onNotify) onNotify(`Saved "${paletteData.title}" to your collection!`, 'success');
  };

  // Apply colors from image extraction
  const handleApplyImagePalette = extractedColors => {
    setColors(extractedColors);
    setLockedIndices([]);
  };

  return (
    <div className="generator-container">
      {/* Top Workspace Toolbar */}
      <div className="generator-toolbar">
        {/* Left Toolbar Group: Harmony selector & Count */}
        <div className="toolbar-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <SlidersHorizontal size={16} color="var(--primary-500)" />
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              value={harmonyType}
              onChange={e => setHarmonyType(e.target.value)}
              title="Select Color Harmony Method"
            >
              <option value="random">Random Harmony</option>
              <option value="analogous">Analogous</option>
              <option value="monochromatic">Monochromatic</option>
              <option value="triad">Triad</option>
              <option value="complementary">Complementary</option>
              <option value="warm">Warm Tones</option>
              <option value="cool">Cool Tones</option>
              <option value="pastel">Soft Pastel</option>
              <option value="neon">Vivid Neon</option>
            </select>
          </div>

          <button
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            onClick={handleAddColor}
            disabled={colors.length >= 10}
            title="Add color swatch (up to 10)"
          >
            <Plus size={15} />
            <span>Add Color</span>
          </button>
        </div>

        {/* Right Toolbar Group: Generate, Image, Save, Export */}
        <div className="toolbar-group">
          <button
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            onClick={() => setIsImageModalOpen(true)}
            title="Extract palette from image"
          >
            <ImageIcon size={15} />
            <span>Image Extractor</span>
          </button>

          <button
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            onClick={() => setIsSaveOpen(true)}
            title="Save palette to your profile"
          >
            <Bookmark size={15} />
            <span>Save</span>
          </button>

          <button
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            onClick={() => setIsExportOpen(true)}
            title="Export as CSS, Tailwind, SVG, or JSON"
          >
            <Share2 size={15} />
            <span>Export</span>
          </button>

          <button
            className="btn btn-primary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.9rem' }}
            onClick={handleGenerate}
            title="Generate new colors (Shortcut: Spacebar)"
          >
            <Sparkles size={16} />
            <span>Generate</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Swatches */}
      <main className="palette-canvas" role="main" aria-label="Palette Generator">
        {colors.map((color, index) => (
          <ColorColumn
            key={index}
            color={color}
            index={index}
            totalColors={colors.length}
            isLocked={lockedIndices.includes(index)}
            onToggleLock={() => toggleLock(index)}
            onUpdateColor={newHex => handleUpdateColor(index, newHex)}
            onRemoveColor={() => handleRemoveColor(index)}
            onMoveLeft={() => handleMoveLeft(index)}
            onMoveRight={() => handleMoveRight(index)}
            onNotify={onNotify}
          />
        ))}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        palette={{ colors, title: 'My Generated Palette' }}
        onNotify={onNotify}
      />

      {/* Save Modal */}
      <SavePaletteModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        colors={colors}
        onSaveSuccess={handleSavePalette}
        onNotify={onNotify}
        navigate={navigate}
      />

      {/* Image Upload Extractor Modal */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onApplyPalette={handleApplyImagePalette}
        onNotify={onNotify}
      />
    </div>
  );
}
