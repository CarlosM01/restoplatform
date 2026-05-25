import React, { useState } from 'react';

const isUrl = (str) => typeof str === 'string' && (str.startsWith('http') || str.startsWith('/') || str.startsWith('data:'));

const CAT_IMAGES = {
  'Todos': 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=100&auto=format&fit=crop&q=60',
  'Carne': 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=100&auto=format&fit=crop&q=60',
  'Pollo': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=100&auto=format&fit=crop&q=60',
  'Ensalada': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&auto=format&fit=crop&q=60',
  'Entrada': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=100&auto=format&fit=crop&q=60',
  'Pescado': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=100&auto=format&fit=crop&q=60',
  'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&auto=format&fit=crop&q=60',
};

const getProductRating = (item) => {
  const ratings = {
    'Lomo a lo Pobre': 4.8,
    'Pizza Napolitana': 4.9,
    'Congrio Frito': 4.7,
    'Merluza al Vapor': 4.7,
    'Cazuela de Vacuno': 4.6,
    'Pollo Arvejado': 4.5,
    'Pastel de Choclo': 4.5,
    'Ensalada César': 4.3,
    'Ensalada de Quinoa': 4.2,
    'Humitas': 4.4,
    'Empanadas de Pino': 4.5,
  };
  return ratings[item.name] || 4.5;
};

const getProductTag = (item) => {
  const nameLower = item.name.toLowerCase();
  if (nameLower.includes('quinoa') || nameLower.includes('humita')) {
    return { class: 'vegan', label: '🌱 Vegano' };
  }
  if (nameLower.includes('merluza') || nameLower.includes('congrio') || nameLower.includes('pastel')) {
    return { class: 'chef', label: '👨‍🍳 Chef\'s choice' };
  }
  if (nameLower.includes('lomo') || nameLower.includes('pizza') || nameLower.includes('asado') || nameLower.includes('empanada')) {
    return { class: 'popular', label: '🔥 Popular' };
  }
  return null;
};

