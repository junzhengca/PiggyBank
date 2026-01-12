import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Transaction } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a date string (YYYY-MM-DD) to a Date object in local timezone.
 * This prevents timezone offset issues when creating dates from date input values.
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  // Create date in local timezone by using UTC and then adjusting
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Formats a Date object to a date string (YYYY-MM-DD) in local timezone.
 */
export function formatLocalDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date object for display in local timezone.
 * Since dates are stored as UTC midnight, we use UTC methods to extract
 * the date components to avoid timezone conversion issues.
 */
export function formatDisplayDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
  const day = date.getUTCDate();
  return `${month} ${day}, ${year}`;
}

/**
 * Gets today's date as a YYYY-MM-DD string in local timezone.
 * Useful for default values in date inputs.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Creates a Date object for a specific year, month, and day in UTC timezone.
 * This matches the format used by parseLocalDate() for consistent comparisons.
 */
export function createUTCDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

/**
 * Creates a Date object for the start of the current period (week, month, year) in UTC timezone.
 * This matches the format used by parseLocalDate() for consistent filtering.
 */
export function getPeriodStartDate(period: 'weekly' | 'monthly' | 'yearly'): Date {
  const now = new Date();
  
  switch (period) {
    case 'weekly':
      // 7 days ago in UTC
      return new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - 7
      ));
    case 'monthly':
      // First day of current month in UTC
      return new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        1
      ));
    case 'yearly':
      // First day of current year in UTC
      return new Date(Date.UTC(
        now.getUTCFullYear(),
        0,
        1
      ));
  }
}

/**
 * Calculates the end date for a budget based on its period and start date.
 * Returns the end of the period (end of week, month, or year).
 */
export function calculateBudgetEndDate(startDate: Date, period: 'weekly' | 'monthly' | 'yearly'): Date {
  const start = new Date(startDate);
  
  switch (period) {
    case 'weekly':
      // End of week (7 days after start, at end of day)
      const weekEnd = new Date(Date.UTC(
        start.getUTCFullYear(),
        start.getUTCMonth(),
        start.getUTCDate() + 6,
        23, 59, 59, 999
      ));
      return weekEnd;
    case 'monthly':
      // End of month
      const monthEnd = new Date(Date.UTC(
        start.getUTCFullYear(),
        start.getUTCMonth() + 1,
        0, // Day 0 = last day of previous month
        23, 59, 59, 999
      ));
      return monthEnd;
    case 'yearly':
      // End of year
      const yearEnd = new Date(Date.UTC(
        start.getUTCFullYear(),
        11, // December (0-indexed)
        31,
        23, 59, 59, 999
      ));
      return yearEnd;
  }
}

/**
 * Compares two dates ignoring time components (only compares year, month, day).
 * Returns true if date1 is on or before date2.
 * Uses UTC methods for consistent comparison.
 */
export function isDateOnOrBefore(date1: Date, date2: Date): boolean {
  const d1 = Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate());
  const d2 = Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate());
  return d1 <= d2;
}

/**
 * Compares two dates ignoring time components (only compares year, month, day).
 * Returns true if date1 is on or after date2.
 * Uses UTC methods for consistent comparison.
 */
export function isDateOnOrAfter(date1: Date, date2: Date): boolean {
  const d1 = Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate());
  const d2 = Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate());
  return d1 >= d2;
}

/**
 * Checks if an account needs review (last reviewed more than a week ago).
 * Returns true if lastReviewedAt is undefined or more than 7 days ago.
 */
export function isAccountNeedsReview(lastReviewedAt: Date | undefined): boolean {
  if (!lastReviewedAt) {
    return true; // Never reviewed
  }
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return lastReviewedAt < oneWeekAgo;
}

/**
 * Formats the last reviewed date for display.
 * Returns a human-readable string like "Today", "Yesterday", "3 days ago", or the full date.
 */
export function formatLastReviewed(lastReviewedAt: Date | undefined): string {
  if (!lastReviewedAt) {
    return 'Never reviewed';
  }
  
  const now = new Date();
  const diffMs = now.getTime() - lastReviewedAt.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Reviewed today';
  } else if (diffDays === 1) {
    return 'Reviewed yesterday';
  } else if (diffDays < 7) {
    return `Reviewed ${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Reviewed ${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    return `Reviewed on ${formatDisplayDate(lastReviewedAt)}`;
  }
}

/**
 * Groups transactions by date string (YYYY-MM-DD)
 * Returns a Map where keys are date strings and values are arrays of transactions
 */
export function groupTransactionsByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();
  
  transactions.forEach(transaction => {
    const dateKey = formatLocalDate(transaction.date);
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(transaction);
  });
  
  return grouped;
}

/**
 * Formats a date for display in day headers
 * Returns "Today", "Yesterday", or formatted date
 */
export function formatDayHeaderDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Compare dates (ignoring time)
  const compareDates = (d1: Date, d2: Date) => {
    return d1.getUTCFullYear() === d2.getUTCFullYear() &&
           d1.getUTCMonth() === d2.getUTCMonth() &&
           d1.getUTCDate() === d2.getUTCDate();
  };
  
  if (compareDates(date, today)) {
    return 'Today';
  } else if (compareDates(date, yesterday)) {
    return 'Yesterday';
  } else {
    return formatDisplayDate(date);
  }
}

/**
 * Sorts date keys in descending order (newest first)
 */
export function sortDateKeysDesc(dateKeys: string[]): string[] {
  return dateKeys.sort((a, b) => b.localeCompare(a));
}

/**
 * Serializes Date objects to ISO strings for Redux storage.
 * Recursively processes objects and arrays to convert all Date instances.
 */
export function serializeDates<T>(data: T): T extends Date ? string : T {
  if (data === null || data === undefined) {
    return data as any;
  }
  
  if (data instanceof Date) {
    return data.toISOString() as any;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => serializeDates(item)) as any;
  }
  
  if (typeof data === 'object') {
    const serialized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        serialized[key] = serializeDates((data as any)[key]);
      }
    }
    return serialized as any;
  }
  
  return data as any;
}

/**
 * Deserializes ISO date strings back to Date objects.
 * Recursively processes objects and arrays to convert date strings.
 */
export function deserializeDates<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'string') {
    // Check if it's an ISO date string by trying to parse it
    // ISO date strings typically contain 'T' and match date patterns
    if (data.includes('T') && data.length >= 19) {
      const date = new Date(data);
      // Only convert if it's a valid date and the string looks like an ISO date
      if (!isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}T/.test(data)) {
        return date as any;
      }
    }
  }
  
  if (Array.isArray(data)) {
    return data.map(item => deserializeDates(item)) as any;
  }
  
  if (typeof data === 'object') {
    const deserialized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        deserialized[key] = deserializeDates((data as any)[key]);
      }
    }
    return deserialized;
  }
  
  return data;
}
