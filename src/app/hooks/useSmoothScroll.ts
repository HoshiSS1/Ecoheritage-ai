import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * Global smooth scroll provider using Lenis.
 * Call this ONCE in App.tsx to enable studio-grade scrolling.
 *
 * Lenis is disabled on pages that manage their own scroll
 * (e.g., HeritageMapPage uses `overflow: hidden` on the page root).
 */
export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
