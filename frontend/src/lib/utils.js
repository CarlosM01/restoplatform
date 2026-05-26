/**
 * Shared utility functions for the RestoApp frontend.
 * Centralizes helpers that were previously duplicated across multiple components.
 */

/**
 * Check if a string looks like a valid image URL (http, relative path, or data URI).
 * @param {string} str
 * @returns {boolean}
 */
export const isUrl = (str) =>
  typeof str === 'string' &&
  (str.startsWith('http') || str.startsWith('https') || str.startsWith('/') || str.startsWith('data:'));

/**
 * CSS custom-property color aliases used across admin components.
 * Avoids redeclaring the same four variables in every file.
 */
export const COLORS = {
  G: 'var(--color-gold)',
  D: 'var(--color-dark)',
  M: 'var(--color-muted)',
  B: 'var(--color-border)',
};

/**
 * Build a unified gallery array from a product/form object.
 * Prefers `product.gallery`, falls back to a single `product.image`.
 *
 * @param {{ gallery?: Array<{url: string, alt_text?: string}>, image?: string, name?: string }} product
 * @returns {Array<{url: string, alt_text?: string}>}
 */
export function buildGallery(product) {
  if (product.gallery && product.gallery.length > 0) {
    return product.gallery.filter(g => isUrl(g.url));
  }
  if (isUrl(product.image)) {
    return [{ url: product.image, alt_text: product.name || '' }];
  }
  return [];
}
