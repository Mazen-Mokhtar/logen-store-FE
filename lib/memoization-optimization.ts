/**
 * Enterprise-grade Memoization and React 18 Concurrency Optimizations
 * 
 * This module provides comprehensive performance optimization strategies including:
 * - React.memo with custom comparison functions
 * - useMemo and useCallback optimizations
 * - React 18 concurrent features (Suspense, Transitions, Deferred Values)
 * - Component-level performance monitoring
 * - Memory leak prevention
 */

import { 
  memo, 
  useMemo, 
  useCallback, 
  useTransition, 
  useDeferredValue, 
  startTransition,
  ComponentType,
  ReactElement,
  DependencyList,
  MutableRefObject,
  useRef,
  useEffect
} from 'react';

// Memoization utilities
export const memoizationUtils = {
  // Deep comparison for complex objects
  deepCompare: (prevProps: any, nextProps: any): boolean => {
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);
    
    if (prevKeys.length !== nextKeys.length) {
      return false;
    }
    
    for (const key of prevKeys) {
      if (prevProps[key] !== nextProps[key]) {
        // For arrays and objects, do shallow comparison
        if (Array.isArray(prevProps[key]) && Array.isArray(nextProps[key])) {
          if (prevProps[key].length !== nextProps[key].length) {
            return false;
          }
          for (let i = 0; i < prevProps[key].length; i++) {
            if (prevProps[key][i] !== nextProps[key][i]) {
              return false;
            }
          }
        } else if (
          typeof prevProps[key] === 'object' && 
          typeof nextProps[key] === 'object' &&
          prevProps[key] !== null &&
          nextProps[key] !== null
        ) {
          const prevObjKeys = Object.keys(prevProps[key]);
          const nextObjKeys = Object.keys(nextProps[key]);
          
          if (prevObjKeys.length !== nextObjKeys.length) {
            return false;
          }
          
          for (const objKey of prevObjKeys) {
            if (prevProps[key][objKey] !== nextProps[key][objKey]) {
              return false;
            }
          }
        } else {
          return false;
        }
      }
    }
    
    return true;
  },
  
  // Shallow comparison for simple objects
  shallowCompare: (prevProps: any, nextProps: any): boolean => {
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);
    
    if (prevKeys.length !== nextKeys.length) {
      return false;
    }
    
    for (const key of prevKeys) {
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }
    
    return true;
  },
  
  // Product-specific comparison
  productCompare: (prevProps: any, nextProps: any): boolean => {
    // Compare essential product properties
    const essentialProps = ['_id', 'title', 'price', 'images', 'inStock', 'promotion'];
    
    for (const prop of essentialProps) {
      if (prevProps.product?.[prop] !== nextProps.product?.[prop]) {
        return false;
      }
    }
    
    // Compare other props
    return memoizationUtils.shallowCompare(
      { ...prevProps, product: undefined },
      { ...nextProps, product: undefined }
    );
  },
};

// Enhanced memo HOCs
export const createMemoizedComponent = <T extends ComponentType<any>>(
  Component: T,
  compareFunction?: (prevProps: any, nextProps: any) => boolean
) => {
  const MemoizedComponent = memo(Component, compareFunction);
  MemoizedComponent.displayName = `Memoized(${Component.displayName || Component.name})`;
  return MemoizedComponent;
};

// Product-specific memoized components
export const MemoizedProductCard = createMemoizedComponent(
  (props: any) => props.children,
  memoizationUtils.productCompare
);

export const MemoizedProductList = createMemoizedComponent(
  (props: any) => props.children,
  (prevProps, nextProps) => {
    // Compare products array length and IDs
    if (prevProps.products?.length !== nextProps.products?.length) {
      return false;
    }
    
    if (prevProps.products) {
      for (let i = 0; i < prevProps.products.length; i++) {
        if (prevProps.products[i]._id !== nextProps.products[i]._id) {
          return false;
        }
      }
    }
    
    return memoizationUtils.shallowCompare(
      { ...prevProps, products: undefined },
      { ...nextProps, products: undefined }
    );
  }
);

