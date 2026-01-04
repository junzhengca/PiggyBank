import { db } from '../index';
import { Category, CategoryFormData } from '@/types';

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    return await db.categories.toArray();
  },

  async getById(id: string): Promise<Category | undefined> {
    return await db.categories.get(id);
  },

  async getByType(type: 'income' | 'expense'): Promise<Category[]> {
    return await db.categories.where('type').equals(type).toArray();
  },

  async create(data: CategoryFormData): Promise<Category> {
    const now = new Date();
    const category: Category = {
      id: crypto.randomUUID(),
      ...data,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.categories.add(category);
    return category;
  },

  async update(id: string, data: Partial<CategoryFormData>): Promise<Category | undefined> {
    const existing = await db.categories.get(id);
    if (!existing) return undefined;

    const updated: Category = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    await db.categories.put(updated);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const existing = await db.categories.get(id);
    if (!existing || existing.isDefault) {
      return false;
    }
    await db.categories.delete(id);
    return true;
  },
};
