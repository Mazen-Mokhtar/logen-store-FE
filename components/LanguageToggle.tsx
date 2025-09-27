'use client';

import { useLanguageStore } from '@/lib/store';
import { motion } from 'framer-motion';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguageStore();

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
        className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        aria-label={`Switch to ${language === 'en' ? 'Arabic' : 'English'}`}
      >
        <span className="text-sm font-medium">
          {language === 'en' ? 'العربية' : 'English'}
        </span>
      </motion.button>
    </div>
  );
}