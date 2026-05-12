import { useEffect } from 'react';
import { useLocation } from 'react-router';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    const scroll = () => {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } catch (e) {
        window.scrollTo(0, 0);
      }
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Scroll immediately
    scroll();

    // Scroll after layout changes (Suspense resolution)
    requestAnimationFrame(() => {
      scroll();
      const t1 = setTimeout(scroll, 50);
      const t2 = setTimeout(scroll, 150);
      const t3 = setTimeout(scroll, 300);
      const t4 = setTimeout(scroll, 500);
    });
  }, [pathname, hash]);

  return null;
}
