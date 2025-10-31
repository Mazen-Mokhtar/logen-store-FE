'use client';

import { memo, Suspense, ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from 'react-error-boundary';

interface ProgressiveLoaderProps {
  children: ReactNode;
  fallback: ReactNode;
  errorFallback?: ReactNode;
  delay?: number;
  minLoadTime?: number;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  className?: string;
}

// Progressive Loader with minimum load time and smooth transitions
export const ProgressiveLoader = memo(({
  children,
  fallback,
  errorFallback,
  delay = 0,
  minLoadTime = 300,
  onLoadStart,
  onLoadComplete,
  className = ''
}: ProgressiveLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [loadStartTime] = useState(Date.now());

  useEffect(() => {
    onLoadStart?.();
    
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Ensure minimum load time for smooth UX
      const elapsed = Date.now() - loadStartTime;
      const remainingTime = Math.max(0, minLoadTime - elapsed);
      
      setTimeout(() => {
        setShowContent(true);
        onLoadComplete?.();
      }, remainingTime);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, minLoadTime, loadStartTime, onLoadStart, onLoadComplete]);

  const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
    <motion.div
      className="flex flex-col items-center justify-center p-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {errorFallback || (
        <>
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">We encountered an error while loading this content.</p>
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
    <div className={className}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AnimatePresence mode="wait">
          {!showContent ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Suspense fallback={fallback}>
                {fallback}
              </Suspense>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Suspense fallback={fallback}>
                {children}
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </ErrorBoundary>
    </div>
  );
});

ProgressiveLoader.displayName = 'ProgressiveLoader';

// Page-level progressive loader with route transition
export const PageProgressiveLoader = memo(({
  children,
  fallback,
  className = "min-h-screen"
}: {
  children: ReactNode;
  fallback: ReactNode;
  className?: string;
}) => {
  return (
    <ProgressiveLoader
      className={className}
      fallback={fallback}
      minLoadTime={200}
      delay={0}
    >
      {children}
    </ProgressiveLoader>
  );
});

PageProgressiveLoader.displayName = 'PageProgressiveLoader';

// Component-level progressive loader for smaller sections
export const ComponentProgressiveLoader = memo(({
  children,
  fallback,
  className = ""
}: {
  children: ReactNode;
  fallback: ReactNode;
  className?: string;
}) => {
  return (
    <ProgressiveLoader
      className={className}
      fallback={fallback}
      minLoadTime={100}
      delay={50}
    >
      {children}
    </ProgressiveLoader>
  );
});

ComponentProgressiveLoader.displayName = 'ComponentProgressiveLoader';

// Image progressive loader with blur-to-sharp transition
export const ImageProgressiveLoader = memo(({
  src,
  alt,
  className = "",
  blurDataURL,
  priority = false,
  sizes,
  fill = false,
  width,
  height,
  onLoad,
  onError
}: {
  src: string;
  alt: string;
  className?: string;
  blurDataURL?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <motion.img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoaded ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Actual image */}
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ 
          width: fill ? '100%' : width,
          height: fill ? '100%' : height
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        sizes={sizes}
      />
      
      {/* Loading indicator */}
      {!isLoaded && !hasError && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-gray-100"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoaded ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      )}
    </div>
  );
});

ImageProgressiveLoader.displayName = 'ImageProgressiveLoader';

// Data progressive loader with retry mechanism
export const DataProgressiveLoader = memo(({
  children,
  fallback,
  isLoading,
  error,
  retry,
  retryDelay = 1000,
  maxRetries = 3,
  className = ""
}: {
  children: ReactNode;
  fallback: ReactNode;
  isLoading: boolean;
  error?: Error | null;
  retry?: () => void;
  retryDelay?: number;
  maxRetries?: number;
  className?: string;
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (retryCount >= maxRetries || !retry) return;
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    setTimeout(() => {
      retry();
      setIsRetrying(false);
    }, retryDelay);
  };

  if (error && !isRetrying) {
    return (
      <motion.div
        className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-red-500 mb-4">
          <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load</h3>
        <p className="text-gray-600 mb-4 text-sm">{error.message}</p>
        {retryCount < maxRetries && retry && (
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Retry ({maxRetries - retryCount} attempts left)
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isLoading || isRetrying ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={className}
        >
          {fallback}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

DataProgressiveLoader.displayName = 'DataProgressiveLoader';

// Infinite scroll progressive loader
export const InfiniteScrollLoader = memo(({
  hasMore,
  isLoading,
  onLoadMore,
  className = ""
}: {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  className?: string;
}) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const trigger = document.getElementById('infinite-scroll-trigger');
    if (trigger) observer.observe(trigger);

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  if (!hasMore) return null;

  return (
    <motion.div
      id="infinite-scroll-trigger"
      className={`flex items-center justify-center py-8 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {isLoading ? (
        <motion.div
          className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <button
          onClick={onLoadMore}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Load More
        </button>
      )}
    </motion.div>
  );
});

InfiniteScrollLoader.displayName = 'InfiniteScrollLoader';