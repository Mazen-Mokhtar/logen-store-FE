import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products - StyleHub',
  description: 'Browse our premium collection of fashion products.',
};

interface ProductsLayoutProps {
  children: React.ReactNode;
}

export default function ProductsLayout({ children }: ProductsLayoutProps) {
  return children;
}