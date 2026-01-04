import { Category } from './index';

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Income categories
  { name: 'Salary', type: 'income', color: '#22c55e', icon: '💰', isDefault: true },
  { name: 'Freelance', type: 'income', color: '#10b981', icon: '💼', isDefault: true },
  { name: 'Investments', type: 'income', color: '#3b82f6', icon: '📈', isDefault: true },
  { name: 'Other Income', type: 'income', color: '#64748b', icon: '💵', isDefault: true },
  
  // Expense categories
  { name: 'Housing', type: 'expense', color: '#ef4444', icon: '🏠', isDefault: true },
  { name: 'Food & Dining', type: 'expense', color: '#f97316', icon: '🍔', isDefault: true },
  { name: 'Transportation', type: 'expense', color: '#eab308', icon: '🚗', isDefault: true },
  { name: 'Utilities', type: 'expense', color: '#a855f7', icon: '💡', isDefault: true },
  { name: 'Entertainment', type: 'expense', color: '#ec4899', icon: '🎬', isDefault: true },
  { name: 'Shopping', type: 'expense', color: '#f43f5e', icon: '🛍️', isDefault: true },
  { name: 'Health', type: 'expense', color: '#06b6d4', icon: '🏥', isDefault: true },
  { name: 'Education', type: 'expense', color: '#6366f1', icon: '📚', isDefault: true },
  { name: 'Personal Care', type: 'expense', color: '#f59e0b', icon: '💄', isDefault: true },
  { name: 'Travel', type: 'expense', color: '#14b8a6', icon: '✈️', isDefault: true },
  { name: 'Gifts', type: 'expense', color: '#8b5cf6', icon: '🎁', isDefault: true },
  { name: 'Other Expense', type: 'expense', color: '#94a3b8', icon: '📦', isDefault: true },
];

export const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'credit', label: 'Credit Card' },
  { value: 'debit', label: 'Debit Card' },
  { value: 'investment', label: 'Investment' },
] as const;

export const BUDGET_PERIODS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

export const ANALYTICS_PERIODS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  INR: '₹',
  CNY: '¥',
};

export const DEFAULT_CURRENCY = 'USD';

export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy h:mm a',
  INPUT: 'yyyy-MM-dd',
} as const;

export const DB_VERSION = 2;
export const DB_NAME = 'PiggyBankDB';
