'use client';

import React from 'react';
import { useLocale } from '@/hooks/useLocale';

interface WarrantyBadgeProps {
  warranty: {
    hasWarranty: boolean;
    warrantyPeriod?: number;
    warrantyType?: 'seller' | 'manufacturer' | 'extended';
  };
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const WarrantyBadge: React.FC<WarrantyBadgeProps> = ({ 
  warranty, 
  size = 'medium', 
  className = '' 
}) => {
  const { locale } = useLocale();
  
  if (!warranty?.hasWarranty) {
    return null;
  }

  const isArabic = locale === 'ar';
  
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const getWarrantyText = () => {
    if (isArabic) {
      const period = warranty.warrantyPeriod;
      const typeText = warranty.warrantyType === 'manufacturer' ? 'ضمان الشركة' : 
                      warranty.warrantyType === 'extended' ? 'ضمان ممتد' : 'ضمان البائع';
      
      if (period) {
        const periodText = period === 1 ? 'شهر' : 
                          period <= 10 ? `${period} أشهر` : 
                          period === 12 ? 'سنة' : 
                          period === 24 ? 'سنتان' : 
                          `${period} شهر`;
        return `${typeText} ${periodText}`;
      }
      return typeText;
    } else {
      const period = warranty.warrantyPeriod;
      const typeText = warranty.warrantyType === 'manufacturer' ? 'Manufacturer' : 
                      warranty.warrantyType === 'extended' ? 'Extended' : 'Seller';
      
      if (period) {
        const periodText = period === 1 ? '1 Month' : 
                          period < 12 ? `${period} Months` : 
                          period === 12 ? '1 Year' : 
                          period === 24 ? '2 Years' : 
                          `${period} Months`;
        return `${periodText}`;
      }
      return `${typeText} Warranty`;
    }
  };

  const getWarrantyIcon = () => {
    return (
      <svg 
        className={`${size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4'} ${isArabic ? 'ml-1' : 'mr-1'}`}
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className={`
      inline-flex items-center justify-center
      ${sizeClasses[size]}
      bg-gradient-to-r from-emerald-500 to-teal-600
      text-white font-semibold
      rounded-full shadow-lg
      border-2 border-white/20
      backdrop-blur-sm
      hover:from-emerald-600 hover:to-teal-700
      transition-all duration-300 ease-in-out
      transform hover:scale-105
      ${className}
    `}>
      {getWarrantyIcon()}
      <span className="whitespace-nowrap font-medium">
        {getWarrantyText()}
      </span>
    </div>
  );
};

export default WarrantyBadge;