import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency?: string): string {
  if (currency) {
    // Use the currency-specific formatting
    const currencySymbols: { [key: string]: string } = {
      'SAR': 'ر.س',
      'USD': '$',
      'EUR': '€',
      'EGP': 'EGP'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${price.toLocaleString()} ${symbol}`;
  }
  
  // Fallback to SAR if no currency specified
  return `${price.toLocaleString()} ر.س`;
}

export function getImageUrl(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

export function decodeHtmlEntities(text: string): string {
  if (typeof window !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }
  // Server-side fallback for common HTML entities
  return text
    .replace(/&#x2F;/g, '/')
    .replace(/&#x3A;/g, ':')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
}