// Optimized hooks
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList,
  debugName?: string
): T => {
  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);
  
  // Update callback if dependencies changed
  const depsChanged = useMemo(() => {
    if (!depsRef.current || depsRef.current.length !== deps.length) {
      return true;
    }
    
    return deps.some((dep, index) => dep !== depsRef.current[index]);
  }, deps);
  
  if (depsChanged) {
    callbackRef.current = callback;
    depsRef.current = deps;
  }
  
  return useCallback(callbackRef.current, deps);
};

export const useOptimizedMemo = <T>(
  factory: () => T,
  deps: DependencyList,
  debugName?: string
): T => {
  const result = useMemo(() => {
    const startTime = performance.now();
    const value = factory();
    const endTime = performance.now();
    
    if (process.env.NODE_ENV === 'development' && debugName) {
      console.log(`useMemo[${debugName}] took ${(endTime - startTime).toFixed(2)}ms`);
    }
    
    return value;
  }, deps);
  
  return result;
};

// React 18 Concurrent Features
export const useConcurrentFeatures = () => {
  const [isPending, startTransition] = useTransition();
  
  const deferredTransition = useCallback((callback: () => void) => {
    startTransition(() => {
      callback();
    });
  }, []);
  
  const deferredValue = <T>(value: T): T => {
    return useDeferredValue(value);
  };
  
  return {
    isPending,
    deferredTransition,
    deferredValue,
    startTransition,
  };
};

// Performance monitoring for components
export const useComponentPerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);
  const mountTime = useRef(performance.now());
  
  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current} at ${currentTime.toFixed(2)}ms`);
      
      if (lastRenderTime.current > 0) {
        const timeSinceLastRender = currentTime - lastRenderTime.current;
        if (timeSinceLastRender < 16) { // Less than one frame
          console.warn(`${componentName} rendered too frequently: ${timeSinceLastRender.toFixed(2)}ms since last render`);
        }
      }
    }
    
    lastRenderTime.current = currentTime;
  });
  
  useEffect(() => {
    return () => {
      const unmountTime = performance.now();
      const totalLifetime = unmountTime - mountTime.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} unmounted after ${totalLifetime.toFixed(2)}ms, ${renderCount.current} renders`);
      }
    };
  }, [componentName]);
  
  return {
    renderCount: renderCount.current,
    mountTime: mountTime.current,
  };
};

// Memory leak prevention
export const useMemoryLeakPrevention = () => {
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const abortControllersRef = useRef<Set<AbortController>>(new Set());
  
  const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
    const timeoutId = setTimeout(() => {
      callback();
      timeoutsRef.current.delete(timeoutId);
    }, delay);
    
    timeoutsRef.current.add(timeoutId);
    return timeoutId;
  }, []);
  
  const safeSetInterval = useCallback((callback: () => void, delay: number) => {
    const intervalId = setInterval(callback, delay);
    intervalsRef.current.add(intervalId);
    return intervalId;
  }, []);
  
  const createAbortController = useCallback(() => {
    const controller = new AbortController();
    abortControllersRef.current.add(controller);
    return controller;
  }, []);
  
  const cleanup = useCallback(() => {
    // Clear timeouts
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current.clear();
    
    // Clear intervals
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current.clear();
    
    // Abort controllers
    abortControllersRef.current.forEach(controller => controller.abort());
    abortControllersRef.current.clear();
  }, []);
  
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  
  return {
    safeSetTimeout,
    safeSetInterval,
    createAbortController,
    cleanup,
  };
};

// Optimized list rendering
export const useVirtualizedList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    visibleRange,
  };
};

// Export types
export type MemoizedComponent<T> = T & {
  displayName?: string;
};

export type ConcurrentFeatures = ReturnType<typeof useConcurrentFeatures>;
export type ComponentPerformance = ReturnType<typeof useComponentPerformance>;
export type MemoryLeakPrevention = ReturnType<typeof useMemoryLeakPrevention>;
export type VirtualizedList<T> = ReturnType<typeof useVirtualizedList<T>>;