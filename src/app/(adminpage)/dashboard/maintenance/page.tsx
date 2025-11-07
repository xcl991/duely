'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Power,
  PowerOff,
  Clock,
  AlertTriangle,
  CheckCircle,
  History,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface MaintenanceStatus {
  enabled: boolean;
  message: string | null;
  estimatedMinutes: number | null;
  startedAt: string | null;
  estimatedEndTime: string | null;
}

interface MaintenanceLog {
  id: string;
  startedAt: string;
  endedAt: string | null;
  duration: number | null;
  message: string | null;
  startedByName: string | null;
  endedByName: string | null;
  reason: string | null;
}

export default function MaintenanceControlPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus | null>(null);
  const [history, setHistory] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [message, setMessage] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [reason, setReason] = useState('manual');

  // Fetch maintenance status
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/maintenance/status');
      if (response.ok) {
        const data = await response.json();
        setMaintenanceStatus(data);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
      toast.error('Failed to fetch maintenance status');
    }
  };

  // Fetch maintenance history
  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/admin/maintenance/history?limit=10');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStatus(), fetchHistory()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Toggle maintenance mode
  const toggleMaintenance = async (enable: boolean) => {
    if (actionLoading) return;

    setActionLoading(true);

    try {
      const response = await fetch('/api/admin/maintenance/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: enable,
          message: enable ? message || undefined : undefined,
          estimatedMinutes: enable ? estimatedMinutes : undefined,
          reason: enable ? reason : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle maintenance mode');
      }

      toast.success(data.message);

      // Refresh data
      await Promise.all([fetchStatus(), fetchHistory()]);

      // Reset form if activated
      if (enable) {
        setMessage('');
        setEstimatedMinutes(15);
        setReason('manual');
      }
    } catch (error: any) {
      console.error('Error toggling maintenance:', error);
      toast.error(error.message || 'Failed to toggle maintenance mode');
    } finally {
      setActionLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format duration
  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Maintenance Mode Control</h1>
        <p className="text-slate-600">Manage site-wide maintenance mode and view history</p>
      </div>

      {/* Current Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Current Status</h2>
          <button
            onClick={() => fetchStatus()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh status"
          >
            <RefreshCw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {maintenanceStatus && (
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                  maintenanceStatus.enabled
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {maintenanceStatus.enabled ? (
                  <>
                    <AlertTriangle className="w-5 h-5" />
                    <span>MAINTENANCE MODE ACTIVE</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>SITE OPERATIONAL</span>
                  </>
                )}
              </div>
            </div>

            {/* Details when active */}
            {maintenanceStatus.enabled && (
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Message:</p>
                  <p className="text-slate-900">{maintenanceStatus.message || 'Default message'}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Started At:</p>
                    <p className="text-slate-900">{formatDate(maintenanceStatus.startedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Estimated Duration:</p>
                    <p className="text-slate-900">
                      {maintenanceStatus.estimatedMinutes
                        ? formatDuration(maintenanceStatus.estimatedMinutes)
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Control Panel</h2>

        {maintenanceStatus?.enabled ? (
          /* Deactivate Form */
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">
                  Deactivating maintenance mode will restore site access for all users.
                </span>
              </p>
            </div>
            <button
              onClick={() => toggleMaintenance(false)}
              disabled={actionLoading}
              className="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Deactivating...</span>
                </>
              ) : (
                <>
                  <PowerOff className="w-5 h-5" />
                  <span>Deactivate Maintenance Mode</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Activate Form */
          <div className="space-y-4">
            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Maintenance Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="The site is currently under maintenance. We will be back online shortly."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Estimated Duration */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 15)}
                min={1}
                max={1440}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="manual">Manual</option>
                <option value="deployment">Deployment</option>
                <option value="emergency">Emergency</option>
                <option value="scheduled">Scheduled</option>
                <option value="database">Database Maintenance</option>
              </select>
            </div>

            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">
                  Warning: This will block all users from accessing the site (except admin panel).
                </span>
              </p>
            </div>

            {/* Activate Button */}
            <button
              onClick={() => toggleMaintenance(true)}
              disabled={actionLoading}
              className="w-full md:w-auto px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Activating...</span>
                </>
              ) : (
                <>
                  <Power className="w-5 h-5" />
                  <span>Activate Maintenance Mode</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Maintenance History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-900">Maintenance History</h2>
        </div>

        {history.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No maintenance history yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Started
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Ended
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Reason
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                    Started By
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {formatDate(log.startedAt)}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {formatDate(log.endedAt)}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {formatDuration(log.duration)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.reason || 'manual'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {log.startedByName || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
