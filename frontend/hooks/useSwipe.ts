'use client';

import { useCallback, useRef, useState } from 'react';

const SWIPE_THRESHOLD = 50;

export function useSwipe(onSwipeLeft?: () => void, onSwipeRight?: () => void) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (touchStart == null || touchEnd == null) return;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) < SWIPE_THRESHOLD) return;
    if (diff > 0) onSwipeRight?.();
    else onSwipeLeft?.();
  }, [touchStart, touchEnd, onSwipeLeft, onSwipeRight]);

  return { onTouchStart, onTouchMove, onTouchEnd, containerRef };
}
