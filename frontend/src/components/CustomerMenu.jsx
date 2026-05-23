import { useState, useEffect } from 'react';
import {
  getProducts, createOrder,
  initPayment, getUser, clearAuth, fmt,
  getVenue, getCategories,
} from '../lib/api.js';

const STEPS = ['menu', 'cart', 'payment'];

const G = '#C4A97D', D = '#1B1916', M = '#A89B8C', B = '#F0EBE4', BG = '#FFF8F0';

export default function CustomerMenu() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState('menu');
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [sedeId, setSedeId] = useState(null);
  const [cat, setCat] = useState('Todos');
  const [cart, setCart] = useState([]);
  const [flash, setFlash] = useState(null);

  // UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setUser(getUser());

    // Resolve venue_id from URL params, default to 1
    const params = new URLSearchParams(window.location.search);
    const sid = parseInt(params.get('sede') || '1', 10);
    setSedeId(sid);

    Promise.all([
      getProducts(sid),
      getVenue(sid),
      getCategories(sid),
    ])
      .then(([p, sede, categorias]) => {
        setProducts(p);
        setCats(['Todos', ...categorias]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const items = products.filter(p => cat === 'Todos' || p.category === cat);
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cnt = cart.reduce((s, c) => s + c.qty, 0);

  const add = (item) => {
    if (item.inventory && item.inventory.stock < 1) return;
    setCart(p => {
      const e = p.find(c => c.id === item.id);
      return e ? p.map(c => c.id === item.id ? {...c, qty: c.qty+1} : c) : [...p, {...item, qty: 1}];
    });
    setFlash(item.id);
    setTimeout(() => setFlash(null), 600);
  };

  const upd = (id, d) => setCart(p =>
    p.map(c => c.id === id ? {...c, qty: Math.max(0, c.qty + d)} : c).filter(c => c.qty > 0)
  );

  const stepIdx = STEPS.indexOf(step);
  const canNext = {
    menu: cnt > 0,
    cart: cnt > 0,
    payment: false, // payment se maneja distinto
  };

  const procesarCheckout = async () => {
    if (!user) {
      alert('Debes iniciar sesión para pagar');
      window.location.href = '/login';
      return;
    }
    setProcessing(true);
    try {
      // 1. Crear pedido
      const pedido = await createOrder({
        venue_id: sedeId,
        items: cart.map(c => ({ product_id: c.id, quantity: c.qty })),
      });

      // 2. Iniciar payment Webpay
      const payment = await initPayment(pedido.id);

      // 3. Submit a Webpay (form POST con token_ws)
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payment.url;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'token_ws';
      input.value = payment.token;
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
    } catch (e) {
      setError(e.message);
      setProcessing(false);
    }
  };

  const logout = () => { clearAuth(); window.location.reload(); };

  if (loading) return <div style={{padding: 40, textAlign: 'center', color: M}}>Cargando...</div>;
  if (error) return <div style={{padding: 20, color: '#E85D3A'}}>Error: {error}</div>;

  return (
    <div className="app-shell">
      {/* Header */}
      <div className="app-header">
        <div>
          <div className="brand">RestoPlatform</div>
          <div className="name">La Leña Restaurante</div>
        </div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ color: G, fontSize: 11, textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: 9, color: M }}>{user.role}</div>
            </div>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: M, cursor: 'pointer', fontSize: 16 }}>↪</button>
          </div>
        ) : (
          <a href="/login" style={{ background: G, color: '#fff', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>Ingresar</a>
        )}
      </div>

      {/* Progress */}
      <div style={{ background: '#FFF', padding: '12px 18px 10px', borderBottom: `1px solid ${B}` }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {['Menú', 'Carrito', 'Pago'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
              <div style={{ width: 26, height: 26, borderRadius: 13, background: stepIdx >= i ? G : '#EDE8E0', color: stepIdx >= i ? '#fff' : M, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <span style={{ fontSize: 10, fontWeight: stepIdx === i ? 700 : 400, color: stepIdx >= i ? D : M, marginLeft: 4, whiteSpace: 'nowrap' }}>{label}</span>
              {i < 2 && <div style={{ flex: 1, height: 2, background: stepIdx > i ? G : '#EDE8E0', margin: '0 8px', borderRadius: 1 }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* STEP MENU */}
        {step === 'menu' && (
          <div>
            <div style={{ padding: '14px 18px 6px' }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Elige tus platos</div>
              <div style={{ fontSize: 11, color: M, marginBottom: 10 }}>Selecciona lo que quieres pedir y avanza al carrito.</div>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }}>
                {cats.map(c => (
                  <button key={c} onClick={() => setCat(c)} style={{ padding: '6px 13px', borderRadius: 18, border: cat === c ? 'none' : '1px solid #DDD6CC', background: cat === c ? D : '#FFF', color: cat === c ? '#FFF' : '#6B6560', fontSize: 11, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>{c}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(i => {
                const incart = cart.find(c => c.id === i.id);
                const stockOk = i.inventory && i.inventory.stock > 0;
                return (
                  <div key={i.id} style={{ background: '#FFF', borderRadius: 14, padding: 12, display: 'flex', gap: 12, alignItems: 'center', border: `1px solid ${incart ? G : B}`, boxShadow: incart ? `0 0 0 1px ${G}` : '0 1px 6px rgba(0,0,0,0.04)', opacity: stockOk ? 1 : 0.5 }}>
                    <div style={{ fontSize: 32, width: 50, height: 50, background: BG, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i.image || '🍽️'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{i.name}</div>
                      <div style={{ fontSize: 10, color: M }}>{i.description}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                        <span style={{ color: G, fontWeight: 700, fontSize: 14 }}>{fmt(i.price)}</span>
                        {incart ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button onClick={() => upd(i.id, -1)} style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid #DDD6CC', background: '#FFF', cursor: 'pointer', fontSize: 13 }}>−</button>
                            <span style={{ fontWeight: 700, fontSize: 13, minWidth: 14, textAlign: 'center' }}>{incart.qty}</span>
                            <button onClick={() => upd(i.id, 1)} disabled={!stockOk || incart.qty >= i.inventory.stock} style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: D, color: '#fff', cursor: 'pointer', fontSize: 13 }}>+</button>
                          </div>
                        ) : (
                          <button onClick={() => add(i)} disabled={!stockOk} style={{ padding: '5px 12px', background: flash === i.id ? '#2E7D32' : (stockOk ? D : '#DDD6CC'), color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: stockOk ? 'pointer' : 'not-allowed' }}>
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
        )}

        {/* STEP CART */}
        {step === 'cart' && (
          <div style={{ padding: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 3 }}>Resumen del pedido</div>
            <div style={{ fontSize: 11, color: M, marginBottom: 16 }}>Revisa antes de pagar con Webpay.</div>

            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8, color: G }}>🍽️ PRODUCTOS</div>
            {cart.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${B}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.image} {c.name}</div>
                  <div style={{ fontSize: 11, color: M }}>{fmt(c.price)} × {c.qty}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => upd(c.id, -1)} style={{ width: 26, height: 26, borderRadius: 7, border: '1px solid #DDD6CC', background: '#FFF', cursor: 'pointer' }}>−</button>
                  <span style={{ fontWeight: 700, fontSize: 13, minWidth: 14, textAlign: 'center' }}>{c.qty}</span>
                  <button onClick={() => upd(c.id, 1)} style={{ width: 26, height: 26, borderRadius: 7, border: 'none', background: D, color: '#fff', cursor: 'pointer' }}>+</button>
                </div>
                <span style={{ fontWeight: 700, fontSize: 13, marginLeft: 10, minWidth: 60, textAlign: 'right' }}>{fmt(c.price * c.qty)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0', fontWeight: 700, fontSize: 17 }}>
              <span>Total</span><span style={{ color: G }}>{fmt(total)}</span>
            </div>
          </div>
        )}

        {/* STEP PAYMENT */}
        {step === 'payment' && (
          <div style={{ padding: 18, textAlign: 'center' }}>
            <div style={{ background: '#FFF', borderRadius: 16, border: '1px solid #E0E0E0', padding: 24 }}>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>💳</div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Pagar con Webpay</div>
                <div style={{ fontSize: 12, color: M }}>Te redirigiremos a la pasarela segura de Transbank</div>
              </div>
              <div style={{ background: BG, borderRadius: 10, padding: 16, marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: M, marginBottom: 4 }}>Total a pagar</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: D }}>{fmt(total)}</div>
              </div>
              <button onClick={procesarCheckout} disabled={processing} className="btn-gold" style={{ width: '100%', padding: 14, fontSize: 15 }}>
                {processing ? '⏳ Procesando...' : `Ir a Webpay → ${fmt(total)}`}
              </button>
              <div style={{ background: '#F0F4FF', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
                <span style={{ fontSize: 16 }}>🔒</span>
                <span style={{ fontSize: 10, color: '#5B6B8A' }}>Pago seguro procesado por Webpay — Transbank</span>
              </div>
              {error && <div style={{ color: '#E85D3A', fontSize: 12, marginTop: 10 }}>{error}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{ flexShrink: 0, padding: '12px 18px', background: '#FFF', borderTop: `1px solid ${B}`, display: 'flex', gap: 10 }}>
        {step !== 'menu' && (
          <button onClick={() => setStep(STEPS[stepIdx - 1])} className="btn-ghost">← Volver</button>
        )}
        {step !== 'payment' && (
          <button
            onClick={() => canNext[step] && setStep(STEPS[stepIdx + 1])}
            disabled={!canNext[step]}
            className="btn-gold"
            style={{ flex: 1, padding: 12, fontWeight: 700 }}
          >
            {step === 'menu' && `Siguiente — ${cnt} ${cnt === 1 ? 'plato' : 'platos'} (${fmt(total)})`}
            {step === 'cart' && `Ir a pagar — ${fmt(total)}`}
          </button>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '6px 0 10px', fontSize: 8, color: '#C4B8A8', letterSpacing: 1.5 }}>
        POWERED BY RESTOPLATFORM · BETA v0.1
      </div>
    </div>
  );
}
