/**
 * Date utility functions for subscription tracking
 */

import {
  format,
  differenceInDays,
  addMonths,
  addYears,
  addDays,
  isToday,
  isPast,
  startOfDay,
} from "date-fns";

/**
 * Format date to readable string
 * @param date - Date to format
 * @param formatStr - Format string (default: MMM dd, yyyy)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  formatStr: string = "MMM dd, yyyy"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Get number of days until a future date
 * @param date - Future date
 * @returns Number of days (negative if past)
 */
export function getDaysUntil(date: Date | string): number {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return differenceInDays(startOfDay(dateObj), startOfDay(new Date()));
}

/**
 * Check if a date is overdue (in the past)
 * @param date - Date to check
 * @returns true if date is in the past
 */
export function isOverdue(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return isPast(startOfDay(dateObj)) && !isToday(dateObj);
}

/**
 * Check if a date is due today
 * @param date - Date to check
 * @returns true if date is today
 */
export function isDueToday(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return isToday(dateObj);
}

/**
 * Check if a date is within next N days
 * @param date - Date to check
 * @param days - Number of days to check within
 * @returns true if date is within next N days
 */
export function isWithinDays(date: Date | string, days: number): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const daysUntil = getDaysUntil(dateObj);
  return daysUntil >= 0 && daysUntil <= days;
}

/**
 * Calculate next billing date based on frequency
 * @param startDate - Start or current billing date
 * @param frequency - Billing frequency (monthly, yearly, quarterly)
 * @returns Next billing date
 */
export function getNextBillingDate(
  startDate: Date | string,
  frequency: string
): Date {
  const dateObj = typeof startDate === "string" ? new Date(startDate) : startDate;

  switch (frequency.toLowerCase()) {
    case "monthly":
      return addMonths(dateObj, 1);
    case "yearly":
    case "annual":
      return addYears(dateObj, 1);
    case "quarterly":
      return addMonths(dateObj, 3);
    case "weekly":
      return addDays(dateObj, 7);
    case "daily":
      return addDays(dateObj, 1);
    default:
      return addMonths(dateObj, 1); // Default to monthly
  }
}

/**
 * Get relative time string (e.g., "in 3 days", "overdue by 2 days")
 * @param date - Date to check
 * @returns Relative time string
 */
export function getRelativeTimeString(date: Date | string): string {
  const daysUntil = getDaysUntil(date);

  if (daysUntil === 0) {
    return "Due today";
  } else if (daysUntil === 1) {
    return "Due tomorrow";
  } else if (daysUntil > 1) {
    return `Due in ${daysUntil} days`;
  } else if (daysUntil === -1) {
    return "Overdue by 1 day";
  } else {
    return `Overdue by ${Math.abs(daysUntil)} days`;
  }
}

/**
 * Get urgency level based on days until date
 * @param date - Date to check
 * @returns Urgency level (high, medium, low, overdue)
 */
export function getUrgencyLevel(
  date: Date | string
): "overdue" | "high" | "medium" | "low" {
  const daysUntil = getDaysUntil(date);

  if (daysUntil < 0) {
    return "overdue";
  } else if (daysUntil <= 3) {
    return "high";
  } else if (daysUntil <= 7) {
    return "medium";
  } else {
    return "low";
  }
}
