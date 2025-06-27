"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NavigationManager() {
  const router = useRouter();

  useEffect(() => {
    const handleNavigation = (event: CustomEvent) => {
      const { path } = event.detail;
      console.log("🔗 Custom navigation event:", { path });
      
      // Validate URL before navigation
      try {
        if (path && typeof path === 'string' && path.startsWith('/')) {
          router.push(path);
        } else {
          console.warn("⚠️ Invalid navigation path:", path);
        }
      } catch (error) {
        console.error("❌ Navigation error:", error);
      }
    };

    // Register all navigation event listeners
    const navEvents = [
      'navigate-to-login',
      'navigate-to-products', 
      'navigate-to-checkout',
      'navigate-to-product',
      'navigate-to-ranking',
      'navigate-to-orders'
    ];

    navEvents.forEach(eventName => {
      window.addEventListener(eventName, handleNavigation as EventListener);
    });

    // Cleanup
    return () => {
      navEvents.forEach(eventName => {
        window.removeEventListener(eventName, handleNavigation as EventListener);
      });
    };
  }, [router]);

  return null; // This component doesn't render anything
}