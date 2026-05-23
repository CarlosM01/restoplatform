import React from 'react';
import Button from '../common/Button.jsx';

export default function PaymentStep({ user, total, processing, error, procesarCheckout, fmt }) {
  return (
    <div className="payment-container">
      {!user ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Opción 1: Checkout de Invitado */}
          <div className="payment-card">
            <div className="payment-emoji">⚡</div>
            <h3 className="payment-title">Pago Rápido como Invitado</h3>
            <p className="payment-subtitle">No necesitas registrarte ni crear una contraseña para realizar tu pedido.</p>

            <div className="payment-amount-box">
              <div className="payment-amount-label">Total a pagar</div>
              <div className="payment-amount-value">{fmt(total)}</div>
            </div>

            <Button
              onClick={() => procesarCheckout(true)}
              disabled={processing}
              variant="gold"
              loading={processing}
              style={{ width: '100%', padding: 12, fontSize: 14, fontWeight: 700 }}
            >
              Pagar como Invitado → {fmt(total)}
            </Button>
          </div>

          {/* Opción 2: Iniciar Sesión (Opcional) */}
          <div className="payment-card mini">
            <div className="payment-emoji" style={{ fontSize: 24 }}>🔑</div>
            <h4 className="payment-title" style={{ fontSize: 14 }}>¿Tienes una cuenta?</h4>
            <p className="payment-subtitle" style={{ fontSize: 11, marginBottom: 12 }}>
              Inicia sesión para guardar tu historial de pedidos y ver tus detalles.
            </p>
            <a
              href="/login"
              className="btn-ghost"
              style={{ display: 'block', padding: '10px', fontSize: 13, textDecoration: 'none', textAlign: 'center', fontWeight: 600 }}
            >
              Iniciar Sesión
            </a>
          </div>
        </div>
      ) : (
        <div className="payment-card" style={{ border: '1px solid #E0E0E0' }}>
          <div style={{ marginBottom: 18 }}>
            <div className="payment-emoji" style={{ fontSize: 36, marginBottom: 10 }}>💳</div>
            <h3 className="payment-title" style={{ fontSize: 18 }}>Confirmar Pedido</h3>
            <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 10 }}>
              Sesión iniciada como <strong>{user.name}</strong>
            </div>
          </div>
          <div className="payment-amount-box" style={{ padding: 16, marginBottom: 18 }}>
            <div className="payment-amount-label" style={{ marginBottom: 4 }}>Total a pagar</div>
            <div className="payment-amount-value large">{fmt(total)}</div>
          </div>
          <Button
            onClick={() => procesarCheckout(false)}
            disabled={processing}
            variant="gold"
            loading={processing}
            style={{ width: '100%', padding: 14, fontSize: 15 }}
          >
            Confirmar y Pagar → {fmt(total)}
          </Button>
          <div className="payment-simulation-alert">
            <span style={{ fontSize: 16 }}>✅</span>
            <span className="payment-simulation-text">
              Simulación de pago activa — El pedido se confirmará de inmediato
            </span>
          </div>
        </div>
      )}
      {error && <div style={{ color: '#E85D3A', fontSize: 12, marginTop: 12, textAlign: 'center' }}>{error}</div>}
    </div>
  );
}
