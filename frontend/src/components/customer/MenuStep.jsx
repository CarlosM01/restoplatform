import React from 'react';
import Button from '../common/Button.jsx';

export default function MenuStep({ cats, cat, setCat, items, cart, flash, add, upd, fmt }) {
  return (
    <div>
      <div className="category-filter-header">
        <div className="category-filter-title">Elige tus platos</div>
        <div className="category-filter-subtitle">Selecciona lo que quieres pedir y avanza al carrito.</div>
        <div className="category-scroll">
          {cats.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`category-btn ${cat === c ? 'active' : 'inactive'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="products-grid">
        {items.map(i => {
          const incartQty = cart.filter(c => c.id === i.id).reduce((sum, c) => sum + c.qty, 0);
          const stockOk = i.inventory && i.inventory.stock > 0;
          const cardBorder = incartQty > 0 ? 'var(--color-gold)' : 'var(--color-border)';
          const cardShadow = incartQty > 0 ? '0 0 0 1px var(--color-gold)' : '0 1px 6px rgba(0,0,0,0.04)';

          return (
            <div
              key={i.id}
              className="product-item-card"
              style={{
                border: `1px solid ${cardBorder}`,
                boxShadow: cardShadow,
                opacity: stockOk ? 1 : 0.5,
              }}
            >
              <div className="product-item-image">{i.image || '🍽️'}</div>
              <div className="product-info">
                <div className="product-name">{i.name}</div>
                <div className="product-desc">{i.description}</div>
                <div className="product-action-row">
                  <span className="product-price">{fmt(i.price)}</span>
                  {incartQty > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {i.modifiers && i.modifiers.length > 0 ? (
                        <>
                          <span style={{ fontSize: 10, background: 'var(--color-gold)', color: '#fff', padding: '3px 8px', borderRadius: 10, fontWeight: 700 }}>
                            {incartQty} agregados
                          </span>
                          <button
                            onClick={() => add(i)}
                            disabled={!stockOk || incartQty >= i.inventory.stock}
                            style={{ padding: '4px 10px', background: 'var(--color-dark)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                          >
                            + Agregar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => upd(i.id, -1)}
                            className="cart-qty-btn minus"
                          >
                            −
                          </button>
                          <span style={{ fontWeight: 700, fontSize: 13, minWidth: 14, textAlign: 'center' }}>
                            {incartQty}
                          </span>
                          <button
                            onClick={() => upd(i.id, 1)}
                            disabled={!stockOk || incartQty >= i.inventory.stock}
                            className="cart-qty-btn plus"
                          >
                            +
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => add(i)}
                      disabled={!stockOk}
                      style={{
                        padding: '5px 12px',
                        background: flash === i.id ? '#2E7D32' : (stockOk ? 'var(--color-dark)' : '#DDD6CC'),
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: stockOk ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {flash === i.id ? '✓' : stockOk ? '+ Agregar' : 'Sin stock'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
