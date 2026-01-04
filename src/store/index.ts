import { configureStore } from '@reduxjs/toolkit';
import accountsReducer from './slices/accountsSlice';
import transactionsReducer from './slices/transactionsSlice';
import categoriesReducer from './slices/categoriesSlice';
import budgetsReducer from './slices/budgetsSlice';
import tagsReducer from './slices/tagsSlice';

export const store = configureStore({
  reducer: {
    accounts: accountsReducer,
    transactions: transactionsReducer,
    categories: categoriesReducer,
    budgets: budgetsReducer,
    tags: tagsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
