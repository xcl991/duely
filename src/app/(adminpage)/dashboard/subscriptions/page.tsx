import { getAdminSession } from '@/lib/admin/session';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubscriptionsTableClient } from '@/components/admin/SubscriptionsTableClient';

async function getSubscriptions() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        member: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get subscription stats
    const totalCount = subscriptions.length;
    const activeCount = subscriptions.filter(s => s.status === 'active').length;
    const trialCount = subscriptions.filter(s => s.status === 'trial').length;
    const pausedCount = subscriptions.filter(s => s.status === 'paused').length;
    const canceledCount = subscriptions.filter(s => s.status === 'canceled').length;

    // Calculate total monthly value
    const totalMonthlyValue = subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, sub) => {
        if (sub.billingFrequency === 'monthly') {
          return sum + sub.amount;
        } else if (sub.billingFrequency === 'yearly') {
          return sum + sub.amount / 12;
        } else if (sub.billingFrequency === 'quarterly') {
          return sum + sub.amount / 3;
        }
        return sum;
      }, 0);

    return {
      subscriptions,
      stats: {
        totalCount,
        activeCount,
        trialCount,
        pausedCount,
        canceledCount,
        totalMonthlyValue,
      },
    };
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return {
      subscriptions: [],
      stats: {
        totalCount: 0,
        activeCount: 0,
        trialCount: 0,
        pausedCount: 0,
        canceledCount: 0,
        totalMonthlyValue: 0,
      },
    };
  }
}

export default async function SubscriptionsPage() {
  await getAdminSession(); // Ensure authenticated
  const { subscriptions, stats } = await getSubscriptions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
        <p className="text-muted-foreground">
          Manage and monitor all user subscriptions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Trial / Paused / Canceled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.trialCount} / {stats.pausedCount} / {stats.canceledCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions[0]?.currency || 'IDR'} {stats.totalMonthlyValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>
            Complete list of subscriptions with user details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionsTableClient subscriptions={subscriptions} />
        </CardContent>
      </Card>
    </div>
  );
}
