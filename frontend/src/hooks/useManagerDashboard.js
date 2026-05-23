import { useState, useEffect } from 'react';
import { venueOrders, changeOrderStatus, getProducts, updateStock, updateProduct, getUser, clearAuth } from '../lib/api.js';

export default function useManagerDashboard() {
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

  const updateProductStatus = async (id, isActive) => {
    try {
      await updateProduct(id, { is_active: isActive });
      cargarProductos();
    } catch (e) {
      alert(e.message);
    }
  };

  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  const pedidosFiltrados = filtroEstado ? orders.filter(p => p.status === filtroEstado) : orders;

  return {
    user,
    tab,
    setTab,
    orders,
    products,
    filtroEstado,
    setFiltroEstado,
    error,
    editStock,
    setEditStock,
    cargarPedidos,
    cargarProductos,
    cambiarEstado,
    guardarStock,
    updateProductStatus,
    logout,
    pedidosFiltrados,
  };
}
