import { config } from './config';

// Analytics event types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

// Error tracking interface
export interface ErrorEvent {
  error: Error;
  errorInfo?: any;
  userId?: string;
  url?: string;
  userAgent?: string;
  timestamp?: number;
  context?: Record<string, any>;
}

// Performance tracking interface
export interface PerformanceEvent {
  name: string;
  value: number;
  unit: string;
  context?: Record<string, any>;
  timestamp?: number;
}

// Accessibility tracking interface
export interface AccessibilityEvent {
  action: string;
  element?: string;
  method?: 'keyboard' | 'mouse' | 'touch' | 'voice';
  context?: Record<string, any>;
  timestamp?: number;
}

class Analytics {
  private isInitialized = false;
  private queue: AnalyticsEvent[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    if (this.isInitialized) return;

    // Initialize Google Analytics
    if (config.analytics.googleAnalytics?.trackingId) {
      this.initializeGA();
    }

    // Initialize other analytics services here
    // Example: Mixpanel, Amplitude, etc.

    this.isInitialized = true;
    this.flushQueue();
  }

  private initializeGA() {
    // Google Analytics is initialized in the layout component
    // This method can be used for additional GA configuration
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', config.analytics.googleAnalytics?.trackingId, {
        page_title: document.title,
        page_location: window.location.href,
      });
    }
  }

  private flushQueue() {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.sendEvent(event);
      }
    }
  }

  private sendEvent(event: AnalyticsEvent) {
    if (!this.isInitialized) {
      this.queue.push(event);
      return;
    }

    // Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      window.gtag('event', event.name, {
        ...event.properties,
        user_id: event.userId,
        timestamp: event.timestamp || Date.now(),
      });
    }

    // Send to other analytics services
    this.sendToCustomAnalytics(event);
  }

  private sendToCustomAnalytics(event: AnalyticsEvent) {
    // Implement custom analytics logic here
    // Example: Send to your own analytics endpoint
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }
  }

  // Public methods
  track(name: string, properties?: Record<string, any>, userId?: string) {
    this.sendEvent({
      name,
      properties,
      userId,
      timestamp: Date.now(),
    });
  }

  page(path: string, title?: string, properties?: Record<string, any>) {
    this.track('page_view', {
      page_path: path,
      page_title: title || document.title,
      ...properties,
    });
  }

  identify(userId: string, traits?: Record<string, any>) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', config.analytics.googleAnalytics?.trackingId, {
        user_id: userId,
        custom_map: traits,
      });
    }

    this.track('identify', { user_id: userId, ...traits });
  }

  trackError(errorEvent: ErrorEvent) {
    const event: AnalyticsEvent = {
      name: 'error',
      properties: {
        error_message: errorEvent.error.message,
        error_stack: errorEvent.error.stack,
        error_name: errorEvent.error.name,
        url: errorEvent.url || (typeof window !== 'undefined' ? window.location.href : ''),
        user_agent: errorEvent.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
        context: errorEvent.context,
      },
      userId: errorEvent.userId,
      timestamp: errorEvent.timestamp || Date.now(),
    };

    this.sendEvent(event);

    // Also send to error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(errorEvent.error);
    }
  }

  trackPerformance(performanceEvent: PerformanceEvent) {
    this.track('performance', {
      metric_name: performanceEvent.name,
      metric_value: performanceEvent.value,
      metric_unit: performanceEvent.unit,
      ...performanceEvent.context,
    });
  }

  trackAccessibility(accessibilityEvent: AccessibilityEvent) {
    this.track('accessibility', {
      accessibility_action: accessibilityEvent.action,
      accessibility_element: accessibilityEvent.element,
      accessibility_method: accessibilityEvent.method,
      ...accessibilityEvent.context,
    });
  }

  trackConversion(conversionName: string, value?: number, currency?: string) {
    this.track('conversion', {
      conversion_name: conversionName,
      value,
      currency: currency || 'USD',
    });
  }

  trackSearch(query: string, results?: number, category?: string) {
    this.track('search', {
      search_term: query,
      search_results: results,
      search_category: category,
    });
  }

  trackEngagement(action: string, element?: string, value?: number) {
    this.track('engagement', {
      engagement_action: action,
      engagement_element: element,
      engagement_value: value,
    });
  }
}

// Create singleton instance
// Export for backward compatibility
export const initGA = () => {
  // Google Analytics is initialized in the layout component
  // This is a legacy export for compatibility
  console.warn('initGA is deprecated. GA is automatically initialized.');
};

export const GA_TRACKING_ID = config.analytics.googleAnalytics?.trackingId || '';

export const analytics = new Analytics();

// Convenience functions
export const trackEvent = (name: string, properties?: Record<string, any>) => {
  analytics.track(name, properties);
};

export const trackPageView = (path: string, title?: string) => {
  analytics.page(path, title);
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  analytics.trackError({
    error,
    context,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    timestamp: Date.now(),
  });
};

export const trackPerformance = (name: string, value: number, unit: string = 'ms') => {
  analytics.trackPerformance({ name, value, unit });
};

export const trackAccessibility = (action: string, element?: string, method?: 'keyboard' | 'mouse' | 'touch' | 'voice') => {
  analytics.trackAccessibility({ action, element, method });
};

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    page: analytics.page.bind(analytics),
    identify: analytics.identify.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackAccessibility: analytics.trackAccessibility.bind(analytics),
    trackConversion: analytics.trackConversion.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackEngagement: analytics.trackEngagement.bind(analytics),
  };
}

// Global type declarations
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}