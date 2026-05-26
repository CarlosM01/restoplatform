import React, { useRef } from 'react';

const isUrl = (str) =>
  typeof str === 'string' && (str.startsWith('http') || str.startsWith('https') || str.startsWith('/') || str.startsWith('data:'));

/**
 * ImageGalleryEditor — manages an ordered list of {url, alt_text, sort_order} objects.
 * Props:
 *   gallery: Array<{url: string, alt_text?: string, sort_order: number}>
 *   onChange: (newGallery) => void
 */
export default function ImageGalleryEditor({ gallery = [], onChange }) {
  const dragIdx = useRef(null);

  const addImage = () => {
    const next = [...gallery, { url: '', alt_text: '', sort_order: gallery.length }];
    onChange(next);
  };

  const removeImage = (idx) => {
    const next = gallery.filter((_, i) => i !== idx).map((img, i) => ({ ...img, sort_order: i }));
    onChange(next);
  };

  const updateField = (idx, field, value) => {
    const next = gallery.map((img, i) => i === idx ? { ...img, [field]: value } : img);
    onChange(next);
  };

  // Drag-and-drop reorder
  const onDragStart = (e, idx) => {
    dragIdx.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e, idx) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    const reordered = [...gallery];
    const [moved] = reordered.splice(dragIdx.current, 1);
    reordered.splice(idx, 0, moved);
    dragIdx.current = idx;
    onChange(reordered.map((img, i) => ({ ...img, sort_order: i })));
  };

  const onDragEnd = () => { dragIdx.current = null; };

  const G = 'var(--color-gold)';
  const D = 'var(--color-dark)';
  const M = 'var(--color-muted)';
  const B = 'var(--color-border)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontWeight: '700', fontSize: 12.5, color: D }}>
          🖼️ Galería de Imágenes
          <span style={{ fontWeight: '400', color: M, marginLeft: 6 }}>
            ({gallery.length} {gallery.length === 1 ? 'imagen' : 'imágenes'})
          </span>
        </label>
        <button
          type="button"
          onClick={addImage}
          style={{
            background: G,
            color: '#FFF',
            border: 'none',
            borderRadius: 8,
            padding: '5px 12px',
            fontSize: 11.5,
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          + Agregar imagen
        </button>
      </div>

      {gallery.length === 0 && (
        <div style={{
          border: `2px dashed ${B}`,
          borderRadius: 10,
          padding: '20px 16px',
          textAlign: 'center',
          color: M,
          fontSize: 12,
          background: '#FAFAF8',
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
          <div style={{ fontWeight: '600', marginBottom: 4 }}>Sin imágenes en la galería</div>
          <div>Haz clic en "+ Agregar imagen" para añadir URLs de imágenes al producto.</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {gallery.map((img, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={(e) => onDragStart(e, idx)}
            onDragOver={(e) => onDragOver(e, idx)}
            onDragEnd={onDragEnd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#FAFAF8',
              border: `1px solid ${B}`,
              borderRadius: 10,
              padding: '8px 10px',
              cursor: 'grab',
              transition: 'box-shadow 0.15s ease',
            }}
          >
            {/* Drag handle */}
            <div style={{ color: M, fontSize: 16, cursor: 'grab', userSelect: 'none', flexShrink: 0 }}>
              ⠿
            </div>

            {/* Thumbnail */}
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 8,
              overflow: 'hidden',
              border: `1px solid ${B}`,
              background: '#F0EDE8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 20,
            }}>
              {isUrl(img.url) ? (
                <img
                  src={img.url}
                  alt={img.alt_text || `Imagen ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <span style={{ display: isUrl(img.url) ? 'none' : 'flex' }}>🖼️</span>
            </div>

            {/* Inputs */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <input
                type="text"
                placeholder={`URL de imagen ${idx + 1} (https://...)`}
                value={img.url}
                onChange={(e) => updateField(idx, 'url', e.target.value)}
                style={{
                  width: '100%',
                  padding: '5px 8px',
                  borderRadius: 6,
                  border: `1px solid ${isUrl(img.url) ? '#A5D6A7' : B}`,
                  fontSize: 11.5,
                  background: '#FFF',
                  boxSizing: 'border-box',
                  outline: 'none',
                  color: D,
                  transition: 'border-color 0.15s ease',
                }}
              />
              <input
                type="text"
                placeholder="Texto alternativo (accesibilidad, opcional)"
                value={img.alt_text || ''}
                onChange={(e) => updateField(idx, 'alt_text', e.target.value)}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: `1px solid ${B}`,
                  fontSize: 10.5,
                  background: '#FFF',
                  boxSizing: 'border-box',
                  outline: 'none',
                  color: M,
                }}
              />
            </div>

            {/* Order badge */}
            <div style={{
              fontSize: 9,
              fontWeight: '700',
              color: idx === 0 ? G : M,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              flexShrink: 0,
              textAlign: 'center',
              minWidth: 32,
            }}>
              {idx === 0 ? '⭐ Principal' : `#${idx + 1}`}
            </div>

            {/* Remove */}
            <button
              type="button"
              onClick={() => removeImage(idx)}
              title="Eliminar imagen"
              style={{
                background: '#FFEBEE',
                border: '1px solid #FFCDD2',
                color: '#C62828',
                borderRadius: 6,
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: '700',
                flexShrink: 0,
                transition: 'background 0.15s ease',
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {gallery.length > 0 && (
        <div style={{ fontSize: 10, color: M, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>⠿ Arrastra las filas para reordenar.</span>
          <span>⭐ La primera imagen es la miniatura principal del plato.</span>
        </div>
      )}
    </div>
  );
}
