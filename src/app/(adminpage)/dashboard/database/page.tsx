'use client';

import { useEffect, useState } from 'react';
import { Database, AlertCircle, ExternalLink, Server, Shield, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Database Viewer Page
 * Provides access to Prisma Studio for database management
 */
export default function DatabaseViewerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prismaStudioUrl, setPrismaStudioUrl] = useState<string>('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if admin is authenticated
      const response = await fetch('/api/admin/auth-check');
      const data = await response.json();

      if (data.isAdmin) {
        // In development, Prisma Studio runs on port 5555
        // In production, it will be proxied through nginx
        const isDevelopment = process.env.NODE_ENV === 'development';
        setPrismaStudioUrl(isDevelopment ? 'http://localhost:5555' : '/prisma-studio');
      } else {
        setError('You are not authorized to access the database viewer');
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setError('Failed to verify authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    checkAuth();
  };

  const openPrismaStudio = () => {
    if (prismaStudioUrl) {
      window.open(prismaStudioUrl, '_blank', 'width=1400,height=900');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Verifying authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <CardTitle className="text-red-900">Access Denied</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Database className="h-8 w-8" />
          Database Viewer
        </h1>
        <p className="text-gray-600 mt-2">
          Access and manage your database using Prisma Studio
        </p>
      </div>

      {/* Warning Card */}
      <Card className="mb-6 border-yellow-200 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-yellow-600" />
            <CardTitle className="text-yellow-900 text-lg">Security Notice</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-yellow-800 space-y-2">
          <p>⚠️ You have full database access. Please be careful when making changes.</p>
          <p>⚠️ Always backup data before performing bulk operations.</p>
          <p>⚠️ Changes made here directly affect the production database.</p>
        </CardContent>
      </Card>

      {/* Prisma Studio Access Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Option 1: Open in New Window */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Open in New Window
            </CardTitle>
            <CardDescription>
              Launch Prisma Studio in a separate browser window
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={openPrismaStudio} className="w-full" size="lg">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Prisma Studio
            </Button>
            <p className="text-sm text-gray-500 mt-3">
              Recommended for full-screen database management
            </p>
          </CardContent>
        </Card>

        {/* Option 2: Embedded View (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Development Mode
              </CardTitle>
              <CardDescription>
                Prisma Studio is running on localhost:5555
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  To start Prisma Studio in development:
                </p>
                <code className="block bg-gray-100 p-3 rounded text-sm">
                  npx prisma studio
                </code>
                <p className="text-xs text-gray-500">
                  Then access it at http://localhost:5555
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Production Info */}
        {process.env.NODE_ENV === 'production' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Production Setup
              </CardTitle>
              <CardDescription>
                Prisma Studio is proxied through nginx
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Production Configuration:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Runs on internal port 5555</li>
                  <li>Proxied through nginx</li>
                  <li>Protected by admin authentication</li>
                  <li>Rate limited for security</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Database Info Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Available Tables</CardTitle>
          <CardDescription>
            Tables accessible through Prisma Studio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              'Admin',
              'AdminLog',
              'AdminSettings',
              'AdminNotification',
              'AdminTwoFactor',
              'AdminIPWhitelist',
              'AdminAccessLog',
              'User',
              'Account',
              'Session',
              'Subscription',
              'Category',
              'Member',
              'Notification',
              'UserSettings',
              'Payment',
              'SubscriptionHistory',
              'ExchangeRate',
              'PushSubscription',
            ].map((table) => (
              <div
                key={table}
                className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {table}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Prisma Studio Features</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ul className="space-y-2 list-disc list-inside">
            <li>Browse all database tables and records</li>
            <li>Create, read, update, and delete records</li>
            <li>Filter and sort data with advanced queries</li>
            <li>View relationships between tables</li>
            <li>Export data to CSV or JSON</li>
            <li>Run custom Prisma queries</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
