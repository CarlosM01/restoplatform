import React from 'react';

export default function Button({ children, variant = 'gold', disabled, loading, onClick, type = 'button', style = {}, ...props }) {
  const className = `btn-${variant}`;
  return (
    <button
      type={type}
      className={className}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
      {...props}
    >
      {loading ? 'Cargando...' : children}
    </button>
  );
}
