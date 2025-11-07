'use client';

import { useEffect, useState } from 'react';
import { Construction, Clock, RefreshCw } from 'lucide-react';

interface MaintenanceInfo {
  enabled: boolean;
  message: string | null;
  estimatedMinutes: number | null;
  estimatedEndTime: string | null;
  startedAt: string | null;
}

export default function MaintenancePage() {
  const [info, setInfo] = useState<MaintenanceInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<number>(30);

  // Fetch maintenance info
  const fetchMaintenanceInfo = async () => {
    try {
      const response = await fetch('/api/maintenance/info');
      if (response.ok) {
        const data = await response.json();
        setInfo(data);
      }
    } catch (error) {
      console.error('Error fetching maintenance info:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMaintenanceInfo();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMaintenanceInfo();
      setCountdown(30); // Reset countdown
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format estimated end time
  const formatEndTime = (estimatedMinutes: number | null) => {
    if (!estimatedMinutes) return null;

    if (estimatedMinutes < 60) {
      return `${estimatedMinutes} minute${estimatedMinutes !== 1 ? 's' : ''}`;
    }

    const hours = Math.floor(estimatedMinutes / 60);
    const mins = estimatedMinutes % 60;

    if (mins === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    return `${hours} hour${hours !== 1 ? 's' : ''} and ${mins} minute${mins !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Icon and Title */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-full">
                <Construction className="w-16 h-16 text-white" strokeWidth={2} />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Under Maintenance
            </h1>

            <p className="text-lg text-slate-600 max-w-md">
              {info?.message ||
                'We are currently performing scheduled maintenance. We will be back online shortly.'}
            </p>
          </div>

          {/* Estimated Time */}
          {info?.estimatedMinutes !== null && info?.estimatedMinutes !== undefined && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">
                  Estimated Downtime
                </h3>
              </div>
              <p className="text-center text-2xl font-bold text-blue-600">
                {formatEndTime(info.estimatedMinutes)}
              </p>
            </div>
          )}

          {/* Auto-refresh info */}
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <RefreshCw className="w-4 h-4" />
            <span>Auto-refreshing in {countdown} seconds</span>
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-slate-200"></div>

          {/* Additional Info */}
          <div className="text-center space-y-4">
            <p className="text-slate-600">
              We apologize for any inconvenience. Our team is working hard to complete this maintenance as quickly as possible.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <a
                href="mailto:support@duely.com"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Contact Support
              </a>
              <span className="hidden sm:block text-slate-300">|</span>
              <button
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Check Status
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-400 text-sm">
          <p>Duely - Subscription Management Platform</p>
        </div>
      </div>
    </div>
  );
}
