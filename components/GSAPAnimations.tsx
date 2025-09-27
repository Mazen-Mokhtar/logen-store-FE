import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface GSAPAnimationsProps {
  heroRef: React.RefObject<HTMLDivElement>;
}

export default function GSAPAnimations({ heroRef }: GSAPAnimationsProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || !heroRef.current) return;

    const ctx = gsap.context(() => {
      // Parallax effect for hero background
      gsap.to('.hero-bg', {
        yPercent: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }, heroRef);

    return () => ctx.revert();
  }, [heroRef]);

  return null;
}