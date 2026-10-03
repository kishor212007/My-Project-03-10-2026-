import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('PaletteApp Component Rendering', () => {
  it('renders the brand title in navbar and footer', () => {
    render(<App />);
    const brandElements = screen.getAllByText(/PaletteApp/i);
    expect(brandElements.length).toBeGreaterThan(0);
  });

  it('renders Generator action controls', () => {
    render(<App />);
    const generateButtons = screen.getAllByText(/Generate/i);
    expect(generateButtons.length).toBeGreaterThan(0);
  });
});
