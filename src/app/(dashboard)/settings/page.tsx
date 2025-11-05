"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Bell, DollarSign, RotateCcw, Save } from "lucide-react";
import {
  getUserSettings,
  updateUserSettings,
  resetSettings,
} from "@/app/actions/settings";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Locale } from "@/lib/i18n/config";
import { useTranslations } from "@/lib/i18n/hooks";

export default function SettingsPage() {
  const t = useTranslations();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Language context
  const { locale, setLocale } = useLanguage();

  // Form state
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState<"en" | "id">(locale);
  const [emailReminders, setEmailReminders] = useState(true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [monthlyBudgetLimit, setMonthlyBudgetLimit] = useState<number | null>(null);
  const [monthlyBudgetCurrency, setMonthlyBudgetCurrency] = useState("IDR");

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await getUserSettings();
      setCurrency(data.currency);
      const userLanguage = data.language as Locale;
      setLanguage(userLanguage);
      // Sync with LanguageContext
      setLocale(userLanguage);
      setEmailReminders(data.emailReminders);
      setReminderDaysBefore(data.reminderDaysBefore);
      setWeeklyDigest(data.weeklyDigest);
      setMonthlyBudgetLimit(data.monthlyBudgetLimit || null);
      setMonthlyBudgetCurrency(data.monthlyBudgetCurrency || currency);
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error(t('settings.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const result = await updateUserSettings({
        currency,
        language,
        emailReminders,
        reminderDaysBefore,
        weeklyDigest,
        monthlyBudgetLimit,
        monthlyBudgetCurrency,
      });

      if (result.success) {
        // Update LanguageContext immediately for real-time UI change
        setLocale(language as Locale);
        toast.success(result.message);
        loadSettings();
        // Refresh all server components to update currency display
        router.refresh();
      } else {
        toast.error(result.error || t('settings.failedToSave'));
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(t('common.unexpectedError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(t('settings.resetConfirm'))) {
      return;
    }

    try {
      setIsSaving(true);
      const result = await resetSettings();

      if (result.success) {
        // Reset language to default (English)
        setLocale('en');
        toast.success(result.message);
        loadSettings();
        // Refresh all server components to update currency display
        router.refresh();
      } else {
        toast.error(result.error || t('settings.failedToReset'));
      }
    } catch (error) {
      console.error("Reset error:", error);
      toast.error(t('common.unexpectedError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t('settings.title')}</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {t('settings.subtitle')}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-5 bg-muted rounded w-32 mb-2"></div>
                <div className="h-4 bg-muted rounded w-48"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-full animate-pulse"></div>
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
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t('settings.title')}</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {t('settings.subtitle')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
            className="transition-colors hover:bg-[#3EBCB3] hover:text-white hover:border-[#3EBCB3] active:bg-[#3EBCB3] active:text-white w-full sm:w-auto"
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
            <RotateCcw className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline sm:hidden">Reset</span>
            <span className="xs:hidden sm:inline">{t('common.resetToDefault')}</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            style={{ backgroundColor: '#3EBCB3', color: 'white' }}
            className="shadow hover:opacity-90 w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline sm:hidden">{isSaving ? t('common.saving') : t('common.save')}</span>
            <span className="xs:hidden sm:inline">{isSaving ? t('common.saving') : t('common.saveChanges')}</span>
          </Button>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* App Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <CardTitle>{t('settings.appPreferences')}</CardTitle>
            </div>
            <CardDescription>
              {t('settings.appPreferencesDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">{t('settings.defaultCurrency')}</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
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
              <p className="text-xs text-muted-foreground">
                {t('settings.defaultCurrencyDesc')}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="language">{t('settings.language')}</Label>
              <Select value={language} onValueChange={(value) => setLanguage(value as "en" | "id")}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('settings.english')}</SelectItem>
                  <SelectItem value="id">{t('settings.indonesian')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('settings.languageDesc')}
              </p>
            </div>

            <Separator />

            {/* Monthly Budget Limit */}
            <div className="space-y-2">
              <Label htmlFor="budget-limit">{t('settings.monthlyBudgetLimit')}</Label>
              <div className="flex gap-2">
                <Input
                  id="budget-limit"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t('settings.budgetLimitPlaceholder')}
                  value={monthlyBudgetLimit ?? ""}
                  onChange={(e) =>
                    setMonthlyBudgetLimit(e.target.value ? parseFloat(e.target.value) : null)
                  }
                  className="flex-1"
                />
                <Select value={monthlyBudgetCurrency} onValueChange={setMonthlyBudgetCurrency}>
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                    <SelectItem value="IDR">IDR</SelectItem>
                    <SelectItem value="KRW">KRW</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="AUD">AUD</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('settings.monthlyBudgetLimitDesc')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle>{t('settings.notifications')}</CardTitle>
            </div>
            <CardDescription>
              {t('settings.notificationsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.emailReminders')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('settings.emailRemindersDesc')}
                </p>
              </div>
              <Switch
                checked={emailReminders}
                onCheckedChange={setEmailReminders}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="reminder-days">{t('settings.reminderDaysBefore')}</Label>
              <Input
                id="reminder-days"
                type="number"
                min="1"
                max="30"
                value={reminderDaysBefore}
                onChange={(e) =>
                  setReminderDaysBefore(parseInt(e.target.value) || 3)
                }
                disabled={!emailReminders}
              />
              <p className="text-xs text-muted-foreground">
                {t('settings.reminderDaysDesc')}
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.weeklyDigest')}</Label>
                <p className="text-xs text-muted-foreground">
                  {t('settings.weeklyDigestDesc')}
                </p>
              </div>
              <Switch
                checked={weeklyDigest}
                onCheckedChange={setWeeklyDigest}
                disabled={!emailReminders}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.aboutNotifications')}</CardTitle>
          <CardDescription>
            {t('settings.aboutNotificationsDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <h4 className="font-medium">{t('settings.notificationTypes')}</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                <strong>{t('settings.renewalReminders')}:</strong> {t('settings.renewalRemindersDesc', { days: reminderDaysBefore })}
              </li>
              <li>
                <strong>{t('settings.overdueAlerts')}:</strong> {t('settings.overdueAlertsDesc')}
              </li>
              <li>
                <strong>{t('settings.budgetAlerts')}:</strong> {t('settings.budgetAlertsDesc')}
              </li>
              <li>
                <strong>{t('settings.weeklyDigest')}:</strong> {t('settings.weeklyDigestDescAlt')}
              </li>
            </ul>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <h4 className="font-medium">{t('settings.inAppNotifications')}</h4>
            <p className="text-muted-foreground">
              {t('settings.inAppNotificationsDesc')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
