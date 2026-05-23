import React from 'react';

export default function CartStep({ cart, upd, total, fmt }) {
  return (
    <div className="cart-container">
      <div className="cart-title">Resumen del pedido</div>
      <div className="cart-subtitle">Revisa tu pedido antes de pagar.</div>

      <div className="cart-section-title">🍽️ PRODUCTOS</div>
      {cart.map(c => (
        <div key={c.cartItemId} className="cart-item-row">
          <div className="cart-item-details">
            <div className="cart-item-name">{c.image} {c.name}</div>
            {c.selectedModifiers && c.selectedModifiers.length > 0 && (
              <div className="cart-item-mods">
                {c.selectedModifiers.map((m, idx) => (
                  <span key={idx}>· {m.name} (+{fmt(m.price_delta)})</span>
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
