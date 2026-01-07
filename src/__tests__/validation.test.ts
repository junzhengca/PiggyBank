/**
 * Unit tests for validation functions
 */

import { describe, it, expect } from 'vitest';
import {
  validateAccount,
  validateCategory,
  validateTag,
  validateTransaction,
  validateBudget,
  validateExportData,
  formatValidationErrors,
  SUPPORTED_VERSIONS,
} from '@/lib/validation';
import {
  createMockAccount,
  createMockCategory,
  createMockTag,
  createMockTransaction,
  createMockBudget,
  createMockExportData,
  createInvalidExportData,
  createExportDataWithInvalidTransactionForeignKey,
  createExportDataWithInvalidVersion,
  createExportDataWithInvalidTypes,
  createEmptyExportData,
} from './testHelpers';

describe('validateAccount', () => {
  it('should validate a valid account', () => {
    const account = createMockAccount();
    const errors = validateAccount(account);
    expect(errors).toHaveLength(0);
  });

  it('should reject account with invalid id', () => {
    const account = createMockAccount({ id: 'not-a-uuid' });
    const errors = validateAccount(account);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.field === 'id')).toBe(true);
  });

  it('should reject account with missing name', () => {
    const account = createMockAccount({ name: '' });
    const errors = validateAccount(account);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.field === 'name')).toBe(true);
  });

  it('should reject account with invalid type', () => {
    const account = createMockAccount({ type: 'invalid-type' as any });
    const errors = validateAccount(account);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.field === 'type')).toBe(true);
  });

  it('should reject account with invalid balance', () => {
    const account = createMockAccount({ balance: NaN });
    const errors = validateAccount(account);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.field === 'balance')).toBe(true);
  });

  it('should reject account with invalid currency', () => {
    const account = createMockAccount({ currency: null as any });
    const errors = validateAccount(account);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.field === 'currency')).toBe(true);
  });

  it('should reject account with invalid createdAt', () => {
    const account = createMockAccount({ createdAt: 'not-a-date' as any });
    const errors = validateAccount(account);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.field === 'createdAt')).toBe(true);
  });

  it('should reject account with invalid updatedAt', () => {
    const account = createMockAccount({ updatedAt: 'not-a-date' as any });
    const errors = validateAccount(account);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.field === 'updatedAt')).toBe(true);
  });

  it('should validate credit card details', () => {
    const account = createMockAccount({
      type: 'credit',
      creditCardDetails: {
        interestRate: 18.99,
        statementDay: 15,
        creditLimit: 5000,
      },
    });
    const errors = validateAccount(account);
    expect(errors).toHaveLength(0);
  });

  it('should reject invalid interestRate', () => {
    const account = createMockAccount({
      creditCardDetails: { interestRate: NaN },
    });
    const errors = validateAccount(account);
    expect(errors.some(e => e.field === 'creditCardDetails.interestRate')).toBe(true);
  });

  it('should reject invalid statementDay', () => {
    const account = createMockAccount({
      creditCardDetails: { statementDay: 32 },
    });
    const errors = validateAccount(account);
    expect(errors.some(e => e.field === 'creditCardDetails.statementDay')).toBe(true);
  });

  it('should reject invalid creditLimit', () => {
    const account = createMockAccount({
      creditCardDetails: { creditLimit: NaN },
    });
    const errors = validateAccount(account);
    expect(errors.some(e => e.field === 'creditCardDetails.creditLimit')).toBe(true);
  });
});

