/**
 * Validation functions for import/export data
 * Ensures data integrity and prevents invalid data from being imported
 */

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Supported export versions
 */
export const SUPPORTED_VERSIONS = ['1.0.0'];

/**
 * Validate an ISO date string
 */
function isValidDate(isoString: string | null | undefined): boolean {
  if (!isoString) return true; // null/undefined is valid (optional field)
  const date = new Date(isoString);
  return !isNaN(date.getTime());
}

/**
 * Validate a UUID string
 */
function isValidUuid(uuid: string | undefined): boolean {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate an Account object
 */
export function validateAccount(account: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!account.id || !isValidUuid(account.id)) {
    errors.push({ field: 'id', message: 'Invalid or missing id', value: account.id });
  }

  if (!account.name || typeof account.name !== 'string') {
    errors.push({ field: 'name', message: 'Invalid or missing name', value: account.name });
  }

  if (!['checking', 'savings', 'credit', 'debit', 'investment'].includes(account.type)) {
    errors.push({ field: 'type', message: 'Invalid account type', value: account.type });
  }

  if (typeof account.balance !== 'number' || isNaN(account.balance)) {
    errors.push({ field: 'balance', message: 'Invalid balance', value: account.balance });
  }

  if (!account.currency || typeof account.currency !== 'string') {
    errors.push({ field: 'currency', message: 'Invalid or missing currency', value: account.currency });
  }

  if (!isValidDate(account.createdAt)) {
    errors.push({ field: 'createdAt', message: 'Invalid createdAt date', value: account.createdAt });
  }

  if (!isValidDate(account.updatedAt)) {
    errors.push({ field: 'updatedAt', message: 'Invalid updatedAt date', value: account.updatedAt });
  }

  if (account.creditCardDetails) {
    if (account.creditCardDetails.interestRate !== undefined) {
      if (typeof account.creditCardDetails.interestRate !== 'number' || isNaN(account.creditCardDetails.interestRate)) {
        errors.push({ field: 'creditCardDetails.interestRate', message: 'Invalid interestRate', value: account.creditCardDetails.interestRate });
      }
    }
    if (account.creditCardDetails.statementDay !== undefined) {
      if (typeof account.creditCardDetails.statementDay !== 'number' || account.creditCardDetails.statementDay < 1 || account.creditCardDetails.statementDay > 31) {
        errors.push({ field: 'creditCardDetails.statementDay', message: 'Invalid statementDay (must be 1-31)', value: account.creditCardDetails.statementDay });
      }
    }
    if (account.creditCardDetails.creditLimit !== undefined) {
      if (typeof account.creditCardDetails.creditLimit !== 'number' || isNaN(account.creditCardDetails.creditLimit)) {
        errors.push({ field: 'creditCardDetails.creditLimit', message: 'Invalid creditLimit', value: account.creditCardDetails.creditLimit });
      }
    }
  }

  return errors;
}

/**
 * Validate a Category object
 */
export function validateCategory(category: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!category.id || !isValidUuid(category.id)) {
    errors.push({ field: 'id', message: 'Invalid or missing id', value: category.id });
  }

  if (!category.name || typeof category.name !== 'string') {
    errors.push({ field: 'name', message: 'Invalid or missing name', value: category.name });
  }

  if (!['income', 'expense'].includes(category.type)) {
    errors.push({ field: 'type', message: 'Invalid category type', value: category.type });
  }

  if (!category.color || typeof category.color !== 'string') {
    errors.push({ field: 'color', message: 'Invalid or missing color', value: category.color });
  }

  if (typeof category.isDefault !== 'boolean') {
    errors.push({ field: 'isDefault', message: 'Invalid isDefault', value: category.isDefault });
  }

  if (!isValidDate(category.createdAt)) {
    errors.push({ field: 'createdAt', message: 'Invalid createdAt date', value: category.createdAt });
  }

  if (!isValidDate(category.updatedAt)) {
    errors.push({ field: 'updatedAt', message: 'Invalid updatedAt date', value: category.updatedAt });
  }

  return errors;
}

/**
 * Validate a Tag object
 */
