import { NextRequest, NextResponse } from 'next/server';
import { HealthStatus, DetailedHealthStatus } from '@/types';

// Simulate system metrics
function getSystemMetrics() {
  const now = Date.now();
  const startTime = now - (Math.random() * 86400000); // Random uptime up to 24 hours
  
  return {
    uptime: now - startTime,
    memory: {
      used: Math.floor(Math.random() * 8000000000), // Random memory usage up to 8GB
      total: 16000000000, // 16GB total
    },
    cpu: {
      usage: Math.random() * 100, // Random CPU usage 0-100%
      cores: 8,
    },
    disk: {
      used: Math.floor(Math.random() * 500000000000), // Random disk usage up to 500GB
      total: 1000000000000, // 1TB total
    },
  };
}

// Simulate service checks
function getServiceChecks() {
  const services = ['database', 'cache', 'api', 'storage'];
  const statuses: ('healthy' | 'warning' | 'error')[] = ['healthy', 'warning', 'error'];
  
  return services.map(service => ({
    name: service,
    status: Math.random() > 0.8 ? statuses[Math.floor(Math.random() * 3)] : 'healthy',
    responseTime: Math.floor(Math.random() * 200) + 10, // 10-210ms
    lastCheck: new Date().toISOString(),
  }));
}

// Basic health check
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'basic';

  try {
    if (type === 'basic') {
      const healthData: HealthStatus = {
        status: Math.random() > 0.9 ? 'error' : Math.random() > 0.7 ? 'warning' : 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Date.now() - (Math.random() * 86400000),
        version: '1.0.0',
      };

      return NextResponse.json(healthData);
    }

    if (type === 'detailed') {
      const metrics = getSystemMetrics();
      const services = getServiceChecks();
      
      // Convert services array to checks object format
      const checks: { [key: string]: { status: 'pass' | 'fail' | 'warn' | 'healthy' | 'warning' | 'error'; message?: string; duration?: number } } = {};
      if (Array.isArray(services) && services.length > 0) {
        services.forEach(service => {
          checks[service.name] = {
            status: service.status,
            message: `${service.name} service is ${service.status}`,
            duration: service.responseTime
          };
        });
      }
      
      const detailedHealth: DetailedHealthStatus = {
        status: services.some(s => s.status === 'error') ? 'error' : 
                services.some(s => s.status === 'warning') ? 'warning' : 'healthy',
        timestamp: new Date().toISOString(),
        uptime: metrics.uptime,
        version: '1.0.0',
        checks,
        system: {
          memory: {
            used: metrics.memory.used,
            total: metrics.memory.total,
            percentage: (metrics.memory.used / metrics.memory.total) * 100,
          },
          cpu: {
            usage: metrics.cpu.usage,
            cores: metrics.cpu.cores,
          },
          disk: {
            used: metrics.disk.used,
            total: metrics.disk.total,
            percentage: (metrics.disk.used / metrics.disk.total) * 100,
          },
        },
      };

      return NextResponse.json(detailedHealth);
    }

    if (type === 'metrics') {
      const metrics = {
        timestamp: new Date().toISOString(),
        requests: {
          total: Math.floor(Math.random() * 100000),
          perSecond: Math.floor(Math.random() * 100),
          errors: Math.floor(Math.random() * 100),
          averageResponseTime: Math.floor(Math.random() * 200) + 50,
        },
        database: {
          connections: Math.floor(Math.random() * 50),
          queries: Math.floor(Math.random() * 1000),
          averageQueryTime: Math.floor(Math.random() * 50) + 5,
        },
        cache: {
          hits: Math.floor(Math.random() * 10000),
          misses: Math.floor(Math.random() * 1000),
          hitRate: Math.random() * 100,
        },
      };

      return NextResponse.json(metrics);
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        error: 'Health check failed' 
      },
      { status: 500 }
    );
  }
}

// Health check with POST for more complex operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checks = [] } = body;

    // Simulate running specific health checks
    const results = checks.map((check: string) => ({
      name: check,
      status: Math.random() > 0.9 ? 'error' : 'healthy',
      duration: Math.floor(Math.random() * 100) + 10,
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({
      status: results.some((r: any) => r.status === 'error') ? 'error' : 'healthy',
      timestamp: new Date().toISOString(),
      checks: results,
    });
  } catch (error) {
    console.error('Health check POST error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        timestamp: new Date().toISOString(),
        error: 'Health check failed' 
      },
      { status: 500 }
    );
  }
}