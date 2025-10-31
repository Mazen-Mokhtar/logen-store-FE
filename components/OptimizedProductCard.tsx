'use client';

import { useState, useCallback, memo } from 'react';
import Image from 'next/image';
import IntelligentLink from './IntelligentLink';
import WarrantyBadge from './WarrantyBadge';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { useCartStore, useLanguageStore, useNotificationStore } from '@/lib/store';
import { useMessages } from '@/hooks/useMessages';
import { formatPrice, decodeHtmlEntities } from '@/lib/utils';
import { Product as ApiProduct } from '@/lib/api';
import { generateGradientBlurDataURL, RESPONSIVE_SIZES } from '@/lib/image-optimization';

interface OptimizedProductCardProps {
  product: ApiProduct;
  priority?: boolean;
  className?: string;
}

const OptimizedProductCard = memo(({ product, priority = false, className = '' }: OptimizedProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCartStore();
  const { language } = useLanguageStore();
  const { addNotification } = useNotificationStore();
  const messages = useMessages();
  const router = useRouter();

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '50px',
  });

  const isRTL = language === 'ar';
  const title = isRTL ? product.title?.ar || product.title?.en : product.title?.en || product.title?.ar;
  const description = isRTL ? product.description?.ar || product.description?.en : product.description?.en || product.description?.ar;

  const primaryImageUrl = product.images?.[0]?.secure_url || '/mvp-images/1.jpg';
  const secondaryImageUrl = product.images?.[1]?.secure_url || primaryImageUrl;
  const hasMultipleImages = product.images && product.images.length > 1;

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.inStock) return;

    // Calculate the correct price (with discount if available)
    const finalPrice = product.promotion?.isOnSale 
      ? product.promotion.salePrice 
      : product.price;

    addItem({
      id: product._id,
      title,
      price: finalPrice,
      currency: product.currency,
      image: primaryImageUrl,
    });

    addNotification({
      type: 'success',
      title: isRTL ? 'تمت الإضافة للسلة' : 'Added to Cart',
      message: isRTL ? `تم إضافة ${title} إلى السلة` : `${title} added to cart`,
    });
  }, [product, title, primaryImageUrl, addItem, addNotification, isRTL]);

  const handleProductClick = useCallback(() => {
    // Prefetch the product page
    router.prefetch(`/${language}/products/${product.handle}`);
  }, [router, language, product.handle]);

  if (!inView && !priority) {
    return (
      <div ref={ref} className={`aspect-square bg-gray-100 rounded-2xl ${className}`}>
        <div className="animate-pulse w-full h-full bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
      onMouseEnter={() => {
        handleProductClick();
        if (hasMultipleImages) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (hasMultipleImages) {
          setIsHovered(false);
        }
      }}
    >
      <IntelligentLink 
        href={`/${language}/products/${product.handle}`} 
        className="block"
        prefetchOnHover={true}
        prefetchOnVisible={!priority}
        priority={priority}
        hoverDelay={200}
      >
        {/* Image Container */}
        <div className="relative w-full aspect-square overflow-hidden rounded-t-2xl flex items-center justify-center bg-white">
          {/* Primary Image */}
          <Image
            src={primaryImageUrl}
            alt={title}
            fill
            sizes={RESPONSIVE_SIZES.productCard}
            quality={75}
            priority={priority}
            style={{
              objectFit: "contain",
              objectPosition: "center",
            }}
            className={`transition-all duration-500 group-hover:scale-105 ${
              imageLoaded && (!isHovered || !hasMultipleImages) ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            placeholder="blur"
            blurDataURL={generateGradientBlurDataURL(10, 10, ['#f3f4f6', '#e5e7eb'])}
          />
          
          {/* Secondary Image - Only show if there's a second image */}
          {hasMultipleImages && (
            <Image
              src={secondaryImageUrl}
              alt={title}
              fill
              sizes={RESPONSIVE_SIZES.productCard}
              quality={75}
              style={{
                objectFit: "contain",
                objectPosition: "center",
              }}
              className={`transition-all duration-500 group-hover:scale-105 ${
                imageLoaded && isHovered ? 'opacity-100' : 'opacity-0'
              }`}
              placeholder="blur"
              blurDataURL={generateGradientBlurDataURL(10, 10, ['#f3f4f6', '#e5e7eb'])}
            />
          )}
          
          {/* Sale Badge */}
          {product.promotion?.isOnSale && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              {isRTL ? 'تخفيض' : 'Sale'}
            </div>
          )}

          {/* Warranty Badge */}
          {product.warranty?.hasWarranty && (
            <div className={`absolute top-3 ${product.promotion?.isOnSale ? (isRTL ? 'left-20' : 'right-3') : (isRTL ? 'left-3' : 'right-3')}`}>
              <WarrantyBadge warranty={product.warranty} size="small" />
            </div>
          )}

          {/* Quick Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`absolute bottom-3 right-3 p-2 rounded-full transition-all duration-300 transform translate-y-8 group-hover:translate-y-0 ${
              product.inStock
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
            {decodeHtmlEntities(title)}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {product.promotion?.isOnSale ? (
                <>
                  <span className="text-lg font-bold text-red-600">
                    {formatPrice(product.promotion.salePrice, product.currency)}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.promotion.originalPrice || product.price, product.currency)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price, product.currency)}
                </span>
              )}
            </div>
            
            {!product.inStock && (
              <span className="text-xs text-red-500 font-medium">
                {isRTL ? 'نفد المخزون' : 'Out of Stock'}
              </span>
            )}
          </div>
        </div>
      </IntelligentLink>
    </motion.div>
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

export default OptimizedProductCard;