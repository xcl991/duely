import { getAdminSession } from '@/lib/admin/session';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersTableClient } from '@/components/admin/UsersTableClient';

async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        subscriptions: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            subscriptions: true,
            categories: true,
            members: true,
          },
        },
      },
    });

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export default async function UsersPage() {
  await getAdminSession(); // Ensure authenticated
  const users = await getUsers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage and monitor all registered users
        </p>
      </div>

      {/* User Count Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Users</CardTitle>
          <CardDescription>
            {users.length} registered user{users.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Complete list of registered users with their subscription details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTableClient users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
