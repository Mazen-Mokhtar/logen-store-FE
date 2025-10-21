import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout - StyleHub',
  description: 'Complete your purchase securely with fast shipping across Saudi Arabia.',
  robots: 'noindex, nofollow', // Don't index checkout pages
};

interface CheckoutLayoutProps {
  children: React.ReactNode;
}

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return children;
}