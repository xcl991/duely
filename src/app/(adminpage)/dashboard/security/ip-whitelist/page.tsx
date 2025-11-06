'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Shield,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Globe,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface IPEntry {
  id: string;
  ipAddress: string;
  description: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastUsed: string | null;
}

export default function IPWhitelistPage() {
  const [entries, setEntries] = useState<IPEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Add IP form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIP, setNewIP] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/admin/ip-whitelist');
      const data = await response.json();

      if (data.success) {
        setEntries(data.entries);
        setEnabled(data.enabled);
      } else {
        toast.error('Failed to fetch IP whitelist');
      }
    } catch (error) {
      console.error('Error fetching IP whitelist:', error);
      toast.error('Failed to load IP whitelist');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWhitelist = async () => {
    setToggling(true);
    try {
      const response = await fetch('/api/admin/ip-whitelist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      });

      const data = await response.json();

      if (data.success) {
        setEnabled(!enabled);
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to toggle IP whitelist');
      }
    } catch (error) {
      console.error('Error toggling IP whitelist:', error);
      toast.error('Failed to toggle IP whitelist');
    } finally {
      setToggling(false);
    }
  };

  const handleAddIP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newIP.trim()) {
      toast.error('Please enter an IP address');
      return;
    }

    setAdding(true);
    try {
      const response = await fetch('/api/admin/ip-whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAddress: newIP.trim(),
          description: newDescription.trim() || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('IP address added to whitelist');
        setNewIP('');
        setNewDescription('');
        setShowAddForm(false);
        fetchEntries();
      } else {
        toast.error(data.error || 'Failed to add IP address');
      }
    } catch (error) {
      console.error('Error adding IP:', error);
      toast.error('Failed to add IP address');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/ip-whitelist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`IP ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchEntries();
      } else {
        toast.error(data.error || 'Failed to update IP');
      }
    } catch (error) {
      console.error('Error toggling IP status:', error);
      toast.error('Failed to update IP status');
    }
  };

  const handleUpdateDescription = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/ip-whitelist/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editDescription }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Description updated');
        setEditingId(null);
        setEditDescription('');
        fetchEntries();
      } else {
        toast.error(data.error || 'Failed to update description');
      }
    } catch (error) {
      console.error('Error updating description:', error);
      toast.error('Failed to update description');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this IP from the whitelist?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/ip-whitelist/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('IP removed from whitelist');
        fetchEntries();
      } else {
        toast.error(data.error || 'Failed to remove IP');
      }
    } catch (error) {
      console.error('Error deleting IP:', error);
      toast.error('Failed to remove IP');
    }
  };

  const startEdit = (entry: IPEntry) => {
    setEditingId(entry.id);
    setEditDescription(entry.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDescription('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading IP whitelist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">IP Whitelist</h1>
          <p className="text-muted-foreground mt-1">
            Manage IP-based access control for admin panel
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={enabled ? 'destructive' : 'default'}
            onClick={handleToggleWhitelist}
            disabled={toggling}
          >
            <Shield className="h-4 w-4 mr-2" />
            {enabled ? 'Disable Whitelist' : 'Enable Whitelist'}
          </Button>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add IP
            </Button>
          )}
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Whitelist Status</CardTitle>
              <CardDescription>
                {enabled
                  ? 'Only whitelisted IPs can access the admin panel'
                  : 'All IPs are currently allowed (whitelist disabled)'}
              </CardDescription>
            </div>
            <Badge className={enabled ? 'bg-green-500' : 'bg-gray-500'}>
              {enabled ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Warning when disabled */}
      {!enabled && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  IP Whitelist is Disabled
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                  The admin panel is currently accessible from any IP address. Enable
                  the whitelist to restrict access to approved IPs only.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add IP Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add IP Address</CardTitle>
            <CardDescription>
              Add a new IP address to the whitelist. Supports wildcards (e.g., 192.168.1.*)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddIP} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ipAddress">IP Address *</Label>
                  <Input
                    id="ipAddress"
                    placeholder="192.168.1.100 or 192.168.1.*"
                    value={newIP}
                    onChange={(e) => setNewIP(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Office network, Home IP, etc."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={adding}>
                  {adding ? 'Adding...' : 'Add IP Address'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewIP('');
                    setNewDescription('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* IP List */}
      <Card>
        <CardHeader>
          <CardTitle>Whitelisted IP Addresses ({entries.length})</CardTitle>
          <CardDescription>
            Manage IP addresses that are allowed to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No IP addresses</h3>
              <p className="text-muted-foreground mb-4">
                Add IP addresses to restrict admin panel access
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First IP
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 border rounded-lg ${
                    !entry.isActive ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-lg font-mono font-semibold">
                          {entry.ipAddress}
                        </code>
                        <Badge className={entry.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                          {entry.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {editingId === entry.id ? (
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Description"
                            className="max-w-md"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUpdateDescription(entry.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          {entry.description && (
                            <p className="text-sm text-muted-foreground">
                              {entry.description}
                            </p>
                          )}
                          <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                            <span>
                              Added {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                            </span>
                            {entry.lastUsed && (
                              <span>
                                Last used {formatDistanceToNow(new Date(entry.lastUsed), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(entry.id, entry.isActive)}
                      >
                        {entry.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(entry)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
