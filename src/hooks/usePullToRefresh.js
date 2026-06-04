import { useEffect, useRef, useState } from 'react';

export function usePullToRefresh(onRefresh) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const threshold = 80;

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = async (e) => {
      if (startY.current === null) return;
      const dy = e.changedTouches[0].clientY - startY.current;
      startY.current = null;
      if (dy > threshold) {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh]);

  return refreshing;
}