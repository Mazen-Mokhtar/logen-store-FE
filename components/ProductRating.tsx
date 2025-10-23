'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { useProductRatingStats } from '@/hooks/useRatings';
import { useLocale } from '@/hooks/useLocale';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface ProductRatingProps {
  productId: string;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  showValue = true, 
  size = 'md',
  className = '' 
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span 
          key={`full-${i}`} 
          className="text-yellow-400 inline-block"
          style={{ 
            fontSize: 'inherit',
            lineHeight: '1',
            display: 'inline-block',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          ★
        </span>
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <span 
          key="half" 
          className="text-yellow-400 relative inline-block"
          style={{ 
            fontSize: 'inherit',
            lineHeight: '1',
            display: 'inline-block',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          <span 
            className="absolute inset-0 overflow-hidden"
            style={{ width: '50%' }}
          >
            ★
          </span>
          <span className="text-gray-300">★</span>
        </span>
      );
    }

    // Empty stars
    const emptyStars = maxRating - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span 
          key={`empty-${i}`} 
          className="text-gray-300 inline-block"
          style={{ 
            fontSize: 'inherit',
            lineHeight: '1',
            display: 'inline-block',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          ☆
        </span>
      );
    }

    return stars;
  };

  return (
    <div
      className={`product-rating flex items-center gap-1 ${sizeClasses[size]} ${className}`}
    >
      <div className="flex">
        {renderStars()}
      </div>
      {showValue && (
        <span className="text-gray-600 ml-1">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}

export function ProductRating({ 
  productId, 
  showDetails = false, 
  size = 'md', 
  className = '',
  onClick,
  interactive = false
}: ProductRatingProps) {
  const { locale, messages } = useLocale();
  const { data: statsData, isLoading, error } = useProductRatingStats(productId);

  // إضافة logs لتتبع البيانات
  console.log('🔍 ProductRating Debug Info:');
  console.log('📦 Product ID:', productId);
  console.log('⏳ Is Loading:', isLoading);
  console.log('❌ Error:', error);
  console.log('📊 Stats Data:', statsData);
  console.log('🌐 Window available:', typeof window !== 'undefined');

  const handleClick = () => {
    if (interactive && onClick) {
      onClick();
    }
  };

  // Show loading state during SSR and initial client load
  if (typeof window === 'undefined' || isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-5 h-5 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="w-8 h-4 bg-gray-200 rounded"></div>
          {showDetails && <div className="w-16 h-4 bg-gray-200 rounded"></div>}
        </div>
      </div>
    );
  }

  if (error || !statsData) {
    return null;
  }

  // Handle different response structures
  const stats = statsData.data || statsData;
  const { averageRating, totalRatings, ratingDistribution } = stats;

  // إضافة logs إضافية لتتبع البيانات المستخرجة
  console.log('📊 Extracted Stats:', { averageRating, totalRatings, ratingDistribution });
  console.log('🔢 Total Ratings Check:', totalRatings, typeof totalRatings);
  console.log('⭐ Average Rating Check:', averageRating, typeof averageRating);

  if (totalRatings === 0) {
    return (
      <div 
        className={`flex items-center gap-2 ${interactive ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
        onClick={handleClick}
      >
        <StarRating rating={0} size={size} showValue={false} />
        <span className="text-gray-500 text-sm">
          {messages?.noRatings || 'No ratings yet'}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`${interactive ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <StarRating rating={averageRating} size={size} />
        {showDetails && (
          <span className="text-gray-600 text-sm">
            ({totalRatings} {totalRatings === 1 ? 
              (messages?.review || 'review') : 
              (messages?.reviews || 'reviews')
            })
          </span>
        )}
      </div>
      
      {showDetails && ratingDistribution && typeof ratingDistribution === 'object' && (
        <div className="mt-3 space-y-2">
          {Object.entries(ratingDistribution || {})
            .filter(([rating, count]) => {
              const numCount = Number(count);
              return !isNaN(numCount) && numCount > 0;
            })
            .reverse()
            .map(([rating, count]) => {
              const numCount = Number(count) || 0;
              const percentage = totalRatings > 0 ? (numCount / totalRatings) * 100 : 0;
              return (
                <div key={`rating-${rating}`} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-gray-600">{rating}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-gray-600 text-xs">
                    {numCount}
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default ProductRating;