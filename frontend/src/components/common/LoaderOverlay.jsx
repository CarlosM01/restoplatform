import React from 'react';
import Spinner from './Spinner.jsx';

export default function LoaderOverlay({ message = 'Cargando...' }) {
  return (
    <div className="loader-overlay" style={{ flexDirection: 'column', gap: 10 }}>
      <Spinner size={28} />
      <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>{message}</span>
    </div>
  );
}
