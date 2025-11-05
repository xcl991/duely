import { prisma } from "@/lib/prisma";
import { differenceInDays } from "date-fns";

/**
 * Generate renewal reminder notifications for all users
 * This should be run daily via a cron job or scheduled task
 */
export async function generateRenewalReminders() {
  try {
    // Get all users with their settings
    const users = await prisma.user.findMany({
      include: {
        settings: true,
        subscriptions: {
          where: {
            status: "active",
          },
          select: {
            id: true,
            serviceName: true,
            amount: true,
            nextBilling: true,
            currency: true,
          },
        },
      },
    });

    let notificationsCreated = 0;

    for (const user of users) {
      // Skip if email reminders are disabled
      if (user.settings && !user.settings.emailReminders) {
        continue;
      }

      const reminderDays = user.settings?.reminderDaysBefore ?? 3;

      for (const subscription of user.subscriptions) {
        const daysUntilRenewal = differenceInDays(
          subscription.nextBilling,
          new Date()
        );

        // Check if renewal is within reminder window
        if (daysUntilRenewal === reminderDays && daysUntilRenewal > 0) {
          // Check if notification already exists for this subscription today
          const existingNotification = await prisma.notification.findFirst({
            where: {
              userId: user.id,
              subscriptionId: subscription.id,
              type: "renewal_reminder",
              createdAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
              },
            },
          });

          if (!existingNotification) {
            await prisma.notification.create({
              data: {
                userId: user.id,
                subscriptionId: subscription.id,
                type: "renewal_reminder",
                title: `${subscription.serviceName} renews in ${reminderDays} days`,
                message: `Your ${subscription.serviceName} subscription will renew on ${subscription.nextBilling.toLocaleDateString()} for ${
                  subscription.currency
                } ${subscription.amount.toFixed(2)}.`,
              },
            });
            notificationsCreated++;
          }
        }
      }
    }

    return {
      success: true,
      notificationsCreated,
    };
  } catch (error) {
    console.error("Generate renewal reminders error:", error);
    return {
      success: false,
      error: "Failed to generate renewal reminders",
    };
  }
}

/**
 * Generate overdue notifications for subscriptions past their billing date
 */
export async function generateOverdueNotifications() {
  try {
    // Get all active subscriptions past their billing date
    const overdueSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "active",
        nextBilling: {
          lt: new Date(),
        },
      },
      include: {
        user: {
          include: {
            settings: true,
          },
        },
      },
    });

    let notificationsCreated = 0;

    for (const subscription of overdueSubscriptions) {
      // Skip if email reminders are disabled
      if (
        subscription.user.settings &&
        !subscription.user.settings.emailReminders
      ) {
        continue;
      }

      const daysOverdue = Math.abs(
        differenceInDays(subscription.nextBilling, new Date())
      );

      // Check if notification already exists for this subscription today
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          type: "overdue",
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      if (!existingNotification) {
        await prisma.notification.create({
          data: {
            userId: subscription.userId,
            subscriptionId: subscription.id,
            type: "overdue",
            title: `${subscription.serviceName} is overdue`,
            message: `Your ${subscription.serviceName} subscription was due ${daysOverdue} day${
              daysOverdue !== 1 ? "s" : ""
            } ago. Please review and update the renewal date.`,
          },
        });
        notificationsCreated++;
      }
    }

    return {
      success: true,
      notificationsCreated,
    };
  } catch (error) {
    console.error("Generate overdue notifications error:", error);
    return {
      success: false,
      error: "Failed to generate overdue notifications",
    };
  }
}

/**
 * Generate budget alert notifications when category spending exceeds 80% of budget
 */
export async function generateBudgetAlerts() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        budgetLimit: {
          not: null,
        },
      },
      include: {
        user: {
          include: {
            settings: true,
          },
        },
        subscriptions: {
          where: {
            status: "active",
          },
          select: {
            amount: true,
            billingFrequency: true,
          },
        },
      },
    });

    let notificationsCreated = 0;

    for (const category of categories) {
      if (!category.budgetLimit) continue;

      // Calculate monthly spending
      const monthlySpending = category.subscriptions.reduce((sum, sub) => {
        let monthly = sub.amount;
        if (sub.billingFrequency === "yearly") {
          monthly = sub.amount / 12;
        } else if (sub.billingFrequency === "quarterly") {
          monthly = sub.amount / 3;
        }
        return sum + monthly;
      }, 0);

      const utilizationPercent = (monthlySpending / category.budgetLimit) * 100;

      // Alert if over 80% budget utilization
      if (utilizationPercent >= 80) {
        // Check if notification already exists for this category this month
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: category.userId,
            type: "budget_alert",
            message: {
              contains: category.name,
            },
            createdAt: {
              gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
              ),
            },
          },
        });

        if (!existingNotification) {
          await prisma.notification.create({
            data: {
              userId: category.userId,
              type: "budget_alert",
              title: `Budget alert: ${category.name}`,
              message: `Your ${category.name} category is at ${utilizationPercent.toFixed(
                0
              )}% of the monthly budget ($${monthlySpending.toFixed(
                2
              )} / $${category.budgetLimit.toFixed(2)}).`,
            },
          });
          notificationsCreated++;
        }
      }
    }

    return {
      success: true,
      notificationsCreated,
    };
  } catch (error) {
    console.error("Generate budget alerts error:", error);
    return {
      success: false,
      error: "Failed to generate budget alerts",
    };
  }
}

/**
 * Run all notification generators
 * This is the main function to be called by a cron job daily
 */
export async function generateAllNotifications() {
  const results = {
    renewalReminders: await generateRenewalReminders(),
    overdueNotifications: await generateOverdueNotifications(),
    budgetAlerts: await generateBudgetAlerts(),
  };

  const totalCreated =
    (results.renewalReminders.success
      ? (results.renewalReminders.notificationsCreated || 0)
      : 0) +
    (results.overdueNotifications.success
      ? (results.overdueNotifications.notificationsCreated || 0)
      : 0) +
    (results.budgetAlerts.success
      ? (results.budgetAlerts.notificationsCreated || 0)
      : 0);

  return {
    success:
      results.renewalReminders.success &&
      results.overdueNotifications.success &&
      results.budgetAlerts.success,
    results,
    totalNotificationsCreated: totalCreated,
  };
}
