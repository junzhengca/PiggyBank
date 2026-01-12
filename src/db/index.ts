import Dexie, { Table } from 'dexie';
import { Account, Category, Tag, Transaction, Budget } from '@/types';
import { DB_NAME } from '@/types/constants';

export class PiggyBankDB extends Dexie {
  accounts!: Table<Account>;
  categories!: Table<Category>;
  tags!: Table<Tag>;
  transactions!: Table<Transaction>;
  budgets!: Table<Budget>;

  constructor() {
    super(DB_NAME);
    
    this.version(1).stores({
      accounts: 'id, name, type, balance, currency, createdAt, updatedAt',
      categories: 'id, name, type, color, isDefault, createdAt, updatedAt',
      tags: 'id, name, color, createdAt, updatedAt',
      transactions: 'id, accountId, categoryId, amount, type, date, vendor, createdAt, updatedAt',
      budgets: 'id, categoryId, amount, period, startDate, endDate, createdAt, updatedAt',
    });
    
    this.version(2).stores({
      accounts: 'id, name, type, balance, currency, lastReviewedAt, createdAt, updatedAt',
      categories: 'id, name, type, color, isDefault, createdAt, updatedAt',
      tags: 'id, name, color, createdAt, updatedAt',
      transactions: 'id, accountId, categoryId, amount, type, date, vendor, createdAt, updatedAt',
      budgets: 'id, categoryId, amount, period, startDate, endDate, createdAt, updatedAt',
    }).upgrade(async (trans) => {
      // Migration: Add lastReviewedAt to existing accounts
      const accounts = await trans.table('accounts').toArray();
      await trans.table('accounts').bulkPut(
        accounts.map(account => ({
          ...account,
          lastReviewedAt: account.createdAt // Initialize to createdAt for existing accounts
        }))
      );
    });
    
    this.version(3).stores({
      accounts: 'id, name, type, balance, currency, bankId, lastReviewedAt, createdAt, updatedAt',
      categories: 'id, name, type, color, isDefault, createdAt, updatedAt',
      tags: 'id, name, color, createdAt, updatedAt',
      transactions: 'id, accountId, categoryId, amount, type, date, vendor, createdAt, updatedAt',
      budgets: 'id, categoryId, amount, period, startDate, endDate, createdAt, updatedAt',
    });
  }
}

export const db = new PiggyBankDB();

// Helper function to initialize default data
export async function initializeDefaultData() {
  const categoryCount = await db.categories.count();
  
  if (categoryCount === 0) {
    const { DEFAULT_CATEGORIES } = await import('@/types/constants');
    const now = new Date();
    
    await db.categories.bulkAdd(
      DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      }))
    );
  }
}

// Initialize database
initializeDefaultData().catch(console.error);
