"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  createCategory,
  updateCategory,
  type CategoryWithStats,
} from "@/app/actions/categories";
import {
  categorySchema,
  type CategoryFormData,
} from "@/lib/validations/category";
import { useTranslations } from "@/lib/i18n/hooks";
import { formatCurrency } from "@/lib/utils/currency";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: CategoryWithStats | null;
  currency?: string;
}

// Preset colors for category
const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
];

// Preset icons (emojis)
const PRESET_ICONS = [
  "📁",
  "🎬",
  "💼",
  "📚",
  "⚡",
  "💪",
  "💰",
  "🎮",
  "🎵",
  "📱",
  "💻",
  "🏠",
  "🚗",
  "✈️",
  "🍕",
  "☕",
];

// Available currencies
const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
];

export function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  category,
  currency = "IDR",
}: CategoryFormModalProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [budgetCurrency, setBudgetCurrency] = useState(currency);
  const isEditing = !!category;

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      icon: null,
      color: null,
      budgetLimit: null,
    },
  });

  // Update form when category changes
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        icon: category.icon,
        color: category.color,
        budgetLimit: category.budgetLimit,
      });
      // Use category's budgetCurrency if available, otherwise default
      setBudgetCurrency(category.budgetCurrency || currency);
    } else {
      form.reset({
        name: "",
        icon: null,
        color: null,
        budgetLimit: null,
      });
      setBudgetCurrency(currency); // Reset to default currency when adding new
    }
  }, [category, form, currency]);

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);

    try {
      // Add budgetCurrency to the data
      const submitData = {
        ...data,
        budgetCurrency: budgetCurrency,
      };

      const result = isEditing
        ? await updateCategory({ ...submitData, id: category.id })
        : await createCategory(submitData);

      if (result.success) {
        toast.success(result.message);
        onSuccess();
        onClose();
        form.reset();
      } else {
        toast.error(result.error || t('categories.failedToSave'));
      }
    } catch (error) {
      console.error("Category form error:", error);
      toast.error(t('common.unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      form.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('categoryForm.editTitle') : t('categoryForm.addTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('categoryForm.updateDetails')
              : t('categoryForm.addNewDesc')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Category Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categoryForm.categoryName')} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t('categoryForm.categoryNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Icon Selection */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categoryForm.icon')}</FormLabel>
                  <div className="grid grid-cols-8 gap-2">
                    {PRESET_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => field.onChange(icon)}
                        className={`h-10 w-10 flex items-center justify-center text-xl rounded-md border-2 transition-colors ${
                          field.value === icon
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color Selection */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categoryForm.color')}</FormLabel>
                  <div className="grid grid-cols-8 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => field.onChange(color)}
                        className={`h-10 w-10 rounded-md border-2 transition-all ${
                          field.value === color
                            ? "border-primary scale-110"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Budget Limit */}
            <FormField
              control={form.control}
              name="budgetLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('categoryForm.monthlyBudgetLimit')}</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={t('categoryForm.budgetPlaceholder')}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseFloat(value) : null);
                        }}
                        className="flex-1"
                      />
                      <Select value={budgetCurrency} onValueChange={setBudgetCurrency}>
                        <SelectTrigger className="w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((curr) => (
                            <SelectItem key={curr.code} value={curr.code}>
                              {curr.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('categoryForm.budgetHint', { currency: budgetCurrency })}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">{t('categoryForm.preview')}</p>
              <div className="flex items-center space-x-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg text-2xl"
                  style={{
                    backgroundColor: form.watch("color") || "#e5e7eb",
                  }}
                >
                  {form.watch("icon") || "📁"}
                </div>
                <div>
                  <p className="font-semibold">
                    {form.watch("name") || t('categoryForm.categoryNameDefault')}
                  </p>
                  {form.watch("budgetLimit") && (
                    <p className="text-sm text-muted-foreground">
                      {t('categoryForm.budgetPreview', { amount: formatCurrency(form.watch("budgetLimit") || 0, budgetCurrency) })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
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
                {isSubmitting
                  ? t('common.saving')
                  : isEditing
                  ? t('categoryForm.updateCategory')
                  : t('categoryForm.createCategory')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
