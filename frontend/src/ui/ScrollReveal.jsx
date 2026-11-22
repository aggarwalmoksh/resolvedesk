import React, { useEffect, useRef } from 'react';
import { cn } from '../lib/cn';

/**
 * Wraps children so they fade-in + translate-up when scrolled into view.
 * Content stays in the DOM for SEO / accessibility — only the visual
 * presentation is toggled via CSS classes.
 */
export function ScrollReveal({
  children,
  className,
  delay = 0,
  threshold = 0.15,
  as: Comp = 'div',
  once = true,
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // start hidden
    el.classList.add('sr-hidden');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // stagger via CSS custom property
          el.style.transitionDelay = `${delay}ms`;
          el.classList.remove('sr-hidden');
          el.classList.add('sr-visible');
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.add('sr-hidden');
          el.classList.remove('sr-visible');
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold, once]);

  return (
    <Comp ref={ref} className={cn('sr-unit', className)} {...props}>
      {children}
    </Comp>
  );
}
