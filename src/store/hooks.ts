import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';
import { selectAccounts } from './slices/accountsSlice';
import { selectCategories } from './slices/categoriesSlice';
import { selectTags } from './slices/tagsSlice';
import { selectBudgets } from './slices/budgetsSlice';
import { selectTransactions, selectFilteredTransactions } from './slices/transactionsSlice';
import { Account, Category, Tag, Budget, Transaction } from '@/types';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// Helper hooks that automatically deserialize dates
export const useAccounts = (): Account[] => {
  return useSelector(selectAccounts);
};

export const useCategories = (): Category[] => {
  return useSelector(selectCategories);
};

export const useTags = (): Tag[] => {
  return useSelector(selectTags);
};

export const useBudgets = (): Budget[] => {
  return useSelector(selectBudgets);
};

export const useTransactions = (): Transaction[] => {
  return useSelector(selectTransactions);
};

export const useFilteredTransactions = (): Transaction[] => {
  return useSelector(selectFilteredTransactions);
};
