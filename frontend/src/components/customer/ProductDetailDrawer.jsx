import React, { useState, useCallback } from 'react';
import ImageLightbox from './ImageLightbox.jsx';
import { isUrl, buildGallery } from '../../lib/utils.js';
import useSwipe from '../../hooks/useSwipe.js';

export default function ProductDetailDrawer({ product, onClose, onAdd, fmt }) {
  if (!product) return null;

  // Initialize selected size (default to first size if available)
  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : null
  );

  // Keep track of checked extras
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [quantity, setQuantity] = useState(1);

  // Gallery state
  const gallery = buildGallery(product);
  const [heroIdx, setHeroIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const prevSlide = useCallback(() => setHeroIdx(i => (i - 1 + gallery.length) % gallery.length), [gallery.length]);
  const nextSlide = useCallback(() => setHeroIdx(i => (i + 1) % gallery.length), [gallery.length]);

  const { onTouchStart, onTouchEnd } = useSwipe(nextSlide, prevSlide);

  const toggleExtra = (extra) => {
    setSelectedExtras((prev) => {
      const exists = prev.find((e) => e.id === extra.id);
      if (exists) {
        return prev.filter((e) => e.id !== extra.id);
      } else {
        return [...prev, extra];
      }
    });
  };

  // Calculate current unit price and total price
  const sizeDelta = selectedSize ? selectedSize.price_delta : 0;
  const extrasPrice = selectedExtras.reduce((sum, ext) => sum + ext.price, 0);
  const currentUnitPrice = product.price + sizeDelta + extrasPrice;
  const totalPrice = currentUnitPrice * quantity;

  const handleAddToCart = () => {
    onAdd(product, selectedSize, selectedExtras, quantity);
    onClose();
  };

  const currentHero = gallery[heroIdx];

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
        {/* Drag handle indicator */}
        <div className="drawer-handle" onClick={onClose} />

        {/* Back and Cart header bar */}
        <div className="drawer-nav-bar">
          <button className="drawer-back-btn" onClick={onClose} aria-label="Volver">
            <span className="drawer-back-arrow">←</span>
          </button>
          <span className="drawer-nav-title">Detalle del Plato</span>
          <button className="drawer-close-icon-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="drawer-scrollable-content">
          {/* ─── GALLERY HERO AREA ─── */}
          <div
            className="drawer-hero-image gallery-hero"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onClick={() => gallery.length > 0 && setLightboxOpen(true)}
            style={{ cursor: gallery.length > 0 ? 'zoom-in' : 'default', position: 'relative', overflow: 'hidden' }}
          >
            {currentHero ? (
              <img
                key={currentHero.url}
                src={currentHero.url}
                alt={currentHero.alt_text || product.name}
                className="gallery-hero-img"
              />
            ) : (
              <div className="drawer-hero-placeholder">{product.image || '🍽️'}</div>
            )}

            {/* Zoom hint overlay */}
            {gallery.length > 0 && (
              <div className="gallery-zoom-hint" aria-hidden="true">
                🔍
              </div>
            )}

            {/* Prev/Next buttons — only when gallery has multiple */}
            {gallery.length > 1 && (
              <>
                <button
                  className="gallery-nav-btn gallery-prev"
                  onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                  aria-label="Imagen anterior"
                >
                  ‹
                </button>
                <button
                  className="gallery-nav-btn gallery-next"
                  onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                  aria-label="Siguiente imagen"
                >
                  ›
                </button>
              </>
            )}

            {/* Gallery count badge */}
            {gallery.length > 1 && (
              <span className="gallery-count-badge" aria-hidden="true">
                🖼 {gallery.length}
              </span>
            )}

            {/* Dot pagination */}
            {gallery.length > 1 && (
              <div className="gallery-dots" onClick={(e) => e.stopPropagation()}>
                {gallery.map((_, i) => (
                  <button
                    key={i}
                    className={`gallery-dot ${i === heroIdx ? 'active' : ''}`}
                    onClick={() => setHeroIdx(i)}
                    aria-label={`Ver imagen ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product main details card */}
          <div className="drawer-detail-card">
            <div className="drawer-product-meta">
              <span className="drawer-product-category">{product.category}</span>
              {product.inventory && (
                <span className={`drawer-stock-badge ${product.inventory.stock > 0 ? 'in-stock' : 'no-stock'}`}>
                  {product.inventory.stock > 0 ? `${product.inventory.stock} disponibles` : 'Sin stock'}
                </span>
              )}
            </div>

            <h2 className="drawer-product-title">{product.name}</h2>
            <p className="drawer-product-desc">{product.description || 'Sin descripción disponible.'}</p>
            <div className="drawer-product-base-price">Precio base: {fmt(product.price)}</div>

            {/* ─── INGREDIENTS SECTION ─── */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="drawer-section">
                <h3 className="drawer-section-title">Ingredientes</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {product.ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: '#FAF9F6',
                        border: '1px solid var(--color-border)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        color: 'var(--color-dark)',
                        fontWeight: '600'
                      }}
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ─── ALLERGENS SECTION ─── */}
            {product.allergens && product.allergens.length > 0 && (
              <div className="drawer-section">
                <h3 className="drawer-section-title">Alérgenos</h3>
                <div className="drawer-allergens-list">
                  {product.allergens.map((all) => {
                    const icon = all.icon || '⚠️';
                    const label = all.label || all.name.toUpperCase();
                    return (
                      <div key={all.id} className="drawer-allergen-item" title={`${all.name} (${all.severity || 'Normal'})`}>
                        <div className="drawer-allergen-circle">
                          <span className="drawer-allergen-icon">{icon}</span>
                        </div>
                        <span className="drawer-allergen-label">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── SIZES SECTION ─── */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="drawer-section">
                <h3 className="drawer-section-title">Tamaño</h3>
                <div className="drawer-sizes-list">
                  {product.sizes.map((sz) => {
                    const isSelected = selectedSize && selectedSize.id === sz.id;
                    return (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`drawer-size-chip ${isSelected ? 'active' : ''}`}
                      >
                        <span className="size-name">{sz.name}</span>
                        {sz.price_delta > 0 && (
                          <span className="size-delta">+{fmt(sz.price_delta)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── EXTRAS SECTION ─── */}
            {product.extras && product.extras.length > 0 && (
              <div className="drawer-section">
                <h3 className="drawer-section-title">Extras / Adiciones</h3>
                <div className="drawer-extras-grid">
                  {product.extras.map((ext) => {
                    const isSelected = !!selectedExtras.find((e) => e.id === ext.id);
                    return (
                      <div
                        key={ext.id}
                        onClick={() => toggleExtra(ext)}
                        className={`drawer-extra-card ${isSelected ? 'active' : ''}`}
                      >
                        <div className="extra-card-content">
                          <div className="extra-card-info">
                            <span className="extra-name">{ext.name}</span>
                            <span className="extra-price">+{fmt(ext.price)}</span>
                          </div>
                          <button
                            type="button"
                            className={`extra-add-btn ${isSelected ? 'selected' : ''}`}
                            aria-label={isSelected ? "Quitar extra" : "Agregar extra"}
                          >
                            {isSelected ? '✓' : '+'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── FLOATING FOOTER ACTION BAR ─── */}
        <div className="drawer-footer">
          <div className="drawer-footer-top">
            <span className="drawer-unit-price-label">Precio Unitario</span>
            <span className="drawer-unit-price-val">{fmt(currentUnitPrice)}</span>
          </div>

          <div className="drawer-footer-actions">
            {/* Quantity controls */}
            <div className="drawer-qty-selector">
              <button
                type="button"
                className="drawer-qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span className="drawer-qty-val">{quantity}</span>
              <button
                type="button"
                className="drawer-qty-btn"
                onClick={() => setQuantity((q) => q + 1)}
                disabled={product.inventory && quantity >= product.inventory.stock}
              >
                +
              </button>
            </div>

            {/* Add to Cart button */}
            <button
              type="button"
              className="drawer-add-cart-btn"
              onClick={handleAddToCart}
              disabled={product.inventory && product.inventory.stock <= 0}
            >
              Agregar — {fmt(totalPrice)}
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen lightbox */}
      {lightboxOpen && gallery.length > 0 && (
        <ImageLightbox
          images={gallery}
          startIndex={heroIdx}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
