'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { format as formatDate } from 'date-fns';
import { LocaleConfig, CurrencyConfig } from '@/types';
import { config, locales, currencies } from '@/lib/config';

export function useLocale() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  
  // Get current locale from params or fallback to default
  const currentLocale = (params?.locale as string) || config.i18n.defaultLocale;

  // Get current locale configuration
  const localeConfig = useMemo(() => {
    return locales.find(l => l.code === currentLocale) || locales[0];
  }, [currentLocale]);

  // Get current currency (can be extended to be user-specific)
  const [currency, setCurrency] = useState<CurrencyConfig>(currencies[0]);

  // Switch locale
  const switchLocale = useCallback((newLocale: string) => {
    const availableLocales = config.i18n.supportedLocales;
    if (availableLocales?.includes(newLocale)) {
      // In App Router, we need to navigate to the new locale path
      const currentPath = pathname.replace(`/${currentLocale}`, '');
      router.push(`/${newLocale}${currentPath}`);
    }
  }, [router, pathname, currentLocale]);

  // Format currency
  const formatCurrency = useCallback((
    amount: number,
    currencyCode?: string,
    locale?: string
  ) => {
    const targetCurrency = currencyCode 
      ? currencies.find(c => c.code === currencyCode) || currency
      : currency;
    
    const targetLocale = locale || currentLocale;

    try {
      return new Intl.NumberFormat(targetLocale, {
        style: 'currency',
        currency: targetCurrency.code,
        minimumFractionDigits: targetCurrency.decimals,
        maximumFractionDigits: targetCurrency.decimals,
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      return `${targetCurrency.symbol}${amount.toFixed(targetCurrency.decimals)}`;
    }
  }, [currency, currentLocale]);

  // Format number
  const formatNumber = useCallback((
    number: number,
    options?: Intl.NumberFormatOptions
  ) => {
    try {
      return new Intl.NumberFormat(currentLocale, options).format(number);
    } catch (error) {
      return number.toString();
    }
  }, [currentLocale]);

  // Format date
  const formatDateLocalized = useCallback((
    date: Date | string | number,
    formatString: string = 'PPP'
  ) => {
    try {
      const dateObj = typeof date === 'string' || typeof date === 'number' 
        ? new Date(date) 
        : date;
      
      return formatDate(dateObj, formatString);
    } catch (error) {
      return date.toString();
    }
  }, []);

  // Get relative time (e.g., "2 hours ago")
  const getRelativeTime = useCallback((date: Date | string | number) => {
    try {
      const dateObj = typeof date === 'string' || typeof date === 'number' 
        ? new Date(date) 
        : date;
      
      const rtf = new Intl.RelativeTimeFormat(currentLocale, { numeric: 'auto' });
      const now = new Date();
      const diffInSeconds = Math.floor((dateObj.getTime() - now.getTime()) / 1000);
      
      const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 },
      ];
      
      for (const interval of intervals) {
        const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
        if (count >= 1) {
          return rtf.format(
            diffInSeconds < 0 ? -count : count,
            interval.label as Intl.RelativeTimeFormatUnit
          );
        }
      }
      
      return rtf.format(0, 'second');
    } catch (error) {
      return date.toString();
    }
  }, [currentLocale]);

  // Get text direction
  const textDirection = useMemo(() => localeConfig.direction, [localeConfig]);

  // Check if current locale is RTL
  const isRTL = useMemo(() => localeConfig.direction === 'rtl', [localeConfig]);

  // Get localized path
  const getLocalizedPath = useCallback((path: string, locale?: string) => {
    const targetLocale = locale || currentLocale;
    
    if (targetLocale === config.i18n.defaultLocale) {
      return path;
    }
    
    return `/${targetLocale}${path}`;
  }, [currentLocale]);

  // Get alternate language links for SEO
  const getAlternateLinks = useCallback((path: string) => {
    return locales.map(locale => ({
      hreflang: locale.code,
      href: `${config.site.url}${getLocalizedPath(path, locale.code)}`,
    }));
  }, [getLocalizedPath]);

  // Load messages for current locale
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const response = await import(`@/data/messages.${currentLocale}.json`);
        setMessages(response.default || {});
      } catch (error) {
        console.warn(`Failed to load messages for locale ${currentLocale}:`, error);
        // Fallback to English
        try {
          const fallbackResponse = await import(`@/data/messages.en.json`);
          setMessages(fallbackResponse.default as any || {});
        } catch (fallbackError) {
          console.error('Failed to load fallback messages:', fallbackError);
          setMessages({});
        }
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [currentLocale]);

  // Translate function
  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    let message = messages[key] || key;
    
    if (params) {
      const entries = Object.entries(params);
      if (Array.isArray(entries) && entries.length > 0) {
        entries.forEach(([paramKey, value]) => {
          message = message.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
        });
      }
    }
    
    return message;
  }, [messages]);

  return {
    // Current locale info
    locale: currentLocale,
    localeConfig,
    availableLocales: locales,
    isRTL,
    textDirection,
    
    // Currency
    currency,
    setCurrency,
    availableCurrencies: currencies,
    
    // Actions
    switchLocale,
    
    // Formatting functions
    formatCurrency,
    formatNumber,
    formatDate: formatDateLocalized,
    getRelativeTime,
    
    // Path helpers
    getLocalizedPath,
    getAlternateLinks,
    
    // Translation
    t,
    messages,
    isLoadingMessages,
  };
}