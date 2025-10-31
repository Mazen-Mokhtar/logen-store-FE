'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
  const messages = useMessages();

  return (
    <div className="pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {messages.nav.contact}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get in touch with us. We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="flex items-start space-x-4 rtl:space-x-reverse">
              <div className="bg-black text-white p-3 rounded-full">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Email</h3>
                <p className="text-gray-600">{process.env.NEXT_PUBLIC_CONTACT_EMAIL_PRIMARY}</p>
                <p className="text-gray-600">{process.env.NEXT_PUBLIC_CONTACT_EMAIL_SUPPORT}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 rtl:space-x-reverse">
              <div className="bg-black text-white p-3 rounded-full">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Phone</h3>
                <p className="text-gray-600">{process.env.NEXT_PUBLIC_CONTACT_PHONE_PRIMARY}</p>
                <p className="text-gray-600">{process.env.NEXT_PUBLIC_CONTACT_PHONE_SECONDARY}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 rtl:space-x-reverse">
              <div className="bg-black text-white p-3 rounded-full">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Address</h3>
                <p className="text-gray-600">
                  {process.env.NEXT_PUBLIC_CONTACT_ADDRESS_LINE1}<br />
                  {process.env.NEXT_PUBLIC_CONTACT_ADDRESS_LINE2}<br />
                  {process.env.NEXT_PUBLIC_CONTACT_ADDRESS_COUNTRY}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <ContactForm className="lg:col-span-1" />
        </div>
      </div>
    </div>
  );
}