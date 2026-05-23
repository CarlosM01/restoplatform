import React from 'react';

export default function Select({ label, error, options = [], style = {}, children, ...props }) {
  return (
    <div style={style}>
      {label && <label className="label">{label}</label>}
      <select className="input" {...props}>
        {children || options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div style={{ color: 'var(--color-danger)', fontSize: 10, marginTop: 2 }}>{error}</div>}
    </div>
  );
}
