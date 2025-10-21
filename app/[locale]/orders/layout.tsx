import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Orders - StyleHub',
  description: 'View and track your orders from StyleHub.',
  robots: 'noindex, nofollow', // Don't index user-specific pages
};

interface OrdersLayoutProps {
  children: React.ReactNode;
}

export default function OrdersLayout({ children }: OrdersLayoutProps) {
  return children;
}