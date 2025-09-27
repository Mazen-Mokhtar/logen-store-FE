import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString()} SAR`;
}

export function getImageUrl(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}