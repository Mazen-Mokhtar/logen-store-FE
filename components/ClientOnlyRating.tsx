'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with no SSR to prevent hydration issues
const ProductRating = dynamic(() => import('./ProductRating'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-5 h-5 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="w-8 h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
  ),
});

interface ClientOnlyRatingProps {
  productId: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export default function ClientOnlyRating(props: ClientOnlyRatingProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-5 h-5 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="w-8 h-4 bg-gray-200 rounded"></div>
          {props.showDetails && <div className="w-16 h-4 bg-gray-200 rounded"></div>}
        </div>
      </div>
    );
  }

  return <ProductRating {...props} />;
}