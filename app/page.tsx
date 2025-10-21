import { redirect } from 'next/navigation';
import { config } from '@/lib/config';

export default function RootPage() {
  // Ensure defaultLocale is properly defined and is a string
  const defaultLocale = config?.i18n?.defaultLocale || 'en';
  
  // Validate that defaultLocale is a string before using it
  if (typeof defaultLocale === 'string' && defaultLocale.trim()) {
    redirect(`/${defaultLocale}`);
  } else {
    // Fallback redirect if config is malformed
    redirect('/en');
  }
}
