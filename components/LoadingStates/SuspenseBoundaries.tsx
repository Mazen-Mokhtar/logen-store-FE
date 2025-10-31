'use client';

import { Suspense, ReactNode, memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import {
  ProductDetailSkeleton,
  ProductGridSkeleton,
  HeaderSkeleton,
  CollectionsSkeleton,
  CartDrawerSkeleton,
  SearchResultsSkeleton,
  PageTransitionSkeleton
} from './AdvancedSkeletons';

interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  name?: string;
  className?: string;
}

// Base Suspense Boundary with Error Handling
export const BaseSuspenseBoundary = memo(({
  children,
  fallback,
  errorFallback,
  name = 'Component',
  className = ''
}: SuspenseBoundaryProps) => {
  const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
    <motion.div
      className="flex flex-col items-center justify-center p-8 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {errorFallback || (
        <>
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to load {name}
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            {error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try again
          </button>
        </>
      )}
    </motion.div>
  );

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={fallback}>
        <div className={className}>
          {children}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
});

BaseSuspenseBoundary.displayName = 'BaseSuspenseBoundary';

// Page-level Suspense Boundary
export const PageSuspenseBoundary = memo(({ 
  children, 
  pageName = 'Page',
  className = 'min-h-screen'
}: {
  children: ReactNode;
  pageName?: string;
  className?: string;
}) => (
  <BaseSuspenseBoundary
    name={pageName}
    fallback={<PageTransitionSkeleton />}
    className={className}
  >
    {children}
  </BaseSuspenseBoundary>
));

PageSuspenseBoundary.displayName = 'PageSuspenseBoundary';

// Product Detail Suspense Boundary
export const ProductDetailSuspenseBoundary = memo(({ children }: { children: ReactNode }) => (
  <BaseSuspenseBoundary
    name="Product Details"
    fallback={<ProductDetailSkeleton />}
  >
    {children}
  </BaseSuspenseBoundary>
));

ProductDetailSuspenseBoundary.displayName = 'ProductDetailSuspenseBoundary';

// Product Grid Suspense Boundary
export const ProductGridSuspenseBoundary = memo(({ 
  children, 
  count = 8 
}: { 
  children: ReactNode;
  count?: number;
}) => (
  <BaseSuspenseBoundary
    name="Product Grid"
    fallback={<ProductGridSkeleton count={count} />}
  >
    {children}
  </BaseSuspenseBoundary>
));

ProductGridSuspenseBoundary.displayName = 'ProductGridSuspenseBoundary';

// Header Suspense Boundary
export const HeaderSuspenseBoundary = memo(({ children }: { children: ReactNode }) => (
  <BaseSuspenseBoundary
    name="Header"
    fallback={<HeaderSkeleton />}
  >
    {children}
  </BaseSuspenseBoundary>
));

HeaderSuspenseBoundary.displayName = 'HeaderSuspenseBoundary';

// Collections Suspense Boundary
export const CollectionsSuspenseBoundary = memo(({ children }: { children: ReactNode }) => (
  <BaseSuspenseBoundary
    name="Collections"
    fallback={<CollectionsSkeleton />}
  >
    {children}
  </BaseSuspenseBoundary>
));

CollectionsSuspenseBoundary.displayName = 'CollectionsSuspenseBoundary';

// Cart Drawer Suspense Boundary
export const CartDrawerSuspenseBoundary = memo(({ children }: { children: ReactNode }) => (
  <BaseSuspenseBoundary
    name="Cart"
    fallback={<CartDrawerSkeleton />}
  >
    {children}
  </BaseSuspenseBoundary>
));

CartDrawerSuspenseBoundary.displayName = 'CartDrawerSuspenseBoundary';

// Search Results Suspense Boundary
export const SearchResultsSuspenseBoundary = memo(({ children }: { children: ReactNode }) => (
  <BaseSuspenseBoundary
    name="Search Results"
    fallback={<SearchResultsSkeleton />}
  >
    {children}
  </BaseSuspenseBoundary>
));

