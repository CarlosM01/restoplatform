import React from 'react';

export default function Modal({ title, onClose, children, width = 420, style = {}, cardStyle = {} }) {
  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.5)', 
        zIndex: 100, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 20,
        ...style 
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{ 
          background: '#FFF', 
          borderRadius: 16, 
          padding: 24, 
          width, 
          maxWidth: '100%', 
          maxHeight: '90vh', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          position: 'relative',
          ...cardStyle 
        }}
      >
        <button
          onClick={onClose}
          style={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            background: 'none', 
            border: 'none', 
            fontSize: 16, 
            cursor: 'pointer', 
            color: 'var(--color-muted)',
            fontWeight: 'bold' 
          }}
          title="Cerrar"
        >
          ✕
        </button>

        {title && (
          <h3 style={{ 
            fontFamily: "var(--font-serif)", 
            fontSize: 20, 
            marginBottom: 16, 
            fontWeight: '700',
            color: 'var(--color-dark)',
            paddingRight: 24
          }}>
            {title}
          </h3>
        )}

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
