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

    // Wait for DOM to be ready and elements to be available
    const initAnimations = () => {
      // Kill all existing ScrollTriggers to prevent conflicts
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      
      const ctx = gsap.context(() => {
        // Hero text animations - check if elements exist first
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
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
        }

        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) {
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
        }

        const heroCta = document.querySelector('.hero-cta');
        if (heroCta) {
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
        }

        // Category cards stagger animation - check if elements exist first
        const categoryCards = document.querySelectorAll('.category-card');
        if (categoryCards.length > 0) {
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
                refreshPriority: -1,
                invalidateOnRefresh: true,
              }
            }
          );
        }

        // Product cards animation removed to prevent page-wide effects

        // Section titles animation removed to prevent page-wide effects

      }, containerRef);

      return ctx;
    };

    // Use a timeout to ensure DOM elements are rendered
    const timeoutId = setTimeout(() => {
      initAnimations();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      // Clean up all ScrollTriggers when component unmounts
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [containerRef]);

  return null;
}