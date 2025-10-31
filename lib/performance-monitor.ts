// Performance monitoring utilities and automated tracking
import { backgroundSync } from './background-sync';

export interface PerformanceThresholds {
  lcp: { good: number; poor: number };
  fid: { good: number; poor: number };
  cls: { good: number; poor: number };
  fcp: { good: number; poor: number };
  ttfb: { good: number; poor: number };
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

export interface WebVitalMeasurement {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

class PerformanceMonitor {
  private thresholds: PerformanceThresholds = {
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    fcp: { good: 1800, poor: 3000 },
    ttfb: { good: 800, poor: 1800 }
  };

  private observers: Map<string, PerformanceObserver> = new Map();
  private measurements: Map<string, WebVitalMeasurement> = new Map();
  private alertCallbacks: Array<(alert: PerformanceAlert) => void> = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;

    this.setupWebVitalsObservers();
    this.setupResourceObserver();
    this.setupNavigationObserver();
    this.setupMemoryMonitoring();
    
    this.isInitialized = true;
  }

  private setupWebVitalsObservers() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          if (lastEntry) {
            this.recordWebVital({
              name: 'LCP',
              value: lastEntry.startTime,
              rating: this.getRating(lastEntry.startTime, this.thresholds.lcp),
              delta: lastEntry.startTime,
              id: this.generateId(),
              navigationType: this.getNavigationType()
            });
          }
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          
          entries.forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              const value = entry.processingStart - entry.startTime;
              
              this.recordWebVital({
                name: 'FID',
                value,
                rating: this.getRating(value, this.thresholds.fid),
                delta: value,
                id: this.generateId(),
                navigationType: this.getNavigationType()
              });
            }
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        let sessionValue = 0;
        let sessionEntries: any[] = [];
        
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              const firstSessionEntry = sessionEntries[0];
              const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
              
              if (sessionValue && 
                  entry.startTime - lastSessionEntry.startTime < 1000 &&
                  entry.startTime - firstSessionEntry.startTime < 5000) {
                sessionValue += entry.value;
                sessionEntries.push(entry);
              } else {
                sessionValue = entry.value;
                sessionEntries = [entry];
              }
              
