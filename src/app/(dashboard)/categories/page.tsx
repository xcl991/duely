"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, FolderOpen, TrendingUp, DollarSign } from "lucide-react";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { CategoryFormModal } from "@/components/categories/CategoryFormModal";
import {
  getCategoriesWithStats,
  getCategoryStats,
  deleteCategory,
  type CategoryWithStats,
} from "@/app/actions/categories";
import { getUserSettings } from "@/app/actions/settings";
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

export default function CategoriesPage() {
  const t = useTranslations();
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalBudget: 0,
    totalSpending: 0,
    budgetUtilization: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryWithStats | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [categoriesData, statsData, userSettings] = await Promise.all([
        getCategoriesWithStats(),
        getCategoryStats(),
        getUserSettings(),
      ]);
      setCategories(categoriesData);
      setStats(statsData);
      setCurrency(userSettings.currency);
    } catch (error) {
      console.error("Failed to load categories:", error);
      toast.error(t('categories.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: CategoryWithStats) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (categoryId: string, categoryName: string) => {
    setCategoryToDelete({ id: categoryId, name: categoryName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      const result = await deleteCategory(categoryToDelete.id);

      if (result.success) {
        toast.success(result.message);
        loadData();
      } else {
        toast.error(result.error || t('categories.failedToDelete'));
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(t('common.unexpectedError'));
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const formatCurrency = (amount: number) => {
    // Currencies that don't use decimal places
    const noDecimalCurrencies = ["IDR", "KRW", "JPY"];

    const options: Intl.NumberFormatOptions = {
      style: "currency",
      currency: currency,
    };

    // Remove decimals for currencies with large nominal values
    if (noDecimalCurrencies.includes(currency)) {
      options.minimumFractionDigits = 0;
      options.maximumFractionDigits = 0;
    } else {
      options.minimumFractionDigits = 2;
    }

    return new Intl.NumberFormat("en-US", options).format(amount);
  };

  const getProgressColor = (utilization: number) => {
    if (utilization >= 100) return "bg-destructive";
    if (utilization >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t('categories.title')}</h2>
            <p className="text-sm md:text-base text-muted-foreground">
              {t('categories.description')}
            </p>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            {t('categories.addCategory')}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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
          {t('categories.description')}
        </p>
        <Button
          onClick={handleAddCategory}
          style={{ backgroundColor: '#3EBCB3', color: 'white' }}
          className="shadow hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('categories.addCategory')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('categories.totalCategories')}
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('categories.totalBudget')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold break-words leading-tight">
              {formatCurrency(stats.totalBudget)}
            </div>
            <p className="text-xs text-muted-foreground">{t('common.perMonth')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('categories.totalSpending')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
              {t('categories.budgetUtilization')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.budgetUtilization.toFixed(0)}%
            </div>
            <Progress
              value={Math.min(stats.budgetUtilization, 100)}
              className="mt-2 h-2"
              indicatorClassName={getProgressColor(stats.budgetUtilization)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">{t('categories.noCategories')}</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t('categories.noCategoriesDesc')}
            </p>
            <Button
              onClick={handleAddCategory}
              style={{ backgroundColor: '#3EBCB3', color: 'white' }}
              className="mt-4 shadow hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('categories.createFirstCategory')}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEditCategory}
              onDelete={handleDeleteClick}
              currency={currency}
            />
          ))}
        </div>
      )}

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        category={selectedCategory}
        currency={currency}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('categories.deleteConfirmation', { name: categoryToDelete?.name || '' })}
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
