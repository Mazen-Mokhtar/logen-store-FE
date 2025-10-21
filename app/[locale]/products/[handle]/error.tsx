'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Product page error:', error);
  }, [error]);

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
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            We encountered an error while loading this product. Please try again.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-8 p-4 bg-gray-100 rounded-lg text-left max-w-2xl mx-auto">
              <p className="text-sm font-mono text-red-600">
                {error.message}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={reset}
              className="inline-flex items-center space-x-2 bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <div>
              <Link
                href="/collections"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}