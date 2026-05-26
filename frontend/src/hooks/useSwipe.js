import { useState, useCallback } from 'react';

/**
 * Hook for horizontal touch-swipe detection.
 * Eliminates duplicated touch-handling logic in ImageLightbox and ProductDetailDrawer.
 *
 * @param {() => void} onSwipeLeft  - Called when the user swipes left  (next).
 * @param {() => void} onSwipeRight - Called when the user swipes right (prev).
 * @param {number}     [threshold=40] - Minimum horizontal px delta to trigger.
 * @returns {{ onTouchStart: function, onTouchEnd: function }}
 */
export default function useSwipe(onSwipeLeft, onSwipeRight, threshold = 40) {
  const [touchStart, setTouchStart] = useState(null);

  const onTouchStart = useCallback((e) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (touchStart === null) return;
    const delta = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(delta) > threshold) {
      delta > 0 ? onSwipeLeft() : onSwipeRight();
    }
    setTouchStart(null);
  }, [touchStart, onSwipeLeft, onSwipeRight, threshold]);

  return { onTouchStart, onTouchEnd };
}
