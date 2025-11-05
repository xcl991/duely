"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Download } from "lucide-react";
import { getSubscriptions, getSubscriptionStats, deleteSubscription, renewSubscription, getCategories, getMembers, calculateSubscriptionTotals } from "@/app/actions/subscriptions";
import { getUserSettings } from "@/app/actions/settings";
import { formatCurrency } from "@/lib/utils/currency";
import SubscriptionFormModal from "@/components/subscriptions/SubscriptionFormModal";
import SubscriptionsTable from "@/components/subscriptions/SubscriptionsTable";
import { toast } from "sonner";
import type { SubscriptionWithRelations } from "@/app/actions/subscriptions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "@/lib/i18n/hooks";

export default function SubscriptionsPage() {
  const t = useTranslations();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithRelations[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<SubscriptionWithRelations[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, paused: 0, canceled: 0, trial: 0 });
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [members, setMembers] = useState<Array<{ id: string; name: string }>>([]);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionWithRelations | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [frequencyFilter, setFrequencyFilter] = useState("all");
  const [memberFilter, setMemberFilter] = useState("all");

  // Calculated totals
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [annualProjection, setAnnualProjection] = useState(0);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Calculate totals
  useEffect(() => {
    const calculateTotals = async () => {
      const activeSubscriptions = subscriptions.filter((s) => s.status === "active");

      if (activeSubscriptions.length === 0) {
        setMonthlyTotal(0);
        setAnnualProjection(0);
        return;
      }

      try {
        const totals = await calculateSubscriptionTotals(activeSubscriptions, currency);
        setMonthlyTotal(totals.monthlyTotal);
        setAnnualProjection(totals.annualProjection);
      } catch (error) {
        console.error("Failed to calculate totals:", error);
        setMonthlyTotal(0);
        setAnnualProjection(0);
      }
    };

    calculateTotals();
  }, [subscriptions, currency]);

  // Apply filters
  useEffect(() => {
    let filtered = [...subscriptions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((sub) =>
        sub.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    // Frequency filter
    if (frequencyFilter !== "all") {
      filtered = filtered.filter((sub) => sub.billingFrequency === frequencyFilter);
    }

    // Member filter
    if (memberFilter !== "all") {
      filtered = filtered.filter((sub) => sub.member?.id === memberFilter);
    }

    setFilteredSubscriptions(filtered);
  }, [subscriptions, searchTerm, statusFilter, frequencyFilter, memberFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsData, statsData, categoriesData, membersData, userSettings] = await Promise.all([
        getSubscriptions(),
        getSubscriptionStats(),
        getCategories(),
        getMembers(),
        getUserSettings(),
      ]);
      setSubscriptions(subsData);
      setFilteredSubscriptions(subsData);
      setCurrency(userSettings.currency);
      setStats(statsData);
      setCategories(categoriesData);
      setMembers(membersData);
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
      toast.error(t('subscriptions.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedSubscription(null);
    setModalOpen(true);
  };

  const handleEdit = (subscription: SubscriptionWithRelations) => {
    setSelectedSubscription(subscription);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setSubscriptionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!subscriptionToDelete) return;

    try {
      const result = await deleteSubscription(subscriptionToDelete);
      if (result.success) {
        toast.success(result.message);
        loadData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(t('subscriptions.errors.deleteFailed'));
    } finally {
      setDeleteDialogOpen(false);
      setSubscriptionToDelete(null);
    }
  };

  const handleRenew = async (id: string) => {
    try {
      const result = await renewSubscription(id);
      if (result.success) {
        toast.success(result.message);
        loadData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(t('subscriptions.errors.renewFailed'));
    }
  };

  const handleExport = () => {
    // CSV export
    const headers = [t('subscriptions.service'), t('subscriptions.amount'), t('subscriptions.currency'), t('subscriptions.frequency'), t('categories.category'), t('members.member'), t('subscriptions.nextBilling'), t('subscriptions.status')];
    const rows = filteredSubscriptions.map((sub) => [
      sub.serviceName,
      sub.amount.toString(),
      sub.currency,
      sub.billingFrequency,
      sub.category?.name || "",
      sub.member?.name || "",
      sub.nextBilling.toISOString().split("T")[0],
      sub.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `subscriptions-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(t('subscriptions.exportSuccess'));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('nav.subscriptions')}</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('subscriptions.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-sm md:text-base text-muted-foreground">{t('subscriptions.manageAll')}</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="transition-colors hover:bg-[#3EBCB3] hover:text-white hover:border-[#3EBCB3] active:bg-[#3EBCB3] active:text-white"
            onTouchStart={(e) => {
              e.currentTarget.style.setProperty('background-color', '#3EBCB3', 'important');
              e.currentTarget.style.setProperty('color', 'white', 'important');
              e.currentTarget.style.setProperty('border-color', '#3EBCB3', 'important');
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.removeProperty('background-color');
              e.currentTarget.style.removeProperty('color');
              e.currentTarget.style.removeProperty('border-color');
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            {t('subscriptions.export')}
          </Button>
          <Button
            onClick={handleAddNew}
            style={{ backgroundColor: '#3EBCB3', color: 'white' }}
            className="shadow hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('subscriptions.addSubscription')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('subscriptions.monthlyTotal')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold break-words leading-tight">{formatCurrency(monthlyTotal, currency)}</div>
            <p className="text-xs text-muted-foreground">{t('subscriptions.activeSubscriptionsCount', { count: stats.active })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('subscriptions.annualProjection')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold break-words leading-tight">{formatCurrency(annualProjection, currency)}</div>
            <p className="text-xs text-muted-foreground">{t('subscriptions.basedOnCurrent')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('subscriptions.totalSubscriptions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.trial} {t('subscriptions.statusTrial').toLowerCase()} · {stats.paused} {t('subscriptions.statusPaused').toLowerCase()} · {stats.canceled} {t('subscriptions.statusCanceled').toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.activeSubscriptions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">{t('subscriptions.currentlyActive')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{t('subscriptions.filters')}</CardTitle>
          <CardDescription className="text-xs">{t('subscriptions.filterDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('subscriptions.searchPlaceholder')}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('subscriptions.allStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('subscriptions.allStatus')}</SelectItem>
                <SelectItem value="active">{t('subscriptions.statusActive')}</SelectItem>
                <SelectItem value="trial">{t('subscriptions.statusTrial')}</SelectItem>
                <SelectItem value="paused">{t('subscriptions.statusPaused')}</SelectItem>
                <SelectItem value="canceled">{t('subscriptions.statusCanceled')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('subscriptions.allFrequencies')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('subscriptions.allFrequencies')}</SelectItem>
                <SelectItem value="monthly">{t('subscriptions.frequencyMonthly')}</SelectItem>
                <SelectItem value="yearly">{t('subscriptions.frequencyYearly')}</SelectItem>
                <SelectItem value="quarterly">{t('subscriptions.frequencyQuarterly')}</SelectItem>
                <SelectItem value="weekly">{t('subscriptions.frequencyWeekly')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={memberFilter} onValueChange={setMemberFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('subscriptions.allMembers')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('subscriptions.allMembers')}</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('subscriptions.allSubscriptions')}</CardTitle>
          <CardDescription>
            {t('subscriptions.subscriptionsFound', { count: filteredSubscriptions.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionsTable
            subscriptions={filteredSubscriptions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRenew={handleRenew}
          />
        </CardContent>
      </Card>

      {/* Form Modal */}
      <SubscriptionFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        subscription={selectedSubscription}
        categories={categories}
        members={members}
        onSuccess={loadData}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('subscriptions.deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="transition-colors hover:bg-[#3EBCB3] hover:text-white hover:border-[#3EBCB3] active:bg-[#3EBCB3] active:text-white"
              onTouchStart={(e) => {
                e.currentTarget.style.setProperty('background-color', '#3EBCB3', 'important');
                e.currentTarget.style.setProperty('color', 'white', 'important');
                e.currentTarget.style.setProperty('border-color', '#3EBCB3', 'important');
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.removeProperty('background-color');
                e.currentTarget.style.removeProperty('color');
                e.currentTarget.style.removeProperty('border-color');
              }}
            >
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              style={{ backgroundColor: '#3EBCB3', color: 'white' }}
              className="shadow hover:opacity-90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
