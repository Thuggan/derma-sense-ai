import React, { useEffect, useRef, useState } from 'react';

const ScrollReveal = ({ children, direction = "up", delay = 0, distance = "50px", duration = 0.8 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  const getTransform = () => {
    switch (direction) {
      case "up": return `translateY(${distance})`;
      case "down": return `translateY(-${distance})`;
      case "left": return `translateX(${distance})`;
      case "right": return `translateX(-${distance})`;
      default: return `translateY(${distance})`;
    }
  };

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translate(0)" : getTransform(),
    transition: `all ${duration}s cubic-bezier(0.17, 0.55, 0.55, 1) ${delay}s`,
    willChange: "opacity, transform"
  };

  return <div ref={ref} style={style}>{children}</div>;
};

export default ScrollReveal;
