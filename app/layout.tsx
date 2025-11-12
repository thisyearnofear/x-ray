import type { Metadata } from 'next';
import React from 'react';
import './globals.css';
import '../src/styles/global-animations.css';
import { Web3Provider } from '../components/web3/Web3Provider';
import { GlobalReactProvider } from '../components/GlobalReactProvider';

// Ensure React is globally available for dynamically loaded modules
if (typeof window !== 'undefined') {
  (window as any).React = React;
}

export const metadata: Metadata = {
  title: 'X-RAI: Onchain AI Powered Medical Diagnostic Experience',
  description: 'Revolutionary Onchain Medical X-Ray Experience with Smart Account Abstraction & AI Consultation',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <GlobalReactProvider>
          <Web3Provider>
            {children}
          </Web3Provider>
        </GlobalReactProvider>
      </body>
    </html>
  );
}
