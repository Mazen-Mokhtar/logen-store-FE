'use client';

import dynamic from 'next/dynamic';
import { useLanguageStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import QueryProvider from './QueryProvider';

// Lazy load heavy components
const CartDrawer = dynamic(() => import('./CartDrawer'), {
  ssr: false,
  loading: () => null,
});

const ScrollAnimations = dynamic(() => import('./ScrollAnimations'), {
  ssr: false,
  loading: () => <div></div>,
});

const NotificationToast = dynamic(() => import('./NotificationToast'), {
  ssr: false,
  loading: () => null,
});
interface LayoutProps {
  children: React.ReactNode;
  locale?: string;
}

export default function Layout({ children, locale }: LayoutProps) {
  const { language } = useLanguageStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    
    // Preload critical resources
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'image';
    preloadLink.href = '/mvp-images/1.jpg';
    document.head.appendChild(preloadLink);
  }, [language]);

  return (
    <QueryProvider>
      <ScrollAnimations>
        <Header />
        <main className={`min-h-screen ${mounted && language === 'ar' ? 'font-arabic' : 'font-sans'}`}>
          {children}
        </main>
        <Footer />
      </ScrollAnimations>
      <CartDrawer />
      <NotificationToast />
    </QueryProvider>
  );
}

export { Layout };