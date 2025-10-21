import { config } from './config';

export type Locale = 'en' | 'ar';

export interface Messages {
  [key: string]: string | Messages;
}

// Cache for loaded messages
const messagesCache = new Map<Locale, Messages>();

// Load messages for a specific locale
export async function loadMessages(locale: Locale): Promise<Messages> {
  // Return cached messages if available
  if (messagesCache.has(locale)) {
    return messagesCache.get(locale)!;
  }

  try {
    // Try to load messages from JSON file
    const messages = await import(`../messages/${locale}.json`);
    messagesCache.set(locale, messages.default);
    return messages.default;
  } catch (error) {
    console.warn(`Failed to load messages for locale ${locale}:`, error);
    
    // Fallback to default locale if not already trying it
    if (locale !== config.i18n.defaultLocale) {
      return loadMessages(config.i18n.defaultLocale as Locale);
    }
    
    // Return empty messages as last resort
    return {};
  }
}

// Get nested message by key path (e.g., 'common.buttons.save')
export function getMessage(messages: Messages, key: string, fallback?: string): string {
  const keys = key.split('.');
  let current: any = messages;
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return fallback || key;
    }
  }
  
  return typeof current === 'string' ? current : fallback || key;
}

// Format message with parameters
export function formatMessage(
  template: string,
  params: Record<string, string | number> = {}
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match;
  });
}

// Get text direction for locale
export function getTextDirection(locale: Locale): 'ltr' | 'rtl' {
  const rtlLocales: Locale[] = ['ar'];
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

// Get locale display name
export function getLocaleDisplayName(locale: Locale, inLocale?: Locale): string {
  const displayNames: Record<Locale, Record<Locale, string>> = {
    en: {
      en: 'English',
      ar: 'Arabic',
    },
    ar: {
      en: 'الإنجليزية',
      ar: 'العربية',
    },
  };
  
  const targetLocale = inLocale || locale;
  return displayNames[targetLocale]?.[locale] || locale;
}

// Validate locale
export function isValidLocale(locale: string): locale is Locale {
  return config.i18n.locales.includes(locale as Locale);
}

// Get browser locale preference
export function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') {
    return config.i18n.defaultLocale as Locale;
  }
  
  const browserLocale = navigator.language.split('-')[0];
  return isValidLocale(browserLocale) ? browserLocale : config.i18n.defaultLocale as Locale;
}