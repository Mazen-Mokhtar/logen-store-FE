'use client';

import { useLocale } from '@/hooks/useLocale';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className = '' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={`
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
        focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white 
        focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 
        focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200
        ${className}
      `}
      tabIndex={0}
    >
      {children}
    </a>
  );
}

export function SkipLinks() {
  const { t } = useLocale();

  return (
    <div className="skip-links">
      <SkipLink href="#main-content">
        {t?.('skipToMain') || 'Skip to main content'}
      </SkipLink>
      <SkipLink href="#navigation">
        {t?.('skipToNavigation') || 'Skip to navigation'}
      </SkipLink>
      <SkipLink href="#footer">
        {t?.('skipToFooter') || 'Skip to footer'}
      </SkipLink>
    </div>
  );
}