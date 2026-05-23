const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export async function api(path, opts = {}) {
  const token = getToken();
  const isFormData = opts.body instanceof FormData;
  const isUrlEncoded = opts.body instanceof URLSearchParams;

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...opts.headers,
  };

  if (!isFormData && !isUrlEncoded && opts.body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });

  if (!res.ok) {
    let data;
    try { data = await res.json(); } catch { data = { detail: res.statusText }; }
    throw new ApiError(data.detail || 'Error en la API', res.status, data);
  }

  if (res.status === 204) return null;
  return res.json();
}

// Helpers
export const login = async (email, password) => {
  const form = new URLSearchParams({ username: email, password });
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  if (!res.ok) {
    const data = await res.json();
    throw new ApiError(data.detail || 'Login fallido', res.status, data);
  }
  const data = await res.json();
  setAuth(data.access_token, {
    id: data.user_id,
    name: data.name,
    role: data.role,
  });
  return data;
};

export const register = (data) =>
  api('/auth/register', { method: 'POST', body: JSON.stringify(data) });

export const me = () => api('/auth/me');

// Products
export const getProducts = (venue_id, category) => {
  const params = new URLSearchParams();
  if (venue_id) params.set('venue_id', venue_id);
  if (category) params.set('category', category);
  return api(`/products?${params}`);
};

export const getCategories = (venue_id) => api(`/products/categories/${venue_id}`);

// Venues
export const getVenue = (venue_id) => api(`/venues/${venue_id}`);
export const getVenues = () => api(`/venues`);

// Orders
export const createOrder = (data) =>
  api('/orders', { method: 'POST', body: JSON.stringify(data) });
export const myOrders = () => api('/orders/my');
export const venueOrders = (status) =>
  api(`/orders/venue${status ? `?status=${status}` : ''}`);
export const changeOrderStatus = (id, action) =>
  api(`/orders/${id}/${action}`, { method: 'PATCH' });

// Reservations
export const getTables = (venue_id) => api(`/reservations/tables/${venue_id}`);
export const checkAvailability = (venue_id, date) =>
  api(`/reservations/availability/${venue_id}?date=${encodeURIComponent(date)}`);
export const createReservation = (data) =>
  api('/reservations', { method: 'POST', body: JSON.stringify(data) });

// Payments
export const initPayment = (order_id) =>
  api(`/payments/init/${order_id}`, { method: 'POST' });

// Admin
export const adminListUsers = (role) =>
  api(`/admin/users${role ? `?role=${role}` : ''}`);
export const adminCreateUser = (data) =>
  api('/admin/users', { method: 'POST', body: JSON.stringify(data) });
export const adminUpdateUser = (id, data) =>
  api(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const adminBanUser = (id) =>
  api(`/admin/users/${id}/ban`, { method: 'PATCH' });
export const adminUnbanUser = (id) =>
  api(`/admin/users/${id}/unban`, { method: 'PATCH' });
export const adminDeleteUser = (id) =>
  api(`/admin/users/${id}`, { method: 'DELETE' });

// Menu CRUD — generic factory
export const menuCrud = (entity) => ({
  list:   ()         => api(`/admin/menu/${entity}`),
  create: (data)     => api(`/admin/menu/${entity}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => api(`/admin/menu/${entity}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  remove: (id)       => api(`/admin/menu/${entity}/${id}`, { method: 'DELETE' }),
});

// Inventory / products CRUD
export const createProduct = (data) =>
  api('/products', { method: 'POST', body: JSON.stringify(data) });
export const updateProduct = (id, data) =>
  api(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const updateStock = (id, stock, minimum_stock) =>
  api(`/products/${id}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ stock, minimum_stock }),
  });

export const fmt = (n) => '$' + n.toLocaleString('es-CL');

export { ApiError };
