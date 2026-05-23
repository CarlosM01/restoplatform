import { useState, useEffect } from 'react';
import {
  adminListUsers, adminCreateUser, adminUpdateUser,
  adminBanUser, adminUnbanUser, adminDeleteUser,
  getUser, clearAuth, menuCrud,
  getProducts, createProduct, updateProduct, deleteProduct
} from '../lib/api.js';

const apis = {
  users: {
    list: adminListUsers,
    create: adminCreateUser,
    update: adminUpdateUser,
    remove: adminDeleteUser,
  },
  products: {
    list: getProducts,
    create: createProduct,
    update: updateProduct,
    remove: deleteProduct,
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

export default function useAdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('users');

  const [data, setData] = useState({
    users: [],
    products: [],
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
        users, products, categories, items, variants, modifierGroups, modifiers, suppliers, ingredients, dietaryTags, allergens
      ] = await Promise.all([
        apis.users.list(),
        apis.products.list(),
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
        products: products || [],
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

  const getNameLookup = (listName, id) => {
    if (!id) return '—';
    const list = data[listName] || [];
    const found = list.find(item => item.id === id);
    return found ? found.name : '—';
  };

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

  return {
    user,
    activeTab,
    setActiveTab,
    data,
    loading,
    showCreate,
    setShowCreate,
    editTarget,
    setEditTarget,
    roleFilter,
    setRoleFilter,
    searchQuery,
    setSearchQuery,
    loadAll,
    ban,
    unban,
    removeUser,
    removeEntity,
    logout,
    getNameLookup,
    getFilteredData,
    apis,
  };
}
