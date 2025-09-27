import { Metadata } from 'next';
import { apiClient } from '@/lib/api';

interface ProductLayoutProps {
  children: React.ReactNode;
  params: {
    handle: string;
  };
}

export async function generateMetadata({ params }: { params: { handle: string } }): Promise<Metadata> {
  try {
    const product = await apiClient.getProductByHandle(params.handle);

    if (!product) {
      return {
        title: 'Product Not Found - StyleHub',
        description: 'The requested product could not be found.',
      };
    }

    const title = product.title?.en || 'Product';
    const description = product.description?.en || 'Product description';
    const image = product.images?.[0]?.secure_url || '/mvp-images/1.jpg';

    return {
      title: `${title} - StyleHub`,
      description: description,
      keywords: `${title}, ${product.tags?.join(', ') || ''}, fashion, clothing, StyleHub`,
      openGraph: {
        title: `${title} - StyleHub`,
        description: description,
        type: 'website',
        url: `https://stylehub.com/products/${product.handle}`,
        images: [
          {
            url: image,
            width: 800,
            height: 800,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} - StyleHub`,
        description: description,
        images: [image],
      },
    };
  } catch (error) {
    console.error('Error generating metadata for product:', error);
    return {
      title: 'Product - StyleHub',
      description: 'Discover premium fashion for the modern lifestyle.',
    };
  }
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return children;
}