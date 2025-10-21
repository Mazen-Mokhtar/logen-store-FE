'use client';

import { useReducedMotion } from '@/components/Accessibility/AccessibilityProvider';
import { ScreenReaderOnly } from '@/components/Accessibility/ScreenReaderOnly';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
  label?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  label = 'Loading...'
}: LoadingSpinnerProps) {
  const reducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const colorClasses = {
    primary: 'border-blue-600',
    secondary: 'border-gray-600',
    white: 'border-white',
    gray: 'border-gray-400',
  };

  return (
    <div className={`inline-flex items-center ${className}`} role="status" aria-live="polite">
      <div
        className={`
          ${sizeClasses[size]}
          ${colorClasses[color]}
          border-2 border-t-transparent rounded-full
          ${reducedMotion ? '' : 'animate-spin'}
        `}
        aria-hidden="true"
      />
      <ScreenReaderOnly>{label}</ScreenReaderOnly>
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
  width?: string;
  height?: string;
}

export function LoadingSkeleton({ 
  className = '',
  lines = 1,
  avatar = false,
  width,
  height = '1rem'
}: LoadingSkeletonProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={`animate-pulse ${className}`} role="status" aria-label="Loading content">
      {avatar && (
        <div className="rounded-full bg-gray-300 h-10 w-10 mb-3"></div>
      )}
      
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`
            bg-gray-300 rounded mb-2 last:mb-0
            ${reducedMotion ? '' : 'loading-skeleton'}
          `}
          style={{
            width: width || (index === lines - 1 ? '75%' : '100%'),
            height,
          }}
        />
      ))}
      
      <ScreenReaderOnly>Loading content...</ScreenReaderOnly>
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showButton?: boolean;
}

export function LoadingCard({ 
  className = '',
  showImage = true,
  showTitle = true,
  showDescription = true,
  showButton = false
}: LoadingCardProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div 
      className={`border rounded-lg p-4 ${className}`}
      role="status"
      aria-label="Loading card"
    >
      <div className={`animate-pulse ${reducedMotion ? 'opacity-60' : ''}`}>
        {showImage && (
          <div className="bg-gray-300 rounded-lg h-48 w-full mb-4"></div>
        )}
        
        {showTitle && (
          <div className="bg-gray-300 rounded h-6 w-3/4 mb-3"></div>
        )}
        
        {showDescription && (
          <>
            <div className="bg-gray-300 rounded h-4 w-full mb-2"></div>
            <div className="bg-gray-300 rounded h-4 w-5/6 mb-3"></div>
          </>
        )}
        
        {showButton && (
          <div className="bg-gray-300 rounded h-10 w-24"></div>
        )}
      </div>
      
      <ScreenReaderOnly>Loading card content...</ScreenReaderOnly>
    </div>
  );
}

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
  label?: string;
}

export function LoadingDots({ 
  size = 'md',
  color = 'primary',
  className = '',
  label = 'Loading...'
}: LoadingDotsProps) {
  const reducedMotion = useReducedMotion();

  const sizeClasses = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
  };

  const colorClasses = {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-600',
    white: 'bg-white',
    gray: 'bg-gray-400',
  };

  return (
    <div 
      className={`flex space-x-1 ${className}`}
      role="status"
      aria-live="polite"
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`
            ${sizeClasses[size]}
            ${colorClasses[color]}
            rounded-full
            ${reducedMotion ? 'opacity-60' : 'animate-bounce'}
          `}
          style={{
            animationDelay: reducedMotion ? '0ms' : `${index * 150}ms`,
          }}
          aria-hidden="true"
        />
      ))}
      <ScreenReaderOnly>{label}</ScreenReaderOnly>
    </div>
  );
}

interface LoadingBarProps {
  progress?: number;
  indeterminate?: boolean;
  className?: string;
  label?: string;
}

export function LoadingBar({ 
  progress,
  indeterminate = false,
  className = '',
  label = 'Loading...'
}: LoadingBarProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={`w-full ${className}`} role="progressbar" aria-label={label}>
      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`
            h-full bg-blue-600 rounded-full transition-all duration-300
            ${indeterminate && !reducedMotion ? 'animate-pulse' : ''}
          `}
          style={{
            width: indeterminate ? '100%' : `${progress || 0}%`,
            transform: indeterminate && !reducedMotion ? 'translateX(-100%)' : 'none',
          }}
        />
      </div>
      
      {progress !== undefined && (
        <ScreenReaderOnly>{Math.round(progress)}% complete</ScreenReaderOnly>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  children?: React.ReactNode;
  className?: string;
  label?: string;
}

export function LoadingOverlay({ 
  isVisible,
  children,
  className = '',
  label = 'Loading...'
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50
        ${className}
      `}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
        {children || (
          <>
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-gray-700">{label}</p>
          </>
        )}
      </div>
    </div>
  );
}