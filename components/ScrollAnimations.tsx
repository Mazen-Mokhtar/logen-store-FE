'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy load GSAP to avoid blocking initial render
const GSAPScrollAnimations = dynamic(() => import('./GSAPScrollAnimations'), {
  ssr: false,
  loading: () => null,
});
interface ScrollAnimationsProps {
  children: React.ReactNode;
}

export default function ScrollAnimations({ children }: ScrollAnimationsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div ref={containerRef}>
      {children}
      {isClient && <GSAPScrollAnimations containerRef={containerRef} />}
    </div>
  );
}