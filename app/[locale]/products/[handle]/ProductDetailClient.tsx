'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, ArrowLeft, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '@/lib/store';
import { useMessages } from '@/hooks/useMessages';
import { formatPrice, decodeHtmlEntities } from '@/lib/utils';
import { useNotificationStore } from '@/lib/store';
import { getOptimizedImageProps, generateGradientBlurDataURL, RESPONSIVE_SIZES, imagePerformance } from '@/lib/image-optimization';
import WarrantyBadge from '@/components/WarrantyBadge';

// Lazy load notification prompt
const NotificationPrompt = dynamic(() => import('@/components/NotificationPrompt'), {
  ssr: false,
  loading: () => null,
});

// Lazy load components with better loading states
const OptimizedProductCard = dynamic(() => import('@/components/OptimizedProductCard'), {
  loading: () => {
    const ProductCardSkeleton = require('@/components/LoadingStates/ProductCardSkeleton').default;
    return <ProductCardSkeleton />;
  },
});

const ProductRating = dynamic(() => import('@/components/ClientOnlyRating'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
  ),
});

const RatingForm = dynamic(() => import('@/components/RatingForm'), {
  loading: () => (
    <div className="animate-pulse bg-white border rounded-lg p-6">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded mb-4"></div>
      <div className="h-20 bg-gray-200 rounded mb-4"></div>
      <div className="h-10 bg-gray-200 rounded w-32"></div>
    </div>
  ),
});

const RatingsList = dynamic(() => import('@/components/ClientOnlyRatingsList'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="bg-white border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
});

interface ProductDetailClientProps {
  locale: string;
  product: any;
  relatedProducts: any[];
}

// Fetch related products with React Query
async function fetchRelatedProducts(categoryId: string, productId: string) {
  const response = await fetch(`/api/v1/products?category=${categoryId}&limit=8`);
  if (!response.ok) {
    throw new Error('Failed to fetch related products');
  }
  
  const data = await response.json();
  const products = data.products || data.data || data || [];
  const safeProducts = Array.isArray(products) ? products : [];
  return safeProducts.filter((p: any) => p._id !== productId).slice(0, 4);
}

