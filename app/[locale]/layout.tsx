import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { Inter, Tajawal } from 'next/font/google';
import { config } from '@/lib/config';
import { generateLocalizedMetadata, generateHreflangAlternates } from '@/lib/seo-utils';
import { Layout } from '@/components/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SEOHead } from '@/components/SEOHead';
import { AccessibilityProvider } from '@/components/Accessibility/AccessibilityProvider';
import { SkipLinks } from '@/components/Accessibility/SkipLink';
import { PerformanceMonitor } from '@/lib/performance';
import StructuredDataComponent from '@/components/StructuredData';
import QueryProvider from '@/components/QueryProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import '@/app/globals.css';
import PageTransition from '@/components/PageTransition';

// Lazy load notification components
const NotificationToast = dynamic(() => import('@/components/NotificationToast'), {
  ssr: false,
  loading: () => null,
});

const CartDrawer = dynamic(() => import('@/components/CartDrawer'), {
  ssr: false,
  loading: () => null,
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-tajawal',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  
  // Validate locale
  if (!config.i18n.locales.includes(locale)) {
    notFound();
  }

  const isRTL = config.i18n.rtlLocales.includes(locale as 'ar');
  
  // Generate localized metadata using SEO utils
  const metadata = generateLocalizedMetadata('homepage', locale, {
    alternateLocales: config.i18n.supportedLocales,
  });

  return {
    ...metadata,
    title: {
      default: metadata.title as string,
      template: `%s | ${config.business.name}`,
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
      userScalable: true,
    },
    other: {
      'format-detection': 'telephone=no',
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'theme-color': '#ffffff',
      'color-scheme': 'light dark',
      'business:contact_data:street_address': config.business.address,
      'business:contact_data:locality': config.business.country,
      'business:contact_data:phone_number': config.business.phone,
      'business:contact_data:email': config.business.email,
      'business:contact_data:website': config.site.url,
    },
    manifest: '/manifest.json',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-icon-180.png', sizes: '180x180', type: 'image/png' },
      ],
    },
  };
}

export async function generateStaticParams() {
  return config.i18n.locales.map((locale) => ({
    locale,
  }));
}

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={inter.className}>
        <QueryProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <PageTransition>
              <main className="flex-1">
                {children}
              </main>
            </PageTransition>
            <Footer />
            <CartDrawer />
            <NotificationToast />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}