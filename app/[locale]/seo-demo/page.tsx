'use client';

import { useState } from 'react';
import SEOHead from '@/components/SEOHead';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import HealthStatus from '@/components/HealthStatus';
import { useLocale } from '@/hooks/useLocale';
import { useSEO } from '@/hooks/useSEO';
import { useHealth } from '@/hooks/useHealth';

interface SEODemoPageProps {
  params: {
    locale: string;
  };
}

export default function SEODemoPage({ params }: SEODemoPageProps) {
  const { locale: currentLocale } = params;
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  
  const { 
    locale, 
    switchLocale, 
    formatCurrency, 
    formatNumber, 
    formatDate, 
    getRelativeTime, 
    isRTL,
    getLocalizedPath,
    getAlternateLinks,
    t 
  } = useLocale();
  
  const { 
    seoData, 
    isLoading: seoLoading, 
    updateSEO, 
    generateStructuredData 
  } = useSEO();
  
  const { 
    healthData, 
    isOnline, 
    overallStatus 
  } = useHealth();

  const handleUpdateSEO = () => {
    if (customTitle || customDescription) {
      updateSEO({
        title: customTitle || undefined,
        description: customDescription || undefined,
      });
    }
  };

  const sampleProduct = {
    id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 299.99,
    currency: 'USD',
    image: '/sample-product.jpg',
    category: 'Electronics',
    brand: 'TechBrand',
    availability: 'InStock' as const,
    rating: 4.5,
    reviewCount: 128,
  };

  const structuredData = generateStructuredData('product', sampleProduct);

  return (
    <>
      <SEOHead
        title={customTitle || 'SEO & Internationalization Demo'}
        description={customDescription || 'Comprehensive demonstration of SEO features, internationalization, and health monitoring capabilities.'}
        path={`/${currentLocale}/seo-demo`}
        type="website"
        structuredData={[structuredData]}
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t('seo.demo.title', { fallback: 'SEO & i18n Demo' })}
                </h1>
                <p className="text-gray-600">
                  {t('seo.demo.description', { fallback: 'Explore internationalization and SEO features' })}
                </p>
              </div>
              <LanguageSwitcher variant="dropdown" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Current Locale:</span> {locale}
              </div>
              <div>
                <span className="font-medium">Text Direction:</span> {isRTL ? 'RTL' : 'LTR'}
              </div>
              <div>
                <span className="font-medium">Online Status:</span> 
                <span className={`ml-1 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* SEO Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Dynamic SEO Controls</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter custom page title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Description
                </label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter custom meta description"
                />
              </div>
              <button
                onClick={handleUpdateSEO}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Update SEO
              </button>
            </div>
          </div>

          {/* Localization Examples */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Localization Examples</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Currency & Numbers</h3>
                <div className="space-y-2 text-sm">
                  <div>Price: {formatCurrency(299.99, 'USD')}</div>
                  <div>Large Number: {formatNumber(1234567.89)}</div>
                  <div>Percentage: {formatNumber(0.1234, { style: 'percent' })}</div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Date & Time</h3>
                <div className="space-y-2 text-sm">
                  <div>Current Date: {formatDate(new Date())}</div>
                  <div>Short Date: {formatDate(new Date(), 'P')}</div>
                  <div>Relative Time: {getRelativeTime(new Date(Date.now() - 3600000))}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Language Switcher Variants */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Language Switcher Variants</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Dropdown</h3>
                <LanguageSwitcher variant="dropdown" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Inline</h3>
                <LanguageSwitcher variant="inline" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Compact</h3>
                <LanguageSwitcher variant="compact" />
              </div>
            </div>
          </div>

          {/* Health Monitoring */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Health Monitoring</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Compact Status</h3>
                <HealthStatus variant="compact" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Detailed Status</h3>
                <HealthStatus variant="detailed" />
              </div>
            </div>
          </div>

          {/* SEO Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Current SEO Data</h2>
            {seoLoading ? (
              <div className="animate-pulse">Loading SEO data...</div>
            ) : (
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Title:</span> {seoData?.title}</div>
                <div><span className="font-medium">Description:</span> {seoData?.description}</div>
                <div><span className="font-medium">Keywords:</span> {Array.isArray(seoData?.keywords) ? seoData.keywords.join(', ') : seoData?.keywords}</div>
                <div><span className="font-medium">Canonical URL:</span> {seoData?.canonicalUrl}</div>
                <div><span className="font-medium">Alternate Links:</span></div>
                <ul className="ml-4 space-y-1">
                  {getAlternateLinks('/seo-demo').map((link) => (
                    <li key={link.hreflang}>
                      {link.hreflang}: {link.href}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}