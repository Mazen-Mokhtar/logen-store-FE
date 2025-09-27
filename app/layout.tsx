import './globals.css';
import type { Metadata } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import Script from 'next/script';
import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const tajawal = Tajawal({ 
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: 'StyleHub - Premium Fashion Store',
  description: 'Discover premium fashion for the modern lifestyle. Shop our curated collection of contemporary clothing, shoes, and accessories with fast shipping across Saudi Arabia.',
  keywords: 'fashion, clothing, style, premium, modern, contemporary',
  authors: [{ name: 'StyleHub' }],
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'StyleHub - Premium Fashion Store',
    description: 'Discover premium fashion for the modern lifestyle. Shop our curated collection of contemporary clothing.',
    type: 'website',
    url: 'https://stylehub.com',
    siteName: 'StyleHub',
    locale: 'en_US',
    alternateLocale: 'ar_SA',
    images: [
      {
        url: '/mvp-images/1.jpg',
        width: 1200,
        height: 630,
        alt: 'StyleHub - Premium Fashion Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StyleHub - Premium Fashion Store',
    description: 'Discover premium fashion for the modern lifestyle.',
    images: ['/mvp-images/1.jpg'],
  },
  other: {
    'theme-color': '#000000',
    'color-scheme': 'light',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://stackblitz.com" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.variable} ${tajawal.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <Layout>{children}</Layout>
        </ErrorBoundary>
        
        {/* Performance monitoring script */}
        <Script
          id="performance-observer"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                      console.log('LCP:', entry.startTime);
                    }
                    if (entry.entryType === 'first-input') {
                      console.log('FID:', entry.processingStart - entry.startTime);
                    }
                  }
                });
                observer.observe({entryTypes: ['largest-contentful-paint', 'first-input']});
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
