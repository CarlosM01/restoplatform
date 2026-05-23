import React from 'react';

export default function Checkbox({ label, id, style = {}, ...props }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', ...style }}>
      <input
        type="checkbox"
        id={id}
        style={{ width: 16, height: 16, accentColor: 'var(--color-gold)' }}
        {...props}
      />
      {label && (
        <label htmlFor={id} className="label" style={{ marginBottom: 0, cursor: 'pointer', fontSize: 12 }}>
          {label}
        </label>
      )}
    </div>
  );
}
