'use client';

import Link from 'next/link';
import { useMessages } from '@/hooks/useMessages';

export default function Footer() {
  const messages = useMessages();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">StyleHub</h3>
            <p className="text-gray-400 max-w-md">
              Premium fashion for the modern lifestyle. Discover your style with our curated collection of contemporary clothing.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-gray-400 hover:text-white transition-colors">
                {messages.nav.home}
              </Link>
              <Link href="/collections" className="block text-gray-400 hover:text-white transition-colors">
                {messages.nav.collections}
              </Link>
              <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                {messages.nav.contact}
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <div className="space-y-2">
              <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">
                {messages.footer.about}
              </Link>
              <Link href="/privacy" className="block text-gray-400 hover:text-white transition-colors">
                {messages.footer.privacy}
              </Link>
              <Link href="/terms" className="block text-gray-400 hover:text-white transition-colors">
                {messages.footer.terms}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>{messages.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}