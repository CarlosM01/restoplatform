import React from 'react';

export default function Input({ label, error, style = {}, ...props }) {
  return (
    <div style={style}>
      {label && <label className="label">{label}</label>}
      <input className="input" {...props} />
      {error && <div style={{ color: 'var(--color-danger)', fontSize: 10, marginTop: 2 }}>{error}</div>}
    </div>
  );
}
