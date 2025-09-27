import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProductLoading() {
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
          {/* Product Images Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
            <div className="flex space-x-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Size Selection Skeleton */}
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="flex space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-12 h-10 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Color Selection Skeleton */}
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="flex space-x-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-12 h-10 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart Skeleton */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                <div className="w-32 h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-full h-14 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}