'use client';

import { SEOHead } from './SEOHead';
import { useLocale } from '@/hooks/useLocale';
import { config } from '@/lib/config';
import { generateWebsiteStructuredData, generateOrganizationStructuredData } from '@/lib/structured-data-utils';

interface FallbackSEOProps {
  pageType?: 'home' | 'category' | 'search' | 'about' | 'contact' | 'error' | 'generic';
  customTitle?: string;
  customDescription?: string;
  path?: string;
}

export function FallbackSEO({ 
  pageType = 'generic', 
  customTitle, 
  customDescription, 
  path = '/' 
}: FallbackSEOProps) {
  const { locale } = useLocale();

  // Generate fallback content based on page type and locale
  const getFallbackContent = () => {
    const isArabic = locale === 'ar';
    
    const fallbackTitles = {
      home: isArabic 
        ? `${config.site.name} - متجرك الموثوق لجميع اكسسوارات الجوال والكمبيوتر`
        : `${config.site.name} - Your Trusted Electronics Store`,
      category: isArabic
        ? `تصفح المنتجات - ${config.site.name}`
        : `Browse Products - ${config.site.name}`,
      search: isArabic
        ? `البحث في المنتجات - ${config.site.name}`
        : `Search Products - ${config.site.name}`,
      about: isArabic
        ? `من نحن - ${config.site.name}`
        : `About Us - ${config.site.name}`,
      contact: isArabic
        ? `اتصل بنا - ${config.site.name}`
        : `Contact Us - ${config.site.name}`,
      error: isArabic
        ? `خطأ - ${config.site.name}`
        : `Error - ${config.site.name}`,
      generic: isArabic
        ? `${config.site.name} - متجر الإلكترونيات`
        : `${config.site.name} - Electronics Store`
    };

    const fallbackDescriptions = {
      home: isArabic
        ? 'اكتشف أحدث الهواتف الذكية، الشواحن، سماعات الرأس، لوحات المفاتيح، أجهزة الكمبيوتر المحمولة وجميع اكسسوارات التكنولوجيا بأفضل الأسعار في المملكة العربية السعودية.'
        : 'Discover the latest smartphones, chargers, headphones, keyboards, laptops and all tech accessories at the best prices in Saudi Arabia.',
      category: isArabic
        ? 'تصفح مجموعتنا الواسعة من المنتجات الإلكترونية عالية الجودة مع ضمان الجودة وأفضل الأسعار.'
        : 'Browse our wide collection of high-quality electronic products with quality guarantee and best prices.',
      search: isArabic
        ? 'ابحث عن المنتجات الإلكترونية التي تحتاجها من بين آلاف المنتجات المتوفرة لدينا.'
        : 'Search for the electronic products you need from thousands of products available in our store.',
      about: isArabic
        ? 'تعرف على قصة متجر لوجن وكيف أصبحنا الوجهة الأولى لشراء الإلكترونيات في المملكة العربية السعودية.'
        : 'Learn about Logen Store\'s story and how we became the premier destination for electronics shopping in Saudi Arabia.',
      contact: isArabic
        ? 'تواصل معنا للحصول على المساعدة أو الاستفسارات حول منتجاتنا وخدماتنا. نحن هنا لمساعدتك.'
        : 'Contact us for help or inquiries about our products and services. We are here to help you.',
      error: isArabic
        ? 'عذراً، حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى أو العودة إلى الصفحة الرئيسية.'
        : 'Sorry, an error occurred while loading the page. Please try again or return to the homepage.',
      generic: isArabic
        ? 'متجر لوجن - وجهتك الأولى لشراء جميع المنتجات الإلكترونية والاكسسوارات بأفضل الأسعار.'
        : 'Logen Store - Your premier destination for all electronics and accessories at the best prices.'
    };

    const fallbackKeywords = {
      home: isArabic
        ? 'هواتف ذكية، شواحن، سماعات، لوحات مفاتيح، أجهزة كمبيوتر، اكسسوارات إلكترونية، متجر إلكترونيات، السعودية'
        : 'smartphones, chargers, headphones, keyboards, computers, electronic accessories, electronics store, Saudi Arabia',
      category: isArabic
        ? 'منتجات إلكترونية، اكسسوارات تقنية، أجهزة ذكية، متجر لوجن'
        : 'electronic products, tech accessories, smart devices, Logen Store',
      search: isArabic
        ? 'البحث عن منتجات، إلكترونيات، اكسسوارات، أجهزة'
        : 'product search, electronics, accessories, devices',
      about: isArabic
        ? 'عن الشركة، متجر لوجن، تاريخ الشركة، رؤيتنا'
        : 'about company, Logen Store, company history, our vision',
      contact: isArabic
        ? 'اتصل بنا، خدمة العملاء، الدعم الفني، معلومات التواصل'
        : 'contact us, customer service, technical support, contact information',
      error: isArabic
        ? 'خطأ، صفحة غير موجودة، مشكلة تقنية'
        : 'error, page not found, technical issue',
      generic: isArabic
        ? 'متجر إلكترونيات، منتجات تقنية، اكسسوارات'
        : 'electronics store, tech products, accessories'
    };

    return {
      title: customTitle || fallbackTitles[pageType],
      description: customDescription || fallbackDescriptions[pageType],
      keywords: fallbackKeywords[pageType]
    };
  };

  const { title, description, keywords } = getFallbackContent();

  // Generate structured data for fallback pages
  const structuredData = [
    generateWebsiteStructuredData(locale),
    generateOrganizationStructuredData()
  ];

  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      path={path}
      type="website"
      structuredData={structuredData}
    />
  );
}

export default FallbackSEO;