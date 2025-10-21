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
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import StructuredDataComponent from '@/components/StructuredData';
import '@/app/globals.css';

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
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  
  // Validate locale
  if (!config.i18n.locales.includes(locale)) {
    notFound();
  }

  const isRTL = config.i18n.rtlLocales.includes(locale as 'ar');

  return (
    <html 
      lang={locale} 
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`${inter.variable} ${tajawal.variable} ${isRTL ? 'font-arabic' : ''}`}
    >
      <head>
        <link rel="dns-prefetch" href={config.api.baseUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured Data */}
        <StructuredDataComponent type="website" />
        <StructuredDataComponent type="organization" />
        <StructuredDataComponent type="ecommerce" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AccessibilityProvider>
          <SkipLinks />
          <ErrorBoundary>
            <Layout locale={locale}>
              {children}
            </Layout>
          </ErrorBoundary>
        </AccessibilityProvider>

        {/* Google Analytics */}
        {config.analytics.googleAnalytics.trackingId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${config.analytics.googleAnalytics.trackingId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${config.analytics.googleAnalytics.trackingId}', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `}
            </Script>
          </>
        )}

        {/* Performance Monitoring */}
        <Script id="performance-monitor" strategy="afterInteractive">
          {`
            if (typeof window !== 'undefined') {
              const monitor = new (${PerformanceMonitor.toString()})();
              // Monitor is automatically initialized in constructor
            }
          `}
        </Script>

        {/* Service Worker Registration - Temporarily disabled for build testing */}
        {/* <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registered: ', registration);
                  })
                  .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `}
        </Script> */}
      </body>
    </html>
  );
}