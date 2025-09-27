'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Package, Settings } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rtl:space-x-reverse p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          {user.profileImage ? (
            <Image
              src={user.profileImage}
              alt={user.userName}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-gray-600" />
          )}
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">
          {user.userName}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user.userName}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.role && (
                <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded-full">
                  {user.role}
                </span>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link
                href="/orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Package className="w-4 h-4" />
                <span>My Orders</span>
              </Link>

              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Profile Settings</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 rtl:space-x-reverse w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}