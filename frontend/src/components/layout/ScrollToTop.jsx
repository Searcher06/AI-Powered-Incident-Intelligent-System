import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll the main content area back to top on every route change
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Also reset any scrollable containers (the main tag)
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
  }, [pathname]);

  return null;
}
