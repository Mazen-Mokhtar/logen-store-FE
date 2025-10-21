'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { useMessages } from '@/hooks/useMessages';
import { useCategories } from '@/hooks/useCategories';
import { useLocale } from '@/hooks/useLocale';

export default function CategoryStrip() {
  const messages = useMessages();
  const { categories, loading, error } = useCategories({ limit: 5 });
  const { locale } = useLocale();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    if (inView && !imagesLoaded && categories?.length > 0) {
      // Preload category images
      const imagePromises = categories?.map((category) => {
        return new Promise((resolve) => {
          const img = new window.Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = category.logo.secure_url;
        });
      }) || [];
      
      Promise.all(imagePromises).then(() => {
        setImagesLoaded(true);
      });
    }
  }, [inView, imagesLoaded, categories]);

  return (
    <section ref={ref} className="category-section py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="section-title text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {messages.categories.title}
          </h2>
        </motion.div>

        {loading ? (
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load categories</p>
          </div>
        ) : (
          <>
            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-6">
              {Array.isArray(categories) && categories.slice(0, 5).map((category, index) => (
                <div
                  key={category._id}
                  className="category-card"
                  style={{ willChange: 'transform' }}
                >
                  <Link href={`/${locale}/collections?category=${encodeURIComponent(category._id)}`} className="group block">
                    <div className="relative aspect-square overflow-hidden rounded-2xl">
                      <Image
                        src={category.logo.secure_url}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        loading={index < 2 ? 'eager' : 'lazy'}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-white text-xl font-bold text-center">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Mobile Horizontal Scroll */}
            <div className="md:hidden">
              <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                {Array.isArray(categories) && categories.slice(0, 5).map((category, index) => (
                  <div
                    key={category._id}
                    className="category-card flex-shrink-0"
                    style={{ willChange: 'transform' }}
                  >
                    <Link href={`/${locale}/collections?category=${encodeURIComponent(category._id)}`} className="group block">
                      <div className="relative w-40 h-40 overflow-hidden rounded-2xl">
                        <Image
                          src={category.logo.secure_url}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="160px"
                          loading="lazy"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <h3 className="text-white text-lg font-bold text-center px-2">
                            {category.name}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}