              if (sessionValue > clsValue) {
                clsValue = sessionValue;
                
                this.recordWebVital({
                  name: 'CLS',
                  value: clsValue,
                  rating: this.getRating(clsValue, this.thresholds.cls),
                  delta: entry.value,
                  id: this.generateId(),
                  navigationType: this.getNavigationType()
                });
              }
            }
          });
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }

      // First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          
          if (fcpEntry) {
            this.recordWebVital({
              name: 'FCP',
              value: fcpEntry.startTime,
              rating: this.getRating(fcpEntry.startTime, this.thresholds.fcp),
              delta: fcpEntry.startTime,
              id: this.generateId(),
              navigationType: this.getNavigationType()
            });
          }
        });
        
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('fcp', fcpObserver);
      } catch (error) {
        console.warn('FCP observer not supported:', error);
      }
    }

    // Time to First Byte (TTFB) from Navigation Timing
    this.measureTTFB();
  }

  private setupResourceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          
          entries.forEach((entry: any) => {
            // Track slow resources
            if (entry.duration > 1000) {
              this.createAlert({
                type: 'warning',
                metric: 'Resource Load Time',
                value: entry.duration,
                threshold: 1000,
                message: `Slow resource: ${entry.name} took ${entry.duration.toFixed(0)}ms`,
                url: window.location.href,
                userAgent: navigator.userAgent
              });
            }
            
            // Track large resources
            if (entry.transferSize > 1024 * 1024) { // 1MB
              this.createAlert({
                type: 'warning',
                metric: 'Resource Size',
                value: entry.transferSize,
                threshold: 1024 * 1024,
                message: `Large resource: ${entry.name} is ${(entry.transferSize / 1024 / 1024).toFixed(1)}MB`,
                url: window.location.href,
                userAgent: navigator.userAgent
              });
            }
          });
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }
    }
  }

  private setupNavigationObserver() {
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          
          entries.forEach((entry: any) => {
            // Track slow page loads
            const loadTime = entry.loadEventEnd - entry.navigationStart;
            if (loadTime > 3000) {
              this.createAlert({
                type: 'warning',
                metric: 'Page Load Time',
                value: loadTime,
                threshold: 3000,
                message: `Slow page load: ${loadTime.toFixed(0)}ms`,
                url: window.location.href,
                userAgent: navigator.userAgent
              });
            }
          });
        });
        
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navigationObserver);
      } catch (error) {
        console.warn('Navigation observer not supported:', error);
      }
    }
  }

  private setupMemoryMonitoring() {
    if ((performance as any).memory) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usagePercent > 80) {
          this.createAlert({
            type: 'warning',
            metric: 'Memory Usage',
            value: usagePercent,
            threshold: 80,
            message: `High memory usage: ${usagePercent.toFixed(1)}%`,
            url: window.location.href,
            userAgent: navigator.userAgent
          });
        }
      };
      
      // Check memory every 30 seconds
      setInterval(checkMemory, 30000);
    }
  }

  private measureTTFB() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      
      this.recordWebVital({
        name: 'TTFB',
        value: ttfb,
        rating: this.getRating(ttfb, this.thresholds.ttfb),
        delta: ttfb,
        id: this.generateId(),
        navigationType: this.getNavigationType()
      });
    }
  }

  private recordWebVital(measurement: WebVitalMeasurement) {
    this.measurements.set(measurement.name, measurement);
    
    // Send to analytics
    this.sendToAnalytics(measurement);
    
    // Check for alerts
    if (measurement.rating === 'poor' || measurement.rating === 'needs-improvement') {
      const threshold = measurement.rating === 'poor' 
        ? this.thresholds[measurement.name.toLowerCase() as keyof PerformanceThresholds].poor
        : this.thresholds[measurement.name.toLowerCase() as keyof PerformanceThresholds].good;
      
      this.createAlert({
        type: measurement.rating === 'poor' ? 'error' : 'warning',
        metric: measurement.name,
        value: measurement.value,
        threshold,
        message: `${measurement.name} is ${measurement.rating.replace('-', ' ')}: ${measurement.value.toFixed(measurement.name === 'CLS' ? 3 : 0)}${this.getUnit(measurement.name)}`,
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    }
  }

  private sendToAnalytics(measurement: WebVitalMeasurement) {
    // Send to background sync for offline support
    backgroundSync.syncAnalyticsEvent('web-vital', {
      metric: measurement.name,
      value: measurement.value,
      rating: measurement.rating,
      delta: measurement.delta,
      id: measurement.id,
      navigationType: measurement.navigationType,
      url: window.location.href,
      timestamp: Date.now()
    });
  }

  private createAlert(alertData: Omit<PerformanceAlert, 'id' | 'timestamp'>) {
    const alert: PerformanceAlert = {
      ...alertData,
      id: this.generateId(),
      timestamp: Date.now()
    };
    
    // Notify alert callbacks
    this.alertCallbacks.forEach(callback => callback(alert));
    
    // Send to background sync
    backgroundSync.syncAnalyticsEvent('performance-alert', alert);
  }

  private getRating(value: number, thresholds: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  }

  private getNavigationType(): string {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return navigation ? navigation.type : 'unknown';
  }

  private getUnit(metric: string): string {
    switch (metric) {
      case 'CLS': return '';
      default: return 'ms';
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods
  public onAlert(callback: (alert: PerformanceAlert) => void) {
    this.alertCallbacks.push(callback);
  }

  public removeAlertCallback(callback: (alert: PerformanceAlert) => void) {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }

  public getMeasurements(): Map<string, WebVitalMeasurement> {
    return new Map(this.measurements);
  }

  public getLatestMeasurement(metric: string): WebVitalMeasurement | undefined {
    return this.measurements.get(metric);
  }

  public updateThresholds(newThresholds: Partial<PerformanceThresholds>) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  public getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  public startMonitoring() {
    if (!this.isInitialized) {
      this.initialize();
    }
  }

  public stopMonitoring() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.measurements.clear();
    this.alertCallbacks.length = 0;
    this.isInitialized = false;
  }

  public exportData() {
    return {
      measurements: Array.from(this.measurements.entries()),
      thresholds: this.thresholds,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for manual measurements
export function measureUserTiming(name: string, startMark?: string, endMark?: string) {
  if (typeof performance !== 'undefined' && performance.measure) {
    try {
      if (startMark && endMark) {
        performance.measure(name, startMark, endMark);
      } else {
        performance.measure(name);
      }
      
      const measures = performance.getEntriesByName(name, 'measure');
      const latestMeasure = measures[measures.length - 1];
      
      if (latestMeasure) {
        backgroundSync.syncAnalyticsEvent('user-timing', {
          name,
          duration: latestMeasure.duration,
          startTime: latestMeasure.startTime,
          url: window.location.href,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.warn('Error measuring user timing:', error);
    }
  }
}

export function markUserTiming(name: string) {
  if (typeof performance !== 'undefined' && performance.mark) {
    try {
      performance.mark(name);
    } catch (error) {
      console.warn('Error marking user timing:', error);
    }
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const [measurements, setMeasurements] = React.useState<Map<string, WebVitalMeasurement>>(new Map());
  const [alerts, setAlerts] = React.useState<PerformanceAlert[]>([]);

  React.useEffect(() => {
    const handleAlert = (alert: PerformanceAlert) => {
      setAlerts(prev => [...prev.slice(-9), alert]); // Keep last 10 alerts
    };

    performanceMonitor.onAlert(handleAlert);
    performanceMonitor.startMonitoring();

    // Update measurements periodically
    const interval = setInterval(() => {
      setMeasurements(performanceMonitor.getMeasurements());
    }, 1000);

    return () => {
      performanceMonitor.removeAlertCallback(handleAlert);
      clearInterval(interval);
    };
  }, []);

  return {
    measurements,
    alerts,
    monitor: performanceMonitor
  };
}

// Import React for the hook
import React from 'react';