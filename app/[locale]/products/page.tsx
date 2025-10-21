import { redirect } from 'next/navigation';

export default function ProductsPage({ params }: { params: { locale: string } }) {
  // Ensure we have a valid locale parameter
  const locale = params?.locale || 'en';
  
  // Redirect to collections with proper locale
  redirect(`/${locale}/collections`);
}