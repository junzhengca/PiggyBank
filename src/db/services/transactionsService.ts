import { db } from '../index';
import { Transaction, TransactionFormData, TransactionFilters } from '@/types';
import accountsService from './accountsService';

const transactionsService = {
  async getAll(): Promise<Transaction[]> {
    return await db.transactions.orderBy('date').reverse().toArray();
  },

  async getById(id: string): Promise<Transaction | undefined> {
    return await db.transactions.get(id);
  },

  async getFiltered(filters: TransactionFilters): Promise<Transaction[]> {
    let query = db.transactions.orderBy('date').reverse();

    if (filters.startDate) {
      query = query.filter(t => t.date >= filters.startDate!);
    }

    if (filters.endDate) {
      query = query.filter(t => t.date <= filters.endDate!);
    }

    const results = await query.toArray();

    return results.filter(t => {
      if (filters.accountId && t.accountId !== filters.accountId) return false;
      if (filters.categoryId && t.categoryId !== filters.categoryId) return false;
      if (filters.type && t.type !== filters.type) return false;
      if (filters.vendor && !t.vendor.toLowerCase().includes(filters.vendor.toLowerCase())) return false;
      if (filters.tagIds && filters.tagIds.length > 0) {
        return filters.tagIds.some(tagId => t.tagIds.includes(tagId));
      }
      return true;
    });
  },

  async create(data: TransactionFormData): Promise<Transaction> {
    const now = new Date();
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.transactions.add(transaction);
    
    // Update account balance
    const amount = data.type === 'income' ? data.amount : -data.amount;
    await accountsService.updateBalance(data.accountId, amount);
    
    return transaction;
  },

  async update(id: string, data: Partial<TransactionFormData>): Promise<Transaction | undefined> {
    const existing = await db.transactions.get(id);
    if (!existing) return undefined;

    // Revert old balance change
    const oldAmount = existing.type === 'income' ? existing.amount : -existing.amount;
    await accountsService.updateBalance(existing.accountId, -oldAmount);

    const updated: Transaction = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    
    await db.transactions.put(updated);
    
    // Apply new balance change
    const newAmount = updated.type === 'income' ? updated.amount : -updated.amount;
    await accountsService.updateBalance(updated.accountId, newAmount);
    
    return updated;
  },

  async delete(id: string): Promise<void> {
    const existing = await db.transactions.get(id);
    if (!existing) return;

    // Revert balance change
    const amount = existing.type === 'income' ? existing.amount : -existing.amount;
    await accountsService.updateBalance(existing.accountId, -amount);
    
    await db.transactions.delete(id);
  },

  async getByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await db.transactions
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  },

  async getAccountTransactions(accountId: string): Promise<Transaction[]> {
    return await db.transactions
      .where('accountId')
      .equals(accountId)
      .reverse()
      .toArray();
  },
};

export default transactionsService;
