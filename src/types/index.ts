// Account Types
export type AccountType = 'checking' | 'savings' | 'credit' | 'debit' | 'investment';

export interface CreditCardDetails {
  interestRate?: number;    // APR percentage (e.g., 18.99)
  statementDay?: number;     // Day of month (1-31)
  creditLimit?: number;      // Credit limit amount
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color?: string;
  icon?: string;
  creditCardDetails?: CreditCardDetails;
  lastReviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountFormData {
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color?: string;
  icon?: string;
  creditCardDetails?: CreditCardDetails;
}

// Category Types
export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryFormData {
  name: string;
  type: CategoryType;
  color: string;
  icon?: string;
}

// Tag Types
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagFormData {
  name: string;
  color: string;
}

// Transaction Types
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  date: Date;
  vendor: string;
  notes?: string;
  tagIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionFormData {
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  date: Date;
  vendor: string;
  notes?: string;
  tagIds: string[];
}

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  accountId?: string;
  categoryId?: string;
  tagIds?: string[];
  type?: TransactionType;
  vendor?: string;
}

// Budget Types
export type BudgetPeriod = 'monthly' | 'weekly' | 'yearly';

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetFormData {
  categoryId: string;
  amount: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date;
}

// Analytics Types
export type AnalyticsPeriod = 'weekly' | 'monthly' | 'yearly';

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface IncomeExpenseData {
  period: string;
  income: number;
  expense: number;
  net: number;
}

export interface AnalyticsData {
  incomeExpense: IncomeExpenseData[];
  categorySpending: CategorySpending[];
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
}

// Export/Import Types
export interface ExportData {
  version: string;
  exportDate: string;
  accounts: Account[];
  categories: Category[];
  tags: Tag[];
  transactions: Transaction[];
  budgets: Budget[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  imported: {
    accounts: number;
    categories: number;
    tags: number;
    transactions: number;
    budgets: number;
  };
  errors?: string[];
}
