import { useState, useEffect } from 'react';
import {
  venueOrders, changeOrderStatus,
  getProducts, updateStock, updateProduct, createProduct,
  getUser, clearAuth, fmt,
} from '../lib/api.js';

const G = '#C4A97D', D = '#1B1916', M = '#A89B8C', B = '#F0EBE4';

const ESTADO_LABEL = {
  pendiente: { label: 'Pendiente', color: '#F57C00', bg: '#FFF3E0' },
  confirmado: { label: 'Confirmado', color: '#1976D2', bg: '#E3F2FD' },
  en_preparacion: { label: 'En preparación', color: '#7B1FA2', bg: '#F3E5F5' },
  listo: { label: 'Listo', color: '#388E3C', bg: '#E8F5E9' },
  entregado: { label: 'Entregado', color: '#5D4037', bg: '#EFEBE9' },
  cancelado: { label: 'Cancelado', color: '#C62828', bg: '#FFEBEE' },
};

export default function ManagerDashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [error, setError] = useState(null);
  const [editStock, setEditStock] = useState({});

  useEffect(() => {
    const u = getUser();
    if (!u || (u.role !== 'manager' && u.role !== 'admin')) {
      window.location.href = '/login';
      return;
    }
    setUser(u);
    cargarPedidos();
    cargarProductos();
    const interval = setInterval(cargarPedidos, 8000);
    return () => clearInterval(interval);
  }, []);

  const cargarPedidos = () => venueOrders().then(setOrders).catch(e => setError(e.message));
  const cargarProductos = () => getProducts().then(setProducts).catch(e => setError(e.message));

  const cambiarEstado = async (id, accion) => {
    try {
      await changeOrderStatus(id, accion);
      cargarPedidos();
    } catch (e) {
      alert(e.message);
    }
  };

  const guardarStock = async (id, stock) => {
    try {
      await updateStock(id, parseInt(stock));
      cargarProductos();
      setEditStock(prev => { const n = {...prev}; delete n[id]; return n; });
    } catch (e) {
      alert(e.message);
    }
  };

  const logout = () => { clearAuth(); window.location.href = '/login'; };

  const pedidosFiltrados = filtroEstado ? orders.filter(p => p.status === filtroEstado) : orders;

  if (!user) return null;

  return (
    <div className="app-shell wide" style={{ maxWidth: 1200 }}>
      <div className="app-header" style={{ padding: '14px 24px' }}>
        <div>
          <div className="brand">PANEL ENCARGADO</div>
          <div className="name">La Leña Restaurante</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ color: G, fontSize: 12, textAlign: 'right' }}>
            <div style={{ fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: 10, color: M }}>{user.role}</div>
          </div>
          <button onClick={logout} className="btn-ghost" style={{ padding: '6px 14px', fontSize: 11 }}>Cerrar sesión</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#FFF', borderBottom: `1px solid ${B}` }}>
        {[
          ['orders', '📋 Pedidos', orders.filter(p => p.status === 'pendiente').length],
          ['inventario', '📦 Inventario', null],
        ].map(([id, label, badge]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ padding: '14px 24px', background: 'none', border: 'none', borderBottom: tab === id ? `3px solid ${G}` : '3px solid transparent', cursor: 'pointer', color: tab === id ? D : M, fontWeight: tab === id ? 700 : 500, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            {label}
            {badge > 0 && <span style={{ background: '#E85D3A', color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>{badge}</span>}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24, background: '#FAFAFA' }}>
        {/* PEDIDOS */}
        {tab === 'orders' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22 }}>Pedidos de la sede</h2>
              <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="input" style={{ width: 200 }}>
                <option value="">Todos los estados</option>
                {Object.entries(ESTADO_LABEL).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            {pedidosFiltrados.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: M }}>No hay orders</div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
              {pedidosFiltrados.map(p => {
                const est = ESTADO_LABEL[p.status] || { label: p.status, color: M, bg: '#F0F0F0' };
                return (
                  <div key={p.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>Pedido #{p.id}</div>
                        <div style={{ fontSize: 10, color: M }}>{new Date(p.created_at).toLocaleString('es-CL')}</div>
                      </div>
                      <span style={{ background: est.bg, color: est.color, padding: '4px 10px', borderRadius: 12, fontSize: 10, fontWeight: 700 }}>{est.label}</span>
                    </div>

                    <div style={{ padding: '10px 0', borderTop: `1px solid ${B}`, borderBottom: `1px solid ${B}` }}>
                      {p.items.map(it => {
                        const prod = products.find(pr => pr.id === it.product_id);
                        return (
                          <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0' }}>
                            <span>{prod?.image} {prod?.name || `Producto #${it.product_id}`} × {it.quantity}</span>
                            <span style={{ fontWeight: 600 }}>{fmt(it.unit_price * it.quantity)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>Total</span><span style={{ color: G }}>{fmt(p.total)}</span>
                    </div>

                    {/* Acciones según status */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {p.status === 'pendiente' && (
                        <>
                          <button onClick={() => cambiarEstado(p.id, 'confirmar')} className="btn-gold" style={{ padding: '8px 12px', fontSize: 11, flex: 1 }}>Confirmar</button>
                          <button onClick={() => confirm('¿Cancelar pedido? Se devolverá el stock.') && cambiarEstado(p.id, 'cancelar')} style={{ padding: '8px 12px', fontSize: 11, background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
                        </>
                      )}
                      {p.status === 'confirmado' && (
                        <button onClick={() => cambiarEstado(p.id, 'preparar')} className="btn-gold" style={{ padding: '8px 12px', fontSize: 11, flex: 1 }}>Iniciar preparación</button>
                      )}
                      {p.status === 'en_preparacion' && (
                        <button onClick={() => cambiarEstado(p.id, 'listo')} className="btn-gold" style={{ padding: '8px 12px', fontSize: 11, flex: 1 }}>Marcar listo</button>
                      )}
                      {p.status === 'listo' && (
                        <button onClick={() => cambiarEstado(p.id, 'entregar')} className="btn-dark" style={{ padding: '8px 12px', fontSize: 11, flex: 1 }}>Entregar</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* INVENTARIO */}
        {tab === 'inventario' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22 }}>Inventario</h2>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ background: '#FFF8F0' }}>
                  <tr>
                    <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>PRODUCTO</th>
                    <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>CATEGORÍA</th>
                    <th style={{ padding: 12, textAlign: 'right', fontSize: 11, color: M }}>PRECIO</th>
                    <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>STOCK</th>
                    <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ESTADO</th>
                    <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const stock = p.inventory?.stock ?? 0;
                    const low = stock <= (p.inventory?.minimum_stock ?? 5);
                    const editing = editStock[p.id] !== undefined;
                    return (
                      <tr key={p.id} style={{ borderTop: `1px solid ${B}` }}>
                        <td style={{ padding: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 20 }}>{p.image}</span>
                            <div>
                              <div style={{ fontWeight: 600 }}>{p.name}</div>
                              <div style={{ fontSize: 10, color: M }}>{p.description}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: 12, fontSize: 12 }}>{p.category}</td>
                        <td style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: G }}>{fmt(p.price)}</td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          {editing ? (
                            <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                              <input
                                type="number"
                                value={editStock[p.id]}
                                onChange={e => setEditStock({...editStock, [p.id]: e.target.value})}
                                style={{ width: 70, padding: 4, borderRadius: 6, border: `1px solid ${G}` }}
                                autoFocus
                              />
                              <button onClick={() => guardarStock(p.id, editStock[p.id])} style={{ background: G, color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}>✓</button>
                              <button onClick={() => setEditStock(prev => { const n = {...prev}; delete n[p.id]; return n; })} style={{ background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}>✕</button>
                            </div>
                          ) : (
                            <span style={{ fontWeight: 700, color: low ? '#C62828' : D }}>{stock}</span>
                          )}
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          {!p.is_active ? (
                            <span style={{ background: '#FFEBEE', color: '#C62828', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>Inactivo</span>
                          ) : low ? (
                            <span style={{ background: '#FFF3E0', color: '#F57C00', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>Stock bajo</span>
                          ) : (
                            <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>OK</span>
                          )}
                        </td>
                        <td style={{ padding: 12, textAlign: 'center' }}>
                          <button onClick={() => setEditStock({...editStock, [p.id]: stock})} style={{ background: 'none', border: `1px solid ${G}`, color: G, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}>Editar stock</button>
                          <button onClick={async () => {
                            try {
                              await updateProduct(p.id, { is_active: !p.is_active });
                              cargarProductos();
                            } catch (e) { alert(e.message); }
                          }} style={{ background: p.is_active ? '#FFEBEE' : '#E8F5E9', color: p.is_active ? '#C62828' : '#2E7D32', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>
                            {p.is_active ? 'Desactivar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
