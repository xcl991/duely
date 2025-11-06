import Papa from 'papaparse';

/**
 * Convert data to CSV and download
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: string[]
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);

  // Convert data to CSV
  const csv = Papa.unparse({
    fields: csvHeaders,
    data: data.map(item => {
      const row: any = {};
      csvHeaders.forEach(header => {
        const value = item[header];
        // Handle dates, objects, arrays
        if (value instanceof Date) {
          row[header] = value.toISOString();
        } else if (typeof value === 'object' && value !== null) {
          row[header] = JSON.stringify(value);
        } else {
          row[header] = value;
        }
      });
      return row;
    }),
  });

  // Download file
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Download file to user's computer
 */
export function downloadFile(
  content: string,
  filename: string,
  contentType: string
): void {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Format data for export
 */
export interface ExportUser {
  ID: string;
  Name: string;
  Username: string;
  Email: string;
  'Subscription Plan': string;
  'Subscription Status': string;
  'Google ID': string;
  'Created At': string;
  'Updated At': string;
}

export interface ExportSubscription {
  ID: string;
  'Service Name': string;
  Amount: number;
  Frequency: string;
  Status: string;
  'Next Billing': string;
  'User Email': string;
  'User Name': string;
  Category: string;
  Member: string;
  Notes: string;
  'Created At': string;
  'Updated At': string;
}

export interface ExportAdminLog {
  ID: string;
  Admin: string;
  'Admin Email': string;
  Action: string;
  Target: string;
  'IP Address': string;
  'User Agent': string;
  Metadata: string;
  Timestamp: string;
}

export interface ExportAnalytics {
  Date: string;
  Revenue: number;
  Subscriptions: number;
  'Total Users': number;
  'New Users': number;
  'Active Users': number;
  'Churn Rate': number;
}

/**
 * Export users to CSV
 */
export function exportUsers(users: any[]): void {
  const exportData: ExportUser[] = users.map(user => ({
    ID: user.id,
    Name: user.name || '',
    Username: user.username || '',
    Email: user.email,
    'Subscription Plan': user.subscriptionPlan || 'free',
    'Subscription Status': user.subscriptionStatus || 'free',
    'Google ID': user.googleId || '',
    'Created At': new Date(user.createdAt).toLocaleString(),
    'Updated At': new Date(user.updatedAt).toLocaleString(),
  }));

  const filename = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(exportData, filename);
}

/**
 * Export subscriptions to CSV
 */
export function exportSubscriptions(subscriptions: any[]): void {
  const exportData: ExportSubscription[] = subscriptions.map(sub => ({
    ID: sub.id,
    'Service Name': sub.serviceName,
    Amount: sub.amount,
    Frequency: sub.billingFrequency,
    Status: sub.status,
    'Next Billing': sub.nextBilling ? new Date(sub.nextBilling).toLocaleString() : '',
    'User Email': sub.user?.email || '',
    'User Name': sub.user?.name || '',
    Category: sub.category?.name || '',
    Member: sub.member?.name || '',
    Notes: sub.notes || '',
    'Created At': new Date(sub.createdAt).toLocaleString(),
    'Updated At': new Date(sub.updatedAt).toLocaleString(),
  }));

  const filename = `subscriptions-export-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(exportData, filename);
}

/**
 * Export admin logs to CSV
 */
export function exportAdminLogs(logs: any[]): void {
  const exportData: ExportAdminLog[] = logs.map(log => ({
    ID: log.id,
    Admin: log.admin?.name || '',
    'Admin Email': log.admin?.email || '',
    Action: log.action,
    Target: log.target || '',
    'IP Address': log.ipAddress || '',
    'User Agent': log.userAgent || '',
    Metadata: log.metadata || '',
    Timestamp: new Date(log.createdAt).toLocaleString(),
  }));

  const filename = `admin-logs-export-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(exportData, filename);
}

/**
 * Export analytics data to CSV
 */
export function exportAnalytics(analyticsData: any[]): void {
  const exportData: ExportAnalytics[] = analyticsData.map(data => ({
    Date: data.date,
    Revenue: data.revenue || 0,
    Subscriptions: data.subscriptions || 0,
    'Total Users': data.totalUsers || 0,
    'New Users': data.newUsers || 0,
    'Active Users': data.activeUsers || 0,
    'Churn Rate': data.churnRate || 0,
  }));

  const filename = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(exportData, filename);
}
