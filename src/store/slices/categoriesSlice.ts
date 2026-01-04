import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Category, CategoryFormData } from '@/types';
import { categoriesService } from '@/db/services/categoriesService';

interface CategoriesState {
  categories: Category[];
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
    return await categoriesService.getAll();
  }
);

export const fetchCategoriesByType = createAsyncThunk(
  'categories/fetchByType',
  async (type: 'income' | 'expense') => {
    return await categoriesService.getByType(type);
  }
);

export const createCategory = createAsyncThunk(
  'categories/create',
  async (data: CategoryFormData) => {
    return await categoriesService.create(data);
  }
);

export const updateCategory = createAsyncThunk(
  'categories/update',
  async ({ id, data }: { id: string; data: Partial<CategoryFormData> }) => {
    return await categoriesService.update(id, data);
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

export default categoriesSlice.reducer;