export default function MenuStep({ cats, cat, setCat, items, products = [], cart, flash, add, upd, fmt }) {
  // Local states for advanced filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('price-asc');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Category item counts based on all products in the database
  const getCategoryCount = (c) => {
    if (c === 'Todos') return products.length;
    return products.filter(p => p.category === c).length;
  };

  // Filter items by search text & price filter
  const filteredItems = items.filter(i => {
    const q = searchQuery.toLowerCase().trim();
    const matchQ = !q || i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);

    let matchPrice = true;
    if (priceFilter === 'low') {
      matchPrice = i.price <= 5990;
    } else if (priceFilter === 'mid') {
      matchPrice = i.price > 5990 && i.price <= 7990;
    } else if (priceFilter === 'high') {
      matchPrice = i.price > 7990;
    }

    return matchQ && matchPrice;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return a.price - b.price;
    } else {
      return b.price - a.price;
    }
  });

  // Dynamic values for the visual range track
  const minPrice = products.length > 0 ? Math.min(...products.map(p => p.price)) : 2490;
  const maxPrice = products.length > 0 ? Math.max(...products.map(p => p.price)) : 9990;

  const getRangeFillStyle = () => {
    if (priceFilter === 'low') return { left: '0%', right: '60%' };
    if (priceFilter === 'mid') return { left: '35%', right: '25%' };
    if (priceFilter === 'high') return { left: '65%', right: '0%' };
    return { left: '0%', right: '20%' }; // all
  };

  const getRangeDisplayString = () => {
    if (priceFilter === 'low') return `${fmt(minPrice)} — ${fmt(5990)}`;
    if (priceFilter === 'mid') return `${fmt(5990)} — ${fmt(7990)}`;
    if (priceFilter === 'high') return `${fmt(7990)} — ${fmt(maxPrice)}`;
    return `${fmt(minPrice)} — ${fmt(maxPrice)}`;
  };

  return (
    <div className="menu-step-container">
      
      {/* SEARCH AND FILTERS */}
      <div className="search-wrap">
        <i className="ti ti-search icon-left" aria-hidden="true"></i>
        <input 
          className="search-input" 
          type="text" 
          id="searchInput"
          placeholder="Buscar plato o ingrediente…" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <i 
          className={`ti ti-adjustments-horizontal icon-right ${showAdvanced ? 'active' : ''}`} 
          aria-hidden="true" 
          title="Filtros avanzados"
          onClick={() => setShowAdvanced(!showAdvanced)}
        ></i>
      </div>

      {/* COLLAPSIBLE PRICE RANGE PANEL */}
      <div className={`price-box-wrapper ${showAdvanced ? 'show' : ''}`}>
        <div className="price-box">
          <div className="price-header">
            <div className="price-header-label">
              <i className="ti ti-coin" aria-hidden="true"></i> Rango de precio
            </div>
            <div className="price-range-display" id="priceRangeDisplay">
              {getRangeDisplayString()}
            </div>
          </div>
          
          <div className="range-track">
            <div className="range-fill" id="rangeFill" style={getRangeFillStyle()}></div>
          </div>
          
          <div className="range-labels">
            <span>{fmt(minPrice)}</span>
            <span>{fmt(maxPrice)}</span>
          </div>
          
          <div className="price-chips">
            <div 
              className={`price-chip ${priceFilter === 'all' ? 'active' : ''}`} 
              onClick={() => setPriceFilter('all')}
            >
              Todos los precios
            </div>
            <div 
              className={`price-chip ${priceFilter === 'low' ? 'active' : ''}`} 
              onClick={() => setPriceFilter('low')}
            >
              Hasta {fmt(5990)}
            </div>
            <div 
              className={`price-chip ${priceFilter === 'mid' ? 'active' : ''}`} 
              onClick={() => setPriceFilter('mid')}
            >
              {fmt(5990)} – {fmt(7990)}
            </div>
            <div 
              className={`price-chip ${priceFilter === 'high' ? 'active' : ''}`} 
              onClick={() => setPriceFilter('high')}
            >
              Más de {fmt(7990)}
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIES HEADER & SORT BUTTON */}
      <div className="filter-topbar">
        <span className="filter-section-label">Categorías</span>
        <button 
          className="sort-btn" 
          id="sortBtn" 
          onClick={() => setSortBy(prev => prev === 'price-asc' ? 'price-desc' : 'price-asc')}
        >
          <i className="ti ti-arrows-sort"></i>
          <span id="sortLabel">{sortBy === 'price-asc' ? 'Precio ↑' : 'Precio ↓'}</span>
        </button>
      </div>

      {/* CATEGORY CHIPS */}
      <div className="cats" id="catBar">
        {cats.map(c => (
          <div 
            key={c} 
            className={`cat-chip ${cat === c ? 'active' : ''}`} 
            onClick={() => setCat(c)}
          >
            <span className="chip-emoji">
              {isUrl(CAT_IMAGES[c]) ? (
                <img src={CAT_IMAGES[c]} alt={c} className="category-chip-img" />
              ) : (
                CAT_IMAGES[c] || '🍽️'
              )}
            </span>
            {c}
            <span className="chip-count" id={`cnt-${c}`}>
              {getCategoryCount(c)}
            </span>
          </div>
        ))}
      </div>

      {/* RESULTS COUNT & FILTER TAG */}
      <div className="results-bar">
        <div className="results-count">
          <span id="visibleCount">{sortedItems.length}</span> platos disponibles
        </div>
        <div className="active-filter-tag" id="activeTag">
          <i className="ti ti-circle-check" aria-hidden="true"></i>
          <span id="activeTagText">
            {cat} {priceFilter !== 'all' ? ` · Filtro precio` : ''}
          </span>
        </div>
      </div>

      {/* CARD LIST */}
      {sortedItems.length > 0 ? (
        <div className="card-list" id="cardList">
          {sortedItems.map(i => {
            const incartQty = cart.filter(c => c.id === i.id).reduce((sum, c) => sum + c.qty, 0);
            const stockOk = i.inventory && i.inventory.stock > 0;
            const rating = getProductRating(i);
            const tag = getProductTag(i);

            return (
              <div 
                key={i.id} 
                className={`menu-card ${incartQty > 0 ? 'selected-card' : ''}`}
                style={{ opacity: stockOk ? 1 : 0.6 }}
              >
                <div className="card-thumb">
                  {isUrl(i.image) ? (
                    <img src={i.image} alt={i.name} />
                  ) : (
                    i.image || '🍽️'
                  )}
                </div>
                <div className="card-body">
                  <div className="card-header">
                    <div className="card-name">{i.name}</div>
                    <div className="card-cat-badge">{i.category}</div>
                  </div>
                  
                  <div className="card-desc">{i.description}</div>
                  
                  <div className="card-footer">
                    <div className="card-left">
                      <div className="card-price">{fmt(i.price)}</div>
                      <div className="card-meta">
                        <div className="rating">
                          <i className="ti ti-star-filled" aria-hidden="true"></i> {rating.toFixed(1)}
                        </div>
                        {tag && (
                          <span className={`card-tag ${tag.class}`}>
                            {tag.label}
                          </span>
                        )}
                      </div>
                    </div>

                    {incartQty > 0 ? (
                      <div className="cart-qty-controls">
                        {i.modifiers && i.modifiers.length > 0 ? (
                          <>
                            <span className="qty-tag">
                              {incartQty} agregados
                            </span>
                            <button
                              onClick={() => add(i)}
                              disabled={!stockOk || incartQty >= i.inventory.stock}
                              className="add-btn-small"
                            >
                              + Agregar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => upd(i.id, -1)}
                              className="cart-qty-btn minus"
                            >
                              −
                            </button>
                            <span className="cart-qty-val">
                              {incartQty}
                            </span>
                            <button
                              onClick={() => upd(i.id, 1)}
                              disabled={!stockOk || incartQty >= i.inventory.stock}
                              className="cart-qty-btn plus"
                            >
                              +
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <button 
                        className="add-btn" 
                        onClick={() => add(i)}
                        disabled={!stockOk}
                        style={{
                          background: flash === i.id ? 'var(--color-success)' : '',
                          borderColor: flash === i.id ? 'var(--color-success)' : ''
                        }}
                      >
                        {flash === i.id ? (
                          <>
                            <i className="ti ti-circle-check" aria-hidden="true" style={{ fontSize: 13 }}></i> Agregado
                          </>
                        ) : (
                          <>
                            <i className="ti ti-plus" aria-hidden="true"></i> {stockOk ? 'Agregar' : 'Sin stock'}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="empty-state show" id="emptyState">
          <div className="empty-icon">🍽</div>
          <div className="empty-title">Sin resultados</div>
          <div className="empty-sub">Prueba con otra búsqueda o rango de precio.</div>
        </div>
      )}

    </div>
  );
}
