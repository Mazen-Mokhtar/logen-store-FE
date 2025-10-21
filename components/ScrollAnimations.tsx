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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Add a small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef}>
      {children}
      {isClient && isReady && <GSAPScrollAnimations containerRef={containerRef} />}
    </div>
  );
}