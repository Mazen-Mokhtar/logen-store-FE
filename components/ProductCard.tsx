'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useCartStore, useLanguageStore } from '@/lib/store';
import { useMessages } from '@/hooks/useMessages';
import { formatPrice } from '@/lib/utils';
import { Product as ApiProduct } from '@/lib/api';


interface ProductCardProps {
  product: ApiProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { addItem } = useCartStore();
  const { language } = useLanguageStore();
  const messages = useMessages();

  const title = language === 'ar' ? product.title.ar : product.title.en;
  const isOnSale = product.promotion?.isOnSale || false;
  const salePrice = product.promotion?.salePrice;
  const originalPrice = product.promotion?.originalPrice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.inStock) return;

    addItem({
      id: product._id,
      title,
      price: product.price,
      image: product.images[0]?.secure_url || '/placeholder-image.jpg',
    });
  };

  return (
    <motion.div
      ref={ref}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
      style={{ willChange: 'transform' }}
    >
      <Link href={`/products/${encodeURIComponent(product.handle)}`}>
        <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square">
          {/* Sale Badge */}
          {isOnSale && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold"
            >
              {messages.products.sale}
            </motion.div>
          )}

          {/* Product Image */}
          <motion.div
            animate={{
              scale: isHovered ? 1.1 : 1,
              y: isHovered ? -10 : 0,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative w-full h-full"
            style={{ willChange: 'transform' }}
          >
            {inView && (
              <Image
                src={product.images[0]?.secure_url || '/placeholder-image.jpg'}
                alt={title}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                onLoad={() => setImageLoaded(true)}
              />
            )}
          </motion.div>

          {/* Add to Cart Button - Appears on Hover */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isHovered && product.inStock ? 1 : 0,
              y: isHovered && product.inStock ? 0 : 20,
            }}
            transition={{ duration: 0.3 }}
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="absolute bottom-4 left-4 right-4 bg-white text-black py-3 rounded-full font-semibold flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ willChange: 'transform' }}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>{product.inStock ? messages.products.addToCart : messages.products.outOfStock}</span>
          </motion.button>
        </div>

        {/* Product Info */}
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{title}</h3>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {isOnSale && originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}