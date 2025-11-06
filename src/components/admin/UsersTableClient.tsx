'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { UserEditDialog } from './UserEditDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { SearchBar } from './SearchBar';
import { FilterDropdown } from './FilterDropdown';
import { toast } from 'sonner';
import { exportUsers } from '@/lib/admin/export';

type User = {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  createdAt: Date;
  subscriptions: { id: string; status: string }[];
  _count: {
    subscriptions: number;
    categories: number;
    members: number;
  };
};

type UsersTableClientProps = {
  users: User[];
};

export function UsersTableClient({ users }: UsersTableClientProps) {
  const router = useRouter();
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        user.name?.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower);

      // Plan filter
      const matchesPlan = !planFilter || user.subscriptionPlan === planFilter;

      // Status filter
      const matchesStatus = !statusFilter || user.subscriptionStatus === statusFilter;

      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [users, searchQuery, planFilter, statusFilter]);

  const handleDelete = async () => {
    if (!deleteUser) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${deleteUser.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      toast.success('User deleted successfully');
      setDeleteUser(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const planOptions = [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'business', label: 'Business' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'trial', label: 'Trial' },
    { value: 'canceled', label: 'Canceled' },
    { value: 'expired', label: 'Expired' },
  ];

  return (
    <>
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search by name, username, or email..."
            onSearch={setSearchQuery}
          />
        </div>
        <div className="flex gap-2">
          <FilterDropdown
            label="Plan"
            options={planOptions}
            value={planFilter}
            onChange={setPlanFilter}
            placeholder="All Plans"
          />
          <FilterDropdown
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Statuses"
          />
          <Button
            variant="outline"
            onClick={() => {
              exportUsers(filteredUsers);
              toast.success('Users exported successfully');
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Results count */}
      {(searchQuery || planFilter || statusFilter) && (
        <div className="text-sm text-muted-foreground mb-2">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscriptions</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  {searchQuery || planFilter || statusFilter
                    ? 'No users match the current filters'
                    : 'No users found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || user.username || 'N/A'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.subscriptionPlan === 'business'
                          ? 'default'
                          : user.subscriptionPlan === 'pro'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {user.subscriptionPlan.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.subscriptionStatus === 'active'
                          ? 'default'
                          : user.subscriptionStatus === 'trial'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {user.subscriptionStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {user._count.subscriptions}
                    {user.subscriptions.filter((s) => s.status === 'active').length > 0 && (
                      <span className="text-xs text-green-600 ml-1">
                        ({user.subscriptions.filter((s) => s.status === 'active').length} active)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{user._count.categories}</TableCell>
                  <TableCell className="text-center">{user._count.members}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteUser(user)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {editUser && (
        <UserEditDialog
          user={editUser}
          open={!!editUser}
          onOpenChange={(open) => !open && setEditUser(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteUser && (
        <DeleteConfirmDialog
          open={!!deleteUser}
          onOpenChange={(open) => !open && setDeleteUser(null)}
          onConfirm={handleDelete}
          title="Delete User"
          description="Are you sure you want to delete this user? This action cannot be undone."
          itemName={`${deleteUser.name || deleteUser.username || 'User'} (${deleteUser.email})`}
          cascadeInfo={[
            `${deleteUser._count.subscriptions} subscription(s)`,
            `${deleteUser._count.categories} category(ies)`,
            `${deleteUser._count.members} member(s)`,
          ]}
          loading={deleteLoading}
        />
      )}
    </>
  );
}
