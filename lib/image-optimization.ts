/**
 * Enterprise-grade Image Optimization Utilities
 * 
 * This module provides comprehensive image optimization strategies including:
 * - Next.js Image component configurations
 * - Priority loading for above-the-fold images
 * - Lazy loading with intersection observer
 * - Responsive image sizing
 * - WebP/AVIF format optimization
 * - Blur placeholder generation
 */

import React from 'react';
import { ImageProps } from 'next/image';

// Image optimization configurations
export const IMAGE_CONFIG = {
  // Device sizes for responsive images
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  
  // Image sizes for different use cases
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  
  // Quality settings for different contexts
  quality: {
    high: 90,      // Hero images, product galleries
    medium: 75,    // Product cards, thumbnails
    low: 60,       // Background images, decorative
    placeholder: 20 // Blur placeholders
  },
  
  // Format preferences
  formats: ['image/avif', 'image/webp', 'image/jpeg'],
  
  // Cache TTL
  cacheTTL: 31536000, // 1 year
} as const;

// Responsive image sizes for different components
export const RESPONSIVE_SIZES = {
  // Hero images - full width on all devices
  hero: '100vw',
  
  // Product gallery - responsive grid
  productGallery: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  
  // Product cards in grid
  productCard: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  
  // Product detail main image
  productDetail: '(max-width: 768px) 100vw, 50vw',
  
  // Thumbnails
  thumbnail: '(max-width: 768px) 20vw, 10vw',
  
  // Avatar/profile images
  avatar: '(max-width: 768px) 15vw, 8vw',
  
  // Logo
  logo: '(max-width: 768px) 40vw, 20vw',
} as const;

// Priority loading configuration
export const PRIORITY_CONFIG = {
  // Images that should load with priority
  aboveFold: [
    'hero',
    'logo',
    'featured-product',
    'main-banner'
  ],
  
  // Maximum number of priority images per page
  maxPriorityImages: 3,
  
  // Viewport threshold for lazy loading
  lazyThreshold: 0.1,
  
  // Root margin for intersection observer
  rootMargin: '50px',
} as const;

// Optimized Image component props generator
export function getOptimizedImageProps(
  src: string,
  alt: string,
  options: {
    priority?: boolean;
    sizes?: string;
    quality?: keyof typeof IMAGE_CONFIG.quality;
    fill?: boolean;
    width?: number;
    height?: number;
    className?: string;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    style?: React.CSSProperties;
  } = {}
): Partial<ImageProps> {
  const {
    priority = false,
    sizes = RESPONSIVE_SIZES.productCard,
    quality = 'medium',
    fill = false,
    width,
    height,
    className = '',
    placeholder = 'blur',
    blurDataURL,
    style
  } = options;

  const baseProps: Partial<ImageProps> = {
    src,
    alt,
    quality: IMAGE_CONFIG.quality[quality],
    sizes,
    className,
    priority,
    placeholder: blurDataURL ? 'blur' : placeholder,
    blurDataURL,
  };

  if (fill) {
    baseProps.fill = true;
    // Use custom style if provided, otherwise default to cover
    baseProps.style = style || { objectFit: 'cover' };
  } else if (width && height) {
    baseProps.width = width;
    baseProps.height = height;
    // Apply custom style for non-fill images too
    if (style) {
      baseProps.style = style;
    }
  }

  return baseProps;
}

// Generate blur placeholder data URL
export function generateBlurDataURL(
  width: number = 10,
  height: number = 10,
  color: string = '#f3f4f6'
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Advanced blur placeholder with gradient
export function generateGradientBlurDataURL(
  width: number = 10,
  height: number = 10,
  colors: string[] = ['#f3f4f6', '#e5e7eb']
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
    </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

// Image preloader utility
export class ImagePreloader {
  private static preloadedImages = new Set<string>();
  
  static preload(src: string, priority: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.preloadedImages.has(src)) {
        resolve();
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        this.preloadedImages.add(src);
        resolve();
      };
      img.onerror = reject;
      
      if (priority) {
        img.fetchPriority = 'high';
      }
      
      img.src = src;
    });
  }
  
  static preloadMultiple(sources: string[], priority: boolean = false): Promise<void[]> {
    return Promise.all(sources.map(src => this.preload(src, priority)));
  }
  
  static isPreloaded(src: string): boolean {
    return this.preloadedImages.has(src);
  }
  
  static clear(): void {
    this.preloadedImages.clear();
  }
}

