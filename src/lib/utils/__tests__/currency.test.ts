/**
 * Unit tests for currency utility functions
 */

import {
  formatCurrency,
  convertToMonthly,
  convertToAnnual,
  formatCurrencyWithFrequency,
} from "../currency";

describe("Currency Utilities", () => {
  describe("formatCurrency", () => {
    it("should format USD currency correctly", () => {
      expect(formatCurrency(99.99, "USD")).toBe("$99.99");
    });

    it("should format EUR currency correctly", () => {
      expect(formatCurrency(99.99, "EUR", "de-DE")).toContain("99,99");
    });

    it("should format GBP currency correctly", () => {
      expect(formatCurrency(99.99, "GBP", "en-GB")).toBe("£99.99");
    });

    it("should handle zero amount", () => {
      expect(formatCurrency(0, "USD")).toBe("$0.00");
    });

    it("should handle large numbers", () => {
      const result = formatCurrency(1000000, "USD");
      expect(result).toContain("1,000,000");
    });

    it("should handle negative numbers", () => {
      const result = formatCurrency(-50, "USD");
      expect(result).toContain("-");
      expect(result).toContain("50");
    });
  });

  describe("convertToMonthly", () => {
    it("should return monthly amount unchanged", () => {
      expect(convertToMonthly(10, "monthly")).toBe(10);
    });

    it("should convert yearly to monthly", () => {
      expect(convertToMonthly(120, "yearly")).toBe(10);
      expect(convertToMonthly(120, "annual")).toBe(10);
    });

    it("should convert quarterly to monthly", () => {
      expect(convertToMonthly(30, "quarterly")).toBe(10);
    });

    it("should convert weekly to monthly", () => {
      const result = convertToMonthly(10, "weekly");
      expect(result).toBeCloseTo(43.3, 1);
    });

    it("should convert daily to monthly", () => {
      expect(convertToMonthly(1, "daily")).toBe(30);
    });

    it("should handle unknown frequency as monthly", () => {
      expect(convertToMonthly(15, "unknown")).toBe(15);
    });

    it("should be case insensitive", () => {
      expect(convertToMonthly(120, "YEARLY")).toBe(10);
      expect(convertToMonthly(120, "YeArLy")).toBe(10);
    });
  });

  describe("convertToAnnual", () => {
    it("should return annual amount unchanged", () => {
      expect(convertToAnnual(120, "yearly")).toBe(120);
      expect(convertToAnnual(120, "annual")).toBe(120);
    });

    it("should convert monthly to annual", () => {
      expect(convertToAnnual(10, "monthly")).toBe(120);
    });

    it("should convert quarterly to annual", () => {
      expect(convertToAnnual(30, "quarterly")).toBe(120);
    });

    it("should convert weekly to annual", () => {
      expect(convertToAnnual(10, "weekly")).toBe(520);
    });

    it("should convert daily to annual", () => {
      expect(convertToAnnual(1, "daily")).toBe(365);
    });

    it("should handle unknown frequency as monthly", () => {
      expect(convertToAnnual(10, "unknown")).toBe(120);
    });

    it("should be case insensitive", () => {
      expect(convertToAnnual(10, "MONTHLY")).toBe(120);
    });
  });

  describe("formatCurrencyWithFrequency", () => {
    it("should format monthly subscription", () => {
      const result = formatCurrencyWithFrequency(9.99, "monthly", "USD");
      expect(result).toBe("$9.99/mo");
    });

    it("should format yearly subscription", () => {
      const result = formatCurrencyWithFrequency(99.99, "yearly", "USD");
      expect(result).toBe("$99.99/yr");
    });

    it("should format annual subscription", () => {
      const result = formatCurrencyWithFrequency(99.99, "annual", "USD");
      expect(result).toBe("$99.99/yr");
    });

    it("should format quarterly subscription", () => {
      const result = formatCurrencyWithFrequency(29.99, "quarterly", "USD");
      expect(result).toBe("$29.99/qtr");
    });

    it("should format weekly subscription", () => {
      const result = formatCurrencyWithFrequency(2.99, "weekly", "USD");
      expect(result).toBe("$2.99/wk");
    });

    it("should format daily subscription", () => {
      const result = formatCurrencyWithFrequency(0.99, "daily", "USD");
      expect(result).toBe("$0.99/day");
    });

    it("should handle unknown frequency without suffix", () => {
      const result = formatCurrencyWithFrequency(19.99, "unknown", "USD");
      expect(result).toBe("$19.99");
    });

    it("should work with different currencies", () => {
      const result = formatCurrencyWithFrequency(9.99, "monthly", "EUR");
      expect(result).toContain("9.99");
      expect(result).toContain("/mo");
    });

    it("should be case insensitive for frequency", () => {
      const result = formatCurrencyWithFrequency(9.99, "MONTHLY", "USD");
      expect(result).toBe("$9.99/mo");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very small amounts", () => {
      expect(formatCurrency(0.01, "USD")).toBe("$0.01");
    });

    it("should handle very large amounts", () => {
      const result = formatCurrency(999999999.99, "USD");
      expect(result).toContain("999,999,999.99");
    });

    it("should handle decimal conversions", () => {
      const monthly = convertToMonthly(10.99, "yearly");
      expect(monthly).toBeCloseTo(0.916, 2);
    });
  });
});
