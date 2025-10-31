'use client';

import Link from 'next/link';
import { useMessages } from '@/hooks/useMessages';

export default function Footer() {
  const messages = useMessages();

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Logen Store</h3>
            <p className="text-gray-400">
              {messages.common?.description || 'Premium fashion for the modern lifestyle'}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{messages.common?.quickLinks || 'Quick Links'}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  {messages.nav?.home || 'Home'}
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-gray-400 hover:text-white transition-colors">
                  {messages.nav?.collections || 'Collections'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  {messages.nav?.contact || 'Contact'}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">{messages.common?.legal || 'Legal'}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  {messages.footer?.about || 'About Us'}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  {messages.footer?.privacy || 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  {messages.footer?.terms || 'Terms of Service'}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            {messages.footer?.copyright || '© 2024 Logen Store. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}