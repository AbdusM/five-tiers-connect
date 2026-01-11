/**
 * Date filtering utilities for receipts
 */

import { Receipt } from "@/types/receipt-snap/receipt";

export type DateRange = "all" | "today" | "week" | "month" | "year" | "custom";

export interface DateFilter {
  range: DateRange;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
}

/**
 * Get start of day
 */
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get start of week (Sunday)
 */
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get start of month
 */
function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get start of year
 */
function startOfYear(date: Date): Date {
  const d = new Date(date);
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Parse receipt date string to Date object
 */
function parseReceiptDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Handle YYYY-MM-DD format
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  // Fallback to Date.parse
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Get date range boundaries
 */
export function getDateRangeBounds(filter: DateFilter): { start: Date; end: Date } | null {
  const now = new Date();
  const today = startOfDay(now);

  switch (filter.range) {
    case "all":
      return null;

    case "today":
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      };

    case "week":
      const weekStart = startOfWeek(now);
      return {
        start: weekStart,
        end: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000),
      };

    case "month":
      const monthStart = startOfMonth(now);
      const nextMonth = new Date(monthStart);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return {
        start: monthStart,
        end: nextMonth,
      };

    case "year":
      const yearStart = startOfYear(now);
      const nextYear = new Date(yearStart);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      return {
        start: yearStart,
        end: nextYear,
      };

    case "custom":
      if (!filter.startDate || !filter.endDate) return null;
      const customStart = parseReceiptDate(filter.startDate);
      const customEnd = parseReceiptDate(filter.endDate);
      if (!customStart || !customEnd) return null;
      // Include the end date fully
      customEnd.setHours(23, 59, 59, 999);
      return { start: customStart, end: customEnd };

    default:
      return null;
  }
}

/**
 * Filter receipts by date range
 */
export function filterReceiptsByDate(
  receipts: Receipt[],
  filter: DateFilter
): Receipt[] {
  if (filter.range === "all") {
    return receipts;
  }

  const bounds = getDateRangeBounds(filter);
  if (!bounds) return receipts;

  return receipts.filter((receipt) => {
    const receiptDate = parseReceiptDate(receipt.date);
    if (!receiptDate) return false;

    return receiptDate >= bounds.start && receiptDate < bounds.end;
  });
}

/**
 * Get human-readable label for date range
 */
export function getDateRangeLabel(filter: DateFilter): string {
  switch (filter.range) {
    case "all":
      return "All Time";
    case "today":
      return "Today";
    case "week":
      return "This Week";
    case "month":
      return "This Month";
    case "year":
      return "This Year";
    case "custom":
      if (filter.startDate && filter.endDate) {
        return `${filter.startDate} to ${filter.endDate}`;
      }
      return "Custom Range";
    default:
      return "All Time";
  }
}

/**
 * Get quick stats for a date range
 */
export function getDateRangeStats(receipts: Receipt[]): {
  firstDate: string | null;
  lastDate: string | null;
  daysCovered: number;
} {
  if (receipts.length === 0) {
    return { firstDate: null, lastDate: null, daysCovered: 0 };
  }

  const dates = receipts
    .map((r) => parseReceiptDate(r.date))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) {
    return { firstDate: null, lastDate: null, daysCovered: 0 };
  }

  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];
  const daysCovered = Math.ceil(
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  return {
    firstDate: firstDate.toISOString().split("T")[0],
    lastDate: lastDate.toISOString().split("T")[0],
    daysCovered,
  };
}
