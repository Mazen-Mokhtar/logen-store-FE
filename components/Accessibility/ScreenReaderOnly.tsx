'use client';

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function ScreenReaderOnly({ 
  children, 
  as: Component = 'span',
  className = '' 
}: ScreenReaderOnlyProps) {
  return (
    <Component className={`sr-only ${className}`}>
      {children}
    </Component>
  );
}

// Utility component for announcing dynamic content changes
interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = false,
  relevant = 'additions text' as any,
  className = '',
}: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  );
}

// Component for providing additional context
interface DescriptionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function Description({ id, children, className = '' }: DescriptionProps) {
  return (
    <div id={id} className={`sr-only ${className}`}>
      {children}
    </div>
  );
}

// Component for labeling elements
interface LabelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function Label({ id, children, className = '' }: LabelProps) {
  return (
    <span id={id} className={`sr-only ${className}`}>
      {children}
    </span>
  );
}