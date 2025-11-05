"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import {
  categorySchema,
  updateCategorySchema,
  type CategoryFormData,
  type UpdateCategoryData,
} from "@/lib/validations/category";
import { convertToMonthly } from "@/lib/utils/currency";
import { convertCurrency } from "@/lib/utils/exchange-rate";

export type CategoryWithStats = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  budgetLimit: number | null;
  budgetCurrency: string | null;
  createdAt: Date;
  updatedAt: Date;
  subscriptionCount: number;
  monthlySpending: number;
  budgetUtilization: number | null;
};

/**
 * Create a new category
 */
export async function createCategory(data: CategoryFormData) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Validate input
    const validatedData = categorySchema.parse(data);

    // Check for duplicate category name
    const existing = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name: validatedData.name,
      },
    });

    if (existing) {
      return {
        success: false,
        error: "A category with this name already exists",
      };
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        icon: validatedData.icon ?? null,
        color: validatedData.color ?? null,
        budgetLimit: validatedData.budgetLimit ?? null,
        budgetCurrency: validatedData.budgetCurrency ?? null,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/subscriptions");
    revalidatePath("/analytics");
    revalidatePath("/categories");

    return {
      success: true,
      data: category,
      message: "Category created successfully",
    };
  } catch (error) {
    console.error("Create category error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to create category",
    };
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(data: UpdateCategoryData) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Validate input
    const validatedData = updateCategorySchema.parse(data);

    // Check if category belongs to user
    const existing = await prisma.category.findUnique({
      where: { id: validatedData.id },
      select: { userId: true },
    });

    if (!existing) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    if (existing.userId !== user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check for duplicate name (excluding current category)
    const duplicate = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name: validatedData.name,
        id: {
          not: validatedData.id,
        },
      },
    });

    if (duplicate) {
      return {
        success: false,
        error: "A category with this name already exists",
      };
    }

    // Update category
    const { id, ...updateData } = validatedData;
    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/dashboard");
    revalidatePath("/subscriptions");
    revalidatePath("/analytics");
    revalidatePath("/categories");

    return {
      success: true,
      data: category,
      message: "Category updated successfully",
    };
  } catch (error) {
    console.error("Update category error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to update category",
    };
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Check if category belongs to user
    const existing = await prisma.category.findUnique({
      where: { id },
      select: {
        userId: true,
        _count: {
          select: { subscriptions: true },
        },
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    if (existing.userId !== user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Check if category has subscriptions
    if (existing._count.subscriptions > 0) {
      // Set categoryId to null for all subscriptions in this category
      await prisma.subscription.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });
    }

    // Delete category
    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/subscriptions");
    revalidatePath("/analytics");
    revalidatePath("/categories");

    return {
      success: true,
      message: "Category deleted successfully",
    };
  } catch (error) {
    console.error("Delete category error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to delete category",
    };
  }
}

/**
 * Get all categories with statistics
 */
export async function getCategoriesWithStats(): Promise<CategoryWithStats[]> {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Get user settings for currency
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const displayCurrency = userSettings?.currency || "IDR";

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    include: {
      subscriptions: {
        where: { status: "active" },
        select: {
          amount: true,
          currency: true,
          billingFrequency: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Process each category with async currency conversion
  const categoriesWithStats = await Promise.all(
    categories.map(async (category) => {
      let monthlySpending = 0;

      // Convert each subscription to display currency (not budget currency)
      for (const sub of category.subscriptions) {
        let monthlyAmount = convertToMonthly(sub.amount, sub.billingFrequency);

        // Convert to display currency if needed
        const subCurrency = sub.currency || "IDR"; // Default to IDR if no currency set
        if (subCurrency !== displayCurrency) {
          monthlyAmount = await convertCurrency(monthlyAmount, subCurrency, displayCurrency);
        }

        monthlySpending += monthlyAmount;
      }

      // Calculate budget utilization by converting budget to display currency if needed
      let budgetUtilization: number | null = null;
      if (category.budgetLimit && category.budgetLimit > 0) {
        const budgetCurrency = category.budgetCurrency || displayCurrency;
        let budgetInDisplayCurrency = category.budgetLimit;

        if (budgetCurrency !== displayCurrency) {
          budgetInDisplayCurrency = await convertCurrency(
            category.budgetLimit,
            budgetCurrency,
            displayCurrency
          );
        }

        budgetUtilization = (monthlySpending / budgetInDisplayCurrency) * 100;
      }

      return {
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        budgetLimit: category.budgetLimit,
        budgetCurrency: category.budgetCurrency,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        subscriptionCount: category.subscriptions.length,
        monthlySpending: Math.round(monthlySpending * 100) / 100,
        budgetUtilization: budgetUtilization
          ? Math.round(budgetUtilization * 100) / 100
          : null,
      };
    })
  );

  return categoriesWithStats;
}

/**
 * Get single category by ID
 */
export async function getCategoryById(id: string) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  const category = await prisma.category.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  return category;
}

/**
 * Get category statistics overview
 */
export async function getCategoryStats() {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("User not authenticated");
  }

  // Get user settings for global monthly budget
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const categories = await getCategoriesWithStats();

  const totalCategories = categories.length;
  // Use global monthly budget from settings, not sum of category budgets
  const totalBudget = userSettings?.monthlyBudgetLimit || 0;
  const totalSpending = categories.reduce(
    (sum, cat) => sum + cat.monthlySpending,
    0
  );
  const budgetUtilization =
    totalBudget > 0 ? (totalSpending / totalBudget) * 100 : 0;

  return {
    totalCategories,
    totalBudget: Math.round(totalBudget * 100) / 100,
    totalSpending: Math.round(totalSpending * 100) / 100,
    budgetUtilization: Math.round(budgetUtilization * 100) / 100,
  };
}
