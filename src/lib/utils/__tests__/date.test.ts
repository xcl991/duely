/**
 * Unit tests for date utility functions
 */

import {
  formatDate,
  getDaysUntil,
  isOverdue,
  isDueToday,
  isWithinDays,
  getNextBillingDate,
  getRelativeTimeString,
  getUrgencyLevel,
} from "../date";
import { addDays, subDays } from "date-fns";

describe("Date Utilities", () => {
  describe("formatDate", () => {
    it("should format date with default format", () => {
      const date = new Date("2025-01-15");
      const result = formatDate(date);
      expect(result).toBe("Jan 15, 2025");
    });

    it("should format date with custom format", () => {
      const date = new Date("2025-01-15");
      const result = formatDate(date, "yyyy-MM-dd");
      expect(result).toBe("2025-01-15");
    });

    it("should format string date", () => {
      const result = formatDate("2025-01-15");
      expect(result).toBe("Jan 15, 2025");
    });

    it("should handle different format patterns", () => {
      const date = new Date("2025-01-15");
      expect(formatDate(date, "dd/MM/yyyy")).toBe("15/01/2025");
      expect(formatDate(date, "MMMM dd, yyyy")).toBe("January 15, 2025");
    });
  });

  describe("getDaysUntil", () => {
    it("should return 0 for today", () => {
      const today = new Date();
      expect(getDaysUntil(today)).toBe(0);
    });

    it("should return positive number for future dates", () => {
      const future = addDays(new Date(), 5);
      expect(getDaysUntil(future)).toBe(5);
    });

    it("should return negative number for past dates", () => {
      const past = subDays(new Date(), 3);
      expect(getDaysUntil(past)).toBe(-3);
    });

    it("should handle string dates", () => {
      const tomorrow = addDays(new Date(), 1);
      expect(getDaysUntil(tomorrow.toISOString())).toBe(1);
    });
  });

  describe("isOverdue", () => {
    it("should return false for today", () => {
      const today = new Date();
      expect(isOverdue(today)).toBe(false);
    });

    it("should return false for future dates", () => {
      const future = addDays(new Date(), 5);
      expect(isOverdue(future)).toBe(false);
    });

    it("should return true for past dates", () => {
      const past = subDays(new Date(), 1);
      expect(isOverdue(past)).toBe(true);
    });

    it("should handle string dates", () => {
      const past = subDays(new Date(), 2);
      expect(isOverdue(past.toISOString())).toBe(true);
    });
  });

  describe("isDueToday", () => {
    it("should return true for today", () => {
      const today = new Date();
      expect(isDueToday(today)).toBe(true);
    });

    it("should return false for tomorrow", () => {
      const tomorrow = addDays(new Date(), 1);
      expect(isDueToday(tomorrow)).toBe(false);
    });

    it("should return false for yesterday", () => {
      const yesterday = subDays(new Date(), 1);
      expect(isDueToday(yesterday)).toBe(false);
    });
  });

  describe("isWithinDays", () => {
    it("should return true for dates within range", () => {
      const future = addDays(new Date(), 3);
      expect(isWithinDays(future, 7)).toBe(true);
    });

    it("should return false for dates beyond range", () => {
      const future = addDays(new Date(), 10);
      expect(isWithinDays(future, 7)).toBe(false);
    });

    it("should return true for today when checking within 0 days", () => {
      const today = new Date();
      expect(isWithinDays(today, 0)).toBe(true);
    });

    it("should return false for past dates", () => {
      const past = subDays(new Date(), 1);
      expect(isWithinDays(past, 7)).toBe(false);
    });

    it("should return true for exact boundary", () => {
      const future = addDays(new Date(), 7);
      expect(isWithinDays(future, 7)).toBe(true);
    });
  });

  describe("getNextBillingDate", () => {
    const startDate = new Date("2025-01-15");

    it("should calculate next monthly billing date", () => {
      const next = getNextBillingDate(startDate, "monthly");
      expect(next).toEqual(new Date("2025-02-15"));
    });

    it("should calculate next yearly billing date", () => {
      const next = getNextBillingDate(startDate, "yearly");
      expect(next).toEqual(new Date("2026-01-15"));
    });

    it("should calculate next annual billing date", () => {
      const next = getNextBillingDate(startDate, "annual");
      expect(next).toEqual(new Date("2026-01-15"));
    });

    it("should calculate next quarterly billing date", () => {
      const next = getNextBillingDate(startDate, "quarterly");
      expect(next).toEqual(new Date("2025-04-15"));
    });

    it("should calculate next weekly billing date", () => {
      const next = getNextBillingDate(startDate, "weekly");
      expect(next).toEqual(addDays(startDate, 7));
    });

    it("should calculate next daily billing date", () => {
      const next = getNextBillingDate(startDate, "daily");
      expect(next).toEqual(new Date("2025-01-16"));
    });

    it("should default to monthly for unknown frequency", () => {
      const next = getNextBillingDate(startDate, "unknown");
      expect(next).toEqual(new Date("2025-02-15"));
    });

    it("should be case insensitive", () => {
      const next = getNextBillingDate(startDate, "MONTHLY");
      expect(next).toEqual(new Date("2025-02-15"));
    });

    it("should handle string dates", () => {
      const next = getNextBillingDate("2025-01-15", "monthly");
      expect(next).toEqual(new Date("2025-02-15"));
    });
  });

  describe("getRelativeTimeString", () => {
    it("should return 'Due today' for today", () => {
      const today = new Date();
      expect(getRelativeTimeString(today)).toBe("Due today");
    });

    it("should return 'Due tomorrow' for tomorrow", () => {
      const tomorrow = addDays(new Date(), 1);
      expect(getRelativeTimeString(tomorrow)).toBe("Due tomorrow");
    });

    it("should return 'Due in X days' for future dates", () => {
      const future = addDays(new Date(), 5);
      expect(getRelativeTimeString(future)).toBe("Due in 5 days");
    });

    it("should return 'Overdue by 1 day' for yesterday", () => {
      const yesterday = subDays(new Date(), 1);
      expect(getRelativeTimeString(yesterday)).toBe("Overdue by 1 day");
    });

    it("should return 'Overdue by X days' for past dates", () => {
      const past = subDays(new Date(), 3);
      expect(getRelativeTimeString(past)).toBe("Overdue by 3 days");
    });
  });

  describe("getUrgencyLevel", () => {
    it("should return 'overdue' for past dates", () => {
      const past = subDays(new Date(), 1);
      expect(getUrgencyLevel(past)).toBe("overdue");
    });

    it("should return 'high' for dates within 3 days", () => {
      expect(getUrgencyLevel(new Date())).toBe("high");
      expect(getUrgencyLevel(addDays(new Date(), 1))).toBe("high");
      expect(getUrgencyLevel(addDays(new Date(), 3))).toBe("high");
    });

    it("should return 'medium' for dates within 7 days", () => {
      expect(getUrgencyLevel(addDays(new Date(), 4))).toBe("medium");
      expect(getUrgencyLevel(addDays(new Date(), 7))).toBe("medium");
    });

    it("should return 'low' for dates beyond 7 days", () => {
      expect(getUrgencyLevel(addDays(new Date(), 8))).toBe("low");
      expect(getUrgencyLevel(addDays(new Date(), 30))).toBe("low");
    });
  });

  describe("Edge Cases", () => {
    it("should handle month boundaries correctly", () => {
      const endOfMonth = new Date("2025-01-31");
      const next = getNextBillingDate(endOfMonth, "monthly");
      // February doesn't have 31 days, so should be Feb 28 or Mar 3 depending on date-fns behavior
      expect(next.getMonth()).toBe(1); // February (0-indexed)
    });

    it("should handle leap years", () => {
      const leapDate = new Date("2024-02-29");
      const next = getNextBillingDate(leapDate, "yearly");
      expect(next).toEqual(new Date("2025-02-28")); // 2025 is not a leap year
    });

    it("should handle year boundaries", () => {
      const endOfYear = new Date("2025-12-31");
      const next = getNextBillingDate(endOfYear, "monthly");
      expect(next).toEqual(new Date("2026-01-31"));
    });
  });
});