describe('validateCategory', () => {
  it('should validate a valid category', () => {
    const category = createMockCategory();
    const errors = validateCategory(category);
    expect(errors).toHaveLength(0);
  });

  it('should reject category with invalid id', () => {
    const category = createMockCategory({ id: 'not-a-uuid' });
    const errors = validateCategory(category);
    expect(errors.some(e => e.field === 'id')).toBe(true);
  });

  it('should reject category with missing name', () => {
    const category = createMockCategory({ name: '' });
    const errors = validateCategory(category);
    expect(errors.some(e => e.field === 'name')).toBe(true);
  });

  it('should reject category with invalid type', () => {
    const category = createMockCategory({ type: 'invalid-type' as any });
    const errors = validateCategory(category);
    expect(errors.some(e => e.field === 'type')).toBe(true);
  });

  it('should reject category with missing color', () => {
    const category = createMockCategory({ color: '' });
    const errors = validateCategory(category);
    expect(errors.some(e => e.field === 'color')).toBe(true);
  });

  it('should reject category with invalid isDefault', () => {
    const category = createMockCategory({ isDefault: 'yes' as any });
    const errors = validateCategory(category);
    expect(errors.some(e => e.field === 'isDefault')).toBe(true);
  });
});

describe('validateTag', () => {
  it('should validate a valid tag', () => {
    const tag = createMockTag();
    const errors = validateTag(tag);
    expect(errors).toHaveLength(0);
  });

  it('should reject tag with invalid id', () => {
    const tag = createMockTag({ id: 'not-a-uuid' });
    const errors = validateTag(tag);
    expect(errors.some(e => e.field === 'id')).toBe(true);
  });

  it('should reject tag with missing name', () => {
    const tag = createMockTag({ name: '' });
    const errors = validateTag(tag);
    expect(errors.some(e => e.field === 'name')).toBe(true);
  });

  it('should reject tag with missing color', () => {
    const tag = createMockTag({ color: '' });
    const errors = validateTag(tag);
    expect(errors.some(e => e.field === 'color')).toBe(true);
  });
});

describe('validateTransaction', () => {
  it('should validate a valid transaction', () => {
    const account = createMockAccount();
    const category = createMockCategory();
    const transaction = createMockTransaction({
      accountId: account.id,
      categoryId: category.id,
    });
    const errors = validateTransaction(transaction, [account.id], [category.id]);
    expect(errors).toHaveLength(0);
  });

  it('should reject transaction with invalid accountId', () => {
    const category = createMockCategory();
    const transaction = createMockTransaction({
      accountId: 'not-a-uuid',
      categoryId: category.id,
    });
    const errors = validateTransaction(transaction, [], [category.id]);
    expect(errors.some(e => e.field === 'accountId')).toBe(true);
  });

  it('should reject transaction with non-existent accountId', () => {
    const category = createMockCategory();
    const account = createMockAccount();
    const transaction = createMockTransaction({
      accountId: account.id,
      categoryId: category.id,
    });
    const errors = validateTransaction(transaction, [], [category.id]);
    expect(errors.some(e => e.message.includes('Referenced account does not exist'))).toBe(true);
  });

  it('should reject transaction with invalid categoryId', () => {
    const account = createMockAccount();
    const transaction = createMockTransaction({
      accountId: account.id,
      categoryId: 'not-a-uuid',
    });
    const errors = validateTransaction(transaction, [account.id], []);
    expect(errors.some(e => e.field === 'categoryId')).toBe(true);
  });

  it('should reject transaction with non-existent categoryId', () => {
    const account = createMockAccount();
    const category = createMockCategory();
    const transaction = createMockTransaction({
      accountId: account.id,
      categoryId: category.id,
    });
    const errors = validateTransaction(transaction, [account.id], []);
    expect(errors.some(e => e.message.includes('Referenced category does not exist'))).toBe(true);
  });

  it('should reject transaction with invalid amount', () => {
    const account = createMockAccount();
    const category = createMockCategory();
    const transaction = createMockTransaction({
      accountId: account.id,
      categoryId: category.id,
      amount: NaN,
    });
    const errors = validateTransaction(transaction, [account.id], [category.id]);
    expect(errors.some(e => e.field === 'amount')).toBe(true);
  });

  it('should reject transaction with invalid type', () => {
    const account = createMockAccount();
    const category = createMockCategory();
    const transaction = createMockTransaction({
      accountId: account.id,
      categoryId: category.id,
      type: 'invalid-type' as any,
    });
    const errors = validateTransaction(transaction, [account.id], [category.id]);
    expect(errors.some(e => e.field === 'type')).toBe(true);
  });

  it('should reject transaction with invalid date', () => {
    const account = createMockAccount();
    const category = createMockCategory();
    const transaction = createMockTransaction({
      accountId: account.id,
      categoryId: category.id,
      date: 'not-a-date' as any,
    });
    const errors = validateTransaction(transaction, [account.id], [category.id]);
    expect(errors.some(e => e.field === 'date')).toBe(true);
  });

  it('should reject transaction with missing vendor', () => {
    const account = createMockAccount();
    const category = createMockCategory();
    const transaction = createMockTransaction({
      accountId: account.id,
      categoryId: category.id,
      vendor: '',
    });
    const errors = validateTransaction(transaction, [account.id], [category.id]);
    expect(errors.some(e => e.field === 'vendor')).toBe(true);
  });

  it('should reject transaction with invalid tagIds', () => {
    const account = createMockAccount();
    const category = createMockCategory();
    const transaction = createMockTransaction({
      accountId: account.id,
      categoryId: category.id,
      tagIds: 'not-an-array' as any,
    });
    const errors = validateTransaction(transaction, [account.id], [category.id]);
    expect(errors.some(e => e.field === 'tagIds')).toBe(true);
  });

  it('should reject transaction with invalid tag ID', () => {
    const account = createMockAccount();
    const category = createMockCategory();
    const transaction = createMockTransaction({
      accountId: account.id,
      categoryId: category.id,
      tagIds: ['not-a-uuid'],
    });
    const errors = validateTransaction(transaction, [account.id], [category.id]);
    expect(errors.some(e => e.field === 'tagIds[0]')).toBe(true);
  });
});

