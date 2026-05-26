import React from 'react';
import useManagerDashboard from '../../hooks/useManagerDashboard.js';
import Header from '../common/Header.jsx';
import OrdersTab from './OrdersTab.jsx';
import InventoryTab from './InventoryTab.jsx';
import { fmt } from '../../lib/api.js';
import './ManagerDashboard.css';

export default function ManagerDashboard() {
  const {
    user,
    tab,
    setTab,
    orders,
    products,
    filtroEstado,
    setFiltroEstado,
    editStock,
    setEditStock,
    cambiarEstado,
    guardarStock,
    updateProductStatus,
    logout,
    pedidosFiltrados,
  } = useManagerDashboard();

  if (!user) return null;

  return (
    <div className="app-shell wide" style={{ maxWidth: 1200 }}>
      {/* Header */}
      <Header
        title="PANEL ENCARGADO"
        subtitle="Restaurante Demo"
        user={user}
        logoutAction={logout}
      />

      {/* Tabs */}
      <div className="manager-tabs-bar">
        {[
          { id: 'orders', label: '📋 Pedidos', badge: orders.filter(p => p.status === 'pendiente').length },
          { id: 'inventario', label: '📦 Inventario', badge: 0 },
        ].map(item => {
          const borderBottomVal = tab === item.id ? '3px solid var(--color-gold)' : '3px solid transparent';
          const colorVal = tab === item.id ? 'var(--color-dark)' : 'var(--color-muted)';
          const fontW = tab === item.id ? 700 : 500;

          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="manager-tab-btn"
              style={{
                borderBottom: borderBottomVal,
                color: colorVal,
                fontWeight: fontW,
              }}
            >
              {item.label}
              {item.badge > 0 && <span className="manager-tab-badge">{item.badge}</span>}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24, background: '#FAFAFA' }}>
        {tab === 'orders' && (
          <OrdersTab
            pedidosFiltrados={pedidosFiltrados}
            products={products}
            filtroEstado={filtroEstado}
            setFiltroEstado={setFiltroEstado}
            cambiarEstado={cambiarEstado}
            fmt={fmt}
          />
        )}

        {tab === 'inventario' && (
          <InventoryTab
            products={products}
            editStock={editStock}
            setEditStock={setEditStock}
            guardarStock={guardarStock}
            updateProductStatus={updateProductStatus}
            fmt={fmt}
          />
        )}
      </div>
    </div>
  );
}
