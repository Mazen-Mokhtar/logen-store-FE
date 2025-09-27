'use client';

import dynamic from 'next/dynamic';
import { useLanguageStore } from '@/lib/store';
import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';

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
}

export default function Layout({ children }: LayoutProps) {
  const { language } = useLanguageStore();

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
    <div className={`min-h-screen ${language === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      <ScrollAnimations>
        <Header />
        <main>{children}</main>
        <Footer />
      </ScrollAnimations>
      <CartDrawer />
      <NotificationToast />
    </div>
  );
}