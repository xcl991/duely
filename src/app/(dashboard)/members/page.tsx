"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, DollarSign, Crown, TrendingDown, AlertTriangle } from "lucide-react";
import { MemberCard } from "@/components/members/MemberCard";
import { MemberFormModal } from "@/components/members/MemberFormModal";
import { MemberSubscriptionModal } from "@/components/members/MemberSubscriptionModal";
import {
  getMembersWithStats,
  getMemberStats,
  deleteMember,
  detectFamilyPlanSavings,
  type MemberWithStats,
  type FamilySavingsInsight,
} from "@/app/actions/members";
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
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/hooks";
import { getUserSettings } from "@/app/actions/settings";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils/currency";

export default function MembersPage() {
  const t = useTranslations();
  const [members, setMembers] = useState<MemberWithStats[]>([]);
  const [stats, setStats] = useState<{
    totalMembers: number;
    totalSpending: number;
    mostActiveMember: {
      id: string;
      name: string;
      avatarColor: string | null;
      spending: number;
      subscriptionCount: number;
    } | null;
  }>({
    totalMembers: 0,
    totalSpending: 0,
    mostActiveMember: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberWithStats | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [memberForSubscriptions, setMemberForSubscriptions] = useState<MemberWithStats | null>(null);
  const [savingsInsight, setSavingsInsight] = useState<FamilySavingsInsight>({
    totalPotentialSavings: 0,
    duplicateServices: [],
    hasOpportunities: false,
  });
  const [currency, setCurrency] = useState("IDR");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [membersData, statsData, savingsData, userSettings] = await Promise.all([
        getMembersWithStats(),
        getMemberStats(),
        detectFamilyPlanSavings(),
        getUserSettings(),
      ]);
      setMembers(membersData);
      setStats(statsData);
      setSavingsInsight(savingsData);
      setCurrency(userSettings.currency);
    } catch (error) {
      console.error("Failed to load members:", error);
      toast.error(t('members.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMember = () => {
    setSelectedMember(null);
    setIsModalOpen(true);
  };

  const handleEditMember = (member: MemberWithStats) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (memberId: string, memberName: string) => {
    setMemberToDelete({ id: memberId, name: memberName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;

    try {
      const result = await deleteMember(memberToDelete.id);

      if (result.success) {
        toast.success(result.message);
        loadData();
      } else {
        toast.error(result.error || t('members.failedToDelete'));
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(t('common.unexpectedError'));
    } finally {
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleViewSubscriptions = (member: MemberWithStats) => {
    setMemberForSubscriptions(member);
    setSubscriptionModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {t('members.title')}
            </h2>
            <p className="text-muted-foreground">
              {t('members.description')}
            </p>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            {t('members.addMember')}
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-sm md:text-base text-muted-foreground">
          {t('members.description')}
        </p>
        <Button
          onClick={handleAddMember}
          style={{ backgroundColor: '#3EBCB3', color: 'white' }}
          className="shadow hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('members.addMember')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('members.totalMembers')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('members.familyTotalSpending')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold break-words leading-tight">
              {formatCurrency(stats.totalSpending)}
            </div>
            <p className="text-xs text-muted-foreground">{t('common.perMonth')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('members.mostActiveMember')}
            </CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.mostActiveMember ? (
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback
                    style={{
                      backgroundColor:
                        stats.mostActiveMember.avatarColor || "#3b82f6",
                      color: "white",
                    }}
                  >
                    {getInitials(stats.mostActiveMember.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {stats.mostActiveMember.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(stats.mostActiveMember.spending)}/month
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
            )}
          </CardContent>
        </Card>

        <Card className={savingsInsight.hasOpportunities ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('members.potentialSavings')}
            </CardTitle>
            {savingsInsight.hasOpportunities ? (
              <TrendingDown className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            {savingsInsight.hasOpportunities ? (
              <>
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-green-600 break-words leading-tight">
                  {formatCurrency(savingsInsight.totalPotentialSavings)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('members.familyPlanOpportunities', { count: savingsInsight.duplicateServices.length })}
                </p>
                {savingsInsight.duplicateServices.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {savingsInsight.duplicateServices.slice(0, 2).map((service) => (
                      <Badge key={service.serviceName} variant="secondary" className="text-xs mr-1">
                        {service.serviceName} ({service.memberCount} {t('members.members')})
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground">$0.00</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('members.noDuplicates')}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Members Grid */}
      {members.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">{t('members.noMembers')}</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t('members.noMembersDesc')}
            </p>
            <Button
              onClick={handleAddMember}
              style={{ backgroundColor: '#3EBCB3', color: 'white' }}
              className="mt-4 shadow hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('members.addFirstMember')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={handleEditMember}
              onDelete={handleDeleteClick}
              onViewSubscriptions={handleViewSubscriptions}
              currency={currency}
            />
          ))}
        </div>
      )}

      {/* Member Form Modal */}
      <MemberFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        member={selectedMember}
      />

      {/* Member Subscription Modal */}
      <MemberSubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        member={memberForSubscriptions}
        currency={currency}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('members.deleteConfirmation', { name: memberToDelete?.name || '' })}
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
              onClick={handleDeleteConfirm}
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
