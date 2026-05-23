import React from 'react';

export default function Spinner({ size = 20, color = 'var(--color-gold)', ...props }) {
  return (
    <span 
      className="spinner" 
      style={{ fontSize: size, color, display: 'inline-block' }} 
      {...props}
    >
      ⏳
    </span>
  );
}
