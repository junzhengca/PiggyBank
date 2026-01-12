import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Account, AccountFormData } from '@/types';
import accountsService from '@/db/services/accountsService';
import { serializeDates, deserializeDates } from '@/lib/utils';
import type { RootState } from '../index';

interface AccountsState {
  accounts: any[]; // Serialized accounts with date strings
  loading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  accounts: [],
  loading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAll',
  async () => {
    const accounts = await accountsService.getAll();
    return serializeDates(accounts);
  }
);

export const createAccount = createAsyncThunk(
  'accounts/create',
  async (data: AccountFormData) => {
    const account = await accountsService.create(data);
    return serializeDates(account);
  }
);

export const updateAccount = createAsyncThunk(
  'accounts/update',
  async ({ id, data }: { id: string; data: Partial<AccountFormData> }) => {
    const account = await accountsService.update(id, data);
    return account ? serializeDates(account) : undefined;
  }
);

export const deleteAccount = createAsyncThunk(
  'accounts/delete',
  async (id: string) => {
    await accountsService.delete(id);
    return id;
  }
);

export const markAccountAsReviewed = createAsyncThunk(
  'accounts/markAsReviewed',
  async (id: string) => {
    const account = await accountsService.markAsReviewed(id);
    return account ? serializeDates(account) : undefined;
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch accounts';
      })
      // Create account
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts.push(action.payload);
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create account';
      })
      // Update account
      .addCase(updateAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.accounts.findIndex((a) => a.id === action.payload!.id);
          if (index !== -1) {
            state.accounts[index] = action.payload;
          }
        }
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update account';
      })
      // Delete account
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter((a) => a.id !== action.payload);
      })
      // Mark account as reviewed
      .addCase(markAccountAsReviewed.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.accounts.findIndex((a) => a.id === action.payload!.id);
          if (index !== -1) {
            state.accounts[index] = action.payload;
          }
        }
      });
  },
});

// Selectors with date deserialization
export const selectAccounts = (state: RootState): Account[] => {
  return deserializeDates(state.accounts.accounts);
};

export default accountsSlice.reducer;
