import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Transaction, TransactionFormData, TransactionFilters } from '@/types';
import transactionsService from '@/db/services/transactionsService';

interface TransactionsState {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  filters: TransactionFilters;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionsState = {
  transactions: [],
  filteredTransactions: [],
  filters: {},
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async () => {
    return await transactionsService.getAll();
  }
);

export const fetchFilteredTransactions = createAsyncThunk(
  'transactions/fetchFiltered',
  async (filters: TransactionFilters) => {
    return await transactionsService.getFiltered(filters);
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/create',
  async (data: TransactionFormData) => {
    return await transactionsService.create(data);
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/update',
  async ({ id, data }: { id: string; data: Partial<TransactionFormData> }) => {
    return await transactionsService.update(id, data);
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/delete',
  async (id: string) => {
    await transactionsService.delete(id);
    return id;
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
        state.filteredTransactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      })
      // Fetch filtered transactions
      .addCase(fetchFilteredTransactions.fulfilled, (state, action) => {
        state.filteredTransactions = action.payload;
      })
      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.unshift(action.payload);
        state.filteredTransactions.unshift(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create transaction';
      })
      // Update transaction
      .addCase(updateTransaction.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.transactions.findIndex((t) => t.id === action.payload!.id);
          if (index !== -1) {
            state.transactions[index] = action.payload;
          }
          const filteredIndex = state.filteredTransactions.findIndex((t) => t.id === action.payload!.id);
          if (filteredIndex !== -1) {
            state.filteredTransactions[filteredIndex] = action.payload;
          }
        }
      })
      // Delete transaction
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter((t) => t.id !== action.payload);
        state.filteredTransactions = state.filteredTransactions.filter((t) => t.id !== action.payload);
      });
  },
});

export const { setFilters, clearFilters } = transactionsSlice.actions;

export default transactionsSlice.reducer;
