import React from 'react';
import Card from '../common/Card.jsx';
import Button from '../common/Button.jsx';

const isUrl = (str) => typeof str === 'string' && (str.startsWith('http') || str.startsWith('/') || str.startsWith('data:'));

const ESTADO_LABEL = {
  pendiente: { label: 'Pendiente', color: '#F57C00', bg: '#FFF3E0' },
  confirmado: { label: 'Confirmado', color: '#1976D2', bg: '#E3F2FD' },
  en_preparacion: { label: 'En preparación', color: '#7B1FA2', bg: '#F3E5F5' },
  listo: { label: 'Listo', color: '#388E3C', bg: '#E8F5E9' },
  entregado: { label: 'Entregado', color: '#5D4037', bg: '#EFEBE9' },
  cancelado: { label: 'Cancelado', color: '#C62828', bg: '#FFEBEE' },
};

export default function OrderCard({ p, products, cambiarEstado, fmt }) {
  const est = ESTADO_LABEL[p.status] || { label: p.status, color: 'var(--color-muted)', bg: '#F0F0F0' };

  return (
    <Card>
      <div className="order-card-header">
        <div>
          <div className="order-card-id">Pedido #{p.id}</div>
          <div className="order-card-time">{new Date(p.created_at).toLocaleString('es-CL')}</div>
        </div>
        <span
          className="order-card-status-badge"
          style={{ background: est.bg, color: est.color }}
        >
          {est.label}
        </span>
      </div>

      <div className="order-card-items-list">
        {p.items.map(it => {
          const prod = products.find(pr => pr.id === it.product_id);
          return (
            <div key={it.id} className="order-card-item-row">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {isUrl(prod?.image) ? (
                  <img src={prod.image} alt={prod.name} style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover', display: 'inline-block', verticalAlign: 'middle' }} />
                ) : (
                  <span>{prod?.image || '🍽️'}</span>
                )}
                <span>{prod?.name || `Producto #${it.product_id}`} × {it.quantity}</span>
              </span>
              <span style={{ fontWeight: 600 }}>{fmt(it.unit_price * it.quantity)}</span>
            </div>
          );
        })}
      </div>

      <div className="order-card-total-row">
        <span>Total</span>
        <span className="order-card-total-val">{fmt(p.total)}</span>
      </div>

      {/* Actions based on status */}
      <div className="order-card-actions">
        {p.status === 'pendiente' && (
          <>
            <Button
              onClick={() => cambiarEstado(p.id, 'confirmar')}
              variant="gold"
              style={{ padding: '8px 12px', fontSize: 11, flex: 1 }}
            >
              Confirmar
            </Button>
            <button
              onClick={() => confirm('¿Cancelar pedido? Se devolverá el stock.') && cambiarEstado(p.id, 'cancelar')}
              style={{ padding: '8px 12px', fontSize: 11, background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
            >
              Cancelar
            </button>
          </>
        )}
        {p.status === 'confirmado' && (
          <Button
            onClick={() => cambiarEstado(p.id, 'preparar')}
            variant="gold"
            style={{ padding: '8px 12px', fontSize: 11, flex: 1 }}
          >
            Iniciar preparación
          </Button>
        )}
        {p.status === 'en_preparacion' && (
          <Button
            onClick={() => cambiarEstado(p.id, 'listo')}
            variant="gold"
            style={{ padding: '8px 12px', fontSize: 11, flex: 1 }}
          >
            Marcar listo
          </Button>
        )}
        {p.status === 'listo' && (
          <Button
            onClick={() => cambiarEstado(p.id, 'entregar')}
            variant="dark"
            style={{ padding: '8px 12px', fontSize: 11, flex: 1 }}
          >
            Entregar
          </Button>
        )}
      </div>
    </Card>
  );
}
export { ESTADO_LABEL };
