import { useState, useEffect } from 'react';
import { getProducts, getCategories, createOrder, initPayment, getUser, clearAuth } from '../lib/api.js';

export default function useCustomerMenu() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState('menu');
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [cat, setCat] = useState('Todos');
  const [cart, setCart] = useState([]);
  const [flash, setFlash] = useState(null);
  const [customizingItem, setCustomizingItem] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  // UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setUser(getUser());

    Promise.all([
      getProducts(),
      getCategories(),
    ])
      .then(([p, categorias]) => {
        setProducts(p || []);
        setCats(['Todos', ...(categorias || [])]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const items = products.filter(p => cat === 'Todos' || p.category === cat);
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cnt = cart.reduce((s, c) => s + c.qty, 0);

  const basePrice = customizingItem ? customizingItem.price : 0;
  const modsPrice = Object.values(selectedOptions)
    .flat()
    .reduce((sum, opt) => sum + (opt.price_delta || 0), 0);
  const customTotal = basePrice + modsPrice;

  const toggleOption = (groupName, opt) => {
    setSelectedOptions(prev => {
      const currentGroupOpts = prev[groupName] || [];
      const exists = currentGroupOpts.find(o => o.name === opt.name);
      let nextGroupOpts;
      if (exists) {
        nextGroupOpts = currentGroupOpts.filter(o => o.name !== opt.name);
      } else {
        nextGroupOpts = [...currentGroupOpts, opt];
      }
      return { ...prev, [groupName]: nextGroupOpts };
    });
  };

  const handleAddCustomized = () => {
    if (!customizingItem) return;
    const chosenMods = Object.values(selectedOptions).flat();
    const cartItemId = customizingItem.id + '-' + chosenMods.map(m => m.name).sort().join('-');

    setCart(p => {
      const e = p.find(c => c.cartItemId === cartItemId);
      if (e) {
        return p.map(c => c.cartItemId === cartItemId ? { ...c, qty: c.qty + 1 } : c);
      } else {
        return [
          ...p,
          {
            ...customizingItem,
            cartItemId,
            qty: 1,
            selectedModifiers: chosenMods,
            price: customTotal,
          }
        ];
      }
    });

    setFlash(customizingItem.id);
    setTimeout(() => setFlash(null), 600);
    setCustomizingItem(null);
    setSelectedOptions({});
  };

  const add = (item) => {
    if (item.inventory && item.inventory.stock < 1) return;
    if (item.modifiers && item.modifiers.length > 0) {
      setCustomizingItem(item);
      setSelectedOptions({});
      return;
    }
    setCart(p => {
      const e = p.find(c => c.id === item.id && (!c.selectedModifiers || c.selectedModifiers.length === 0));
      return e ? p.map(c => (c.id === item.id && (!c.selectedModifiers || c.selectedModifiers.length === 0)) ? {...c, qty: c.qty+1} : c) : [...p, {...item, cartItemId: item.id, qty: 1}];
    });
    setFlash(item.id);
    setTimeout(() => setFlash(null), 600);
  };

  const upd = (cartItemId, d) => setCart(p =>
    p.map(c => c.cartItemId === cartItemId ? {...c, qty: Math.max(0, c.qty + d)} : c).filter(c => c.qty > 0)
  );

  const procesarCheckout = async (asGuest = false) => {
    if (!user && !asGuest) {
      alert('Debes iniciar sesión o continuar como invitado para pagar');
      return;
    }
    setProcessing(true);
    try {
      // 1. Crear pedido
      const pedido = await createOrder({
        items: cart.map(c => ({
          product_id: c.id,
          quantity: c.qty,
          modifiers: c.selectedModifiers || []
        })),
      });

      // 2. Iniciar pago simulado (el backend confirmará el pago directamente)
      const payment = await initPayment(pedido.id);

      // 3. Redirigir directamente a la página de resultado exitoso en el frontend
      window.location.href = payment.url;
    } catch (e) {
      setError(e.message);
      setProcessing(false);
    }
  };

  const logout = () => {
    clearAuth();
    window.location.reload();
  };

  return {
    user,
    step,
    setStep,
    products,
    cats,
    cat,
    setCat,
    cart,
    flash,
    customizingItem,
    setCustomizingItem,
    selectedOptions,
    setSelectedOptions,
    loading,
    error,
    processing,
    items,
    total,
    cnt,
    customTotal,
    toggleOption,
    handleAddCustomized,
    add,
    upd,
    procesarCheckout,
    logout,
  };
}
