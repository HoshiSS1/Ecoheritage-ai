import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
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
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Set up ResizeObserver to handle dynamic height changes (Suspense, lists expansion, etc.)
    const resizeObserver = new ResizeObserver(() => {
      lenis.resize();
    });
    resizeObserver.observe(document.body);

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      resizeObserver.disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Recalculate dimensions and scroll to top on route change
  useEffect(() => {
    if (lenisRef.current) {
      // Small delay to allow the DOM to render the new content
      const timer = setTimeout(() => {
        lenisRef.current?.resize();
        lenisRef.current?.scrollTo(0, { immediate: true });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return lenisRef;
}
