'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Activity,
  Database,
  Server,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  CreditCard,
} from 'lucide-react';

interface HealthData {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      message: string;
      responseTime?: number;
      details?: any;
    };
    api: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      message: string;
      responseTime?: number;
      details?: any;
    };
    storage: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      message: string;
      details?: any;
    };
  };
  metrics: {
    uptime: number;
    activeUsers: number;
    totalUsers: number;
    activeSubscriptions: number;
    totalSubscriptions: number;
  };
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/system/health');
      const data = await response.json();

      if (data.success) {
        setHealth(data.health);
      } else {
        toast.error('Failed to fetch system health');
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
      toast.error('Failed to load system health');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Activity className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500">Degraded</Badge>;
      case 'unhealthy':
        return <Badge className="bg-red-500">Unhealthy</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.length > 0 ? parts.join(' ') : '< 1m';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading system health...</p>
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load system health data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground mt-1">
            Monitor system status and performance
          </p>
        </div>
        <Button onClick={fetchHealth} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Overall System Status</CardTitle>
              <CardDescription>
                Last updated: {new Date(health.timestamp).toLocaleString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(health.overall)}
              {getStatusBadge(health.overall)}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Health Checks */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Database Health */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database
              </CardTitle>
              {getStatusIcon(health.checks.database.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {health.checks.database.message}
              </p>
              {health.checks.database.responseTime && (
                <p className="text-xs text-muted-foreground">
                  Response time: {health.checks.database.responseTime}ms
                </p>
              )}
              {getStatusBadge(health.checks.database.status)}
            </div>
          </CardContent>
        </Card>

        {/* API Health */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="h-5 w-5" />
                API
              </CardTitle>
              {getStatusIcon(health.checks.api.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {health.checks.api.message}
              </p>
              {health.checks.api.responseTime && (
                <p className="text-xs text-muted-foreground">
                  Response time: {health.checks.api.responseTime}ms
                </p>
              )}
              {getStatusBadge(health.checks.api.status)}
            </div>
          </CardContent>
        </Card>

        {/* Storage Health */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Storage
              </CardTitle>
              {getStatusIcon(health.checks.storage.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {health.checks.storage.message}
              </p>
              {getStatusBadge(health.checks.storage.status)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>System Metrics</CardTitle>
          <CardDescription>Current system statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span className="text-sm">Uptime</span>
              </div>
              <p className="text-2xl font-bold">{formatUptime(health.metrics.uptime)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">Total Users</span>
              </div>
              <p className="text-2xl font-bold">{health.metrics.totalUsers}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">Active Subscriptions</span>
              </div>
              <p className="text-2xl font-bold">{health.metrics.activeSubscriptions}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">Total Subscriptions</span>
              </div>
              <p className="text-2xl font-bold">{health.metrics.totalSubscriptions}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
