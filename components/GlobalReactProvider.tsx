"use client";

import React, { useEffect } from 'react';

/**
 * GlobalReactProvider
 * Ensures React is available globally for dynamically loaded modules
 * This fixes the "Can't find variable: React" error that can occur
 * when modules are loaded dynamically (e.g., code splitting, lazy loading)
 */
export function GlobalReactProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Make React globally available
    if (typeof window !== 'undefined') {
      (window as any).React = React;
      console.log('✅ React globally registered');
    }
  }, []);

  return <>{children}</>;
}
