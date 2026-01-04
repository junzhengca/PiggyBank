import { db } from '../index';
import { Budget, BudgetFormData } from '@/types';

export const budgetsService = {
  async getAll(): Promise<Budget[]> {
    return await db.budgets.toArray();
  },

  async getById(id: string): Promise<Budget | undefined> {
    return await db.budgets.get(id);
  },

  async getByCategory(categoryId: string): Promise<Budget[]> {
    return await db.budgets.where('categoryId').equals(categoryId).toArray();
  },

  async create(data: BudgetFormData): Promise<Budget> {
    const now = new Date();
    const budget: Budget = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    await db.budgets.add(budget);
    return budget;
  },

  async update(id: string, data: Partial<BudgetFormData>): Promise<Budget | undefined> {
    const existing = await db.budgets.get(id);
    if (!existing) return undefined;

    const updated: Budget = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    await db.budgets.put(updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.budgets.delete(id);
  },

  async getActiveBudgets(date: Date = new Date()): Promise<Budget[]> {
    const budgets = await db.budgets.toArray();
    return budgets.filter(b => {
      if (b.endDate) {
        return date >= b.startDate && date <= b.endDate;
      }
      return date >= b.startDate;
    });
  },
};
