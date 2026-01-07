/**
 * Test helpers for import/export tests
 * Provides mock data generators and utility functions
 */

import { Account, Category, Tag, Transaction, Budget, ExportData } from '@/types';

/**
 * Generate a mock account
 */
export function createMockAccount(overrides: Partial<Account> = {}): Account {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name: 'Test Account',
    type: 'checking',
    balance: 1000,
    currency: 'USD',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Generate a mock category
 */
export function createMockCategory(overrides: Partial<Category> = {}): Category {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name: 'Test Category',
    type: 'expense',
    color: '#ff0000',
    icon: '📦',
    isDefault: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Generate a mock tag
 */
export function createMockTag(overrides: Partial<Tag> = {}): Tag {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    name: 'Test Tag',
    color: '#00ff00',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Generate a mock transaction
 */
export function createMockTransaction(overrides: Partial<Transaction> = {}): Transaction {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    accountId: crypto.randomUUID(),
    categoryId: crypto.randomUUID(),
    amount: 100,
    type: 'expense',
    date: now,
    vendor: 'Test Vendor',
    tagIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Generate a mock budget
 */
export function createMockBudget(overrides: Partial<Budget> = {}): Budget {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    categoryId: crypto.randomUUID(),
    amount: 500,
    period: 'monthly',
    startDate: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Generate a mock export data object
 */
export function createMockExportData(overrides: Partial<ExportData> = {}): ExportData {
  const account1 = createMockAccount();
  const account2 = createMockAccount({ name: 'Savings Account', type: 'savings' });
  
  const category1 = createMockCategory({ name: 'Food', type: 'expense' });
  const category2 = createMockCategory({ name: 'Salary', type: 'income' });
  
  const tag1 = createMockTag({ name: 'Work' });
  const tag2 = createMockTag({ name: 'Personal' });
  
  const transaction1 = createMockTransaction({
    accountId: account1.id,
    categoryId: category1.id,
    tagIds: [tag1.id],
  });
  const transaction2 = createMockTransaction({
    accountId: account1.id,
    categoryId: category2.id,
    type: 'income',
    amount: 2000,
    tagIds: [tag1.id, tag2.id],
  });
  
  const budget1 = createMockBudget({ categoryId: category1.id });
  const budget2 = createMockBudget({ categoryId: category2.id, period: 'weekly' });

  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    accounts: [account1, account2],
    categories: [category1, category2],
    tags: [tag1, tag2],
    transactions: [transaction1, transaction2],
    budgets: [budget1, budget2],
    ...overrides,
  };
}

/**
 * Create a mock file from export data
 */
export function createMockFile(exportData: ExportData): File {
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  return new File([blob], 'test-export.json', { type: 'application/json' });
}

/**
 * Create an invalid export data object (missing required fields)
 */
export function createInvalidExportData(): any {
  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    // Missing accounts, categories, transactions
  };
}

/**
 * Create an export data with invalid foreign keys
 */
export function createExportDataWithInvalidForeignKeys(): ExportData {
  const account1 = createMockAccount();
  const category1 = createMockCategory();
  const transaction1 = createMockTransaction({
    accountId: account1.id,
    categoryId: category1.id,
  });

  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    accounts: [account1],
    categories: [category1],
    tags: [],
    transactions: [transaction1],
    budgets: [],
  };
}

/**
 * Create an export data with invalid transaction foreign key (for validation tests)
 */
export function createExportDataWithInvalidTransactionForeignKey(): ExportData {
  const account1 = createMockAccount();
  const category1 = createMockCategory();
  const transaction1 = createMockTransaction({
    accountId: 'invalid-account-id', // Invalid foreign key
    categoryId: category1.id,
  });

  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    accounts: [account1],
    categories: [category1],
    tags: [],
    transactions: [transaction1],
    budgets: [],
  };
}

/**
 * Create an export data with invalid version
 */
export function createExportDataWithInvalidVersion(): ExportData {
  const data = createMockExportData();
  return {
    ...data,
    version: '999.0.0', // Unsupported version
  };
}

/**
 * Create an export data with invalid data types
 */
export function createExportDataWithInvalidTypes(): any {
  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    accounts: [
      {
        id: 'not-a-uuid', // Invalid UUID
        name: 123, // Invalid type (should be string)
        type: 'invalid-type', // Invalid account type
        balance: 'not-a-number', // Invalid type (should be number)
        currency: null, // Invalid (should be string)
        createdAt: 'not-a-date', // Invalid date
        updatedAt: 'not-a-date', // Invalid date
      },
    ],
    categories: [],
    tags: [],
    transactions: [],
    budgets: [],
  };
}

/**
 * Create an empty export data
 */
export function createEmptyExportData(): ExportData {
  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    accounts: [],
    categories: [],
    tags: [],
    transactions: [],
    budgets: [],
  };
}