export function validateTag(tag: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!tag.id || !isValidUuid(tag.id)) {
    errors.push({ field: 'id', message: 'Invalid or missing id', value: tag.id });
  }

  if (!tag.name || typeof tag.name !== 'string') {
    errors.push({ field: 'name', message: 'Invalid or missing name', value: tag.name });
  }

  if (!tag.color || typeof tag.color !== 'string') {
    errors.push({ field: 'color', message: 'Invalid or missing color', value: tag.color });
  }

  if (!isValidDate(tag.createdAt)) {
    errors.push({ field: 'createdAt', message: 'Invalid createdAt date', value: tag.createdAt });
  }

  if (!isValidDate(tag.updatedAt)) {
    errors.push({ field: 'updatedAt', message: 'Invalid updatedAt date', value: tag.updatedAt });
  }

  return errors;
}

/**
 * Validate a Transaction object
 */
export function validateTransaction(transaction: any, validAccountIds: string[], validCategoryIds: string[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!transaction.id || !isValidUuid(transaction.id)) {
    errors.push({ field: 'id', message: 'Invalid or missing id', value: transaction.id });
  }

  if (!transaction.accountId || !isValidUuid(transaction.accountId)) {
    errors.push({ field: 'accountId', message: 'Invalid or missing accountId', value: transaction.accountId });
  } else if (!validAccountIds.includes(transaction.accountId)) {
    errors.push({ field: 'accountId', message: 'Referenced account does not exist', value: transaction.accountId });
  }

  if (!transaction.categoryId || !isValidUuid(transaction.categoryId)) {
    errors.push({ field: 'categoryId', message: 'Invalid or missing categoryId', value: transaction.categoryId });
  } else if (!validCategoryIds.includes(transaction.categoryId)) {
    errors.push({ field: 'categoryId', message: 'Referenced category does not exist', value: transaction.categoryId });
  }

  if (typeof transaction.amount !== 'number' || isNaN(transaction.amount)) {
    errors.push({ field: 'amount', message: 'Invalid amount', value: transaction.amount });
  }

  if (!['income', 'expense'].includes(transaction.type)) {
    errors.push({ field: 'type', message: 'Invalid transaction type', value: transaction.type });
  }

  if (!isValidDate(transaction.date)) {
    errors.push({ field: 'date', message: 'Invalid date', value: transaction.date });
  }

  if (!transaction.vendor || typeof transaction.vendor !== 'string') {
    errors.push({ field: 'vendor', message: 'Invalid or missing vendor', value: transaction.vendor });
  }

  if (transaction.notes !== undefined && typeof transaction.notes !== 'string') {
    errors.push({ field: 'notes', message: 'Invalid notes', value: transaction.notes });
  }

  if (!Array.isArray(transaction.tagIds)) {
    errors.push({ field: 'tagIds', message: 'tagIds must be an array', value: transaction.tagIds });
  } else {
    for (let i = 0; i < transaction.tagIds.length; i++) {
      if (!isValidUuid(transaction.tagIds[i])) {
        errors.push({ field: `tagIds[${i}]`, message: 'Invalid tag ID', value: transaction.tagIds[i] });
      }
    }
  }

  if (!isValidDate(transaction.createdAt)) {
    errors.push({ field: 'createdAt', message: 'Invalid createdAt date', value: transaction.createdAt });
  }

  if (!isValidDate(transaction.updatedAt)) {
    errors.push({ field: 'updatedAt', message: 'Invalid updatedAt date', value: transaction.updatedAt });
  }

  return errors;
}

/**
 * Validate a Budget object
 */
export function validateBudget(budget: any, validCategoryIds: string[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!budget.id || !isValidUuid(budget.id)) {
    errors.push({ field: 'id', message: 'Invalid or missing id', value: budget.id });
  }

  if (!budget.categoryId || !isValidUuid(budget.categoryId)) {
    errors.push({ field: 'categoryId', message: 'Invalid or missing categoryId', value: budget.categoryId });
  } else if (!validCategoryIds.includes(budget.categoryId)) {
    errors.push({ field: 'categoryId', message: 'Referenced category does not exist', value: budget.categoryId });
  }

  if (typeof budget.amount !== 'number' || isNaN(budget.amount)) {
    errors.push({ field: 'amount', message: 'Invalid amount', value: budget.amount });
  }

  if (!['monthly', 'weekly', 'yearly'].includes(budget.period)) {
    errors.push({ field: 'period', message: 'Invalid budget period', value: budget.period });
  }

  if (!isValidDate(budget.startDate)) {
    errors.push({ field: 'startDate', message: 'Invalid startDate date', value: budget.startDate });
  }

  if (budget.endDate !== undefined && !isValidDate(budget.endDate)) {
    errors.push({ field: 'endDate', message: 'Invalid endDate date', value: budget.endDate });
  }

  if (!isValidDate(budget.createdAt)) {
    errors.push({ field: 'createdAt', message: 'Invalid createdAt date', value: budget.createdAt });
  }

  if (!isValidDate(budget.updatedAt)) {
    errors.push({ field: 'updatedAt', message: 'Invalid updatedAt date', value: budget.updatedAt });
  }

  return errors;
}

