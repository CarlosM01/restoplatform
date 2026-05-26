import React from 'react';

const isUrl = (str) => typeof str === 'string' && (str.startsWith('http') || str.startsWith('/') || str.startsWith('data:'));

export default function CartStep({ cart, upd, total, fmt }) {
  return (
    <div className="cart-container">
      <div className="cart-title">Resumen del pedido</div>
      <div className="cart-subtitle">Revisa tu pedido antes de pagar.</div>

      <div className="cart-section-title">🍽️ PRODUCTOS</div>
      {cart.map(c => (
        <div key={c.cartItemId} className="cart-item-row">
          <div className="cart-item-details">
            <div className="cart-item-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isUrl(c.image) ? (
                <img src={c.image} alt={c.name} style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }} />
              ) : (
                <span>{c.image || '🍽️'}</span>
              )}
              <span>{c.name}</span>
            </div>
            {(c.selectedSize || (c.selectedExtras && c.selectedExtras.length > 0) || (c.selectedModifiers && c.selectedModifiers.length > 0)) && (
              <div className="cart-item-mods">
                {c.selectedSize && (
                  <span>· Tamaño: {c.selectedSize.name} {c.selectedSize.price_delta > 0 ? `(+${fmt(c.selectedSize.price_delta)})` : ''}</span>
                )}
                {c.selectedExtras && c.selectedExtras.length > 0 && c.selectedExtras.map((ext, idx) => (
                  <span key={`ext-${idx}`}>· Extra: {ext.name} (+{fmt(ext.price)})</span>
                ))}
                {c.selectedModifiers && c.selectedModifiers.length > 0 && c.selectedModifiers.map((m, idx) => (
                  <span key={`mod-${idx}`}>· {m.name} {m.price_delta > 0 ? `(+${fmt(m.price_delta)})` : ''}</span>
                ))}
              </div>
            )}
            <div className="cart-item-price-qty">{fmt(c.price)} × {c.qty}</div>
          </div>
          <div className="cart-qty-controls">
            <button
              onClick={() => upd(c.cartItemId, -1)}
              className="cart-qty-btn minus"
            >
              −
            </button>
            <span style={{ fontWeight: 700, fontSize: 13, minWidth: 14, textAlign: 'center' }}>
              {c.qty}
            </span>
            <button
              onClick={() => upd(c.cartItemId, 1)}
              className="cart-qty-btn plus"
            >
              +
            </button>
          </div>
          <span className="cart-item-total">{fmt(c.price * c.qty)}</span>
        </div>
      ))}
      <div className="cart-total-row">
        <span>Total</span>
        <span className="cart-total-price">{fmt(total)}</span>
      </div>
    </div>
  );
}
