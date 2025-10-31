'use client';

import React from 'react';

import { Metadata } from 'next';
import { useMessages } from '@/hooks/useMessages';
import { generateLocalizedMetadata } from '@/lib/seo-utils';

interface PrivacyPageProps {
  params: { locale: string };
}

// Note: This is now a client component, so generateMetadata won't work
// export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
//   return generateLocalizedMetadata({
//     title: 'Privacy Policy',
//     description: 'How we collect, use, and protect your information',
//     locale: params.locale,
//     path: '/privacy'
//   });
// }

export default function PrivacyPage({ params }: PrivacyPageProps) {
  const messages = useMessages();
  
  if (!messages) {
    return <div>Loading...</div>;
  }
  
  const effectiveDate = process.env.NEXT_PUBLIC_PRIVACY_POLICY_EFFECTIVE_DATE || '2024-01-01';
  const companyName = process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME || process.env.NEXT_PUBLIC_BUSINESS_NAME;
  const contactEmail = process.env.NEXT_PUBLIC_DATA_PROTECTION_OFFICER_EMAIL || process.env.NEXT_PUBLIC_BUSINESS_EMAIL;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {messages.pages?.privacyPolicy?.title || 'Privacy Policy'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {messages.pages?.privacyPolicy?.subtitle || 'How we collect, use, and protect your information'}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>{messages.pages?.privacyPolicy?.effectiveDate || 'Effective Date'}: {effectiveDate}</p>
            <p>{messages.pages?.privacyPolicy?.lastUpdated || 'Last Updated'}: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-8">
          
          {/* Data Collection */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              {messages.pages?.privacyPolicy?.dataCollection || 'Data Collection'}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Personal information (name, email address, phone number)</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information (processed securely by our payment providers)</li>
                <li>Order history and preferences</li>
                <li>Communications with our customer service team</li>
              </ul>
            </div>
          </section>

          {/* Data Usage */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              {messages.pages?.privacyPolicy?.dataUsage || 'How We Use Your Data'}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                We use the information we collect to provide, maintain, and improve our services:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Improve our products and services</li>
                <li>Personalize your shopping experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              {messages.pages?.privacyPolicy?.dataProtection || 'Data Protection'}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>SSL encryption for all data transmission</li>
                <li>Secure payment processing through certified providers</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and employee training</li>
                <li>Data backup and recovery procedures</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              {messages.pages?.privacyPolicy?.cookies || 'Cookies'}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                We use cookies and similar technologies to enhance your browsing experience:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Essential cookies for website functionality</li>
                <li>Analytics cookies to understand site usage</li>
                <li>Preference cookies to remember your settings</li>
                <li>Marketing cookies for personalized content</li>
              </ul>
              <p>
                You can control cookie settings through your browser preferences.
              </p>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              {messages.pages?.privacyPolicy?.thirdPartyServices || 'Third-Party Services'}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                We may share information with trusted third-party service providers who assist us in operating our business:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Payment processors for secure transactions</li>
                <li>Shipping companies for order fulfillment</li>
                <li>Analytics providers for website improvement</li>
                <li>Customer service platforms</li>
              </ul>
              <p>
                These partners are contractually obligated to protect your information and use it only for specified purposes.
              </p>
            </div>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              {messages.pages?.privacyPolicy?.userRights || 'Your Rights'}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access: Request a copy of your personal data</li>
                <li>Rectification: Correct inaccurate or incomplete information</li>
                <li>Erasure: Request deletion of your personal data</li>
                <li>Portability: Receive your data in a structured format</li>
                <li>Objection: Object to processing of your personal data</li>
                <li>Restriction: Request limitation of processing</li>
              </ul>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              {messages.pages?.privacyPolicy?.contactInfo || 'Contact Information'}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-2">
              <p>
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="space-y-1">
                <p><strong>Company:</strong> {companyName}</p>
                <p><strong>Email:</strong> <a href={`mailto:${contactEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">{contactEmail}</a></p>
                <p><strong>Address:</strong> {process.env.NEXT_PUBLIC_BUSINESS_ADDRESS}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}