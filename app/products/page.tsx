'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function ProductsPage() {
  useEffect(() => {
    redirect('/collections');
  }, []);

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  );
}