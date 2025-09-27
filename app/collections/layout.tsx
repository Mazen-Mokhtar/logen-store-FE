import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Collections - StyleHub',
  description: 'Browse our complete collection of premium fashion pieces. Find the perfect style for every occasion.',
  keywords: 'fashion collections, clothing, t-shirts, hoodies, pants, jackets, shoes, StyleHub',
  openGraph: {
    title: 'Collections - StyleHub',
    description: 'Browse our complete collection of premium fashion pieces.',
    type: 'website',
    url: 'https://stylehub.com/collections',
    images: [
      {
        url: '/mvp-images/3.jpg',
        width: 1200,
        height: 630,
        alt: 'StyleHub Collections',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Collections - StyleHub',
    description: 'Browse our complete collection of premium fashion pieces.',
    images: ['/mvp-images/3.jpg'],
  },
};

interface CollectionsLayoutProps {
  children: React.ReactNode;
}

export default function CollectionsLayout({ children }: CollectionsLayoutProps) {
  return children;
}