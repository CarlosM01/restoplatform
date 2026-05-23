import { useState, useEffect } from 'react';
import {
  adminListUsers, adminCreateUser, adminUpdateUser,
  adminBanUser, adminUnbanUser, adminDeleteUser,
  getUser, clearAuth, menuCrud, fmt
} from '../lib/api.js';

const G = '#C4A97D', D = '#1B1916', M = '#A89B8C', B = '#F0EBE4';

const ROLE_COLOR = {
  admin: { bg: '#FFEBEE', color: '#C62828' },
  manager: { bg: '#E3F2FD', color: '#1976D2' },
  customer: { bg: '#F5F5F5', color: '#616161' },
};

const SECTIONS = [
  { id: 'users', label: 'Usuarios', category: 'GENERAL' },
  { id: 'categories', label: 'Categorías', category: 'MENÚ' },
  { id: 'items', label: 'Platos / Ítems', category: 'MENÚ' },
  { id: 'variants', label: 'Variantes', category: 'MENÚ' },
  { id: 'modifier-groups', label: 'Grupos de Modif.', category: 'MENÚ' },
  { id: 'modifiers', label: 'Modificadores', category: 'MENÚ' },
  { id: 'suppliers', label: 'Proveedores', category: 'LOGÍSTICA / SALUD' },
  { id: 'ingredients', label: 'Ingredientes', category: 'LOGÍSTICA / SALUD' },
  { id: 'dietary-tags', label: 'Etiquetas Dietéticas', category: 'LOGÍSTICA / SALUD' },
  { id: 'allergens', label: 'Alérgenos', category: 'LOGÍSTICA / SALUD' },
];

const apis = {
  users: {
    list: adminListUsers,
    create: adminCreateUser,
    update: adminUpdateUser,
    remove: adminDeleteUser,
  },
  categories: menuCrud('categories'),
  items: menuCrud('items'),
  variants: menuCrud('variants'),
  'modifier-groups': menuCrud('modifier-groups'),
  modifiers: menuCrud('modifiers'),
  suppliers: menuCrud('suppliers'),
  ingredients: menuCrud('ingredients'),
  'dietary-tags': menuCrud('dietary-tags'),
  allergens: menuCrud('allergens'),
};