export default function ProductDetailClient({
  locale,
  product,
  relatedProducts: initialRelatedProducts,
}: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [editingRating, setEditingRating] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageLoadStart] = useState(() => performance.now());
  const router = useRouter();
  const { addItem } = useCartStore();
  const { addNotification } = useNotificationStore();
  const messages = useMessages();

  const isRTL = locale === 'ar';
  const title = isRTL ? product.title?.ar || product.title?.en : product.title?.en || product.title?.ar;
  const description = isRTL ? product.description?.ar || product.description?.en : product.description?.en || product.description?.ar;

  // Generate optimized image props for main image
  const mainImageUrl = product.images[selectedImage]?.secure_url || '/mvp-images/1.jpg';
  const optimizedMainImageProps = getOptimizedImageProps(
    mainImageUrl,
    title,
    {
      sizes: RESPONSIVE_SIZES.productDetail,
      quality: 'high',
      fill: true,
      priority: true,
      style: {
        objectFit: "contain",
        objectPosition: "center",
      },
      className: `transition-transform duration-500 hover:scale-105 ${
        imageLoaded ? 'opacity-100' : 'opacity-0'
      }`,
      placeholder: 'blur',
      blurDataURL: generateGradientBlurDataURL(10, 10, ['#f3f4f6', '#e5e7eb']),
    }
  );

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    imagePerformance.trackImageLoad(mainImageUrl, imageLoadStart);
  }, [mainImageUrl, imageLoadStart]);

  // Fetch related products with React Query
  const { data: relatedProductsData = initialRelatedProducts } = useQuery({
    queryKey: ['relatedProducts', product.category?._id, product._id],
    queryFn: () => fetchRelatedProducts(product.category?._id, product._id),
    initialData: initialRelatedProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!product.category?._id,
  });

  // Ensure relatedProducts is always an array
  const relatedProducts = Array.isArray(relatedProductsData) ? relatedProductsData : [];

  // Initialize selected options
  useEffect(() => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0].name);
    }
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0].name);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product.inStock) {
      addNotification({
        type: 'error',
        title: isRTL ? 'خطأ' : 'Error',
        message: isRTL ? 'المنتج غير متوفر حالياً' : 'Product is currently out of stock',
      });
      return;
    }

    const cartItem = {
      id: product._id,
      title: title,
      price: product.promotion?.isOnSale && product.promotion?.salePrice 
        ? product.promotion.salePrice 
        : product.price,
      image: product.images[0]?.secure_url || '/mvp-images/1.jpg',
      quantity,
      size: selectedSize,
      color: selectedColor,
      handle: product.handle,
      currency: product.currency,
    };

    addItem(cartItem);
    addNotification({
      type: 'success',
      title: isRTL ? 'نجح' : 'Success',
      message: isRTL ? 'تم إضافة المنتج إلى السلة' : 'Product added to cart',
    });

    // Show notification prompt after successful add to cart
    setShowNotificationPrompt(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        addNotification({
          type: 'success',
          title: isRTL ? 'نجح' : 'Success',
          message: isRTL ? 'تم نسخ الرابط' : 'Link copied to clipboard',
        });
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      addNotification({
        type: 'success',
        title: isRTL ? 'نجح' : 'Success',
        message: isRTL ? 'تم نسخ الرابط' : 'Link copied to clipboard',
      });
    }
  };

  const handleRatingFormSuccess = () => {
    setShowRatingForm(false);
    setEditingRating(null);
    addNotification({
      type: 'success',
      title: isRTL ? 'نجح' : 'Success',
      message: isRTL ? 'تم حفظ التقييم بنجاح' : 'Rating saved successfully',
    });
  };

  const handleEditRating = (rating: any) => {
    setEditingRating(rating);
    setShowRatingForm(true);
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href={`/${locale}/collections`}
            className="inline-flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            <span>{isRTL ? 'العودة إلى المجموعات' : 'Back to Collections'}</span>
          </Link>
        </motion.div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative w-full aspect-square overflow-hidden rounded-2xl flex items-center justify-center bg-white">
              <Image
                {...optimizedMainImageProps}
                onLoad={handleImageLoad}
                onError={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
              )}
              
              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                  isWishlisted 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/80 text-gray-600 hover:bg-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              {/* Sale Badge */}
              {product.promotion?.isOnSale && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {isRTL ? 'تخفيض' : 'Sale'}
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {Array.isArray(product.images) && product.images.length > 1 && (
              <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto">
                {Array.isArray(product.images) && product.images.map((image: any, index: number) => {
                  const thumbnailProps = getOptimizedImageProps(
                    image.secure_url,
                    `${title} ${index + 1}`,
                    {
                      sizes: RESPONSIVE_SIZES.thumbnail,
                      quality: 'medium',
                      width: 80,
                      height: 80,
                      style: {
                        objectFit: "contain",
                        objectPosition: "center",
                      },
                      className: "w-full h-full",
                      placeholder: 'blur',
                      blurDataURL: generateGradientBlurDataURL(5, 5, ['#f3f4f6', '#e5e7eb']),
                    }
                  );

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors flex items-center justify-center bg-white ${
                        selectedImage === index 
                          ? 'border-black' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image {...thumbnailProps} />
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {decodeHtmlEntities(title)}
              </h1>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(
                    product.promotion?.isOnSale && product.promotion?.salePrice 
                      ? product.promotion.salePrice 
                      : product.price, 
                    product.currency
                  )}
                </span>
                {product.promotion?.isOnSale && (product.promotion.originalPrice || product.price) && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.promotion.originalPrice || product.price, product.currency)}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed">
                {decodeHtmlEntities(description)}
              </p>
            </div>

            {/* Warranty Information */}
            {product.warranty?.hasWarranty && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <WarrantyBadge warranty={product.warranty} locale={locale} size="lg" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {locale === 'ar' ? 'معلومات الضمان' : 'Warranty Information'}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">
                          {locale === 'ar' ? 'مدة الضمان:' : 'Warranty Period:'}
                        </span>{' '}
                        {product.warranty.warrantyPeriod} {locale === 'ar' ? 'شهر' : 'months'}
                      </p>
                      <p>
                        <span className="font-medium">
                          {locale === 'ar' ? 'نوع الضمان:' : 'Warranty Type:'}
                        </span>{' '}
                        {product.warranty.warrantyType === 'seller' 
                          ? (locale === 'ar' ? 'ضمان البائع' : 'Seller Warranty')
                          : product.warranty.warrantyType === 'manufacturer'
                          ? (locale === 'ar' ? 'ضمان الشركة المصنعة' : 'Manufacturer Warranty')
                          : (locale === 'ar' ? 'ضمان ممتد' : 'Extended Warranty')
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Rating */}
            <div className="border-t border-b border-gray-200 py-6">
              <Suspense fallback={
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              }>
                <ProductRating 
                  productId={product._id} 
                  showDetails={true}
                  size="lg"
                  className="mb-4"
                  interactive={true}
                  onClick={() => {
                    // Scroll to ratings section
                    const ratingsSection = document.getElementById('ratings');
                    if (ratingsSection) {
                      ratingsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                />
              </Suspense>
              
              <button
                onClick={() => setShowRatingForm(!showRatingForm)}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {isRTL ? 'إضافة تقييم' : 'Write a Review'}
              </button>
            </div>

            {/* Stock Status */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              product.inStock 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.inStock 
                ? (isRTL ? 'متوفر' : 'In Stock')
                : (isRTL ? 'غير متوفر' : 'Out of Stock')
              }
            </div>

            {/* Size Selection */}
            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  {isRTL ? 'المقاس' : 'Size'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(product.sizes) && product.sizes.map((size: any) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name)}
                      disabled={!size.available}
                      className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                        selectedSize === size.name
                          ? 'border-black bg-black text-white'
                          : size.available
                          ? 'border-gray-300 hover:border-gray-400'
                          : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {Array.isArray(product.colors) && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  {isRTL ? 'اللون' : 'Color'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(product.colors) && product.colors.map((color: any) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      disabled={!color.available}
                      className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                        selectedColor === color.name
                          ? 'border-black bg-black text-white'
                          : color.available
                          ? 'border-gray-300 hover:border-gray-400'
                          : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  {isRTL ? 'الكمية' : 'Quantity'}
                </h3>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-semibold min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-4 rtl:space-x-reverse">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse px-8 py-4 rounded-full font-semibold transition-colors ${
                    product.inStock
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    {isRTL ? 'إضافة إلى السلة' : 'Add to Cart'}
                  </span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-4 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tags */}
            {Array.isArray(product.tags) && product.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  {isRTL ? 'العلامات' : 'Tags'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(product.tags) && product.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Rating Form */}
        {showRatingForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-16"
          >
            <Suspense fallback={
              <div className="animate-pulse bg-white border rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            }>
              <RatingForm
                productId={product._id}
                existingRating={editingRating}
                onSuccess={handleRatingFormSuccess}
                onCancel={() => {
                  setShowRatingForm(false);
                  setEditingRating(null);
                }}
              />
            </Suspense>
          </motion.div>
        )}

        {/* Ratings List */}
        <motion.section
          id="ratings"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <Suspense fallback={
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="bg-white border rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }>
            <RatingsList
              productId={product._id}
              currentUserId={undefined} // TODO: Get from auth context
              onEditRating={handleEditRating}
            />
          </Suspense>
        </motion.section>

        {/* Related Products */}
        {Array.isArray(relatedProducts) && relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {isRTL ? 'منتجات ذات صلة' : 'Related Products'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.isArray(relatedProducts) && relatedProducts.map((relatedProduct: any) => (
                <Suspense
                  key={relatedProduct._id}
                  fallback={
                    <div className="animate-pulse space-y-4">
                      <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  }
                >
                  <OptimizedProductCard product={relatedProduct} />
                </Suspense>
              ))}
            </div>
          </motion.section>
        )}

        {/* Notification Prompt */}
        <NotificationPrompt
          trigger="cart"
          isVisible={showNotificationPrompt}
          onClose={() => setShowNotificationPrompt(false)}
        />
      </div>
    </div>
  );
}