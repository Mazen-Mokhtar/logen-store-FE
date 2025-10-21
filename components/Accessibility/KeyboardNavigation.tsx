'use client';

import { useEffect, useCallback, useRef } from 'react';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowKeys?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  className?: string;
}

export function KeyboardNavigation({
  children,
  onEscape,
  onEnter,
  onArrowKeys,
  className = '',
}: KeyboardNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;
        case 'Enter':
          if (onEnter) {
            event.preventDefault();
            onEnter();
          }
          break;
        case 'ArrowUp':
          if (onArrowKeys) {
            event.preventDefault();
            onArrowKeys('up');
          }
          break;
        case 'ArrowDown':
          if (onArrowKeys) {
            event.preventDefault();
            onArrowKeys('down');
          }
          break;
        case 'ArrowLeft':
          if (onArrowKeys) {
            event.preventDefault();
            onArrowKeys('left');
          }
          break;
        case 'ArrowRight':
          if (onArrowKeys) {
            event.preventDefault();
            onArrowKeys('right');
          }
          break;
      }
    },
    [onEscape, onEnter, onArrowKeys]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => {
        container.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown]);

  return (
    <div ref={containerRef} className={className} tabIndex={-1}>
      {children}
    </div>
  );
}

// Hook for keyboard shortcuts
interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  callback: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const {
          key,
          ctrlKey = false,
          altKey = false,
          shiftKey = false,
          metaKey = false,
          callback,
        } = shortcut;

        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          event.ctrlKey === ctrlKey &&
          event.altKey === altKey &&
          event.shiftKey === shiftKey &&
          event.metaKey === metaKey
        ) {
          event.preventDefault();
          callback();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}

// Component for roving tabindex navigation
interface RovingTabIndexProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  className?: string;
}

export function RovingTabIndex({
  children,
  orientation = 'both',
  loop = true,
  className = '',
}: RovingTabIndexProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);

  const getFocusableChildren = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll('[role="option"], [role="tab"], button, [tabindex]')
    ).filter((el) => {
      const element = el as HTMLElement;
      // Check if element has disabled property (for form elements)
      const isDisabled = 'disabled' in element ? (element as any).disabled : false;
      return !isDisabled && element.tabIndex !== -1;
    }) as HTMLElement[];
  }, []);

  const updateTabIndex = useCallback((activeIndex: number) => {
    const children = getFocusableChildren();
    if (Array.isArray(children) && children.length > 0) {
      children.forEach((child, index) => {
        child.tabIndex = index === activeIndex ? 0 : -1;
      });
    }
    currentIndexRef.current = activeIndex;
  }, [getFocusableChildren]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const children = getFocusableChildren();
      if (children.length === 0) return;

      let newIndex = currentIndexRef.current;
      let handled = false;

      switch (event.key) {
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            newIndex = loop
              ? (currentIndexRef.current + 1) % children.length
              : Math.min(currentIndexRef.current + 1, children.length - 1);
            handled = true;
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            newIndex = loop
              ? currentIndexRef.current === 0
                ? children.length - 1
                : currentIndexRef.current - 1
              : Math.max(currentIndexRef.current - 1, 0);
            handled = true;
          }
          break;
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            newIndex = loop
              ? (currentIndexRef.current + 1) % children.length
              : Math.min(currentIndexRef.current + 1, children.length - 1);
            handled = true;
          }
          break;
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            newIndex = loop
              ? currentIndexRef.current === 0
                ? children.length - 1
                : currentIndexRef.current - 1
              : Math.max(currentIndexRef.current - 1, 0);
            handled = true;
          }
          break;
        case 'Home':
          newIndex = 0;
          handled = true;
          break;
        case 'End':
          newIndex = children.length - 1;
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
        updateTabIndex(newIndex);
        children[newIndex]?.focus();
      }
    },
    [orientation, loop, getFocusableChildren, updateTabIndex]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      // Initialize tabindex
      updateTabIndex(0);
      
      container.addEventListener('keydown', handleKeyDown);
      return () => {
        container.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, updateTabIndex]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}