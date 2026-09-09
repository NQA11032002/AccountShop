'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

type SectionRevealProps = {
  children: ReactNode;
  delayMs?: number;
  className?: string;
};

export default function SectionReveal({ children, delayMs = 0, className = '' }: SectionRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyPreference = () => setPrefersReducedMotion(media.matches);

    applyPreference();
    media.addEventListener('change', applyPreference);

    return () => {
      media.removeEventListener('change', applyPreference);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const currentRef = ref.current;
    if (!currentRef || !('IntersectionObserver' in window)) return;
    // Server-rendered content stays readable without JavaScript. Only hide
    // off-screen sections after hydration, until their leading edge enters.
    if (currentRef.getBoundingClientRect().top >= window.innerHeight) {
      setIsVisible(false);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Reveal once when section enters viewport, then keep visible.
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(currentRef);

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <div
      ref={ref}
      className={`min-w-0 transition-[opacity,transform] duration-700 ease-out motion-reduce:!transform-none motion-reduce:!opacity-100 motion-reduce:!transition-none ${className} ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      }`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
