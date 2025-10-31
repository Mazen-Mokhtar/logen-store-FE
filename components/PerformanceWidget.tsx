'use client';

import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { usePerformanceMonitor } from '@/lib/performance-monitor';

interface PerformanceWidgetProps {
  showAlerts?: boolean;
  compact?: boolean;
  className?: string;
}

export function PerformanceWidget({ 
  showAlerts = true, 
  compact = false, 
  className = '' 
}: PerformanceWidgetProps) {
  const { measurements, alerts } = usePerformanceMonitor();
  const [isVisible, setIsVisible] = useState(false);

  // Convert measurements Map to array for easier handling
  const measurementsArray = Array.from(measurements.values());
  const activeAlerts = alerts.filter(alert => Date.now() - alert.timestamp < 300000); // Last 5 minutes

  const getStatusColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (rating: string) => {
    switch (rating) {
      case 'good': return <CheckCircle className="w-3 h-3" />;
      case 'needs-improvement': return <TrendingUp className="w-3 h-3" />;
      case 'poor': return <AlertTriangle className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  const formatValue = (name: string, value: number) => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return Math.round(value).toString();
  };

  const getUnit = (name: string) => {
    return name === 'CLS' ? '' : 'ms';
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">Performance</span>
          {activeAlerts.length > 0 && (
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </button>

        {isVisible && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Core Web Vitals
              </h3>
              
              <div className="space-y-2">
                {measurementsArray.slice(0, 5).map((measurement) => (
                  <div key={measurement.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1 rounded ${getStatusColor(measurement.rating)}`}>
                        {getStatusIcon(measurement.rating)}
                      </div>
                      <span className="text-sm font-medium">{measurement.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatValue(measurement.name, measurement.value)}{getUnit(measurement.name)}
                    </span>
                  </div>
                ))}
              </div>

              {showAlerts && activeAlerts.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1 text-red-500" />
                    Recent Alerts ({activeAlerts.length})
                  </h4>
                  <div className="space-y-1">
                    {activeAlerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="text-xs text-gray-600 truncate">
                        {alert.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Performance Overview
          </h3>
          {activeAlerts.length > 0 && (
            <div className="flex items-center space-x-1 text-sm text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span>{activeAlerts.length} alert{activeAlerts.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Core Web Vitals Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          {measurementsArray.map((measurement) => (
            <div
              key={measurement.name}
              className={`p-3 rounded-lg border ${getStatusColor(measurement.rating)}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{measurement.name}</span>
                {getStatusIcon(measurement.rating)}
              </div>
              <div className="text-lg font-bold">
                {formatValue(measurement.name, measurement.value)}
                <span className="text-xs font-normal ml-1">{getUnit(measurement.name)}</span>
              </div>
              <div className="text-xs opacity-75 capitalize">
                {measurement.rating.replace('-', ' ')}
              </div>
            </div>
          ))}
        </div>

        {/* Performance Score */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Overall Score</span>
          </div>
          <div className="flex items-center space-x-2">
            {(() => {
              const goodCount = measurementsArray.filter(m => m.rating === 'good').length;
              const totalCount = measurementsArray.length;
              const score = totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : 0;
              const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
              
              return (
                <>
                  <span className={`text-lg font-bold ${scoreColor}`}>{score}</span>
                  <span className="text-sm text-gray-600">/100</span>
                </>
              );
            })()}
          </div>
        </div>

        {/* Recent Alerts */}
        {showAlerts && activeAlerts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
              Recent Performance Issues
            </h4>
            <div className="space-y-2">
              {activeAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-2 rounded text-sm ${
                    alert.type === 'error' 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{alert.metric}</p>
                      <p className="text-xs opacity-75">{alert.message}</p>
                    </div>
                    <span className="text-xs opacity-50 ml-2">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              
              {activeAlerts.length > 3 && (
                <div className="text-center">
                  <span className="text-xs text-gray-500">
                    +{activeAlerts.length - 3} more alert{activeAlerts.length - 3 !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PerformanceWidget;