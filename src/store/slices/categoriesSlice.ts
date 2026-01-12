import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Category, CategoryFormData } from '@/types';
import { categoriesService } from '@/db/services/categoriesService';
import { serializeDates, deserializeDates } from '@/lib/utils';
import type { RootState } from '../index';

interface CategoriesState {
  categories: any[]; // Serialized categories with date strings
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async () => {
    const categories = await categoriesService.getAll();
    return serializeDates(categories);
  }
);

export const fetchCategoriesByType = createAsyncThunk(
  'categories/fetchByType',
  async (type: 'income' | 'expense') => {
    const categories = await categoriesService.getByType(type);
    return serializeDates(categories);
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (data: CategoryFormData) => {
    const category = await categoriesService.create(data);
    return serializeDates(category);
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data }: { id: string; data: Partial<CategoryFormData> }) => {
    const category = await categoriesService.update(id, data);
    return category ? serializeDates(category) : undefined;
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/delete',
  async (id: string) => {
    const success = await categoriesService.delete(id);
    return { id, success };
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      })
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create category';
      })
      // Update category
      .addCase(updateCategory.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.categories.findIndex((c) => c.id === action.payload!.id);
          if (index !== -1) {
            state.categories[index] = action.payload;
          }
        }
      })
      // Delete category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.categories = state.categories.filter((c) => c.id !== action.payload.id);
        }
      });
  },
});

// Selectors with date deserialization
export const selectCategories = (state: RootState): Category[] => {
  return deserializeDates(state.categories.categories);
};

export default categoriesSlice.reducer;
