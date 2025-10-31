'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePrefetch } from '@/lib/prefetch-utils';

interface IntelligentLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetchOnHover?: boolean;
  prefetchOnVisible?: boolean;
  hoverDelay?: number;
  visibilityThreshold?: number;
  priority?: boolean;
}

export default function IntelligentLink({
  href,
  children,
  className = '',
  prefetchOnHover = true,
  prefetchOnVisible = false,
  hoverDelay = 300,
  visibilityThreshold = 0.1,
  priority = false,
}: IntelligentLinkProps) {
  const router = useRouter();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [isPrefetched, setIsPrefetched] = useState(false);
  const { prefetchOnHover: prefetchHover, prefetchOnIntersect, queuePrefetch } = usePrefetch();

  // Prefetch immediately for high priority links
  useEffect(() => {
    if (priority && !isPrefetched) {
      queuePrefetch(href);
      router.prefetch(href);
      setIsPrefetched(true);
    }
  }, [priority, href, queuePrefetch, router, isPrefetched]);

  // Set up intersection observer for visibility-based prefetching
  useEffect(() => {
    if (!prefetchOnVisible || isPrefetched || !linkRef.current) return;

    const observer = prefetchOnIntersect(href, visibilityThreshold);
    if (observer && linkRef.current) {
      observer.observe(linkRef.current);
      
      return () => {
        observer.disconnect();
      };
    }
  }, [prefetchOnVisible, href, visibilityThreshold, prefetchOnIntersect, isPrefetched]);

  const handleMouseEnter = () => {
    if (!prefetchOnHover || isPrefetched) return;

    const cleanup = prefetchHover(href, hoverDelay);
    router.prefetch(href);
    setIsPrefetched(true);

    return cleanup;
  };

  const handleMouseLeave = () => {
    // Cleanup is handled by the prefetch utility
  };

  return (
    <Link
      ref={linkRef}
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Link>
  );
}