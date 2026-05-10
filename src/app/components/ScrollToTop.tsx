import { useEffect } from 'react';
import { useLocation } from 'react-router';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const doScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        const t = setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
        return () => clearTimeout(t);
      }
    } else {
      doScroll();
      const t1 = setTimeout(doScroll, 50);
      const t2 = setTimeout(doScroll, 200);
      
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [pathname, hash]);

  return null;
}
