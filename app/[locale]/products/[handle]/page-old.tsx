'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useCartStore, useLanguageStore } from '@/lib/store';
import { useMessages } from '@/hooks/useMessages';
import { formatPrice, decodeHtmlEntities } from '@/lib/utils';
import { useProduct } from '@/hooks/useProducts';
import { useProducts } from '@/hooks/useProducts';
import { useNotificationStore } from '@/lib/store';

// Lazy load related products section
const ProductCard = dynamic(() => import('@/components/ProductCard'), {
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="aspect-square bg-gray-200 rounded-2xl"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  ),
});

interface ProductPageProps {
  params: {
    handle: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const { addItem } = useCartStore();
  const { addNotification } = useNotificationStore();
  const { language } = useLanguageStore();
  const messages = useMessages();

  const { product, loading, error } = useProduct(undefined, params.handle);
  const { products: relatedProducts } = useProducts({
    category: product?.category._id,
    limit: 4,
    autoFetch: !!product?.category._id,
  });

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0]?.name || '');
      setSelectedColor(product.colors?.[0]?.name || '');
    }
  }, [product]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/collections"
            className="inline-flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Collections</span>
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
              <div className="flex space-x-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-20 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/collections"
            className="inline-flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Collections</span>
          </Link>
          
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {error || "The product you're looking for doesn't exist or may have been removed."}
            </p>
            <div className="space-y-4">
              <Link
                href="/collections"
                className="inline-block bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
              >
                Browse All Products
              </Link>
              <div>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Go to Homepage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const title = language === 'ar' ? product.title.ar : product.title.en;
  const description = language === 'ar' ? product.description.ar : product.description.en;
  const isOnSale = product.promotion?.isOnSale || false;
  const salePrice = product.promotion?.salePrice;
  const originalPrice = product.promotion?.originalPrice;

  const filteredRelatedProducts = relatedProducts
    .filter(p => p._id !== product._id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!product.inStock) return;

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product._id,
        title,
        price: product.price,
        image: product.images[0]?.secure_url || '/placeholder-image.jpg',
        size: selectedSize,
        color: selectedColor,
      });
    }
    
    // Show success notification
    addNotification({
      type: 'success',
      title: 'Added to Cart',
      message: `${quantity} ${title} added to your cart`,
    });
  };

  return (
    <div className="pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/collections"
          className="inline-flex items-center space-x-2 rtl:space-x-reverse text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collections</span>
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100"
            >
              <Image
                src={decodeHtmlEntities(product.images[selectedImage]?.secure_url || '/placeholder-image.jpg')}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              />
              {isOnSale && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {messages.products.sale}
                </div>
              )}
            </motion.div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-4 rtl:space-x-reverse">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-black' : ''
                    }`}
                  >
                    <Image
                      src={decodeHtmlEntities(image.secure_url)}
                      alt={`${title} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h1>
              
              <div className="flex items-center space-x-4 rtl:space-x-reverse mb-6">
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {isOnSale && originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-lg leading-relaxed">
                {description}
              </p>
            </motion.div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && product.sizes.some(s => s.available) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-3">{messages.products.size}</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.filter(s => s.available).map((size) => (
                    <button
                      key={size.name}
                      onClick={() => setSelectedSize(size.name || '')}
                      className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                        selectedSize === size.name
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && product.colors.some(c => c.available) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold mb-3">{messages.products.color}</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.filter(c => c.available).map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name || '')}
                      className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                        selectedColor === color.name
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quantity and Add to Cart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-lg font-semibold mb-3">{messages.products.quantity}</h3>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-3 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full bg-black text-white py-4 rounded-full font-semibold text-lg flex items-center justify-center space-x-3 rtl:space-x-reverse hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>
                  {product.inStock ? messages.products.addToCart : messages.products.outOfStock}
                </span>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Related Products */}
        {filteredRelatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
              {messages.products.relatedProducts}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRelatedProducts.map((relatedProduct) => (
                <div key={relatedProduct._id} className="product-card">
                  <Suspense fallback={
                    <div className="animate-pulse space-y-4">
                      <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  }>
                    <ProductCard product={relatedProduct} />
                  </Suspense>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}