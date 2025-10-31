import { Metadata } from 'next';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';
import { Activity, Shield, TrendingUp, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Performance Dashboard | Admin',
  description: 'Real-time performance monitoring and Core Web Vitals tracking',
};

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Activity className="w-8 h-8 mr-3 text-blue-600" />
                  Performance Monitoring
                </h1>
                <p className="mt-2 text-gray-600">
                  Real-time Core Web Vitals tracking, alerts, and performance insights
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Admin Access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Core Web Vitals</h3>
                <p className="text-sm text-gray-600">Real-time performance metrics</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Performance Alerts</h3>
                <p className="text-sm text-gray-600">Automated monitoring & alerts</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Resource Monitoring</h3>
                <p className="text-sm text-gray-600">Memory, cache & network stats</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <PerformanceDashboard />
      </div>
    </div>
  );
}