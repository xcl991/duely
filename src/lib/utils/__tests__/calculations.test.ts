/**
 * Unit tests for calculation utility functions
 */

import {
  calculateMonthlyTotal,
  calculateAnnualProjection,
  calculateAverageCost,
  calculateCategoryTotals,
  calculateMemberTotals,
  calculateAnnualSavings,
  type Subscription,
} from "../calculations";

// Helper function to create mock subscriptions
const createSubscription = (
  amount: number,
  frequency: string,
  status: string = "active",
  categoryId?: string,
  memberId?: string
): Subscription => ({
  id: Math.random().toString(),
  amount,
  billingFrequency: frequency,
  status,
  categoryId,
  memberId,
  nextBilling: new Date(),
});

describe("Calculation Utilities", () => {
  describe("calculateMonthlyTotal", () => {
    it("should calculate total for monthly subscriptions", () => {
      const subs = [
        createSubscription(10, "monthly"),
        createSubscription(20, "monthly"),
        createSubscription(30, "monthly"),
      ];
      expect(calculateMonthlyTotal(subs)).toBe(60);
    });

    it("should convert yearly subscriptions to monthly", () => {
      const subs = [
        createSubscription(120, "yearly"),
        createSubscription(240, "yearly"),
      ];
      expect(calculateMonthlyTotal(subs)).toBe(30);
    });

    it("should handle mixed frequencies", () => {
      const subs = [
        createSubscription(10, "monthly"),
        createSubscription(120, "yearly"),
        createSubscription(30, "quarterly"),
      ];
      expect(calculateMonthlyTotal(subs)).toBe(30);
    });

    it("should exclude inactive subscriptions by default", () => {
      const subs = [
        createSubscription(10, "monthly", "active"),
        createSubscription(20, "monthly", "canceled"),
        createSubscription(30, "monthly", "paused"),
      ];
      expect(calculateMonthlyTotal(subs)).toBe(10);
    });

    it("should include inactive subscriptions when specified", () => {
      const subs = [
        createSubscription(10, "monthly", "active"),
        createSubscription(20, "monthly", "canceled"),
      ];
      expect(calculateMonthlyTotal(subs, true)).toBe(30);
    });

    it("should return 0 for empty array", () => {
      expect(calculateMonthlyTotal([])).toBe(0);
    });

    it("should handle all inactive subscriptions", () => {
      const subs = [
        createSubscription(10, "monthly", "canceled"),
        createSubscription(20, "monthly", "paused"),
      ];
      expect(calculateMonthlyTotal(subs)).toBe(0);
    });
  });

  describe("calculateAnnualProjection", () => {
    it("should calculate annual projection for monthly subscriptions", () => {
      const subs = [
        createSubscription(10, "monthly"),
        createSubscription(20, "monthly"),
      ];
      expect(calculateAnnualProjection(subs)).toBe(360);
    });

    it("should handle yearly subscriptions", () => {
      const subs = [
        createSubscription(120, "yearly"),
        createSubscription(240, "yearly"),
      ];
      expect(calculateAnnualProjection(subs)).toBe(360);
    });

    it("should handle mixed frequencies", () => {
      const subs = [
        createSubscription(10, "monthly"),
        createSubscription(120, "yearly"),
        createSubscription(40, "quarterly"),
      ];
      expect(calculateAnnualProjection(subs)).toBe(400);
    });

    it("should exclude inactive subscriptions by default", () => {
      const subs = [
        createSubscription(10, "monthly", "active"),
        createSubscription(20, "monthly", "canceled"),
      ];
      expect(calculateAnnualProjection(subs)).toBe(120);
    });

    it("should return 0 for empty array", () => {
      expect(calculateAnnualProjection([])).toBe(0);
    });
  });

  describe("calculateAverageCost", () => {
    it("should calculate average cost correctly", () => {
      const subs = [
        createSubscription(10, "monthly"),
        createSubscription(20, "monthly"),
        createSubscription(30, "monthly"),
      ];
      expect(calculateAverageCost(subs)).toBe(20);
    });

    it("should handle mixed frequencies", () => {
      const subs = [
        createSubscription(10, "monthly"),
        createSubscription(120, "yearly"),
      ];
      expect(calculateAverageCost(subs)).toBe(10);
    });

    it("should only include active subscriptions", () => {
      const subs = [
        createSubscription(10, "monthly", "active"),
        createSubscription(100, "monthly", "canceled"),
      ];
      expect(calculateAverageCost(subs)).toBe(10);
    });

    it("should return 0 for empty array", () => {
      expect(calculateAverageCost([])).toBe(0);
    });

    it("should return 0 when no active subscriptions", () => {
      const subs = [
        createSubscription(10, "monthly", "canceled"),
        createSubscription(20, "monthly", "paused"),
      ];
      expect(calculateAverageCost(subs)).toBe(0);
    });

    it("should handle single subscription", () => {
      const subs = [createSubscription(15, "monthly")];
      expect(calculateAverageCost(subs)).toBe(15);
    });
  });

  describe("calculateCategoryTotals", () => {
    it("should calculate totals by category", () => {
      const categories = new Map([
        ["cat1", "Entertainment"],
        ["cat2", "Productivity"],
      ]);
      const subs = [
        createSubscription(10, "monthly", "active", "cat1"),
        createSubscription(20, "monthly", "active", "cat1"),
        createSubscription(30, "monthly", "active", "cat2"),
      ];

      const result = calculateCategoryTotals(subs, categories);

      expect(result).toHaveLength(2);

      // Both categories have total of 30, so check both are present
      const entertainment = result.find(r => r.categoryName === "Entertainment");
      const productivity = result.find(r => r.categoryName === "Productivity");

      expect(entertainment).toBeDefined();
      expect(entertainment?.total).toBe(30);
      expect(entertainment?.count).toBe(2);

      expect(productivity).toBeDefined();
      expect(productivity?.total).toBe(30);
      expect(productivity?.count).toBe(1);
    });

    it("should handle uncategorized subscriptions", () => {
      const categories = new Map([["cat1", "Entertainment"]]);
      const subs = [
        createSubscription(10, "monthly", "active", "cat1"),
        createSubscription(20, "monthly", "active", undefined),
      ];

      const result = calculateCategoryTotals(subs, categories);

      expect(result).toHaveLength(2);
      const uncategorized = result.find((c) => c.categoryName === "Uncategorized");
      expect(uncategorized).toBeDefined();
      expect(uncategorized?.total).toBe(20);
    });

    it("should calculate percentages correctly", () => {
      const categories = new Map([
        ["cat1", "Entertainment"],
        ["cat2", "Productivity"],
      ]);
      const subs = [
        createSubscription(30, "monthly", "active", "cat1"),
        createSubscription(70, "monthly", "active", "cat2"),
      ];

      const result = calculateCategoryTotals(subs, categories);

      expect(result[0].percentage).toBe(70);
      expect(result[1].percentage).toBe(30);
    });

    it("should sort by total (descending)", () => {
      const categories = new Map([
        ["cat1", "Small"],
        ["cat2", "Large"],
      ]);
      const subs = [
        createSubscription(10, "monthly", "active", "cat1"),
        createSubscription(100, "monthly", "active", "cat2"),
      ];

      const result = calculateCategoryTotals(subs, categories);

      expect(result[0].categoryName).toBe("Large");
      expect(result[1].categoryName).toBe("Small");
    });

    it("should only include active subscriptions", () => {
      const categories = new Map([["cat1", "Entertainment"]]);
      const subs = [
        createSubscription(10, "monthly", "active", "cat1"),
        createSubscription(100, "monthly", "canceled", "cat1"),
      ];

      const result = calculateCategoryTotals(subs, categories);

      expect(result[0].total).toBe(10);
      expect(result[0].count).toBe(1);
    });

    it("should return empty array for no subscriptions", () => {
      const categories = new Map();
      const result = calculateCategoryTotals([], categories);
      expect(result).toHaveLength(0);
    });
  });

  describe("calculateMemberTotals", () => {
    it("should calculate totals by member", () => {
      const members = new Map([
        ["mem1", "John"],
        ["mem2", "Jane"],
      ]);
      const subs = [
        createSubscription(10, "monthly", "active", undefined, "mem1"),
        createSubscription(20, "monthly", "active", undefined, "mem1"),
        createSubscription(30, "monthly", "active", undefined, "mem2"),
      ];

      const result = calculateMemberTotals(subs, members);

      expect(result).toHaveLength(2);

      // Both members have total of 30, so check both are present
      const john = result.find(r => r.memberName === "John");
      const jane = result.find(r => r.memberName === "Jane");

      expect(john).toBeDefined();
      expect(john?.total).toBe(30);

      expect(jane).toBeDefined();
      expect(jane?.total).toBe(30);
    });

    it("should handle unassigned subscriptions", () => {
      const members = new Map([["mem1", "John"]]);
      const subs = [
        createSubscription(10, "monthly", "active", undefined, "mem1"),
        createSubscription(20, "monthly", "active", undefined, undefined),
      ];

      const result = calculateMemberTotals(subs, members);

      expect(result).toHaveLength(2);
      const unassigned = result.find((m) => m.memberName === "Unassigned");
      expect(unassigned).toBeDefined();
      expect(unassigned?.total).toBe(20);
    });

    it("should sort by total (descending)", () => {
      const members = new Map([
        ["mem1", "Low"],
        ["mem2", "High"],
      ]);
      const subs = [
        createSubscription(10, "monthly", "active", undefined, "mem1"),
        createSubscription(100, "monthly", "active", undefined, "mem2"),
      ];

      const result = calculateMemberTotals(subs, members);

      expect(result[0].memberName).toBe("High");
      expect(result[1].memberName).toBe("Low");
    });

    it("should only include active subscriptions", () => {
      const members = new Map([["mem1", "John"]]);
      const subs = [
        createSubscription(10, "monthly", "active", undefined, "mem1"),
        createSubscription(100, "monthly", "canceled", undefined, "mem1"),
      ];

      const result = calculateMemberTotals(subs, members);

      expect(result[0].total).toBe(10);
      expect(result[0].count).toBe(1);
    });

    it("should return empty array for no subscriptions", () => {
      const members = new Map();
      const result = calculateMemberTotals([], members);
      expect(result).toHaveLength(0);
    });
  });

  describe("calculateAnnualSavings", () => {
    it("should calculate savings with default percentage", () => {
      const subs = [
        createSubscription(10, "monthly"),
        createSubscription(20, "monthly"),
      ];

      const savings = calculateAnnualSavings(subs);
      expect(savings).toBe(54); // (10 + 20) * 12 * 0.15
    });

    it("should calculate savings with custom percentage", () => {
      const subs = [createSubscription(100, "monthly")];

      const savings = calculateAnnualSavings(subs, 20);
      expect(savings).toBe(240); // 100 * 12 * 0.20
    });

    it("should only include monthly active subscriptions", () => {
      const subs = [
        createSubscription(10, "monthly", "active"),
        createSubscription(20, "yearly", "active"),
        createSubscription(30, "monthly", "canceled"),
      ];

      const savings = calculateAnnualSavings(subs);
      expect(savings).toBe(18); // 10 * 12 * 0.15
    });

    it("should return 0 for no monthly subscriptions", () => {
      const subs = [
        createSubscription(120, "yearly"),
        createSubscription(40, "quarterly"),
      ];

      const savings = calculateAnnualSavings(subs);
      expect(savings).toBe(0);
    });

    it("should return 0 for empty array", () => {
      expect(calculateAnnualSavings([])).toBe(0);
    });

    it("should handle 0% savings", () => {
      const subs = [createSubscription(100, "monthly")];
      const savings = calculateAnnualSavings(subs, 0);
      expect(savings).toBe(0);
    });

    it("should handle 100% savings", () => {
      const subs = [createSubscription(100, "monthly")];
      const savings = calculateAnnualSavings(subs, 100);
      expect(savings).toBe(1200);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very small amounts", () => {
      const subs = [createSubscription(0.01, "monthly")];
      expect(calculateMonthlyTotal(subs)).toBe(0.01);
    });

    it("should handle very large amounts", () => {
      const subs = [createSubscription(999999, "monthly")];
      expect(calculateMonthlyTotal(subs)).toBe(999999);
    });

    it("should handle decimal amounts precisely", () => {
      const subs = [
        createSubscription(9.99, "monthly"),
        createSubscription(14.99, "monthly"),
      ];
      expect(calculateMonthlyTotal(subs)).toBeCloseTo(24.98, 2);
    });

    it("should handle zero amounts", () => {
      const subs = [
        createSubscription(0, "monthly"),
        createSubscription(10, "monthly"),
      ];
      expect(calculateMonthlyTotal(subs)).toBe(10);
    });

    it("should handle all zero amounts", () => {
      const subs = [
        createSubscription(0, "monthly"),
        createSubscription(0, "monthly"),
      ];
      expect(calculateMonthlyTotal(subs)).toBe(0);
    });
  });
});
