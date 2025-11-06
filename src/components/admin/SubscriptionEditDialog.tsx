'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

type Subscription = {
  id: string;
  serviceName: string;
  amount: number;
  billingFrequency: string;
  nextBilling: Date | null;
  status: string;
  notes: string | null;
  user: {
    name: string | null;
    email: string;
  };
};

type SubscriptionEditDialogProps = {
  subscription: Subscription;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SubscriptionEditDialog({
  subscription,
  open,
  onOpenChange,
}: SubscriptionEditDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: subscription.serviceName,
    amount: subscription.amount.toString(),
    billingFrequency: subscription.billingFrequency,
    nextBilling: subscription.nextBilling
      ? new Date(subscription.nextBilling).toISOString().split('T')[0]
      : '',
    status: subscription.status,
    notes: subscription.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/subscriptions/${subscription.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: formData.serviceName,
          amount: parseFloat(formData.amount),
          billingFrequency: formData.billingFrequency,
          nextBilling: formData.nextBilling ? new Date(formData.nextBilling) : null,
          status: formData.status,
          notes: formData.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update subscription');
      }

      toast.success('Subscription updated successfully');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/subscriptions/${subscription.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      toast.success(`Subscription ${newStatus === 'canceled' ? 'canceled' : newStatus === 'paused' ? 'paused' : 'resumed'} successfully`);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
          <DialogDescription>
            Update subscription details for {subscription.user.name || subscription.user.email}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Service Name */}
            <div className="grid gap-2">
              <Label htmlFor="serviceName">Service Name</Label>
              <Input
                id="serviceName"
                type="text"
                value={formData.serviceName}
                onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                placeholder="e.g. Netflix"
                required
              />
            </div>

            {/* Amount */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (IDR)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g. 186000"
                required
              />
            </div>

            {/* Billing Frequency */}
            <div className="grid gap-2">
              <Label htmlFor="billingFrequency">Billing Frequency</Label>
              <Select
                value={formData.billingFrequency}
                onValueChange={(value) =>
                  setFormData({ ...formData, billingFrequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Next Billing Date */}
            <div className="grid gap-2">
              <Label htmlFor="nextBilling">Next Billing Date</Label>
              <Input
                id="nextBilling"
                type="date"
                value={formData.nextBilling}
                onChange={(e) => setFormData({ ...formData, nextBilling: e.target.value })}
              />
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes about this subscription"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <div className="flex gap-2 mr-auto">
              {subscription.status === 'active' && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleStatusChange('paused')}
                    disabled={loading}
                  >
                    Pause
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleStatusChange('canceled')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </>
              )}
              {subscription.status === 'paused' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleStatusChange('active')}
                  disabled={loading}
                >
                  Resume
                </Button>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Close
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
