'use client';

import useSWR from 'swr';
import { HealthStatus, HealthMetrics, DetailedHealthStatus } from '@/types';
import { config } from '@/lib/config';
import { getCachedHealthData, memoryCache } from '@/lib/cache';

const fetcher = async (url: string) => {
  // Try memory cache first
  const cached = memoryCache.get(url);
  if (cached) return cached;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch health data');
  }
  
  const data = await response.json();
  // Cache for 30 seconds for health data
  memoryCache.set(url, data, 30 * 1000);
  return data;
};

export function useHealth(type: 'basic' | 'detailed' | 'metrics' = 'basic') {
  const apiUrl = `${config.api.endpoints.health}?type=${type}`;
  
  const { data, error, isLoading, mutate } = useSWR<HealthStatus | DetailedHealthStatus | HealthMetrics>(
    apiUrl,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 seconds
      errorRetryCount: 3,
      errorRetryInterval: 2000,
    }
  );

  // Calculate overall health status
  const getOverallStatus = (healthData: HealthStatus | DetailedHealthStatus | HealthMetrics | undefined): string => {
    if (!healthData) return 'unknown';
    
    if ('status' in healthData) {
      return healthData.status;
    }
    
    if ('requests' in healthData) {
      // This is HealthMetrics
      const errorRate = healthData.requests.error / healthData.requests.total;
      if (errorRate > 0.1) return 'error';
      if (errorRate > 0.05) return 'warning';
      return 'healthy';
    }
    
    return 'unknown';
  };

  // Get service count by status
  const getServiceCounts = (healthData: HealthStatus | HealthMetrics | DetailedHealthStatus | undefined) => {
    if (!healthData) {
      return { healthy: 0, warning: 0, error: 0, total: 0 };
    }
    
    // Check if it's DetailedHealthStatus with checks property
    if ('checks' in healthData) {
      const checks = Object.values(healthData.checks);
      return {
        healthy: checks.filter((check) => check.status === 'healthy' || check.status === 'pass').length,
        warning: checks.filter((check) => check.status === 'warning' || check.status === 'warn').length,
        error: checks.filter((check) => check.status === 'error' || check.status === 'fail').length,
        total: checks.length,
      };
    }
    
    // For basic HealthStatus or HealthMetrics, return counts based on overall status
    if ('status' in healthData) {
      const status = healthData.status;
      return {
        healthy: status === 'healthy' ? 1 : 0,
        warning: status === 'warning' || status === 'degraded' ? 1 : 0,
        error: status === 'error' || status === 'unhealthy' ? 1 : 0,
        total: 1,
      };
    }
    
    return { healthy: 0, warning: 0, error: 0, total: 0 };
  };

  // Check specific service health
  const checkServiceHealth = async (serviceName: string) => {
    try {
      const response = await fetch(config.api.endpoints.health, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service: serviceName }),
      });

      if (!response.ok) {
        throw new Error(`Failed to check ${serviceName} health`);
      }

      const result = await response.json();
      
      // Clear cache and revalidate
      memoryCache.delete(apiUrl);
      mutate();
      
      return result;
    } catch (error) {
      console.error(`Error checking ${serviceName} health:`, error);
      throw error;
    }
  };

  // Format uptime
  const formatUptime = (uptimeMs: number) => {
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Format memory usage
  const formatMemory = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  return {
    data,
    healthData: data, // Alias for backward compatibility
    health: type === 'basic' ? data as HealthStatus : undefined,
    detailedHealth: type === 'detailed' ? data as DetailedHealthStatus : undefined,
    metrics: type === 'metrics' ? data as HealthMetrics : undefined,
    isLoading,
    error,
    isOnline: !error && data !== undefined,
    lastOnlineTime: Date.now(),
    hasError: !!error,
    overallStatus: getOverallStatus(data),
    serviceCounts: getServiceCounts(data),
    checkServiceHealth,
    formatUptime,
    formatMemory,
    formatBytes: formatMemory, // Alias for backward compatibility
    getStatusColor,
    getStatusIcon,
    refresh: mutate,
  };
}