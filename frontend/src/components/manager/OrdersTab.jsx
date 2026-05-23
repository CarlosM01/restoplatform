import React from 'react';
import OrderCard, { ESTADO_LABEL } from './OrderCard.jsx';
import Select from '../common/Select.jsx';

export default function OrdersTab({ pedidosFiltrados, products, filtroEstado, setFiltroEstado, cambiarEstado, fmt }) {
  const options = [
    { value: '', label: 'Todos los estados' },
    ...Object.entries(ESTADO_LABEL).map(([k, v]) => ({ value: k, label: v.label })),
  ];

  return (
    <>
      <div className="orders-header-row">
        <h2 className="orders-title">Pedidos del Restaurante</h2>
        <Select
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
          options={options}
          style={{ width: 200 }}
        />
      </div>

      {pedidosFiltrados.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-muted)' }}>
          No hay pedidos
        </div>
      )}

      <div className="orders-grid">
        {pedidosFiltrados.map(p => (
          <OrderCard
            key={p.id}
            p={p}
            products={products}
            cambiarEstado={cambiarEstado}
            fmt={fmt}
          />
        ))}
      </div>
    </>
  );
}
