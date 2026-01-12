import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Budget, BudgetFormData } from '@/types';
import { budgetsService } from '@/db/services/budgetsService';
import { serializeDates, deserializeDates } from '@/lib/utils';
import type { RootState } from '../index';

interface BudgetsState {
  budgets: any[]; // Serialized budgets with date strings
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
    const budgets = await budgetsService.getAll();
    return serializeDates(budgets);
  }
);

export const fetchActiveBudgets = createAsyncThunk(
  'budgets/fetchActive',
  async () => {
    const budgets = await budgetsService.getActiveBudgets();
    return serializeDates(budgets);
  }
);

export const createBudget = createAsyncThunk(
  'budgets/create',
  async (data: BudgetFormData) => {
    const budget = await budgetsService.create(data);
    return serializeDates(budget);
  }
);

export const updateBudget = createAsyncThunk(
  'budgets/update',
  async ({ id, data }: { id: string; data: Partial<BudgetFormData> }) => {
    const budget = await budgetsService.update(id, data);
    return budget ? serializeDates(budget) : undefined;
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
            // Create a new array to ensure React detects the change
            state.budgets = [
              ...state.budgets.slice(0, index),
              action.payload,
              ...state.budgets.slice(index + 1),
            ];
          }
        }
      })
      // Delete budget
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.budgets = state.budgets.filter((b) => b.id !== action.payload);
      });
  },
});

// Selectors with date deserialization
export const selectBudgets = (state: RootState): Budget[] => {
  return deserializeDates(state.budgets.budgets);
};

export default budgetsSlice.reducer;
