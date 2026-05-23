import React from 'react';

export default function Textarea({ label, error, style = {}, ...props }) {
  return (
    <div style={style}>
      {label && <label className="label">{label}</label>}
      <textarea className="input" style={{ resize: 'vertical' }} {...props} />
      {error && <div style={{ color: 'var(--color-danger)', fontSize: 10, marginTop: 2 }}>{error}</div>}
    </div>
  );
}
