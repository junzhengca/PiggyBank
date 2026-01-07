/**
 * Import/Export Service
 * Handles exporting and importing application data with transaction safety
 */

import { ExportData, ImportResult } from '@/types';
import { db as dexieDb } from '@/db';
import { serializeArrayDates, deserializeArrayDates } from './dateHelpers';
import { validateExportData, formatValidationErrors } from './validation';

/**
 * Current export version
 */
export const CURRENT_VERSION = '1.0.0';

/**
 * Date fields for each entity type
 */
const ACCOUNT_DATE_FIELDS = ['createdAt', 'updatedAt', 'lastReviewedAt'] as const;
const CATEGORY_DATE_FIELDS = ['createdAt', 'updatedAt'] as const;
const TAG_DATE_FIELDS = ['createdAt', 'updatedAt'] as const;
const TRANSACTION_DATE_FIELDS = ['date', 'createdAt', 'updatedAt'] as const;
const BUDGET_DATE_FIELDS = ['startDate', 'endDate', 'createdAt', 'updatedAt'] as const;

/**
 * Export data from the database
 * @returns Promise resolving to ExportData object
 */
export async function exportData(): Promise<ExportData> {
  // Fetch all data from database
  const accounts = await dexieDb.accounts.toArray();
  const categories = await dexieDb.categories.toArray();
  const tags = await dexieDb.tags.toArray();
  const transactions = await dexieDb.transactions.toArray();
  const budgets = await dexieDb.budgets.toArray();

  // Serialize Date objects to ISO strings
  const serializedAccounts = serializeArrayDates(accounts, ACCOUNT_DATE_FIELDS as any);
  const serializedCategories = serializeArrayDates(categories, CATEGORY_DATE_FIELDS as any);
  const serializedTags = serializeArrayDates(tags, TAG_DATE_FIELDS as any);
  const serializedTransactions = serializeArrayDates(transactions, TRANSACTION_DATE_FIELDS as any);
  const serializedBudgets = serializeArrayDates(budgets, BUDGET_DATE_FIELDS as any);

  // Create export data
  const exportData: ExportData = {
    version: CURRENT_VERSION,
    exportDate: new Date().toISOString(),
    accounts: serializedAccounts as any,
    categories: serializedCategories as any,
    tags: serializedTags as any,
    transactions: serializedTransactions as any,
    budgets: serializedBudgets as any,
  };

  return exportData;
}

/**
 * Export data and create a downloadable blob
 * @returns Promise resolving to a Blob containing the exported data
 */
