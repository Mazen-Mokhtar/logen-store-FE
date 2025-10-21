'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { LocaleConfig } from '@/types';
import { clsx } from 'clsx';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline' | 'compact';
  showFlag?: boolean;
  showNativeName?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
}

export function LanguageSwitcher({
  variant = 'dropdown',
  showFlag = true,
  showNativeName = true,
  className,
  buttonClassName,
  menuClassName,
}: LanguageSwitcherProps) {
  const {
    locale,
    localeConfig,
    availableLocales,
    switchLocale,
    isRTL,
  } = useLocale();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    switchLocale(newLocale);
    setIsOpen(false);
  };

  // Inline variant - shows all languages as buttons
  if (variant === 'inline') {
    return (
      <div className={clsx('flex gap-2', className)}>
        {Array.isArray(availableLocales) && availableLocales.map((localeOption) => (
          <button
            key={localeOption.code}
            onClick={() => handleLocaleChange(localeOption.code)}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              locale === localeOption.code
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300',
              buttonClassName
            )}
            aria-label={`Switch to ${localeOption.name}`}
          >
            {showFlag && (
              <span className="text-lg" role="img" aria-hidden="true">
                {localeOption.flag}
              </span>
            )}
            <span>
              {showNativeName ? localeOption.nativeName : localeOption.name}
            </span>
            {locale === localeOption.code && (
              <Check className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
    );
  }

  // Compact variant - shows only flag/code
  if (variant === 'compact') {
    return (
      <div className={clsx('relative', className)} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'flex items-center gap-1 p-2 rounded-md text-sm font-medium transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            buttonClassName
          )}
          aria-label={`Current language: ${localeConfig.name}. Click to change language`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          {showFlag ? (
            <span className="text-lg" role="img" aria-hidden="true">
              {localeConfig.flag}
            </span>
          ) : (
            <Globe className="w-4 h-4" />
          )}
          <span className="uppercase text-xs">{locale}</span>
          <ChevronDown
            className={clsx(
              'w-3 h-3 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div
            className={clsx(
              'absolute top-full mt-1 py-1 bg-white dark:bg-gray-800 rounded-md shadow-lg',
              'border border-gray-200 dark:border-gray-700 min-w-[120px] z-50',
              isRTL ? 'left-0' : 'right-0',
              menuClassName
            )}
            role="listbox"
            aria-label="Language options"
          >
            {Array.isArray(availableLocales) && availableLocales.map((localeOption) => (
              <button
                key={localeOption.code}
                onClick={() => handleLocaleChange(localeOption.code)}
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
                  'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                  locale === localeOption.code
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                )}
                role="option"
                aria-selected={locale === localeOption.code}
              >
                <span className="text-base" role="img" aria-hidden="true">
                  {localeOption.flag}
                </span>
                <span className="uppercase text-xs">{localeOption.code}</span>
                {locale === localeOption.code && (
                  <Check className="w-3 h-3 ml-auto" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={clsx('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'border border-gray-300 dark:border-gray-600',
          buttonClassName
        )}
        aria-label={`Current language: ${localeConfig.name}. Click to change language`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {showFlag && (
          <span className="text-lg" role="img" aria-hidden="true">
            {localeConfig.flag}
          </span>
        )}
        <span>
          {showNativeName ? localeConfig.nativeName : localeConfig.name}
        </span>
        <ChevronDown
          className={clsx(
            'w-4 h-4 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          className={clsx(
            'absolute top-full mt-1 py-1 bg-white dark:bg-gray-800 rounded-md shadow-lg',
            'border border-gray-200 dark:border-gray-700 min-w-full z-50',
            isRTL ? 'left-0' : 'right-0',
            menuClassName
          )}
          role="listbox"
          aria-label="Language options"
        >
          {Array.isArray(availableLocales) && availableLocales.map((localeOption) => (
            <button
              key={localeOption.code}
              onClick={() => handleLocaleChange(localeOption.code)}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2 text-sm text-left',
                'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                locale === localeOption.code
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300'
              )}
              role="option"
              aria-selected={locale === localeOption.code}
            >
              {showFlag && (
                <span className="text-lg" role="img" aria-hidden="true">
                  {localeOption.flag}
                </span>
              )}
              <span>
                {showNativeName ? localeOption.nativeName : localeOption.name}
              </span>
              {locale === localeOption.code && (
                <Check className="w-4 h-4 ml-auto" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook for keyboard navigation
export function useLanguageSwitcherKeyboard() {
  const { availableLocales, switchLocale } = useLocale();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + L to cycle through languages
      if (event.altKey && event.key === 'l') {
        event.preventDefault();
        const currentIndex = availableLocales.findIndex(
          (l) => l.code === document.documentElement.lang
        );
        const nextIndex = (currentIndex + 1) % availableLocales.length;
        switchLocale(availableLocales[nextIndex].code);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [availableLocales, switchLocale]);
}

export default LanguageSwitcher;