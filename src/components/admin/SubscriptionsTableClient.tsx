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
import { formatDistanceToNow, format } from 'date-fns';
import { SubscriptionEditDialog } from './SubscriptionEditDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { SearchBar } from './SearchBar';
import { FilterDropdown } from './FilterDropdown';
import { toast } from 'sonner';
import { exportSubscriptions } from '@/lib/admin/export';

type Subscription = {
  id: string;
  serviceName: string;
  serviceIcon: string | null;
  amount: number;
  currency: string;
  billingFrequency: string;
  nextBilling: Date;
  status: string;
  notes: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    email: string;
  };
  category: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  member: {
    id: string;
    name: string;
  } | null;
};

type SubscriptionsTableClientProps = {
  subscriptions: Subscription[];
};

export function SubscriptionsTableClient({ subscriptions }: SubscriptionsTableClientProps) {
  const router = useRouter();
  const [editSubscription, setEditSubscription] = useState<Subscription | null>(null);
  const [deleteSubscription, setDeleteSubscription] = useState<Subscription | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('');

  // Filter and search subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        sub.serviceName.toLowerCase().includes(searchLower) ||
        sub.user.name?.toLowerCase().includes(searchLower) ||
        sub.user.username?.toLowerCase().includes(searchLower) ||
        sub.user.email.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = !statusFilter || sub.status === statusFilter;

      // Frequency filter
      const matchesFrequency = !frequencyFilter || sub.billingFrequency === frequencyFilter;

      return matchesSearch && matchesStatus && matchesFrequency;
    });
  }, [subscriptions, searchQuery, statusFilter, frequencyFilter]);

  const handleDelete = async () => {
    if (!deleteSubscription) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/admin/subscriptions/${deleteSubscription.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete subscription');
      }

      toast.success('Subscription deleted successfully');
      setDeleteSubscription(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete subscription');
    } finally {
      setDeleteLoading(false);
    }
  };

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'trial', label: 'Trial' },
    { value: 'paused', label: 'Paused' },
    { value: 'canceled', label: 'Canceled' },
  ];

  const frequencyOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'quarterly', label: 'Quarterly' },
  ];

  return (
    <>
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search by service name or user..."
            onSearch={setSearchQuery}
          />
        </div>
        <div className="flex gap-2">
          <FilterDropdown
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Statuses"
          />
          <FilterDropdown
            label="Frequency"
            options={frequencyOptions}
            value={frequencyFilter}
            onChange={setFrequencyFilter}
            placeholder="All Frequencies"
          />
          <Button
            variant="outline"
            onClick={() => {
              exportSubscriptions(filteredSubscriptions);
              toast.success('Subscriptions exported successfully');
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Results count */}
      {(searchQuery || statusFilter || frequencyFilter) && (
        <div className="text-sm text-muted-foreground mb-2">
          Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Next Billing</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground">
                  {searchQuery || statusFilter || frequencyFilter
                    ? 'No subscriptions match the current filters'
                    : 'No subscriptions found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {sub.serviceIcon && <span className="text-lg">{sub.serviceIcon}</span>}
                      <span>{sub.serviceName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {sub.user.name || sub.user.username || 'N/A'}
                      </div>
                      <div className="text-muted-foreground text-xs">{sub.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {sub.currency} {sub.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{sub.billingFrequency}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        sub.status === 'active'
                          ? 'default'
                          : sub.status === 'trial'
                          ? 'secondary'
                          : sub.status === 'paused'
                          ? 'outline'
                          : 'destructive'
                      }
                    >
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sub.category ? (
                      <div className="flex items-center gap-1">
                        {sub.category.color && (
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: sub.category.color }}
                          />
                        )}
                        <span className="text-sm">{sub.category.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {sub.member ? (
                      sub.member.name
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(sub.nextBilling), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditSubscription(sub)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteSubscription(sub)}
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
      {editSubscription && (
        <SubscriptionEditDialog
          subscription={editSubscription}
          open={!!editSubscription}
          onOpenChange={(open) => !open && setEditSubscription(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteSubscription && (
        <DeleteConfirmDialog
          open={!!deleteSubscription}
          onOpenChange={(open) => !open && setDeleteSubscription(null)}
          onConfirm={handleDelete}
          title="Delete Subscription"
          description="Are you sure you want to delete this subscription? This action cannot be undone."
          itemName={`${deleteSubscription.serviceName} (${deleteSubscription.user.email})`}
          loading={deleteLoading}
        />
      )}
    </>
  );
}
