import { prisma } from '@/lib/prisma';

/**
 * Health check status
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  status: HealthStatus;
  message: string;
  responseTime?: number;
  details?: any;
}

/**
 * System health overview
 */
export interface SystemHealth {
  overall: HealthStatus;
  timestamp: string;
  checks: {
    database: HealthCheckResult;
    api: HealthCheckResult;
    storage: HealthCheckResult;
  };
  metrics: {
    uptime: number;
    activeUsers: number;
    totalUsers: number;
    activeSubscriptions: number;
    totalSubscriptions: number;
    requestsPerMinute?: number;
    errorRate?: number;
  };
}

/**
 * Check database health
 */
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    // Simple query to test database connection
    await prisma.$queryRaw`SELECT 1`;

    const responseTime = Date.now() - startTime;

    // Check connection pool
    const userCount = await prisma.user.count();

    return {
      status: responseTime < 100 ? 'healthy' : responseTime < 500 ? 'degraded' : 'unhealthy',
      message: responseTime < 100
        ? 'Database connection is healthy'
        : responseTime < 500
        ? 'Database response is slow'
        : 'Database response is very slow',
      responseTime,
      details: {
        userCount,
        threshold: '100ms optimal, 500ms acceptable',
      },
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      message: 'Database connection failed',
      responseTime: Date.now() - startTime,
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Check API health
 */
export async function checkAPIHealth(): Promise<HealthCheckResult> {
  try {
    // Check if basic queries work
    const startTime = Date.now();
    const adminCount = await prisma.admin.count();
    const responseTime = Date.now() - startTime;

    return {
      status: responseTime < 50 ? 'healthy' : responseTime < 200 ? 'degraded' : 'unhealthy',
      message: 'API is operational',
      responseTime,
      details: {
        adminCount,
        threshold: '50ms optimal, 200ms acceptable',
      },
    };
  } catch (error) {
    console.error('API health check failed:', error);
    return {
      status: 'unhealthy',
      message: 'API check failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Check storage health (disk space, uploads, etc.)
 */
export async function checkStorageHealth(): Promise<HealthCheckResult> {
  try {
    // For now, simple check - can be extended with actual disk space checks
    const notificationCount = await prisma.adminNotification.count();
    const settingsCount = await prisma.adminSettings.count();

    return {
      status: 'healthy',
      message: 'Storage is operational',
      details: {
        notificationCount,
        settingsCount,
        note: 'Extended storage monitoring not yet implemented',
      },
    };
  } catch (error) {
    console.error('Storage health check failed:', error);
    return {
      status: 'unhealthy',
      message: 'Storage check failed',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Get system metrics
 */
export async function getSystemMetrics() {
  try {
    const [
      totalUsers,
      totalSubscriptions,
      activeSubscriptions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count(),
      prisma.subscription.count({
        where: {
          status: {
            in: ['active', 'trial'],
          },
        },
      }),
    ]);

    // Uptime in seconds (simplified - would normally track from app start)
    const uptime = process.uptime();

    return {
      uptime,
      activeUsers: 0, // Would need session tracking
      totalUsers,
      activeSubscriptions,
      totalSubscriptions,
    };
  } catch (error) {
    console.error('Error getting system metrics:', error);
    return {
      uptime: 0,
      activeUsers: 0,
      totalUsers: 0,
      activeSubscriptions: 0,
      totalSubscriptions: 0,
    };
  }
}

/**
 * Get overall system health
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    // Run all health checks in parallel
    const [database, api, storage, metrics] = await Promise.all([
      checkDatabaseHealth(),
      checkAPIHealth(),
      checkStorageHealth(),
      getSystemMetrics(),
    ]);

    // Determine overall status
    const statuses = [database.status, api.status, storage.status];
    let overall: HealthStatus = 'healthy';

    if (statuses.includes('unhealthy')) {
      overall = 'unhealthy';
    } else if (statuses.includes('degraded')) {
      overall = 'degraded';
    }

    return {
      overall,
      timestamp: new Date().toISOString(),
      checks: {
        database,
        api,
        storage,
      },
      metrics,
    };
  } catch (error) {
    console.error('Error getting system health:', error);
    return {
      overall: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: 'unhealthy',
          message: 'Health check failed',
        },
        api: {
          status: 'unhealthy',
          message: 'Health check failed',
        },
        storage: {
          status: 'unhealthy',
          message: 'Health check failed',
        },
      },
      metrics: {
        uptime: 0,
        activeUsers: 0,
        totalUsers: 0,
        activeSubscriptions: 0,
        totalSubscriptions: 0,
      },
    };
  }
}

/**
 * Format uptime in human-readable format
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(' ') : '< 1m';
}
