import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useScrollReveal = () => {
  const location = useLocation();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    const applyReveal = () => {
      const selectors = [
        'section', '.home-container > div', '.features-container > div', 
        '.about-container', '.contact-section', 'h1', 'h2', 'h3', 'p', 
        '.feature', 'img', '.cta-button'
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (!el.closest('nav') && !el.closest('header') && !el.closest('footer') && !el.classList.contains('reveal')) {
            el.classList.add('reveal');
            observer.observe(el);
          }
        });
      });
    };

    // Apply initially
    setTimeout(applyReveal, 100);
    // Apply again slightly later for dynamically loaded content
    setTimeout(applyReveal, 500);

    return () => observer.disconnect();
  }, [location.pathname]);
};

export default useScrollReveal;
