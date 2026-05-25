import React from 'react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';

const isUrl = (str) => typeof str === 'string' && (str.startsWith('http') || str.startsWith('/') || str.startsWith('data:'));

export default function InventoryTab({ products, editStock, setEditStock, guardarStock, updateProductStatus, fmt }) {
  const B = 'var(--color-border)';
  const G = 'var(--color-gold)';
  const D = 'var(--color-dark)';
  const M = 'var(--color-muted)';

  return (
    <>
      <div className="inventory-header-row">
        <h2 className="inventory-title">Inventario</h2>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div className="inventory-table-container">
          <table className="inventory-table">
            <thead style={{ background: '#FFF8F0' }}>
              <tr>
                <th>PRODUCTO</th>
                <th>CATEGORÍA</th>
                <th style={{ textAlign: 'right' }}>PRECIO</th>
                <th style={{ textAlign: 'center' }}>STOCK</th>
                <th style={{ textAlign: 'center' }}>ESTADO</th>
                <th style={{ textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const stock = p.inventory?.stock ?? 0;
                const low = stock <= (p.inventory?.minimum_stock ?? 5);
                const editing = editStock[p.id] !== undefined;

                return (
                  <tr key={p.id} style={{ borderTop: `1px solid ${B}` }}>
                    <td>
                      <div className="inventory-product-cell">
                        <span className="inventory-product-emoji" style={{ display: 'inline-flex', width: 36, height: 36, borderRadius: 8, background: '#F5F5F5', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {isUrl(p.image) ? (
                            <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            p.image || '🍽️'
                          )}
                        </span>
                        <div>
                          <div className="inventory-product-name">{p.name}</div>
                          <div className="inventory-product-desc">{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>{p.category}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: G }}>{fmt(p.price)}</td>
                    <td style={{ textAlign: 'center' }}>
                      {editing ? (
                        <div className="stock-editing-row">
                          <input
                            type="number"
                            value={editStock[p.id]}
                            onChange={e => setEditStock({ ...editStock, [p.id]: e.target.value })}
                            className="stock-input"
                            autoFocus
                          />
                          <button
                            onClick={() => guardarStock(p.id, editStock[p.id])}
                            style={{ background: G, color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => setEditStock(prev => { const n = { ...prev }; delete n[p.id]; return n; })}
                            style={{ background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontWeight: 700, color: low ? '#C62828' : D }}>{stock}</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {!p.is_active ? (
                        <span className="inventory-status-badge" style={{ background: '#FFEBEE', color: '#C62828' }}>
                          Inactivo
                        </span>
                      ) : low ? (
                        <span className="inventory-status-badge" style={{ background: '#FFF3E0', color: '#F57C00' }}>
                          Stock bajo
                        </span>
                      ) : (
                        <span className="inventory-status-badge" style={{ background: '#E8F5E9', color: '#2E7D32' }}>
                          OK
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => setEditStock({ ...editStock, [p.id]: stock })}
                        style={{ background: 'none', border: `1px solid ${G}`, color: G, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}
                      >
                        Editar stock
                      </button>
                      <button
                        onClick={() => updateProductStatus(p.id, !p.is_active)}
                        style={{
                          background: p.is_active ? '#FFEBEE' : '#E8F5E9',
                          color: p.is_active ? '#C62828' : '#2E7D32',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 11
                        }}
                      >
                        {p.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
