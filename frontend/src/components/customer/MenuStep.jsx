import React, { useState } from 'react';

const isUrl = (str) => typeof str === 'string' && (str.startsWith('http') || str.startsWith('/') || str.startsWith('data:'));

// Category images, product ratings, and tags are retrieved from the database.

export default function MenuStep({ cats, cat, setCat, items, products = [], cart, flash, add, upd, fmt, setActiveDetailProduct, cnt, total, setStep }) {
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
      
      {/* QUICK CART LINK */}
      <div 
        className={`cart-quick-banner ${cnt === 0 ? 'empty' : ''}`}
        onClick={() => setStep('cart')}
      >
        <div className="cart-quick-left">
          <div className="cart-quick-icon-wrap">
            <i className="ti ti-shopping-cart" aria-hidden="true"></i>
          </div>
          <div className="cart-quick-info">
            <span className="cart-quick-title">
              {cnt > 0 ? 'Mi Carrito' : 'Carrito Vacío'}
            </span>
            <span className="cart-quick-subtitle">
              {cnt > 0 ? `${cnt} ${cnt === 1 ? 'producto seleccionado' : 'productos seleccionados'}` : 'Agrega productos a tu pedido'}
            </span>
          </div>
        </div>
        <div className="cart-quick-right">
          {cnt > 0 && <span className="cart-quick-total">{fmt(total)}</span>}
          <i className="ti ti-chevron-right cart-quick-arrow" aria-hidden="true"></i>
        </div>
      </div>

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
            key={c.name} 
            className={`cat-chip ${cat === c.name ? 'active' : ''}`} 
            onClick={() => setCat(c.name)}
          >
            <span className="chip-emoji">
              {isUrl(c.image) ? (
                <img src={c.image} alt={c.name} className="category-chip-img" />
              ) : (
                c.image || '🍽️'
              )}
            </span>
            {c.name}
            <span className="chip-count" id={`cnt-${c.name}`}>
              {getCategoryCount(c.name)}
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
            const rating = i.rating !== undefined && i.rating !== null ? i.rating : 4.5;

            return (
              <div 
                key={i.id} 
                className={`menu-card ${incartQty > 0 ? 'selected-card' : ''}`}
                style={{ opacity: stockOk ? 1 : 0.6 }}
                onClick={() => setActiveDetailProduct(i)}
              >
                <div className="card-thumb">
                  {isUrl(i.image) ? (
                    <img src={i.image} alt={i.name} />
                  ) : (
                    i.image || '🍽️'
                  )}
                  {/* Gallery count badge */}
                  {i.gallery && i.gallery.length > 1 && (
                    <span className="card-gallery-badge" aria-label={`${i.gallery.length} fotos`}>
                      🖼 {i.gallery.length}
                    </span>
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
                        {i.tag_class && i.tag_label && (
                          <span className={`card-tag ${i.tag_class}`}>
                            {i.tag_label}
                          </span>
                        )}
                      </div>
                    </div>

                    {incartQty > 0 ? (
                      <div className="cart-qty-controls" onClick={(e) => e.stopPropagation()}>
                        {i.modifiers && i.modifiers.length > 0 ? (
                          <>
                            <span className="qty-tag">
                              {incartQty} agregados
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); add(i); }}
                              disabled={!stockOk || incartQty >= i.inventory.stock}
                              className="add-btn-small"
                            >
                              + Agregar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); upd(i.id, -1); }}
                              className="cart-qty-btn minus"
                            >
                              −
                            </button>
                            <span className="cart-qty-val">
                              {incartQty}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); upd(i.id, 1); }}
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
                        onClick={(e) => { e.stopPropagation(); add(i); }}
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