// Lazy loading intersection observer
export class LazyImageObserver {
  private static observer: IntersectionObserver | null = null;
  private static callbacks = new Map<Element, () => void>();
  
  static init(): void {
    if (typeof window === 'undefined' || this.observer) return;
    
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = this.callbacks.get(entry.target);
            if (callback) {
              callback();
              this.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: PRIORITY_CONFIG.lazyThreshold,
        rootMargin: PRIORITY_CONFIG.rootMargin,
      }
    );
  }
  
  static observe(element: Element, callback: () => void): void {
    this.init();
    if (!this.observer) return;
    
    this.callbacks.set(element, callback);
    this.observer.observe(element);
  }
  
  static unobserve(element: Element): void {
    if (!this.observer) return;
    
    this.observer.unobserve(element);
    this.callbacks.delete(element);
  }
  
  static disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.callbacks.clear();
      this.observer = null;
    }
  }
}

// Image optimization utilities
export const imageUtils = {
  // Get optimized image URL for external images
  getOptimizedUrl: (
    src: string,
    width: number,
    height?: number,
    quality: number = IMAGE_CONFIG.quality.medium
  ): string => {
    if (src.startsWith('/')) {
      // Local images - use Next.js optimization
      const params = new URLSearchParams({
        url: src,
        w: width.toString(),
        q: quality.toString(),
      });
      
      if (height) {
        params.append('h', height.toString());
      }
      
      return `/_next/image?${params.toString()}`;
    }
    
    // External images - use image proxy API
    const params = new URLSearchParams({
      url: src,
      w: width.toString(),
      q: quality.toString(),
    });
    
    if (height) {
      params.append('h', height.toString());
    }
    
    return `/api/image-proxy?${params.toString()}`;
  },
  
  // Calculate aspect ratio
  getAspectRatio: (width: number, height: number): string => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    return `${width / divisor}/${height / divisor}`;
  },
  
  // Get responsive breakpoints
  getResponsiveBreakpoints: (baseWidth: number): number[] => {
    return IMAGE_CONFIG.deviceSizes.filter(size => size <= baseWidth * 2);
  },
  
  // Generate srcSet for responsive images
  generateSrcSet: (src: string, baseWidth: number, quality?: number): string => {
    const breakpoints = imageUtils.getResponsiveBreakpoints(baseWidth);
    return breakpoints
      .map(width => `${imageUtils.getOptimizedUrl(src, width, undefined, quality)} ${width}w`)
      .join(', ');
  },
};

// Performance monitoring for images
export const imagePerformance = {
  // Track image loading performance
  trackImageLoad: (src: string, startTime: number): void => {
    const loadTime = performance.now() - startTime;
    
    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'image_load', {
        event_category: 'performance',
        event_label: src,
        value: Math.round(loadTime),
      });
    }
    
    // Log slow images in development
    if (process.env.NODE_ENV === 'development' && loadTime > 1000) {
      console.warn(`Slow image load: ${src} took ${loadTime.toFixed(2)}ms`);
    }
  },
  
  // Track Largest Contentful Paint for images
  trackLCP: (element: Element): void => {
    if (typeof window === 'undefined') return;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry.element === element) {
        // Send LCP data to analytics
        if (window.gtag) {
          window.gtag('event', 'lcp_image', {
            event_category: 'performance',
            value: Math.round(lastEntry.startTime),
          });
        }
      }
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  },
};

// Export types
export type ImageQuality = keyof typeof IMAGE_CONFIG.quality;
export type ResponsiveSizes = keyof typeof RESPONSIVE_SIZES;