import React, { useState, useEffect } from 'react';
import { isUrl, COLORS, buildGallery } from '../../lib/utils.js';

export default function ProductPreviewCard({ form, fmt }) {
  const { G, D, M, B } = COLORS;
  const isColor = (str) => typeof str === 'string' && (str.startsWith('#') || str.startsWith('rgb') || str.startsWith('hsl'));

  // Gallery cycling: auto-advance every 2s when multiple gallery images exist
  const galleryImages = buildGallery(form);
  const hasGallery = galleryImages.length > 1;
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!hasGallery) {
      setActiveSlide(0);
      return;
    }
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % galleryImages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [hasGallery, galleryImages.length]);

  const heroUrl = hasGallery
    ? galleryImages[activeSlide]?.url
    : isUrl(form.image) ? form.image : null;

  return (
    <div style={{
      flex: '0.8',
      padding: '24px',
      background: '#FDFBF7',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflowY: 'auto',
      borderLeft: `1px solid ${B}`,
    }}>
      <div style={{ alignSelf: 'flex-start', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: M, marginBottom: 20 }}>
        👀 Vista Previa en Tiempo Real (Cliente)
      </div>

      {/* Customer mock menu-card */}
      <div className="menu-card" style={{ width: '100%', maxWidth: '320px', background: '#FFF', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.06)', border: `1px solid ${B}`, overflow: 'hidden', pointerEvents: 'none' }}>
        
        {/* Card Thumbnail */}
        <div className="card-thumb" style={{ height: '170px', background: '#FFF8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', overflow: 'hidden', position: 'relative' }}>
          {heroUrl ? (
            <img
              key={heroUrl}
              src={heroUrl}
              alt={form.name}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                animation: hasGallery ? 'previewFadeIn 0.4s ease' : 'none',
              }}
            />
          ) : (
            <span>🍽️</span>
          )}
          {form.tag_label && (
            <span 
              className={`card-tag ${isColor(form.tag_class) ? '' : (form.tag_class || 'popular')}`} 
              style={{ 
                position: 'absolute', 
                top: 12, 
                left: 12, 
                background: isColor(form.tag_class) ? form.tag_class : (form.tag_class === 'vegan' ? '#2ecc71' : (form.tag_class === 'chef' ? 'var(--color-dark)' : G)), 
                color: '#FFF', 
                fontSize: 10, 
                fontWeight: '700', 
                padding: '4px 8px', 
                borderRadius: 4, 
                textTransform: 'uppercase' 
              }}
            >
              {form.tag_label}
            </span>
          )}
          {/* Gallery count badge */}
          {hasGallery && (
            <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.55)', color: '#FFF', fontSize: 9, fontWeight: '700', padding: '3px 7px', borderRadius: 20, backdropFilter: 'blur(4px)' }}>
              🖼 {galleryImages.length} fotos
            </span>
          )}
          {/* Dot indicators */}
          {hasGallery && (
            <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4 }}>
              {galleryImages.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  style={{
                    width: i === activeSlide ? 14 : 5,
                    height: 5,
                    borderRadius: 3,
                    background: i === activeSlide ? G : 'rgba(255,255,255,0.6)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: D }}>{form.name || 'Nombre del Plato'}</div>
            <div style={{ fontSize: '10px', background: '#FAF9F6', border: `1px solid ${B}`, padding: '2px 6px', borderRadius: '4px', color: M, fontWeight: '600', whiteSpace: 'nowrap' }}>
              {form.category || 'Categoría'}
            </div>
          </div>

          {/* Description */}
          <div style={{ fontSize: '11.5px', color: M, lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {form.description || 'Aquí aparecerá la descripción del delicioso plato que estás creando...'}
          </div>

          {/* Ingredients chips row */}
          {form.ingredients && form.ingredients.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '4px 0' }}>
              {form.ingredients.map((ing, idx) => (
                <span key={idx} style={{ fontSize: '9px', background: '#F5F5F5', padding: '2px 6px', borderRadius: '10px', color: '#666', border: '1px solid #E0E0E0' }}>
                  {ing}
                </span>
              ))}
            </div>
          )}

          {/* Footer price, rating & stock row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: `1px dashed ${B}`, paddingTop: '10px' }}>
            <div className="card-left">
              <div style={{ fontSize: '16px', fontWeight: '700', color: G }}>
                {fmt(Number(form.price) || 0)}
              </div>
              <div className="card-meta" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <div style={{ fontSize: '11px', color: '#FFB300', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  ★ {(Number(form.rating) || 4.5).toFixed(1)}
                </div>
                {form.stock_inicial !== undefined && (
                  <span style={{ fontSize: '9.5px', color: Number(form.stock_inicial) > 0 ? '#00796B' : '#C62828', fontWeight: '600' }}>
                    {Number(form.stock_inicial) > 0 ? `${form.stock_inicial} disp.` : 'Sin stock'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Size variations list preview */}
          {form.sizes && form.sizes.length > 0 && (
            <div style={{ borderTop: `1px solid ${B}`, paddingTop: '6px', marginTop: '4px' }}>
              <div style={{ fontSize: '9px', fontWeight: '700', color: M, textTransform: 'uppercase', marginBottom: 4 }}>Tamaños disponibles</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {form.sizes.map((s, idx) => (
                  <span key={idx} style={{ fontSize: '9px', background: '#FAF9F6', border: `1px solid ${B}`, padding: '2px 6px', borderRadius: 4, color: D }}>
                    {s.name} {s.price_delta > 0 && `(+$${s.price_delta.toLocaleString()})`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extras additions checklist preview */}
          {form.extras && form.extras.length > 0 && (
            <div style={{ borderTop: `1px solid ${B}`, paddingTop: '6px', marginTop: '4px' }}>
              <div style={{ fontSize: '9px', fontWeight: '700', color: M, textTransform: 'uppercase', marginBottom: 4 }}>Extras recomendados</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {form.extras.map((e, idx) => (
                  <span key={idx} style={{ fontSize: '9px', background: '#E8F5E9', border: '1px solid #C8E6C9', padding: '2px 6px', borderRadius: 4, color: '#2E7D32' }}>
                    +{e.name} (${e.price.toLocaleString()})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens labels preview */}
          {form.allergens && form.allergens.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px', borderTop: `1px solid ${B}`, paddingTop: '6px' }}>
              {form.allergens.map((all, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '2px', background: '#FFF3E0', padding: '2px 6px', borderRadius: '4px', border: '1px solid #FFE0B2' }} title={`${all.name} (${all.severity || 'Alta'})`}>
                  <span style={{ fontSize: '10px' }}>{all.icon || '⚠️'}</span>
                  <span style={{ fontSize: '8px', color: '#E65100', fontWeight: '700' }}>{all.label || all.name.toUpperCase()}</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Micro-instructions summary */}
      <div style={{ marginTop: '20px', padding: '12px 14px', background: '#FFFDF9', border: '1px solid #FFE0B2', borderRadius: '10px', width: '100%', maxWidth: '320px' }}>
        <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#E65100', display: 'flex', alignItems: 'center', gap: '6px' }}>
          💡 Sugerencia de Diseño
        </div>
        <p style={{ fontSize: '10.5px', color: '#6D4C41', margin: '4px 0 0 0', lineHeight: '1.4' }}>
          El visualizador a la derecha se actualiza al instante. Rellena los datos para ver cómo encaja el plato final en la carta de compras.
        </p>
      </div>
    </div>
  );
}
