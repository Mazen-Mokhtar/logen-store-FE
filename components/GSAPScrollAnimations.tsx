import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface GSAPScrollAnimationsProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export default function GSAPScrollAnimations({ containerRef }: GSAPScrollAnimationsProps) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Debounced scroll handler for better performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          ticking = false;
        });
        ticking = true;
      }
    };

    const ctx = gsap.context(() => {
      // Hero text animations
      gsap.fromTo('.hero-title', 
        { y: 100, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1.2, 
          ease: 'power3.out', 
          delay: 0.3,
          force3D: true,
        }
      );

      gsap.fromTo('.hero-subtitle', 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1, 
          ease: 'power3.out', 
          delay: 0.6,
          force3D: true,
        }
      );

      gsap.fromTo('.hero-cta', 
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          ease: 'power3.out', 
          delay: 0.9,
          force3D: true,
        }
      );

      // Category cards stagger animation
      gsap.fromTo('.category-card', 
        { y: 60, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.1,
          force3D: true,
          scrollTrigger: {
            trigger: '.category-section',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            fastScrollEnd: true,
          }
        }
      );

      // Product cards stagger animation
      gsap.fromTo('.product-card', 
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.15,
          force3D: true,
          scrollTrigger: {
            trigger: '.products-section',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            fastScrollEnd: true,
          }
        }
      );

      // Section titles animation
      gsap.fromTo('.section-title', 
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          force3D: true,
          scrollTrigger: {
            trigger: '.section-title',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
            fastScrollEnd: true,
          }
        }
      );

    }, containerRef);

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      ctx.revert();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef]);

  return null;
}