describe('validateBudget', () => {
  it('should validate a valid budget', () => {
    const category = createMockCategory();
    const budget = createMockBudget({ categoryId: category.id });
    const errors = validateBudget(budget, [category.id]);
    expect(errors).toHaveLength(0);
  });

  it('should reject budget with invalid categoryId', () => {
    const budget = createMockBudget({ categoryId: 'not-a-uuid' });
    const errors = validateBudget(budget, []);
    expect(errors.some(e => e.field === 'categoryId')).toBe(true);
  });

  it('should reject budget with non-existent categoryId', () => {
    const category = createMockCategory();
    const budget = createMockBudget({ categoryId: category.id });
    const errors = validateBudget(budget, []);
    expect(errors.some(e => e.message.includes('Referenced category does not exist'))).toBe(true);
  });

  it('should reject budget with invalid amount', () => {
    const category = createMockCategory();
    const budget = createMockBudget({ categoryId: category.id, amount: NaN });
    const errors = validateBudget(budget, [category.id]);
    expect(errors.some(e => e.field === 'amount')).toBe(true);
  });

  it('should reject budget with invalid period', () => {
    const category = createMockCategory();
    const budget = createMockBudget({ categoryId: category.id, period: 'invalid-period' as any });
    const errors = validateBudget(budget, [category.id]);
    expect(errors.some(e => e.field === 'period')).toBe(true);
  });

  it('should reject budget with invalid startDate', () => {
    const category = createMockCategory();
    const budget = createMockBudget({ categoryId: category.id, startDate: 'not-a-date' as any });
    const errors = validateBudget(budget, [category.id]);
    expect(errors.some(e => e.field === 'startDate')).toBe(true);
  });

  it('should reject budget with invalid endDate', () => {
    const category = createMockCategory();
    const budget = createMockBudget({ categoryId: category.id, endDate: 'not-a-date' as any });
    const errors = validateBudget(budget, [category.id]);
    expect(errors.some(e => e.field === 'endDate')).toBe(true);
  });
});

