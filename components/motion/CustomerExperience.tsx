'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import './customer-motion.css';

const targets = '[data-customer-card], [data-customer-reveal], h1, .home-category-card, .home-tool-card, .discovery-card';

/** Adds motion without remounting routes, changing form state, or hiding SSR content. */
export default function CustomerExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const enabled = !/^\/(admin|collaborator)(\/|$)/.test(pathname || '');

  useEffect(() => {
    const container = root.current;
    if (!container || !enabled) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const seen = new WeakSet<Element>();
    const running = new Set<Animation>();
    let observer: IntersectionObserver | undefined;
    let frame = 0;

    const animate = (element: HTMLElement, delay: number) => {
      if (preference.matches || document.hidden || typeof element.animate !== 'function') return;
      if (element.contains(document.activeElement)) return;
      // Never animate a container of a fixed overlay or another animated card.
      if (element.parentElement?.closest('[data-customer-card], .discovery-card')) return;
      const animation = element.animate([
        { opacity: 0.25, translate: '0 18px' },
        { opacity: 1, translate: '0 0' },
      ], { duration: 560, delay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' });
      running.add(animation);
      animation.onfinish = () => running.delete(animation);
      animation.oncancel = () => running.delete(animation);
    };

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        let index = 0;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer?.unobserve(entry.target);
          animate(entry.target as HTMLElement, Math.min(index++ * 55, 220));
        });
      }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    }

    const register = (element: Element) => {
      if (seen.has(element) || element.closest('[role="dialog"], [role="alertdialog"], [data-motion-skip]')) return;
      if (element.matches('h1') && element.closest('.customer-hero-copy, .home-enter, .discovery-enter')) return;
      seen.add(element);
      observer?.observe(element);
    };
    const scan = (node: Element) => {
      if (node.matches(targets)) register(node);
      node.querySelectorAll(targets).forEach(register);
    };
    scan(container);
    // API-loaded products, pagination, tabs, and route changes get the same treatment.
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node instanceof Element) scan(node);
      }));
    });
    mutations.observe(container, { childList: true, subtree: true });

    const updateProgress = () => {
      frame = 0;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const value = height > 0 ? Math.min(1, Math.max(0, window.scrollY / height)) : 0;
      if (progress.current) progress.current.style.transform = `scaleX(${value})`;
    };
    const scheduleProgress = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };
    const syncPreference = () => {
      if (preference.matches) running.forEach((animation) => animation.cancel());
    };
    const syncVisibility = () => {
      container.dataset.motionPaused = String(document.hidden);
      if (document.hidden) running.forEach((animation) => animation.cancel());
    };
    const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleProgress) : undefined;
    resize?.observe(container);
    syncVisibility();
    scheduleProgress();
    window.addEventListener('scroll', scheduleProgress, { passive: true });
    window.addEventListener('resize', scheduleProgress);
    document.addEventListener('visibilitychange', syncVisibility);
    preference.addEventListener('change', syncPreference);

    return () => {
      observer?.disconnect();
      mutations.disconnect();
      resize?.disconnect();
      running.forEach((animation) => animation.cancel());
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleProgress);
      window.removeEventListener('resize', scheduleProgress);
      document.removeEventListener('visibilitychange', syncVisibility);
      preference.removeEventListener('change', syncPreference);
    };
  }, [enabled, pathname]);

  return (
    <div ref={root} className={enabled ? 'customer-experience' : undefined}>
      {enabled && <div ref={progress} className="customer-scroll-progress" aria-hidden="true" />}
      {children}
    </div>
  );
}
