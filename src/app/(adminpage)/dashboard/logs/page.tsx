import { getAdminSession } from '@/lib/admin/session';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format } from 'date-fns';

async function getAdminLogs() {
  try {
    const logs = await prisma.adminLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 100, // Last 100 logs
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get log stats
    const totalCount = await prisma.adminLog.count();
    const loginCount = logs.filter(l => l.action === 'login').length;
    const logoutCount = logs.filter(l => l.action === 'logout').length;
    const failedLoginCount = logs.filter(l => l.action === 'login_failed').length;

    // Get unique admin emails
    const uniqueAdmins = [...new Set(logs.map(l => l.admin?.email).filter(Boolean))];

    return {
      logs,
      stats: {
        totalCount,
        loginCount,
        logoutCount,
        failedLoginCount,
        uniqueAdmins: uniqueAdmins.length,
      },
    };
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    return {
      logs: [],
      stats: {
        totalCount: 0,
        loginCount: 0,
        logoutCount: 0,
        failedLoginCount: 0,
        uniqueAdmins: 0,
      },
    };
  }
}

function getActionBadgeVariant(action: string) {
  if (action === 'login') return 'default';
  if (action === 'logout') return 'secondary';
  if (action === 'login_failed') return 'destructive';
  return 'outline';
}

export default async function AdminLogsPage() {
  await getAdminSession(); // Ensure authenticated
  const { logs, stats } = await getAdminLogs();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Logs</h1>
        <p className="text-muted-foreground">
          Audit trail of all administrative actions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.loginCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Logouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.logoutCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedLoginCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueAdmins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 100 Logs)</CardTitle>
          <CardDescription>
            Detailed log of all administrative actions with timestamps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>User Agent</TableHead>
                  <TableHead>Relative Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {log.admin?.name || 'Unknown'}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {log.admin?.email || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.target || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.ipAddress || '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {log.userAgent || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
