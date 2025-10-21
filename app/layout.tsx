import './globals.css';
import type { Metadata } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import Script from 'next/script';
import Layout from '@/components/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import SEOHead from '@/components/SEOHead';
import { config } from '@/lib/config';
import { generateLocalizedMetadata } from '@/lib/seo-utils';
import { initGA, GA_TRACKING_ID } from '@/lib/analytics';

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

// Generate metadata dynamically using SEO utils
export async function generateMetadata(): Promise<Metadata> {
  const baseMetadata = generateLocalizedMetadata('homepage', config.i18n.defaultLocale);
  
  return {
    ...baseMetadata,
    title: {
      default: config.seo.defaultTitle,
      template: `%s | ${config.business.name}`,
    },
    authors: [{ name: config.business.name }],
    creator: config.business.name,
    publisher: config.business.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(config.site.url),
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
    },
    category: 'technology',
    classification: 'Electronics Store',
    openGraph: {
      type: 'website',
      url: config.site.url,
      siteName: config.site.name,
      locale: 'en_US',
      alternateLocale: 'ar_SA',
      images: [
        {
          url: '/mvp-images/1.jpg',
          width: 1200,
          height: 630,
          alt: config.site.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.seo.defaultTitle,
      description: config.seo.defaultDescription,
      images: ['/mvp-images/1.jpg'],
      creator: config.social.twitterHandle,
    },
    other: {
      'theme-color': '#000000',
      'color-scheme': 'light dark',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'format-detection': 'telephone=no',
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is only used for the root redirect
  // All actual pages use the [locale]/layout.tsx
  return children;
}