export async function exportDataAsBlob(): Promise<Blob> {
  const data = await exportData();
  const jsonString = JSON.stringify(data, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

/**
 * Download export data as a file
 * @param filename - Optional filename (defaults to piggybank-export-YYYY-MM-DD.json)
 */
export async function downloadExport(filename?: string): Promise<void> {
  const blob = await exportDataAsBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `piggybank-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Backup existing data before import
 * @returns Promise resolving to backup data
 */
async function backupExistingData(): Promise<ExportData> {
  const accounts = await dexieDb.accounts.toArray();
  const categories = await dexieDb.categories.toArray();
  const tags = await dexieDb.tags.toArray();
  const transactions = await dexieDb.transactions.toArray();
  const budgets = await dexieDb.budgets.toArray();

  return {
    version: CURRENT_VERSION,
    exportDate: new Date().toISOString(),
    accounts,
    categories,
    tags,
    transactions,
    budgets,
  };
}

/**
 * Restore data from backup
 * @param backup - Backup data to restore
 */
async function restoreBackup(backup: ExportData): Promise<void> {
  await dexieDb.transaction('rw', [dexieDb.accounts, dexieDb.categories, dexieDb.tags, dexieDb.transactions, dexieDb.budgets], async () => {
    // Clear all tables
    await dexieDb.accounts.clear();
    await dexieDb.categories.clear();
    await dexieDb.tags.clear();
    await dexieDb.transactions.clear();
    await dexieDb.budgets.clear();

    // Restore backup data
    await dexieDb.accounts.bulkAdd(backup.accounts);
    await dexieDb.categories.bulkAdd(backup.categories);
    await dexieDb.tags.bulkAdd(backup.tags);
    await dexieDb.transactions.bulkAdd(backup.transactions);
    await dexieDb.budgets.bulkAdd(backup.budgets);
  });
}

/**
 * Import data from an ExportData object
 * @param data - ExportData object to import
 * @returns Promise resolving to ImportResult
 */
export async function importData(data: ExportData): Promise<ImportResult> {
  try {
    // Validate the data
    const validationResult = validateExportData(data);
    if (!validationResult.valid) {
      return {
        success: false,
        message: 'Validation failed: ' + formatValidationErrors(validationResult.errors),
        imported: { accounts: 0, categories: 0, tags: 0, transactions: 0, budgets: 0 },
        errors: validationResult.errors.map(e => `${e.field}: ${e.message}`),
      };
    }

    // Backup existing data
    const backup = await backupExistingData();

    try {
      // Deserialize ISO strings to Date objects
      const deserializedAccounts = deserializeArrayDates(data.accounts, ACCOUNT_DATE_FIELDS as any);
      const deserializedCategories = deserializeArrayDates(data.categories, CATEGORY_DATE_FIELDS as any);
      const deserializedTags = deserializeArrayDates(data.tags || [], TAG_DATE_FIELDS as any);
      const deserializedTransactions = deserializeArrayDates(data.transactions, TRANSACTION_DATE_FIELDS as any);
      const deserializedBudgets = deserializeArrayDates(data.budgets || [], BUDGET_DATE_FIELDS as any);

      // Use transaction to ensure atomic operation
      await dexieDb.transaction('rw', [dexieDb.accounts, dexieDb.categories, dexieDb.tags, dexieDb.transactions, dexieDb.budgets], async () => {
        // Clear existing data
        await dexieDb.accounts.clear();
        await dexieDb.categories.clear();
        await dexieDb.tags.clear();
        await dexieDb.transactions.clear();
        await dexieDb.budgets.clear();

        // Import new data
        await dexieDb.accounts.bulkAdd(deserializedAccounts as any);
        await dexieDb.categories.bulkAdd(deserializedCategories as any);
        await dexieDb.tags.bulkAdd(deserializedTags as any);
        await dexieDb.transactions.bulkAdd(deserializedTransactions as any);
        await dexieDb.budgets.bulkAdd(deserializedBudgets as any);
      });

      // Return success result
      return {
        success: true,
        message: 'Data imported successfully!',
        imported: {
          accounts: data.accounts.length,
          categories: data.categories.length,
          tags: (data.tags || []).length,
          transactions: data.transactions.length,
          budgets: (data.budgets || []).length,
        },
      };
    } catch (error) {
      // Rollback by restoring backup
      try {
        await restoreBackup(backup);
      } catch (restoreError) {
        console.error('Failed to restore backup after import failure:', restoreError);
      }

      // Re-throw the original error
      throw error;
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to import data',
      imported: { accounts: 0, categories: 0, tags: 0, transactions: 0, budgets: 0 },
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Import data from a JSON file
 * @param file - File object containing JSON data
 * @returns Promise resolving to ImportResult
 */
export async function importDataFromFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const jsonString = event.target?.result as string;
        const data: ExportData = JSON.parse(jsonString);
        const result = await importData(data);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to parse file',
          imported: { accounts: 0, categories: 0, tags: 0, transactions: 0, budgets: 0 },
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        });
      }
    };
    
    reader.onerror = () => {
      resolve({
        success: false,
        message: 'Failed to read file',
        imported: { accounts: 0, categories: 0, tags: 0, transactions: 0, budgets: 0 },
        errors: ['Failed to read file'],
      });
    };
    
    reader.readAsText(file);
  });
}

/**
 * Clear all data from the database
 * @returns Promise resolving when data is cleared
 */
export async function clearAllData(): Promise<void> {
  await dexieDb.transaction('rw', [dexieDb.accounts, dexieDb.categories, dexieDb.tags, dexieDb.transactions, dexieDb.budgets], async () => {
    await dexieDb.accounts.clear();
    await dexieDb.categories.clear();
    await dexieDb.tags.clear();
    await dexieDb.transactions.clear();
    await dexieDb.budgets.clear();
  });
}

/**
 * Get data statistics
 * @returns Promise resolving to data counts
 */
export async function getDataStats(): Promise<{
  accounts: number;
  categories: number;
  tags: number;
  transactions: number;
  budgets: number;
}> {
  const [accounts, categories, tags, transactions, budgets] = await Promise.all([
    dexieDb.accounts.count(),
    dexieDb.categories.count(),
    dexieDb.tags.count(),
    dexieDb.transactions.count(),
    dexieDb.budgets.count(),
  ]);

  return {
    accounts,
    categories,
    tags,
    transactions,
    budgets,
  };
}
