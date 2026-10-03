import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';

export function NotFound({ navigate }) {
  return (
    <div className="page-container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--primary-500)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}
      >
        <Compass size={36} />
      </div>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
        The color space you are searching for does not exist or has moved into the spectrum.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>
        <ArrowLeft size={16} />
        <span>Return to Generator</span>
      </button>
    </div>
  );
}
