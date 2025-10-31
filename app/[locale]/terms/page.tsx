'use client';

import { Metadata } from 'next';
import { useMessages } from '@/hooks/useMessages';
import { generateLocalizedMetadata } from '@/lib/seo-utils';

interface TermsPageProps {
  params: { locale: string };
}

// Note: This is now a client component, so generateMetadata won't work
// export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
//   return {
//     title: 'Terms of Service',
//     description: 'Terms and conditions for using our services',
//   };
// }

export default function TermsPage({ params }: TermsPageProps) {
  const messages = useMessages();
  
  if (!messages) {
    return <div>Loading...</div>;
  }
  
  const effectiveDate = process.env.NEXT_PUBLIC_TERMS_EFFECTIVE_DATE || '2024-01-01';
  const companyName = process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME || process.env.NEXT_PUBLIC_BUSINESS_NAME;
  const contactEmail = process.env.NEXT_PUBLIC_LEGAL_CONTACT_EMAIL || process.env.NEXT_PUBLIC_BUSINESS_EMAIL;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {messages.pages?.termsOfService?.title || 'Terms of Service'}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {messages.pages?.termsOfService?.subtitle || 'Please read these terms carefully before using our services'}
            </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>{messages.pages?.termsOfService?.effectiveDate || 'Effective Date'}: {effectiveDate}</p>
            <p>{messages.pages?.termsOfService?.lastUpdated || 'Last Updated'}: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-8">
          
          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {messages.pages?.termsOfService?.acceptance || 'Acceptance of Terms'}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                By accessing and using the {companyName} website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p>
                These Terms of Service constitute a legally binding agreement between you and {companyName}. Your use of our services is subject to these terms.
              </p>
            </div>
          </section>

          {/* Our Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              {messages.pages?.termsOfService?.services || 'Our Services'}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                {companyName} provides an e-commerce platform for the sale of electronics, mobile devices, and computer accessories. Our services include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Online product catalog and ordering system</li>
                <li>Secure payment processing</li>
                <li>Order fulfillment and shipping services</li>
                <li>Customer support and after-sales service</li>
                <li>Product warranties and returns processing</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without prior notice.
              </p>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              {messages.pages?.termsOfService?.userResponsibilities || 'User Responsibilities'}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                As a user of our services, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete information when creating an account</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use our services only for lawful purposes</li>
                <li>Respect the intellectual property rights of others</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Pay all fees and charges associated with your purchases</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              {messages.pages?.termsOfService?.prohibited || 'Prohibited Activities'}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                You are prohibited from using our services to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Engage in fraudulent or deceptive practices</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of our services</li>
                <li>Use automated systems to access our services without permission</li>
                <li>Resell or redistribute our products without authorization</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              {messages.pages?.termsOfService?.intellectual || 'Intellectual Property'}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                All content on our website, including but not limited to text, graphics, logos, images, and software, is the property of {companyName} or its licensors and is protected by copyright and other intellectual property laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, or create derivative works of our content without explicit written permission. Product names and trademarks belong to their respective owners.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              {messages.pages?.termsOfService?.limitation || 'Limitation of Liability'}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                To the fullest extent permitted by law, {companyName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use.
              </p>
              <p>
                Our total liability for any claim arising from your use of our services shall not exceed the amount you paid for the specific product or service that gave rise to the claim.
              </p>
              <p>
                We provide our services "as is" without warranties of any kind, either express or implied.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              {messages.pages?.termsOfService?.termination || 'Termination'}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                We may terminate or suspend your account and access to our services immediately, without prior notice, for any reason, including breach of these Terms of Service.
              </p>
              <p>
                You may terminate your account at any time by contacting our customer service team. Upon termination, your right to use our services will cease immediately.
              </p>
              <p>
                Provisions that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              {messages.pages?.termsOfService?.governing || 'Governing Law'}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-4">
              <p>
                These Terms of Service shall be governed by and construed in accordance with the laws of {process.env.NEXT_PUBLIC_BUSINESS_COUNTRY || 'the jurisdiction where the company is registered'}, without regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising from these terms shall be resolved through binding arbitration or in the courts of competent jurisdiction in our business location.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              {messages.pages?.termsOfService?.contact || 'Contact Information'}
            </h2>
            <div className="text-gray-600 dark:text-gray-300 space-y-2">
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-1">
                <p><strong>Company:</strong> {companyName}</p>
                <p><strong>Email:</strong> <a href={`mailto:${contactEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">{contactEmail}</a></p>
                <p><strong>Address:</strong> {process.env.NEXT_PUBLIC_BUSINESS_ADDRESS}</p>
                <p><strong>Phone:</strong> {process.env.NEXT_PUBLIC_BUSINESS_PHONE}</p>
              </div>
            </div>
          </section>

          {/* Updates Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-semibold mb-1">Updates to Terms</p>
                <p>
                  We may update these Terms of Service from time to time. We will notify you of any changes by posting the new terms on this page and updating the "Last Updated" date. Your continued use of our services after any changes constitutes acceptance of the new terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}