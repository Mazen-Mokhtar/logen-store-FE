'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useCartStore, useLanguageStore } from '@/lib/store';
import { useMessages } from '@/hooks/useMessages';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useAuth } from '@/lib/auth';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';

// Lazy load language toggle to reduce initial bundle
const LanguageToggle = dynamic(() => import('./LanguageToggle'), {
  ssr: false,
  loading: () => <div className="w-16 h-8 bg-gray-100 rounded-full animate-pulse"></div>,
});

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { openCart, getTotalItems } = useCartStore();
  const { language } = useLanguageStore();
  const messages = useMessages();
  const { scrollDirection, scrollY } = useScrollDirection();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = getTotalItems();

  const headerVariants = {
    visible: {
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
    hidden: {
      y: '-100%',
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.header
      variants={headerVariants}
      animate={scrollDirection === 'down' && scrollY > 100 ? 'hidden' : 'visible'}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900">
            StyleHub
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              {messages.nav.home}
            </Link>
            <Link
              href="/collections"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              {messages.nav.collections}
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              {messages.nav.contact}
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {mounted && <LanguageToggle />}
            
            {/* Auth Section */}
            {mounted && !isLoading && (
              <>
                {isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden md:block">Sign In</span>
                  </button>
                )}
              </>
            )}
            
            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
              aria-label={`Shopping cart with ${totalItems} items`}
              style={{ willChange: 'transform' }}
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md"
            >
              <div className="py-4 space-y-4">
                <Link
                  href="/"
                  className="block text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {messages.nav.home}
                </Link>
                <Link
                  href="/collections"
                  className="block text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {messages.nav.collections}
                </Link>
                <Link
                  href="/contact"
                  className="block text-gray-700 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {messages.nav.contact}
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </motion.header>
  );
}