const FIELD_CONFIGS = {
  categories: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'parent_id', label: 'Categoría Padre', type: 'select', relation: 'categories', nullable: true },
    { name: 'subtitle', label: 'Subtítulo', type: 'text' },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    { name: 'image_url', label: 'URL de Imagen', type: 'text' },
    { name: 'sort_order', label: 'Orden de Clasificación', type: 'number', default: 0 },
    { name: 'is_active', label: 'Activo', type: 'checkbox', default: true },
  ],
  items: [
    { name: 'name', label: 'Nombre', type: 'text', required: true },
    { name: 'category_id', label: 'Categoría', type: 'select', relation: 'categories', required: true },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    { name: 'base_price', label: 'Precio Base ($)', type: 'number', required: true, min: 0 },
    { name: 'image_url', label: 'URL de Imagen', type: 'text' },
    { name: 'prep_time_minutes', label: 'Tiempo Prep. (minutos)', type: 'number' },
    { name: 'badge', label: 'Insignia (ej: Nuevo, Vegano)', type: 'text' },
    { name: 'sort_order', label: 'Orden de Clasificación', type: 'number', default: 0 },
    { name: 'is_available', label: 'Disponible', type: 'checkbox', default: true },
    { name: 'is_featured', label: 'Destacado', type: 'checkbox', default: false },
  ],
  variants: [
    { name: 'name', label: 'Nombre de Variante (ej: Personal, Familiar)', type: 'text', required: true },
    { name: 'menu_item_id', label: 'Plato / Ítem de Menú', type: 'select', relation: 'items', required: true },
    { name: 'sku', label: 'SKU (Código único)', type: 'text' },
    { name: 'price_override', label: 'Anulación de Precio ($)', type: 'number' },
    { name: 'sort_order', label: 'Orden de Clasificación', type: 'number', default: 0 },
    { name: 'is_available', label: 'Disponible', type: 'checkbox', default: true },
  ],
  'modifier-groups': [
    { name: 'name', label: 'Nombre del Grupo (ej: Salsas, Bebidas)', type: 'text', required: true },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    { name: 'sort_order', label: 'Orden de Clasificación', type: 'number', default: 0 },
  ],
  modifiers: [
    { name: 'name', label: 'Nombre del Modificador', type: 'text', required: true },
    { name: 'modifier_group_id', label: 'Grupo de Modificadores', type: 'select', relation: 'modifier-groups', required: true },
    { name: 'price_delta', label: 'Diferencia de Precio ($)', type: 'number', default: 0 },
    { name: 'max_quantity', label: 'Cantidad Máxima Permitida', type: 'number' },
    { name: 'sort_order', label: 'Orden de Clasificación', type: 'number', default: 0 },
    { name: 'is_available', label: 'Disponible', type: 'checkbox', default: true },
  ],
  suppliers: [
    { name: 'name', label: 'Nombre del Proveedor', type: 'text', required: true },
    { name: 'contact_email', label: 'Email de Contacto', type: 'email' },
    { name: 'country', label: 'País', type: 'text' },
    { name: 'is_active', label: 'Activo', type: 'checkbox', default: true },
  ],
  ingredients: [
    { name: 'name', label: 'Nombre del Ingrediente', type: 'text', required: true },
    { name: 'supplier_id', label: 'Proveedor', type: 'select', relation: 'suppliers', nullable: true },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    { name: 'image_url', label: 'URL de Imagen', type: 'text' },
    { name: 'origin_country', label: 'País de Origen', type: 'text' },
    { name: 'unit', label: 'Unidad de Medida (ej: kg, gr, lts)', type: 'text' },
    { name: 'storage_instructions', label: 'Instrucciones de Almacenamiento', type: 'textarea' },
    { name: 'is_active', label: 'Activo', type: 'checkbox', default: true },
  ],
  'dietary-tags': [
    { name: 'name', label: 'Nombre (ej: Vegano, Gluten Free)', type: 'text', required: true },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    { name: 'icon_url', label: 'URL del Icono', type: 'text' },
    { name: 'badge_color', label: 'Color de Badge (ej: #FF5733 o green)', type: 'text' },
    { name: 'internal_ref_url', label: 'Enlace de Referencia Interna', type: 'text' },
  ],
  allergens: [
    { name: 'name', label: 'Nombre (ej: Maní, Lactosa)', type: 'text', required: true },
    { name: 'description', label: 'Descripción', type: 'textarea' },
    { name: 'icon_url', label: 'URL del Icono', type: 'text' },
    { name: 'severity', label: 'Gravedad (ej: Alta, Moderada)', type: 'text' },
    { name: 'internal_ref_url', label: 'Enlace de Referencia Interna', type: 'text' },
  ],
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  
  // Storage for all lists to satisfy lookup mapping
  const [data, setData] = useState({
    users: [],
    categories: [],
    items: [],
    variants: [],
    'modifier-groups': [],
    modifiers: [],
    suppliers: [],
    ingredients: [],
    'dietary-tags': [],
    allergens: [],
  });

  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  // Filters for lists
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== 'admin') {
      window.location.href = '/login';
      return;
    }
    setUser(u);
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [
        users, categories, items, variants, modifierGroups, modifiers, suppliers, ingredients, dietaryTags, allergens
      ] = await Promise.all([
        apis.users.list(),
        apis.categories.list(),
        apis.items.list(),
        apis.variants.list(),
        apis['modifier-groups'].list(),
        apis.modifiers.list(),
        apis.suppliers.list(),
        apis.ingredients.list(),
        apis['dietary-tags'].list(),
        apis.allergens.list(),
      ]);

      setData({
        users: users || [],
        categories: categories || [],
        items: items || [],
        variants: variants || [],
        'modifier-groups': modifierGroups || [],
        modifiers: modifiers || [],
        suppliers: suppliers || [],
        ingredients: ingredients || [],
        'dietary-tags': dietaryTags || [],
        allergens: allergens || [],
      });
    } catch (e) {
      alert('Error cargando datos: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const ban = async (id) => {
    if (!confirm('¿Banear usuario?')) return;
    try {
      await adminBanUser(id);
      loadAll();
    } catch (e) {
      alert(e.message);
    }
  };

  const unban = async (id) => {
    try {
      await adminUnbanUser(id);
      loadAll();
    } catch (e) {
      alert(e.message);
    }
  };

  const removeUser = async (id) => {
    if (!confirm('¿ELIMINAR usuario permanentemente? Esto no se puede deshacer.')) return;
    try {
      await adminDeleteUser(id);
      loadAll();
    } catch (e) {
      alert(e.message);
    }
  };

  const removeEntity = async (entityName, id) => {
    if (!confirm(`¿Eliminar este elemento permanentemente de ${entityName}?`)) return;
    try {
      await apis[entityName].remove(id);
      loadAll();
    } catch (e) {
      alert('Error al eliminar: ' + e.message);
    }
  };

  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  // Helper function to resolve foreign key names
  const getNameLookup = (listName, id) => {
    if (!id) return '—';
    const list = data[listName] || [];
    const found = list.find(item => item.id === id);
    return found ? found.name : '—';
  };

  // Filter lists based on tab and active query
  const getFilteredData = () => {
    const list = data[activeTab] || [];
    if (activeTab === 'users') {
      let filtered = roleFilter ? list.filter(u => u.role === roleFilter) : list;
      if (searchQuery) {
        filtered = filtered.filter(u => 
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          u.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return filtered;
    }

    if (searchQuery) {
      return list.filter(item => 
        item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  };

  if (!user) return null;

  return (
    <div className="app-shell wide" style={{ maxWidth: 1200, display: 'flex', flexDirection: 'column', height: '100vh', background: '#FAFAFA' }}>
      {/* Header */}
      <div className="app-header" style={{ padding: '14px 24px' }}>
        <div>
          <div className="brand">PANEL ADMINISTRADOR</div>
          <div className="name">RestoPlatform · Control Global</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/manager" style={{ color: G, fontSize: 13, fontWeight: '600' }}>Panel Manager</a>
          <button onClick={logout} className="btn-ghost" style={{ padding: '6px 14px', fontSize: 11, borderColor: G, color: '#FFF' }}>Salir</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sleek Sidebar */}
        <div style={{ width: 250, borderRight: `1px solid ${B}`, background: '#FFF', padding: '20px 14px', overflowY: 'auto' }}>
          {['GENERAL', 'MENÚ', 'LOGÍSTICA / SALUD'].map(cat => {
            const catSections = SECTIONS.filter(s => s.category === cat);
            return (
              <div key={cat} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: '1.5px', color: M, fontWeight: '700', textTransform: 'uppercase', paddingLeft: 12, marginBottom: 8 }}>{cat}</div>
                {catSections.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setActiveTab(s.id); setSearchQuery(''); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      textAlign: 'left',
                      background: activeTab === s.id ? '#FFF8F0' : 'transparent',
                      color: activeTab === s.id ? '#B88E4C' : '#4A4A4A',
                      fontWeight: activeTab === s.id ? '700' : '500',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      marginBottom: '4px',
                      transition: 'all 0.15s ease',
                      boxShadow: activeTab === s.id ? 'inset 3px 0 0 #C4A97D' : 'none',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 24 }}>
          {loading ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
              <span className="spinner" style={{ fontSize: 28, color: G }}>⏳</span>
              <span style={{ fontSize: 13, color: M }}>Cargando datos del panel...</span>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: '700', color: D }}>
                    {SECTIONS.find(s => s.id === activeTab)?.label}
                  </h2>
                  <p style={{ fontSize: 12, color: M, marginTop: 2 }}>Visualiza y gestiona las entidades de tu sistema</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input"
                    style={{ width: 220, padding: '8px 12px' }}
                  />
                  {activeTab === 'users' && (
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input" style={{ width: 160, padding: '8px 12px' }}>
                      <option value="">Todos los roles</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Encargado</option>
                      <option value="customer">Cliente</option>
                    </select>
                  )}
                  <button onClick={() => setShowCreate(true)} className="btn-gold" style={{ padding: '8px 16px', fontSize: 13, borderRadius: 8 }}>
                    + Nuevo {SECTIONS.find(s => s.id === activeTab)?.label.slice(0, -1)}
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="card" style={{ padding: 0, overflow: 'auto', flex: 1, background: '#FFF' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead style={{ background: '#FFFDF9', position: 'sticky', top: 0, zIndex: 10, borderBottom: `2px solid ${B}` }}>
                    {activeTab === 'users' && (
                      <tr>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>ID</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>NOMBRE</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>EMAIL</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>RUT</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ROL</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ESTADO</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ACCIONES</th>
                      </tr>
                    )}

                    {activeTab === 'categories' && (
                      <tr>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>IMG</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>NOMBRE</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>PADRE</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>SUBTÍTULO</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ORDEN</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ESTADO</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ACCIONES</th>
                      </tr>
                    )}

                    {activeTab === 'items' && (
                      <tr>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>IMG</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>NOMBRE</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>CATEGORÍA</th>
                        <th style={{ padding: 12, textAlign: 'right', fontSize: 11, color: M }}>PRECIO BASE</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>PREP. (MIN)</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>DESTACADO</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>DISP.</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ACCIONES</th>
                      </tr>
                    )}

                    {activeTab === 'variants' && (
                      <tr>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>NOMBRE</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>PLATO BASE</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>SKU</th>
                        <th style={{ padding: 12, textAlign: 'right', fontSize: 11, color: M }}>PRECIO OVERRIDE</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>DISP.</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ACCIONES</th>
                      </tr>
                    )}

                    {activeTab === 'modifier-groups' && (
                      <tr>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>NOMBRE</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>DESCRIPCIÓN</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ORDEN</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ACCIONES</th>
                      </tr>
                    )}

                    {activeTab === 'modifiers' && (
                      <tr>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>NOMBRE</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>GRUPO</th>
                        <th style={{ padding: 12, textAlign: 'right', fontSize: 11, color: M }}>DIF. PRECIO</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>CANT. MÁX</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>DISP.</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ACCIONES</th>
                      </tr>
                    )}

                    {activeTab === 'suppliers' && (
                      <tr>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>NOMBRE</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>CONTACT EMAIL</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>PAÍS</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ESTADO</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ACCIONES</th>
                      </tr>
                    )}

                    {activeTab === 'ingredients' && (
                      <tr>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>IMG</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>NOMBRE</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>PROVEEDOR</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>PAÍS ORIGEN</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>UNIDAD</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ESTADO</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ACCIONES</th>
                      </tr>
                    )}

                    {activeTab === 'dietary-tags' && (
                      <tr>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>BADGE</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>NOMBRE</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>DESCRIPCIÓN</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>REF. INTERNA</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ACCIONES</th>
                      </tr>
                    )}

                    {activeTab === 'allergens' && (
                      <tr>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>NOMBRE</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>DESCRIPCIÓN</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>GRAVEDAD</th>
                        <th style={{ padding: 12, textAlign: 'left', fontSize: 11, color: M }}>REF. INTERNA</th>
                        <th style={{ padding: 12, textAlign: 'center', fontSize: 11, color: M }}>ACCIONES</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {getFilteredData().length === 0 ? (
                      <tr>
                        <td colSpan={10} style={{ padding: 40, textAlign: 'center', color: M }}>
                          No se encontraron elementos.
                        </td>
                      </tr>
                    ) : (
                      getFilteredData().map(item => {
                        return (
                          <tr key={item.id} style={{ borderTop: `1px solid ${B}` }}>
                            {activeTab === 'users' && (
                              <>
                                <td style={{ padding: 12, color: M, fontSize: 11 }}>#{String(item.id).slice(0, 8)}</td>
                                <td style={{ padding: 12, fontWeight: 600 }}>{item.name}</td>
                                <td style={{ padding: 12, fontSize: 12 }}>{item.email}</td>
                                <td style={{ padding: 12, fontSize: 12, color: M }}>{item.rut}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <span style={{ background: (ROLE_COLOR[item.role] || ROLE_COLOR.customer).bg, color: (ROLE_COLOR[item.role] || ROLE_COLOR.customer).color, padding: '4px 10px', borderRadius: 12, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                                    {item.role}
                                  </span>
                                </td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  {item.is_banned ? (
                                    <span style={{ background: '#FFEBEE', color: '#C62828', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>Baneado</span>
                                  ) : item.is_active ? (
                                    <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>Activo</span>
                                  ) : (
                                    <span style={{ background: '#F5F5F5', color: M, padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>Inactivo</span>
                                  )}
                                </td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <button onClick={() => setEditTarget(item)} style={{ background: 'none', border: `1px solid ${G}`, color: G, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}>Editar</button>
                                  {item.id !== user.id && (
                                    <>
                                      {item.is_banned ? (
                                        <button onClick={() => unban(item.id)} style={{ background: '#E8F5E9', color: '#2E7D32', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}>Desbanear</button>
                                      ) : (
                                        <button onClick={() => ban(item.id)} style={{ background: '#FFF3E0', color: '#F57C00', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}>Banear</button>
                                      )}
                                      <button onClick={() => removeUser(item.id)} style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>Eliminar</button>
                                    </>
                                  )}
                                </td>
                              </>
                            )}

                            {activeTab === 'categories' && (
                              <>
                                <td style={{ padding: 12 }}>
                                  {item.image_url ? (
                                    <img src={item.image_url} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', border: `1px solid ${B}` }} />
                                  ) : (
                                    <div style={{ width: 28, height: 28, borderRadius: 6, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: M }}>📁</div>
                                  )}
                                </td>
                                <td style={{ padding: 12, fontWeight: 600 }}>{item.name}</td>
                                <td style={{ padding: 12, color: M }}>{getNameLookup('categories', item.parent_id)}</td>
                                <td style={{ padding: 12, fontSize: 12 }}>{item.subtitle || '—'}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>{item.sort_order}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <span style={{ background: item.is_active ? '#E8F5E9' : '#FFEBEE', color: item.is_active ? '#2E7D32' : '#C62828', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                                    {item.is_active ? 'Activa' : 'Inactiva'}
                                  </span>
                                </td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <button onClick={() => setEditTarget(item)} style={{ background: 'none', border: `1px solid ${G}`, color: G, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}>Editar</button>
                                  <button onClick={() => removeEntity('categories', item.id)} style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>Eliminar</button>
                                </td>
                              </>
                            )}

                            {activeTab === 'items' && (
                              <>
                                <td style={{ padding: 12 }}>
                                  {item.image_url ? (
                                    <img src={item.image_url} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', border: `1px solid ${B}` }} />
                                  ) : (
                                    <div style={{ width: 32, height: 32, borderRadius: 6, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: M }}>🍽️</div>
                                  )}
                                </td>
                                <td style={{ padding: 12 }}>
                                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                                  {item.badge && <span style={{ background: '#FFF3E0', color: '#E65100', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, display: 'inline-block', marginTop: 3 }}>{item.badge}</span>}
                                </td>
                                <td style={{ padding: 12 }}>{getNameLookup('categories', item.category_id)}</td>
                                <td style={{ padding: 12, textAlign: 'right', fontWeight: 600 }}>{fmt(item.base_price)}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>{item.prep_time_minutes ? `${item.prep_time_minutes} min` : '—'}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <span style={{ color: item.is_featured ? '#FFB300' : M, fontSize: 16 }}>{item.is_featured ? '★' : '☆'}</span>
                                </td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <span style={{ background: item.is_available ? '#E8F5E9' : '#FFEBEE', color: item.is_available ? '#2E7D32' : '#C62828', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                                    {item.is_available ? 'Sí' : 'No'}
                                  </span>
                                </td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <button onClick={() => setEditTarget(item)} style={{ background: 'none', border: `1px solid ${G}`, color: G, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}>Editar</button>
                                  <button onClick={() => removeEntity('items', item.id)} style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>Eliminar</button>
                                </td>
                              </>
                            )}

                            {activeTab === 'variants' && (
                              <>
                                <td style={{ padding: 12, fontWeight: 600 }}>{item.name}</td>
                                <td style={{ padding: 12 }}>{getNameLookup('items', item.menu_item_id)}</td>
                                <td style={{ padding: 12, color: M }}>{item.sku || '—'}</td>
                                <td style={{ padding: 12, textAlign: 'right', fontWeight: 600 }}>{item.price_override ? fmt(item.price_override) : '—'}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <span style={{ background: item.is_available ? '#E8F5E9' : '#FFEBEE', color: item.is_available ? '#2E7D32' : '#C62828', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                                    {item.is_available ? 'Disponible' : 'No Disponible'}
                                  </span>
                                </td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <button onClick={() => setEditTarget(item)} style={{ background: 'none', border: `1px solid ${G}`, color: G, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}>Editar</button>
                                  <button onClick={() => removeEntity('variants', item.id)} style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>Eliminar</button>
                                </td>
                              </>
                            )}

                            {activeTab === 'modifier-groups' && (
                              <>
                                <td style={{ padding: 12, fontWeight: 600 }}>{item.name}</td>
                                <td style={{ padding: 12, fontSize: 12 }}>{item.description || '—'}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>{item.sort_order}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <button onClick={() => setEditTarget(item)} style={{ background: 'none', border: `1px solid ${G}`, color: G, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}>Editar</button>
                                  <button onClick={() => removeEntity('modifier-groups', item.id)} style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>Eliminar</button>
                                </td>
                              </>
                            )}

                            {activeTab === 'modifiers' && (
                              <>
                                <td style={{ padding: 12, fontWeight: 600 }}>{item.name}</td>
                                <td style={{ padding: 12 }}>{getNameLookup('modifier-groups', item.modifier_group_id)}</td>
                                <td style={{ padding: 12, textAlign: 'right', fontWeight: 600 }}>{fmt(item.price_delta)}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>{item.max_quantity || 'Sinfín'}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <span style={{ background: item.is_available ? '#E8F5E9' : '#FFEBEE', color: item.is_available ? '#2E7D32' : '#C62828', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                                    {item.is_available ? 'Disponible' : 'No'}
                                  </span>
                                </td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <button onClick={() => setEditTarget(item)} style={{ background: 'none', border: `1px solid ${G}`, color: G, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}>Editar</button>
                                  <button onClick={() => removeEntity('modifiers', item.id)} style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>Eliminar</button>
                                </td>
                              </>
                            )}

                            {activeTab === 'suppliers' && (
                              <>
                                <td style={{ padding: 12, fontWeight: 600 }}>{item.name}</td>
                                <td style={{ padding: 12, fontSize: 12 }}>{item.contact_email || '—'}</td>
                                <td style={{ padding: 12 }}>{item.country || '—'}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <span style={{ background: item.is_active ? '#E8F5E9' : '#FFEBEE', color: item.is_active ? '#2E7D32' : '#C62828', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                                    {item.is_active ? 'Activo' : 'Inactivo'}
                                  </span>
                                </td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <button onClick={() => setEditTarget(item)} style={{ background: 'none', border: `1px solid ${G}`, color: G, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}>Editar</button>
                                  <button onClick={() => removeEntity('suppliers', item.id)} style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>Eliminar</button>
                                </td>
                              </>
                            )}

                            {activeTab === 'ingredients' && (
                              <>
                                <td style={{ padding: 12 }}>
                                  {item.image_url ? (
                                    <img src={item.image_url} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', border: `1px solid ${B}` }} />
                                  ) : (
                                    <div style={{ width: 28, height: 28, borderRadius: 6, background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: M }}>📦</div>
                                  )}
                                </td>
                                <td style={{ padding: 12, fontWeight: 600 }}>{item.name}</td>
                                <td style={{ padding: 12 }}>{getNameLookup('suppliers', item.supplier_id)}</td>
                                <td style={{ padding: 12 }}>{item.origin_country || '—'}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>{item.unit || '—'}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <span style={{ background: item.is_active ? '#E8F5E9' : '#FFEBEE', color: item.is_active ? '#2E7D32' : '#C62828', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                                    {item.is_active ? 'Activo' : 'Inactivo'}
                                  </span>
                                </td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <button onClick={() => setEditTarget(item)} style={{ background: 'none', border: `1px solid ${G}`, color: G, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}>Editar</button>
                                  <button onClick={() => removeEntity('ingredients', item.id)} style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>Eliminar</button>
                                </td>
                              </>
                            )}

                            {activeTab === 'dietary-tags' && (
                              <>
                                <td style={{ padding: 12 }}>
                                  <span style={{ background: item.badge_color || '#FDFAF6', border: `1px solid ${B}`, color: '#2D2A26', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                                    {item.icon_url ? item.icon_url + ' ' : ''} {item.name}
                                  </span>
                                </td>
                                <td style={{ padding: 12, fontWeight: 600 }}>{item.name}</td>
                                <td style={{ padding: 12, fontSize: 12 }}>{item.description || '—'}</td>
                                <td style={{ padding: 12, fontSize: 11, color: M }}>{item.internal_ref_url || '—'}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <button onClick={() => setEditTarget(item)} style={{ background: 'none', border: `1px solid ${G}`, color: G, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}>Editar</button>
                                  <button onClick={() => removeEntity('dietary-tags', item.id)} style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>Eliminar</button>
                                </td>
                              </>
                            )}

                            {activeTab === 'allergens' && (
                              <>
                                <td style={{ padding: 12, fontWeight: 600 }}>
                                  {item.icon_url ? item.icon_url + ' ' : ''} {item.name}
                                </td>
                                <td style={{ padding: 12, fontSize: 12 }}>{item.description || '—'}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <span style={{ background: item.severity === 'Alta' ? '#FFEBEE' : '#FFF3E0', color: item.severity === 'Alta' ? '#C62828' : '#E65100', padding: '3px 8px', borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                                    {item.severity || 'Media'}
                                  </span>
                                </td>
                                <td style={{ padding: 12, fontSize: 11, color: M }}>{item.internal_ref_url || '—'}</td>
                                <td style={{ padding: 12, textAlign: 'center' }}>
                                  <button onClick={() => setEditTarget(item)} style={{ background: 'none', border: `1px solid ${G}`, color: G, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, marginRight: 4 }}>Editar</button>
                                  <button onClick={() => removeEntity('allergens', item.id)} style={{ background: '#FFEBEE', color: '#C62828', border: 'none', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11 }}>Eliminar</button>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legacy UserModal wrapper / Dynamic EntityModal wrapper */}
      {(showCreate || editTarget) && (
        activeTab === 'users' ? (
          <UserModal
            user={editTarget}
            onClose={() => { setShowCreate(false); setEditTarget(null); }}
            onSaved={() => { setShowCreate(false); setEditTarget(null); loadAll(); }}
          />
        ) : (
          <EntityModal
            entityName={activeTab}
            editEntity={editTarget}
            lookupLists={data}
            onClose={() => { setShowCreate(false); setEditTarget(null); }}
            onSaved={() => { setShowCreate(false); setEditTarget(null); loadAll(); }}
          />
        )
      )}
    </div>
  );
}

/* Specific UserModal for User administration */
function UserModal({ user, onClose, onSaved }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    rut: user?.rut || '',
    password: '',
    role: user?.role || 'customer',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async () => {
    setSaving(true);
    setErr(null);
    try {
      if (isEdit) {
        const data = {};
        if (form.name !== user.name) data.name = form.name;
        if (form.email !== user.email) data.email = form.email;
        if (form.role !== user.role) data.role = form.role;
        await adminUpdateUser(user.id, data);
      } else {
        await adminCreateUser(form);
      }
      onSaved();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#FFF', borderRadius: 16, padding: 24, width: 420, maxWidth: '90%' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 16, fontWeight: '700' }}>
          {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div><label className="label">Nombre</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          {!isEdit && (
            <>
              <div><label className="label">RUT</label><input className="input" value={form.rut} onChange={e => setForm({ ...form, rut: e.target.value })} /></div>
              <div><label className="label">Contraseña</label><input type="password" className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            </>
          )}
          <div>
            <label className="label">Rol</label>
            <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="customer">Cliente</option>
              <option value="manager">Encargado</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {err && <div style={{ background: '#FFEBEE', color: '#C62828', padding: 10, borderRadius: 8, fontSize: 12, marginTop: 10 }}>{err}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancelar</button>
          <button onClick={submit} disabled={saving} className="btn-gold" style={{ flex: 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
}

/* Dynamic EntityModal for Menu/Logistics CRUD lookups */
function EntityModal({ entityName, editEntity, lookupLists, onClose, onSaved }) {
  const isEdit = !!editEntity;
  const configs = FIELD_CONFIGS[entityName] || [];

  // Initialize form state
  const [form, setForm] = useState(() => {
    const init = {};
    configs.forEach(field => {
      if (isEdit) {
        init[field.name] = editEntity[field.name] !== null && editEntity[field.name] !== undefined
          ? editEntity[field.name]
          : (field.type === 'checkbox' ? false : '');
      } else {
        init[field.name] = field.default !== undefined
          ? field.default
          : (field.type === 'checkbox' ? false : '');
      }
    });
    return init;
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async () => {
    setSaving(true);
    setErr(null);

    // Cast data cleanly to match Pydantic schemas
    const parsed = {};
    configs.forEach(field => {
      const val = form[field.name];
      if (field.type === 'number') {
        if (val === '' || val === null || val === undefined) {
          parsed[field.name] = (field.nullable || field.name.endsWith('_id') || field.name === 'price_override' || field.name === 'prep_time_minutes' || field.name === 'max_quantity') ? null : 0;
        } else {
          parsed[field.name] = Number(val);
        }
      } else if (field.type === 'checkbox') {
        parsed[field.name] = !!val;
      } else if (field.type === 'select') {
        parsed[field.name] = val === '' ? null : val;
      } else {
        parsed[field.name] = val === '' ? (field.nullable ? null : '') : val;
      }
    });

    try {
      if (isEdit) {
        await apis[entityName].update(editEntity.id, parsed);
      } else {
        await apis[entityName].create(parsed);
      }
      onSaved();
    } catch (e) {
      setErr(e.message || 'Error en la petición');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#FFF', borderRadius: 16, padding: 24, width: 480, maxWidth: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 16, fontWeight: '700', textTransform: 'capitalize' }}>
          {isEdit ? `Editar ${entityName.replace('-', ' ')}` : `Nueva ${entityName.replace('-', ' ')}`}
        </h3>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingRight: 6 }}>
          {configs.map(field => {
            if (field.type === 'checkbox') {
              return (
                <div key={field.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <input
                    type="checkbox"
                    id={field.name}
                    checked={!!form[field.name]}
                    onChange={e => setForm({ ...form, [field.name]: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: G }}
                  />
                  <label htmlFor={field.name} className="label" style={{ marginBottom: 0, cursor: 'pointer', fontSize: 12 }}>
                    {field.label}
                  </label>
                </div>
              );
            }

            if (field.type === 'textarea') {
              return (
                <div key={field.name}>
                  <label className="label">{field.label}</label>
                  <textarea
                    rows={3}
                    className="input"
                    value={form[field.name] || ''}
                    onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                  />
                </div>
              );
            }

            if (field.type === 'select') {
              // Retrieve the related items from the lookupLists state
              const list = lookupLists[field.relation] || [];
              // Prevent cycles: if editing a category, filter itself out from Categories list!
              const filteredList = (entityName === 'categories' && field.relation === 'categories' && isEdit)
                ? list.filter(item => item.id !== editEntity.id)
                : list;

              return (
                <div key={field.name}>
                  <label className="label">{field.label}</label>
                  <select
                    className="input"
                    value={form[field.name] || ''}
                    onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                    required={field.required}
                  >
                    <option value="">Seleccione una opción...</option>
                    {filteredList.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            return (
              <div key={field.name}>
                <label className="label">{field.label}</label>
                <input
                  type={field.type}
                  className="input"
                  value={form[field.name] === null || form[field.name] === undefined ? '' : form[field.name]}
                  onChange={e => setForm({ ...form, [field.name]: e.target.value })}
                  min={field.min}
                  required={field.required}
                />
              </div>
            );
          })}
        </div>

        {err && <div style={{ background: '#FFEBEE', color: '#C62828', padding: 10, borderRadius: 8, fontSize: 12, marginTop: 10 }}>{err}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexShrink: 0 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancelar</button>
          <button onClick={submit} disabled={saving} className="btn-gold" style={{ flex: 1 }}>{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </div>
    </div>
  );
}
