"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { subscriptionSchema, type SubscriptionFormData } from "@/lib/validations/subscription";
import { createSubscription, updateSubscription } from "@/app/actions/subscriptions";
import { toast } from "sonner";
import type { SubscriptionWithRelations } from "@/app/actions/subscriptions";
import { useTranslations } from "@/lib/i18n/hooks";

type SubscriptionFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: SubscriptionWithRelations | null;
  categories?: Array<{ id: string; name: string }>;
  members?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
};

export default function SubscriptionFormModal({
  open,
  onOpenChange,
  subscription,
  categories = [],
  members = [],
  onSuccess,
}: SubscriptionFormModalProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(subscription?.startDate || new Date());
  const [nextBillingDate, setNextBillingDate] = useState<Date | undefined>(
    subscription?.nextBilling || new Date()
  );

  const isEditMode = !!subscription;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: subscription
      ? {
          serviceName: subscription.serviceName,
          amount: subscription.amount,
          currency: subscription.currency,
          billingFrequency: subscription.billingFrequency as "monthly" | "yearly" | "quarterly" | "weekly",
          categoryId: subscription.category?.id || null,
          memberId: subscription.member?.id || null,
          startDate: new Date(subscription.startDate),
          nextBilling: new Date(subscription.nextBilling),
          status: subscription.status as "active" | "trial" | "paused" | "canceled",
          notes: subscription.notes,
        }
      : {
          serviceName: "",
          amount: 0,
          currency: "USD",
          billingFrequency: "monthly" as const,
          status: "active" as const,
          startDate: new Date(),
          nextBilling: new Date(),
        },
  });

  // Watch fields
  const watchedCurrency = watch("currency");
  const watchedFrequency = watch("billingFrequency");
  const watchedStatus = watch("status");
  const watchedCategory = watch("categoryId");
  const watchedMember = watch("memberId");

  // Reset form when subscription changes
  useEffect(() => {
    if (subscription) {
      reset({
        serviceName: subscription.serviceName,
        amount: subscription.amount,
        currency: subscription.currency,
        billingFrequency: subscription.billingFrequency as "monthly" | "yearly" | "quarterly" | "weekly",
        categoryId: subscription.category?.id || null,
        memberId: subscription.member?.id || null,
        startDate: new Date(subscription.startDate),
        nextBilling: new Date(subscription.nextBilling),
        status: subscription.status as "active" | "trial" | "paused" | "canceled",
        notes: subscription.notes,
      });
      setStartDate(new Date(subscription.startDate));
      setNextBillingDate(new Date(subscription.nextBilling));
    } else {
      reset({
        serviceName: "",
        amount: 0,
        currency: "USD",
        billingFrequency: "monthly" as const,
        status: "active" as const,
        startDate: new Date(),
        nextBilling: new Date(),
      });
      setStartDate(new Date());
      setNextBillingDate(new Date());
    }
  }, [subscription, reset]);

  // Update form values when dates change
  useEffect(() => {
    if (startDate) {
      setValue("startDate", startDate);
    }
  }, [startDate, setValue]);

  useEffect(() => {
    if (nextBillingDate) {
      setValue("nextBilling", nextBillingDate);
    }
  }, [nextBillingDate, setValue]);

  const onSubmit = async (data: SubscriptionFormData) => {
    setIsSubmitting(true);

    try {
      let result;

      if (isEditMode && subscription) {
        result = await updateSubscription({
          id: subscription.id,
          ...data,
        });
      } else {
        result = await createSubscription(data);
      }

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        reset();
        onSuccess?.();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('subscriptionForm.editTitle') : t('subscriptionForm.addTitle')}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t('subscriptionForm.updateDetails')
              : t('subscriptionForm.addNewDesc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Service Name */}
          <div className="space-y-2">
            <Label htmlFor="serviceName">{t('subscriptions.serviceName')} *</Label>
            <Input
              id="serviceName"
              placeholder={t('subscriptionForm.serviceNamePlaceholder')}
              {...register("serviceName")}
            />
            {errors.serviceName && (
              <p className="text-sm text-destructive">{errors.serviceName.message}</p>
            )}
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t('common.amount')} *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder={t('subscriptionForm.amountPlaceholder')}
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">{t('subscriptionForm.currency')} *</Label>
              <Select
                value={watchedCurrency}
                onValueChange={(value) => setValue("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('subscriptionForm.selectCurrency')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="IDR">IDR (Rp)</SelectItem>
                  <SelectItem value="KRW">KRW (₩)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                  <SelectItem value="AUD">AUD (A$)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Billing Frequency and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingFrequency">{t('subscriptions.billingFrequency')} *</Label>
              <Select
                value={watchedFrequency}
                onValueChange={(value: any) => setValue("billingFrequency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('subscriptionForm.selectFrequency')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t('subscriptions.frequencyMonthly')}</SelectItem>
                  <SelectItem value="yearly">{t('subscriptions.frequencyYearly')}</SelectItem>
                  <SelectItem value="quarterly">{t('subscriptions.frequencyQuarterly')}</SelectItem>
                  <SelectItem value="weekly">{t('subscriptions.frequencyWeekly')}</SelectItem>
                </SelectContent>
              </Select>
              {errors.billingFrequency && (
                <p className="text-sm text-destructive">{errors.billingFrequency.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t('common.status')} *</Label>
              <Select
                value={watchedStatus}
                onValueChange={(value: any) => setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('subscriptionForm.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('subscriptions.statusActive')}</SelectItem>
                  <SelectItem value="trial">{t('subscriptions.statusTrial')}</SelectItem>
                  <SelectItem value="paused">{t('subscriptions.statusPaused')}</SelectItem>
                  <SelectItem value="canceled">{t('subscriptions.statusCanceled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category and Member */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">{t('subscriptions.category')}</Label>
              <Select
                value={watchedCategory || "none"}
                onValueChange={(value) => setValue("categoryId", value === "none" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('subscriptionForm.selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('subscriptionForm.noCategory')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberId">{t('subscriptions.assignToMember')}</Label>
              <Select
                value={watchedMember || "none"}
                onValueChange={(value) => setValue("memberId", value === "none" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('subscriptionForm.selectMember')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('subscriptionForm.noMember')}</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date and Next Billing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('subscriptions.startDate')} *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {startDate ? (
                        <>
                          <span className="hidden sm:inline">{format(startDate, "PPP")}</span>
                          <span className="sm:hidden">{format(startDate, "PP")}</span>
                        </>
                      ) : (
                        t('subscriptionForm.pickDate')
                      )}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto min-w-[240px] p-0" align="center">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('subscriptions.nextBillingDate')} *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !nextBillingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {nextBillingDate ? (
                        <>
                          <span className="hidden sm:inline">{format(nextBillingDate, "PPP")}</span>
                          <span className="sm:hidden">{format(nextBillingDate, "PP")}</span>
                        </>
                      ) : (
                        t('subscriptionForm.pickDate')
                      )}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto min-w-[240px] p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={nextBillingDate}
                    onSelect={setNextBillingDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.nextBilling && (
                <p className="text-sm text-destructive">{errors.nextBilling.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t('subscriptions.notes')}</Label>
            <textarea
              id="notes"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t('subscriptions.addNotes')}
              {...register("notes")}
            />
            {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="transition-colors hover:bg-[#3EBCB3] hover:text-white hover:border-[#3EBCB3] active:bg-[#3EBCB3] active:text-white"
              onTouchStart={(e) => {
                e.currentTarget.style.backgroundColor = '#3EBCB3';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = '#3EBCB3';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.color = '';
                e.currentTarget.style.borderColor = '';
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: '#3EBCB3', color: 'white' }}
              className="shadow hover:opacity-90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? t('subscriptionForm.updateSubscription') : t('subscriptionForm.addSubscription')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
