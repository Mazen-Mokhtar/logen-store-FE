'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Gauge, 
  TrendingUp, 
  TrendingDown,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  Settings,
  BarChart3,
  Zap
} from 'lucide-react';

interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  threshold: { good: number; poor: number };
  unit: string;
  description: string;
}

interface PerformanceMetrics {
  webVitals: {
    lcp: WebVital;
    fid: WebVital;
    cls: WebVital;
    fcp: WebVital;
    ttfb: WebVital;
  };
  networkInfo: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
  memoryInfo: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  cacheStats: {
    hitRate: number;
    totalRequests: number;
    cacheSize: number;
  };
  loadTimes: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
  };
  resourceTiming: {
    totalResources: number;
    totalSize: number;
    averageLoadTime: number;
  };
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  metric: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isCollecting, setIsCollecting] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [historicalData, setHistoricalData] = useState<PerformanceMetrics[]>([]);

  // Initialize Web Vitals thresholds
  const webVitalsConfig = {
    lcp: { good: 2500, poor: 4000, unit: 'ms', description: 'Largest Contentful Paint' },
    fid: { good: 100, poor: 300, unit: 'ms', description: 'First Input Delay' },
    cls: { good: 0.1, poor: 0.25, unit: '', description: 'Cumulative Layout Shift' },
    fcp: { good: 1800, poor: 3000, unit: 'ms', description: 'First Contentful Paint' },
    ttfb: { good: 800, poor: 1800, unit: 'ms', description: 'Time to First Byte' }
  };

  const getRating = (value: number, thresholds: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  };

  const collectWebVitals = useCallback((): Promise<Partial<PerformanceMetrics['webVitals']>> => {
    return new Promise((resolve) => {
      const vitals: Partial<PerformanceMetrics['webVitals']> = {};

      // Collect LCP
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            if (entries.length > 0) {
              const lastEntry = entries[entries.length - 1];
              const value = lastEntry.startTime;
              vitals.lcp = {
                name: 'LCP',
                value,
                rating: getRating(value, webVitalsConfig.lcp),
                threshold: webVitalsConfig.lcp,
                unit: webVitalsConfig.lcp.unit,
                description: webVitalsConfig.lcp.description
              };
            }
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // Collect FID
          const fidObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry: any) => {
              if (entry.processingStart && entry.startTime) {
                const value = entry.processingStart - entry.startTime;
                vitals.fid = {
                  name: 'FID',
                  value,
                  rating: getRating(value, webVitalsConfig.fid),
                  threshold: webVitalsConfig.fid,
                  unit: webVitalsConfig.fid.unit,
                  description: webVitalsConfig.fid.description
                };
              }
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

          // Collect CLS
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            vitals.cls = {
              name: 'CLS',
              value: clsValue,
              rating: getRating(clsValue, webVitalsConfig.cls),
              threshold: webVitalsConfig.cls,
              unit: webVitalsConfig.cls.unit,
              description: webVitalsConfig.cls.description
            };
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });

        } catch (error) {
          console.warn('Error collecting Web Vitals:', error);
        }
      }

      // Collect navigation timing metrics
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const fcp = navigation.responseStart - navigation.requestStart;
        const ttfb = navigation.responseStart - navigation.requestStart;

        vitals.fcp = {
          name: 'FCP',
          value: fcp,
          rating: getRating(fcp, webVitalsConfig.fcp),
          threshold: webVitalsConfig.fcp,
          unit: webVitalsConfig.fcp.unit,
          description: webVitalsConfig.fcp.description
        };

        vitals.ttfb = {
          name: 'TTFB',
          value: ttfb,
          rating: getRating(ttfb, webVitalsConfig.ttfb),
          threshold: webVitalsConfig.ttfb,
          unit: webVitalsConfig.ttfb.unit,
          description: webVitalsConfig.ttfb.description
        };
      }

      setTimeout(() => resolve(vitals), 1000);
    });
  }, []);

  const collectPerformanceMetrics = useCallback(async () => {
    setIsCollecting(true);

    try {
      const webVitals = await collectWebVitals();

      // Network Information
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const networkInfo = {
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0
      };

      // Memory Information
      const memoryInfo = (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0
      };

      // Cache Statistics (mock data - would be replaced with actual cache API)
      const cacheStats = {
        hitRate: Math.random() * 100,
        totalRequests: Math.floor(Math.random() * 1000) + 100,
        cacheSize: Math.floor(Math.random() * 50) + 10
      };

      // Load Times
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTimes = navigation ? {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstPaint: navigation.responseStart - navigation.navigationStart
      } : {
        domContentLoaded: 0,
        loadComplete: 0,
        firstPaint: 0
      };

      // Resource Timing
      const resources = performance.getEntriesByType('resource');
      const resourceTiming = {
        totalResources: resources.length,
        totalSize: resources.reduce((sum, resource: any) => sum + (resource.transferSize || 0), 0),
        averageLoadTime: resources.length > 0 
          ? resources.reduce((sum, resource) => sum + resource.duration, 0) / resources.length 
          : 0
      };

      const newMetrics: PerformanceMetrics = {
        webVitals: {
          lcp: webVitals.lcp || { name: 'LCP', value: 0, rating: 'good', threshold: webVitalsConfig.lcp, unit: 'ms', description: 'Largest Contentful Paint' },
          fid: webVitals.fid || { name: 'FID', value: 0, rating: 'good', threshold: webVitalsConfig.fid, unit: 'ms', description: 'First Input Delay' },
          cls: webVitals.cls || { name: 'CLS', value: 0, rating: 'good', threshold: webVitalsConfig.cls, unit: '', description: 'Cumulative Layout Shift' },
          fcp: webVitals.fcp || { name: 'FCP', value: 0, rating: 'good', threshold: webVitalsConfig.fcp, unit: 'ms', description: 'First Contentful Paint' },
          ttfb: webVitals.ttfb || { name: 'TTFB', value: 0, rating: 'good', threshold: webVitalsConfig.ttfb, unit: 'ms', description: 'Time to First Byte' }
        },
        networkInfo,
        memoryInfo,
        cacheStats,
        loadTimes,
        resourceTiming
      };

      setMetrics(newMetrics);
      setHistoricalData(prev => [...prev.slice(-19), newMetrics]); // Keep last 20 entries

      // Check for alerts
      checkForAlerts(newMetrics);

    } catch (error) {
      console.error('Error collecting performance metrics:', error);
    } finally {
      setIsCollecting(false);
    }
  }, [collectWebVitals]);

  const checkForAlerts = (metrics: PerformanceMetrics) => {
    const newAlerts: Alert[] = [];

    // Check Web Vitals for poor ratings
    Object.entries(metrics.webVitals).forEach(([key, vital]) => {
      if (vital.rating === 'poor') {
        newAlerts.push({
          id: `${key}-${Date.now()}`,
          type: 'error',
          metric: vital.name,
          message: `${vital.description} is poor (${vital.value.toFixed(2)}${vital.unit})`,
          timestamp: Date.now(),
          acknowledged: false
        });
      } else if (vital.rating === 'needs-improvement') {
        newAlerts.push({
          id: `${key}-${Date.now()}`,
          type: 'warning',
          metric: vital.name,
          message: `${vital.description} needs improvement (${vital.value.toFixed(2)}${vital.unit})`,
          timestamp: Date.now(),
          acknowledged: false
        });
      }
    });

    // Check memory usage
    if (metrics.memoryInfo.usedJSHeapSize > 0) {
      const memoryUsage = (metrics.memoryInfo.usedJSHeapSize / metrics.memoryInfo.jsHeapSizeLimit) * 100;
      if (memoryUsage > 80) {
        newAlerts.push({
          id: `memory-${Date.now()}`,
          type: 'warning',
          metric: 'Memory',
          message: `High memory usage: ${memoryUsage.toFixed(1)}%`,
          timestamp: Date.now(),
          acknowledged: false
        });
      }
    }

    // Check cache hit rate
    if (metrics.cacheStats.hitRate < 70) {
      newAlerts.push({
        id: `cache-${Date.now()}`,
        type: 'warning',
        metric: 'Cache',
        message: `Low cache hit rate: ${metrics.cacheStats.hitRate.toFixed(1)}%`,
        timestamp: Date.now(),
        acknowledged: false
      });
    }

    setAlerts(prev => [...prev, ...newAlerts].slice(-10)); // Keep last 10 alerts
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  const exportData = () => {
    const data = {
      currentMetrics: metrics,
      historicalData,
      alerts,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(collectPerformanceMetrics, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, collectPerformanceMetrics]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial data collection
  useEffect(() => {
    collectPerformanceMetrics();
  }, [collectPerformanceMetrics]);

  const getVitalColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Collecting performance metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={collectPerformanceMetrics}
            disabled={isCollecting}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isCollecting ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.filter(alert => !alert.acknowledged).length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Active Alerts ({alerts.filter(alert => !alert.acknowledged).length})
            </h3>
            <button
              onClick={clearAllAlerts}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-2">
            {alerts.filter(alert => !alert.acknowledged).map(alert => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getAlertColor(alert.type)} flex items-center justify-between`}
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-4 h-4" />
                  <div>
                    <p className="font-medium">{alert.metric}</p>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                </div>
                <button
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="text-sm hover:underline"
                >
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Web Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {Object.entries(metrics.webVitals).map(([key, vital]) => (
          <div
            key={key}
            className={`p-4 rounded-lg border ${getVitalColor(vital.rating)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{vital.name}</h4>
              <Gauge className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">
              {vital.value.toFixed(vital.name === 'CLS' ? 3 : 0)}{vital.unit}
            </p>
            <p className="text-sm opacity-75">{vital.description}</p>
            <div className="mt-2 text-xs">
              <span className="capitalize">{vital.rating.replace('-', ' ')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Network Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center">
            <Wifi className="w-4 h-4 mr-2" />
            Network Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Connection Type:</span>
              <span className="font-medium">{metrics.networkInfo.effectiveType}</span>
            </div>
            <div className="flex justify-between">
              <span>Downlink:</span>
              <span className="font-medium">{metrics.networkInfo.downlink} Mbps</span>
            </div>
            <div className="flex justify-between">
              <span>RTT:</span>
              <span className="font-medium">{metrics.networkInfo.rtt} ms</span>
            </div>
          </div>
        </div>

        {/* Memory Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Memory Usage
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Used:</span>
              <span className="font-medium">
                {(metrics.memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total:</span>
              <span className="font-medium">
                {(metrics.memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
            <div className="flex justify-between">
              <span>Limit:</span>
              <span className="font-medium">
                {(metrics.memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          </div>
        </div>

        {/* Cache Stats */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Cache Performance
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Hit Rate:</span>
              <span className="font-medium">{metrics.cacheStats.hitRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Total Requests:</span>
              <span className="font-medium">{metrics.cacheStats.totalRequests}</span>
            </div>
            <div className="flex justify-between">
              <span>Cache Size:</span>
              <span className="font-medium">{metrics.cacheStats.cacheSize} MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Dashboard Settings
          </h4>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Auto Refresh</span>
            </label>
            
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
              disabled={!autoRefresh}
            >
              <option value={1000}>1s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
              <option value={60000}>1m</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PerformanceDashboard;