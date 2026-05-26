import React, { useState, useEffect, useCallback } from 'react';
import useSwipe from '../../hooks/useSwipe.js';

/**
 * ImageLightbox — full-screen image viewer with keyboard, swipe, and click navigation.
 * Props:
 *   images: Array<{url: string, alt_text?: string}>
 *   startIndex: number (default 0)
 *   onClose: () => void
 */
export default function ImageLightbox({ images = [], startIndex = 0, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  const total = images.length;

  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), [total]);
  const next = useCallback(() => setCurrent(c => (c + 1) % total), [total]);

  const { onTouchStart, onTouchEnd } = useSwipe(next, prev);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next, onClose]);

  // Prevent body scroll while lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!images.length) return null;
  const img = images[current];

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de imágenes"
    >
      {/* Close button */}
      <button
        className="lightbox-close"
        onClick={onClose}
        aria-label="Cerrar visor"
      >
        ✕
      </button>

      {/* Counter */}
      <div className="lightbox-counter">
        {current + 1} / {total}
      </div>

      {/* Main image */}
      <div
        className="lightbox-image-wrap"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={img.url}
          src={img.url}
          alt={img.alt_text || `Imagen ${current + 1}`}
          className="lightbox-image"
        />
        {img.alt_text && (
          <div className="lightbox-caption">{img.alt_text}</div>
        )}
      </div>

      {/* Prev / Next buttons */}
      {total > 1 && (
        <>
          <button
            className="lightbox-nav lightbox-prev"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Imagen anterior"
          >
            ‹
          </button>
          <button
            className="lightbox-nav lightbox-next"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Siguiente imagen"
          >
            ›
          </button>
        </>
      )}

      {/* Dot pagination */}
      {total > 1 && (
        <div className="lightbox-dots" onClick={(e) => e.stopPropagation()}>
          {images.map((_, i) => (
            <button
              key={i}
              className={`lightbox-dot ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Ver imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
