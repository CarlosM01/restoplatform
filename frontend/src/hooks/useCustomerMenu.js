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
  const [activeDetailProduct, setActiveDetailProduct] = useState(null);

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
        setCats([
          { name: 'Todos', image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=100&auto=format&fit=crop&q=60' },
          ...(categorias || [])
        ]);
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

  const handleAddDetailedProduct = (product, selectedSize, selectedExtras, quantity = 1) => {
    const sizeDelta = selectedSize ? selectedSize.price_delta : 0.0;
    const extrasPrice = selectedExtras ? selectedExtras.reduce((sum, ext) => sum + ext.price, 0.0) : 0.0;
    const finalUnitPrice = product.price + sizeDelta + extrasPrice;

    // Create a unique key for this customized combination
    const extrasKey = selectedExtras ? selectedExtras.map(e => e.name).sort().join('-') : '';
    const sizeKey = selectedSize ? selectedSize.name : 'default';
    const cartItemId = `${product.id}-sz-${sizeKey}-ex-${extrasKey}`;

    setCart(p => {
      const existing = p.find(c => c.cartItemId === cartItemId);
      if (existing) {
        return p.map(c => c.cartItemId === cartItemId ? { ...c, qty: c.qty + quantity } : c);
      } else {
        return [
          ...p,
          {
            ...product,
            cartItemId,
            qty: quantity,
            selectedSize,
            selectedExtras,
            price: finalUnitPrice, // set final unit price
          }
        ];
      }
    });

    setFlash(product.id);
    setTimeout(() => setFlash(null), 600);
  };

  const add = (item) => {
    if (item.inventory && item.inventory.stock < 1) return;
    
    // If the item has new relational sizes or extras, we open the details drawer!
    if ((item.sizes && item.sizes.length > 0) || (item.extras && item.extras.length > 0)) {
      setActiveDetailProduct(item);
      return;
    }
    
    if (item.modifiers && item.modifiers.length > 0) {
      setCustomizingItem(item);
      setSelectedOptions({});
      return;
    }
    
    setCart(p => {
      const e = p.find(c => c.id === item.id && (!c.selectedModifiers || c.selectedModifiers.length === 0) && !c.selectedSize && (!c.selectedExtras || c.selectedExtras.length === 0));
      return e ? p.map(c => (c.id === item.id && (!c.selectedModifiers || c.selectedModifiers.length === 0) && !c.selectedSize && (!c.selectedExtras || c.selectedExtras.length === 0)) ? {...c, qty: c.qty+1} : c) : [...p, {...item, cartItemId: item.id, qty: 1}];
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
      // 1. Crear pedido, mapping our size & extras details to modifiers expected by the backend
      const itemsPayload = cart.map(c => {
        const mods = [];
        if (c.selectedSize && c.selectedSize.price_delta !== 0) {
          mods.push({ name: `Tamaño: ${c.selectedSize.name}`, price_delta: c.selectedSize.price_delta });
        } else if (c.selectedSize) {
          mods.push({ name: `Tamaño: ${c.selectedSize.name}`, price_delta: 0.0 });
        }
        if (c.selectedExtras) {
          c.selectedExtras.forEach(ext => {
            mods.push({ name: `Extra: ${ext.name}`, price_delta: ext.price });
          });
        }
        if (c.selectedModifiers) {
          c.selectedModifiers.forEach(m => {
            mods.push({ name: m.name, price_delta: m.price_delta || 0.0 });
          });
        }
        return {
          product_id: c.id,
          quantity: c.qty,
          modifiers: mods
        };
      });

      const pedido = await createOrder({
        items: itemsPayload,
      });

      // 2. Iniciar pago simulado
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
    activeDetailProduct,
    setActiveDetailProduct,
    loading,
    error,
    processing,
    items,
    total,
    cnt,
    customTotal,
    toggleOption,
    handleAddCustomized,
    handleAddDetailedProduct,
    add,
    upd,
    procesarCheckout,
    logout,
  };
}
