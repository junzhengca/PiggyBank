import { db } from '../index';
import { Account, AccountFormData } from '@/types';

const accountsService = {
  async getAll(): Promise<Account[]> {
    return await db.accounts.toArray();
  },

  async getById(id: string): Promise<Account | undefined> {
    return await db.accounts.get(id);
  },

  async create(data: AccountFormData): Promise<Account> {
    const now = new Date();
    const account: Account = {
      id: crypto.randomUUID(),
      ...data,
      lastReviewedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await db.accounts.add(account);
    return account;
  },

  async update(id: string, data: Partial<AccountFormData>): Promise<Account | undefined> {
    const existing = await db.accounts.get(id);
    if (!existing) return undefined;

    const updated: Account = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    await db.accounts.put(updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.accounts.delete(id);
  },

  async updateBalance(id: string, amount: number): Promise<Account | undefined> {
    const existing = await db.accounts.get(id);
    if (!existing) return undefined;

    const updated: Account = {
      ...existing,
      balance: existing.balance + amount,
      updatedAt: new Date(),
    };
    await db.accounts.put(updated);
    return updated;
  },

  async markAsReviewed(id: string): Promise<Account | undefined> {
    const existing = await db.accounts.get(id);
    if (!existing) return undefined;

    const updated: Account = {
      ...existing,
      lastReviewedAt: new Date(),
      updatedAt: new Date(),
    };
    await db.accounts.put(updated);
    return updated;
  },
};

export default accountsService;
