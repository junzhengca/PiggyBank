import { db } from '../index';
import { Tag, TagFormData } from '@/types';

export const tagsService = {
  async getAll(): Promise<Tag[]> {
    return await db.tags.toArray();
  },

  async getById(id: string): Promise<Tag | undefined> {
    return await db.tags.get(id);
  },

  async getByIds(ids: string[]): Promise<Tag[]> {
    return await db.tags.where('id').anyOf(ids).toArray();
  },

  async create(data: TagFormData): Promise<Tag> {
    const now = new Date();
    const tag: Tag = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    await db.tags.add(tag);
    return tag;
  },

  async update(id: string, data: Partial<TagFormData>): Promise<Tag | undefined> {
    const existing = await db.tags.get(id);
    if (!existing) return undefined;

    const updated: Tag = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    await db.tags.put(updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.tags.delete(id);
  },
};
