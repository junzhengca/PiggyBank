import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Budget, BudgetFormData } from '@/types';
import { budgetsService } from '@/db/services/budgetsService';

interface BudgetsState {
  budgets: Budget[];
  loading: boolean;
  error: string | null;
}

const initialState: BudgetsState = {
  budgets: [],
  loading: false,
  error: null,
};

export const fetchBudgets = createAsyncThunk(
  'budgets/fetchAll',
  async () => {
    return await budgetsService.getAll();
  }
);

export const fetchActiveBudgets = createAsyncThunk(
  'budgets/fetchActive',
  async () => {
    return await budgetsService.getActiveBudgets();
  }
);

export const createBudget = createAsyncThunk(
  'budgets/create',
  async (data: BudgetFormData) => {
    return await budgetsService.create(data);
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/update',
  async ({ id, data }: { id: string; data: Partial<BudgetFormData> }) => {
    return await budgetsService.update(id, data);
  }
);

export const deleteBudget = createAsyncThunk(
  'budgets/delete',
  async (id: string) => {
    await budgetsService.delete(id);
    return id;
  }
);

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch budgets';
      })
      // Fetch active budgets
      .addCase(fetchActiveBudgets.fulfilled, (state, action) => {
        state.budgets = action.payload;
      })
      // Create budget
      .addCase(createBudget.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets.push(action.payload);
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create budget';
      })
      // Update budget
      .addCase(updateBudget.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.budgets.findIndex((b) => b.id === action.payload!.id);
          if (index !== -1) {
            state.budgets[index] = action.payload;
          }
        }
      })
      // Delete budget
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter((b) => b.id !== action.payload);
      });
  },
});

export default budgetsSlice.reducer;