describe('validateExportData', () => {
  it('should validate valid export data', () => {
    const data = createMockExportData();
    const result = validateExportData(data);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate empty export data', () => {
    const data = createEmptyExportData();
    const result = validateExportData(data);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject null data', () => {
    const result = validateExportData(null as any);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'root')).toBe(true);
  });

  it('should reject undefined data', () => {
    const result = validateExportData(undefined as any);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'root')).toBe(true);
  });

  it('should reject missing version', () => {
    const data = createMockExportData();
    delete (data as any).version;
    const result = validateExportData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'version')).toBe(true);
  });

  it('should reject invalid version', () => {
    const data = createExportDataWithInvalidVersion();
    const result = validateExportData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'version')).toBe(true);
    expect(result.errors.some(e => e.message.includes('Unsupported version'))).toBe(true);
  });

  it('should reject missing exportDate', () => {
    const data = createMockExportData();
    delete (data as any).exportDate;
    const result = validateExportData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'exportDate')).toBe(true);
  });

  it('should reject invalid exportDate', () => {
    const data = createMockExportData();
    (data as any).exportDate = 'not-a-date';
    const result = validateExportData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'exportDate')).toBe(true);
  });

  it('should reject missing accounts array', () => {
    const data = createInvalidExportData();
    const result = validateExportData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'accounts')).toBe(true);
  });

  it('should reject invalid accounts array', () => {
    const data = createMockExportData();
    (data as any).accounts = 'not-an-array';
    const result = validateExportData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'accounts')).toBe(true);
  });

  it('should reject missing categories array', () => {
    const data = createInvalidExportData();
    const result = validateExportData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'categories')).toBe(true);
  });

  it('should reject missing transactions array', () => {
    const data = createInvalidExportData();
    const result = validateExportData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'transactions')).toBe(true);
  });

  it('should reject invalid tags array', () => {
    const data = createMockExportData();
    (data as any).tags = 'not-an-array';
    const result = validateExportData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'tags')).toBe(true);
  });

  it('should reject invalid budgets array', () => {
    const data = createMockExportData();
    (data as any).budgets = 'not-an-array';
    const result = validateExportData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.field === 'budgets')).toBe(true);
  });

  it('should reject invalid account data', () => {
    const data = createExportDataWithInvalidTypes();
    const result = validateExportData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should reject transaction with invalid foreign key', () => {
    const data = createExportDataWithInvalidTransactionForeignKey();
    const result = validateExportData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('Invalid or missing accountId'))).toBe(true);
  });

  it('should validate all supported versions', () => {
    SUPPORTED_VERSIONS.forEach((version) => {
      const data = createMockExportData({ version });
      const result = validateExportData(data);
      expect(result.valid).toBe(true);
    });
  });
});

describe('formatValidationErrors', () => {
  it('should format empty errors array', () => {
    const result = formatValidationErrors([]);
    expect(result).toBe('');
  });

  it('should format single error', () => {
    const errors = [{ field: 'name', message: 'Invalid name' }];
    const result = formatValidationErrors(errors);
    expect(result).toBe('name: Invalid name');
  });

  it('should format multiple errors', () => {
    const errors = [
      { field: 'name', message: 'Invalid name' },
      { field: 'age', message: 'Invalid age' },
      { field: 'email', message: 'Invalid email' },
    ];
    const result = formatValidationErrors(errors);
    expect(result).toContain('name: Invalid name');
    expect(result).toContain('age: Invalid age');
    expect(result).toContain('email: Invalid email');
  });

  it('should deduplicate errors', () => {
    const errors = [
      { field: 'name', message: 'Invalid name' },
      { field: 'name', message: 'Invalid name' },
      { field: 'age', message: 'Invalid age' },
    ];
    const result = formatValidationErrors(errors);
    const count = (result.match(/name: Invalid name/g) || []).length;
    expect(count).toBe(1);
  });
});