/**
 * Validate ExportData structure
 */
export function validateExportData(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data) {
    errors.push({ field: 'root', message: 'Data is null or undefined' });
    return { valid: false, errors };
  }

  if (!data.version || typeof data.version !== 'string') {
    errors.push({ field: 'version', message: 'Invalid or missing version', value: data.version });
  } else if (!SUPPORTED_VERSIONS.includes(data.version)) {
    errors.push({ field: 'version', message: `Unsupported version: ${data.version}. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`, value: data.version });
  }

  if (!data.exportDate || !isValidDate(data.exportDate)) {
    errors.push({ field: 'exportDate', message: 'Invalid or missing exportDate', value: data.exportDate });
  }

  if (!Array.isArray(data.accounts)) {
    errors.push({ field: 'accounts', message: 'accounts must be an array', value: data.accounts });
  }

  if (!Array.isArray(data.categories)) {
    errors.push({ field: 'categories', message: 'categories must be an array', value: data.categories });
  }

  if (!Array.isArray(data.transactions)) {
    errors.push({ field: 'transactions', message: 'transactions must be an array', value: data.transactions });
  }

  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    errors.push({ field: 'tags', message: 'tags must be an array', value: data.tags });
  }

  if (data.budgets !== undefined && !Array.isArray(data.budgets)) {
    errors.push({ field: 'budgets', message: 'budgets must be an array', value: data.budgets });
  }

  // If there are structural errors, return early
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Validate individual items
  const accountIds: string[] = [];
  const categoryIds: string[] = [];
  const tagIds: string[] = [];

  // Validate accounts and collect IDs
  for (let i = 0; i < data.accounts.length; i++) {
    const accountErrors = validateAccount(data.accounts[i]);
    if (accountErrors.length > 0) {
      errors.push(...accountErrors.map(e => ({ ...e, field: `accounts[${i}].${e.field}` })));
    } else {
      accountIds.push(data.accounts[i].id);
    }
  }

  // Validate categories and collect IDs
  for (let i = 0; i < data.categories.length; i++) {
    const categoryErrors = validateCategory(data.categories[i]);
    if (categoryErrors.length > 0) {
      errors.push(...categoryErrors.map(e => ({ ...e, field: `categories[${i}].${e.field}` })));
    } else {
      categoryIds.push(data.categories[i].id);
    }
  }

  // Validate tags and collect IDs
  if (data.tags) {
    for (let i = 0; i < data.tags.length; i++) {
      const tagErrors = validateTag(data.tags[i]);
      if (tagErrors.length > 0) {
        errors.push(...tagErrors.map(e => ({ ...e, field: `tags[${i}].${e.field}` })));
      } else {
        tagIds.push(data.tags[i].id);
      }
    }
  }

  // Validate transactions with foreign key checks
  for (let i = 0; i < data.transactions.length; i++) {
    const transactionErrors = validateTransaction(data.transactions[i], accountIds, categoryIds);
    if (transactionErrors.length > 0) {
      errors.push(...transactionErrors.map(e => ({ ...e, field: `transactions[${i}].${e.field}` })));
    }
  }

  // Validate budgets with foreign key checks
  if (data.budgets) {
    for (let i = 0; i < data.budgets.length; i++) {
      const budgetErrors = validateBudget(data.budgets[i], categoryIds);
      if (budgetErrors.length > 0) {
        errors.push(...budgetErrors.map(e => ({ ...e, field: `budgets[${i}].${e.field}` })));
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format validation errors into a readable message
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';

  const uniqueErrors = new Map<string, string>();
  for (const error of errors) {
    const key = `${error.field}: ${error.message}`;
    uniqueErrors.set(key, key);
  }

  return Array.from(uniqueErrors.values()).join('; ');
}
