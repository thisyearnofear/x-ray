import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'X-RAI: AI Medical Diagnostic Game',
  description: 'Personalized Medical Imaging with AI-Powered Diagnosis',
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
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
