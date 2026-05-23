import React from 'react';

export default function Header({ title, subtitle, user, logoutAction, actions }) {
  const G = 'var(--color-gold)';
  const M = 'var(--color-muted)';

  return (
    <div className="app-header">
      <div>
        <div className="brand">{title}</div>
        <div className="name">{subtitle}</div>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {actions}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ color: G, fontSize: 11, textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: 9, color: M }}>{user.role}</div>
            </div>
            {logoutAction && (
              <button 
                onClick={logoutAction} 
                style={{ background: 'none', border: 'none', color: M, cursor: 'pointer', fontSize: 16 }}
                title="Cerrar sesión"
              >
                ↪
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
