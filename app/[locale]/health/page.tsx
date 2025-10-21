import { Suspense } from 'react';
import HealthStatus from '@/components/HealthStatus';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import SEOHead from '@/components/SEOHead';
import LoadingSpinner from '@/components/LoadingSpinner';

interface HealthPageProps {
  params: {
    locale: string;
  };
}

export default function HealthPage({ params }: HealthPageProps) {
  const { locale } = params;

  return (
    <>
      <SEOHead
        title="System Health"
        description="Monitor system health, performance metrics, and service status in real-time."
        path={`/${locale}/health`}
        type="website"
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                System Health Dashboard
              </h1>
              <LanguageSwitcher variant="dropdown" />
            </div>
            <p className="text-gray-600">
              Real-time monitoring of system health, performance metrics, and service status.
            </p>
          </div>

          {/* Health Status Components */}
          <div className="space-y-8">
            {/* Compact View */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Quick Status
              </h2>
              <Suspense fallback={<LoadingSpinner size="sm" label="Loading status..." />}>
                <HealthStatus variant="compact" />
              </Suspense>
            </section>

            {/* Detailed View */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Detailed Health Information
              </h2>
              <Suspense fallback={<LoadingSpinner size="md" label="Loading detailed status..." />}>
                <HealthStatus variant="detailed" />
              </Suspense>
            </section>

            {/* Dashboard View */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Full Dashboard
              </h2>
              <Suspense fallback={<LoadingSpinner size="lg" label="Loading dashboard..." />}>
                <HealthStatus variant="dashboard" />
              </Suspense>
            </section>
          </div>

          {/* Additional Information */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              About Health Monitoring
            </h3>
            <div className="prose text-gray-600">
              <p>
                This dashboard provides real-time insights into system performance and health metrics.
                The monitoring system tracks various aspects including:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>System uptime and availability</li>
                <li>Resource utilization (CPU, Memory, Disk)</li>
                <li>Database connectivity and performance</li>
                <li>Cache system status</li>
                <li>API response times and error rates</li>
                <li>Network connectivity status</li>
              </ul>
              <p className="mt-4">
                Data is refreshed automatically every 30 seconds to provide up-to-date information.
                You can also manually refresh any component using the refresh button.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}