SearchResultsSuspenseBoundary.displayName = 'SearchResultsSuspenseBoundary';

// Nested Suspense Boundary for granular loading
export const NestedSuspenseBoundary = memo(({
  children,
  fallback,
  level = 1,
  name = 'Component'
}: {
  children: ReactNode;
  fallback: ReactNode;
  level?: number;
  name?: string;
}) => {
  const delay = level * 50; // Stagger nested loading

  return (
    <BaseSuspenseBoundary
      name={name}
      fallback={
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: delay / 1000 }}
        >
          {fallback}
        </motion.div>
      }
    >
      {children}
    </BaseSuspenseBoundary>
  );
});

NestedSuspenseBoundary.displayName = 'NestedSuspenseBoundary';

// Streaming Suspense Boundary for progressive rendering
export const StreamingSuspenseBoundary = memo(({
  children,
  chunks,
  className = ''
}: {
  children: ReactNode;
  chunks: Array<{
    component: ReactNode;
    fallback: ReactNode;
    priority: number;
  }>;
  className?: string;
}) => {
  const sortedChunks = chunks.sort((a, b) => a.priority - b.priority);

  return (
    <div className={className}>
      {sortedChunks.map((chunk, index) => (
        <NestedSuspenseBoundary
          key={index}
          level={index + 1}
          fallback={chunk.fallback}
          name={`Chunk ${index + 1}`}
        >
          {chunk.component}
        </NestedSuspenseBoundary>
      ))}
      
      {/* Main content with lowest priority */}
      <NestedSuspenseBoundary
        level={sortedChunks.length + 1}
        fallback={<div className="animate-pulse bg-gray-200 h-32 rounded" />}
        name="Main Content"
      >
        {children}
      </NestedSuspenseBoundary>
    </div>
  );
});

StreamingSuspenseBoundary.displayName = 'StreamingSuspenseBoundary';

// Route Transition Suspense Boundary
export const RouteTransitionBoundary = memo(({
  children,
  isTransitioning = false
}: {
  children: ReactNode;
  isTransitioning?: boolean;
}) => {
  if (isTransitioning) {
    return <PageTransitionSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <PageSuspenseBoundary>
        {children}
      </PageSuspenseBoundary>
    </motion.div>
  );
});

RouteTransitionBoundary.displayName = 'RouteTransitionBoundary';

// Critical Resource Suspense Boundary
export const CriticalResourceBoundary = memo(({
  children,
  resources = [],
  fallback
}: {
  children: ReactNode;
  resources?: string[];
  fallback?: ReactNode;
}) => {
  // Preload critical resources
  if (typeof window !== 'undefined') {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.match(/\.(woff2?|ttf|eot)$/)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      } else if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
        link.as = 'image';
      }
      
      if (!document.querySelector(`link[href="${resource}"]`)) {
        document.head.appendChild(link);
      }
    });
  }

  return (
    <BaseSuspenseBoundary
      name="Critical Resources"
      fallback={fallback || <PageTransitionSkeleton />}
    >
      {children}
    </BaseSuspenseBoundary>
  );
});

CriticalResourceBoundary.displayName = 'CriticalResourceBoundary';

// Lazy Component Suspense Boundary
export const LazyComponentBoundary = memo(({
  children,
  fallback,
  timeout = 5000,
  name = 'Lazy Component'
}: {
  children: ReactNode;
  fallback?: ReactNode;
  timeout?: number;
  name?: string;
}) => {
  return (
    <BaseSuspenseBoundary
      name={name}
      fallback={
        fallback || (
          <motion.div
            className="flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </motion.div>
        )
      }
    >
      {children}
    </BaseSuspenseBoundary>
  );
});

LazyComponentBoundary.displayName = 'LazyComponentBoundary';