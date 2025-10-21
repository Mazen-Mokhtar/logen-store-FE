'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Database, 
  HardDrive, 
  MemoryStick, 
  RefreshCw, 
  Server, 
  TrendingUp, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { useHealth } from '@/hooks/useHealth';
import { useLocale } from '@/hooks/useLocale';
import { clsx } from 'clsx';

interface HealthStatusProps {
  variant?: 'compact' | 'detailed' | 'dashboard';
  showMetrics?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
  showDetails?: boolean;
}

export function HealthStatus({
  variant = 'compact',
  showMetrics = false,
  autoRefresh = true,
  refreshInterval = 30000,
  className,
}: HealthStatusProps) {
  const { t, formatNumber, getRelativeTime } = useLocale();
  const {
    health,
    detailedHealth,
    metrics,
    overallStatus,
    isOnline,
    lastOnlineTime,
    isLoading,
    hasError,
    refresh,
    getStatusColor,
    getStatusIcon,
    formatUptime,
    formatBytes,
  } = useHealth(
    variant === 'detailed' || variant === 'dashboard' 
      ? 'detailed' 
      : showMetrics 
        ? 'metrics' 
        : 'basic'
  );

  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (!isLoading) {
      setLastRefresh(new Date());
    }
  }, [isLoading]);

  const handleRefresh = async () => {
    await refresh();
    setLastRefresh(new Date());
  };

  // Compact variant - just status indicator
  if (variant === 'compact') {
    return (
      <div className={clsx('flex items-center gap-2', className)}>
        <div className="relative">
          <div
            className={clsx(
              'w-3 h-3 rounded-full',
              isLoading && 'animate-pulse'
            )}
            style={{ backgroundColor: getStatusColor(overallStatus) }}
            title={`System status: ${overallStatus}`}
          />
          {!isOnline && (
            <WifiOff className="absolute -top-1 -right-1 w-2 h-2 text-red-500" />
          )}
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {t(`health.status.${overallStatus}`, { fallback: overallStatus })}
        </span>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={clsx(
            'p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
            isLoading && 'animate-spin'
          )}
          title={t('health.refresh', { fallback: 'Refresh' })}
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // Detailed variant - shows system checks
  if (variant === 'detailed') {
    return (
      <div className={clsx('space-y-4', className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getStatusColor(overallStatus) }}
            />
            <h3 className="text-lg font-semibold">
              {t('health.systemStatus', { fallback: 'System Status' })}
            </h3>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={clsx(
              'flex items-center gap-2 px-3 py-1 rounded-md text-sm',
              'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
            {t('health.refresh', { fallback: 'Refresh' })}
          </button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2 text-sm">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span>
            {isOnline 
              ? t('health.online', { fallback: 'Online' })
              : t('health.offline', { fallback: 'Offline' })
            }
          </span>
          {!isOnline && (
            <span className="text-gray-500">
              ({t('health.lastSeen', { fallback: 'Last seen' })}: {getRelativeTime(lastOnlineTime)})
            </span>
          )}
        </div>

        {/* Basic Health Info */}
        {health && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{t('health.uptime', { fallback: 'Uptime' })}: {formatUptime(health.uptime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-gray-500" />
              <span>{t('health.version', { fallback: 'Version' })}: {health.version}</span>
            </div>
          </div>
        )}

        {/* System Checks */}
        {detailedHealth?.checks && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">
              {t('health.systemChecks', { fallback: 'System Checks' })}
            </h4>
            <div className="space-y-1">
              {Object.entries(detailedHealth.checks).map(([name, check]) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span style={{ color: getStatusColor(check.status) }}>
                      {getStatusIcon(check.status)}
                    </span>
                    <span className="capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    {check.duration && (
                      <span>{check.duration}ms</span>
                    )}
                    {check.message && (
                      <span className="text-xs">{check.message}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Resources */}
        {detailedHealth?.system && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">
              {t('health.systemResources', { fallback: 'System Resources' })}
            </h4>
            <div className="space-y-2">
              {/* Memory */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <MemoryStick className="w-4 h-4 text-gray-500" />
                  <span>{t('health.memory', { fallback: 'Memory' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full transition-all duration-300',
                        detailedHealth.system.memory.percentage > 80 ? 'bg-red-500' :
                        detailedHealth.system.memory.percentage > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      )}
                      style={{ width: `${detailedHealth.system.memory.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatBytes(detailedHealth.system.memory.used)} / {formatBytes(detailedHealth.system.memory.total)}
                  </span>
                </div>
              </div>

              {/* CPU */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-gray-500" />
                  <span>{t('health.cpu', { fallback: 'CPU' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full transition-all duration-300',
                        detailedHealth.system.cpu.usage > 80 ? 'bg-red-500' :
                        detailedHealth.system.cpu.usage > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      )}
                      style={{ width: `${detailedHealth.system.cpu.usage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {detailedHealth.system.cpu.usage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Disk */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-gray-500" />
                  <span>{t('health.disk', { fallback: 'Disk' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full transition-all duration-300',
                        detailedHealth.system.disk.percentage > 80 ? 'bg-red-500' :
                        detailedHealth.system.disk.percentage > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      )}
                      style={{ width: `${detailedHealth.system.disk.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatBytes(detailedHealth.system.disk.used)} / {formatBytes(detailedHealth.system.disk.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-500 text-center">
          {t('health.lastUpdated', { fallback: 'Last updated' })}: {getRelativeTime(lastRefresh)}
        </div>
      </div>
    );
  }

  // Dashboard variant - comprehensive view with metrics
  if (variant === 'dashboard') {
    return (
      <div className={clsx('space-y-6', className)}>
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: getStatusColor(overallStatus) }}
              />
              <div>
                <h3 className="font-semibold">
                  {t('health.overallStatus', { fallback: 'Overall Status' })}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {overallStatus}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="font-semibold">
                  {t('health.uptime', { fallback: 'Uptime' })}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {health ? formatUptime(health.uptime) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="w-6 h-6 text-green-500" />
              ) : (
                <WifiOff className="w-6 h-6 text-red-500" />
              )}
              <div>
                <h3 className="font-semibold">
                  {t('health.connection', { fallback: 'Connection' })}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isOnline ? t('health.online', { fallback: 'Online' }) : t('health.offline', { fallback: 'Offline' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">
                  {t('health.requests', { fallback: 'Requests' })}
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('health.total', { fallback: 'Total' })}:</span>
                  <span>{formatNumber(metrics.requests.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('health.success', { fallback: 'Success' })}:</span>
                  <span className="text-green-600">{formatNumber(metrics.requests.success)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('health.errors', { fallback: 'Errors' })}:</span>
                  <span className="text-red-600">{formatNumber(metrics.requests.error)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('health.avgResponseTime', { fallback: 'Avg Response' })}:</span>
                  <span>{metrics.requests.averageResponseTime}ms</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="flex items-center gap-3 mb-3">
                <Database className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">
                  {t('health.database', { fallback: 'Database' })}
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('health.connections', { fallback: 'Connections' })}:</span>
                  <span>{formatNumber(metrics.database.connections)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('health.queries', { fallback: 'Queries' })}:</span>
                  <span>{formatNumber(metrics.database.queries)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('health.avgQueryTime', { fallback: 'Avg Query Time' })}:</span>
                  <span>{metrics.database.averageQueryTime}ms</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold">
                  {t('health.cache', { fallback: 'Cache' })}
                </h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('health.hits', { fallback: 'Hits' })}:</span>
                  <span className="text-green-600">{formatNumber(metrics.cache.hits)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('health.misses', { fallback: 'Misses' })}:</span>
                  <span className="text-red-600">{formatNumber(metrics.cache.misses)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('health.hitRate', { fallback: 'Hit Rate' })}:</span>
                  <span>{(metrics.cache.hitRate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md',
              'hover:bg-blue-600 transition-colors',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
            {t('health.refresh', { fallback: 'Refresh' })}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default HealthStatus;