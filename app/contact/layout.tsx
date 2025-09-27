import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us - StyleHub',
  description: 'Get in touch with StyleHub. We\'d love to hear from you. Contact us for support, questions, or feedback.',
  keywords: 'contact, support, customer service, StyleHub, help',
  openGraph: {
    title: 'Contact Us - StyleHub',
    description: 'Get in touch with StyleHub. We\'d love to hear from you.',
    type: 'website',
    url: 'https://stylehub.com/contact',
  },
};

interface ContactLayoutProps {
  children: React.ReactNode;
}

export default function ContactLayout({ children }: ContactLayoutProps) {
  return children;
}