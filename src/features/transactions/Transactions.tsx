import { useState } from 'react';
import React from 'react';
import { useAppDispatch, useTransactions, useAccounts, useCategories, useTags } from '@/store/hooks';
import { createTransaction, deleteTransaction, updateTransaction } from '@/store/slices/transactionsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Plus, Trash2, Filter, Search, TrendingUp, TrendingDown, Edit } from 'lucide-react';
import { Transaction, TransactionType } from '@/types';
import { parseLocalDate, formatLocalDate, getTodayDateString } from '@/lib/utils';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { useRegisterShortcut } from '@/components/keyboard/useKeyboardShortcuts';

export default function Transactions() {
  const dispatch = useAppDispatch();
  const transactions = useTransactions();
  const accounts = useAccounts();
  const categories = useCategories();
  const tags = useTags();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const isEditing = editingTransaction !== null;
  const [formData, setFormData] = useState<{
    accountId: string;
    categoryId: string;
    amount: string;
    type: TransactionType;
    date: string;
    vendor: string;
    notes: string;
    tagIds: string[];
  }>({
    accountId: '',
    categoryId: '',
    amount: '',
    type: 'expense',
    date: getTodayDateString(),
    vendor: '',
    notes: '',
    tagIds: [],
  });

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      accountId: transaction.accountId,
      categoryId: transaction.categoryId,
      amount: transaction.amount.toString(),
      type: transaction.type,
      date: formatLocalDate(transaction.date),
      vendor: transaction.vendor,
      notes: transaction.notes || '',
      tagIds: transaction.tagIds,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingTransaction) {
      dispatch(updateTransaction({
        id: editingTransaction.id,
        data: {
          ...formData,
          amount: parseFloat(formData.amount) || 0,
          date: parseLocalDate(formData.date),
        },
      }));
    } else {
      dispatch(createTransaction({
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        date: parseLocalDate(formData.date),
      }));
    }
    setIsOpen(false);
    setEditingTransaction(null);
    setFormData({
      accountId: '',
      categoryId: '',
      amount: '',
      type: 'expense',
      date: getTodayDateString(),
      vendor: '',
      notes: '',
      tagIds: [],
    });
  };

  const resetForm = () => {
    setEditingTransaction(null);
    setFormData({
      accountId: '',
      categoryId: '',
      amount: '',
      type: 'expense',
      date: getTodayDateString(),
      vendor: '',
      notes: '',
      tagIds: [],
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      dispatch(deleteTransaction(id));
    }
  };

  const handleAddTransactionForDate = (dateString: string) => {
    setFormData({
      accountId: '',
      categoryId: '',
      amount: '',
      type: 'expense',
      date: dateString,
      vendor: '',
      notes: '',
      tagIds: [],
    });
    setEditingTransaction(null);
    setIsOpen(true);
  };

  const filteredTransactions = transactions.filter(t =>
    t.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    categories.find(c => c.id === t.categoryId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Register keyboard shortcut for 'c' to add transaction
  useRegisterShortcut({
    key: 'c',
    description: 'Add transaction',
    category: 'actions',
    page: '/transactions',
    action: () => {
      resetForm();
      setIsOpen(true);
    },
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your income and expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/25 justify-between">
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </div>
                <kbd className="ml-2 px-1.5 py-0.5 text-xs font-mono bg-muted text-muted-foreground rounded border border-border">
                  C
                </kbd>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-success" />
                          Income
                        </div>
                      </SelectItem>
                      <SelectItem value="expense">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-destructive" />
                          Expense
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    className="text-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="accountId">Account</Label>
                  <Select
                    value={formData.accountId}
                    onValueChange={(value: any) => setFormData({ ...formData, accountId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.icon} <span className="ml-2">{acc.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value: any) => setFormData({ ...formData, categoryId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.type === formData.type)
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} <span className="ml-2">{cat.name}</span>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <MultiSelect
                    options={tags.map(tag => ({ value: tag.id, label: tag.name, color: tag.color }))}
                    selectedValues={formData.tagIds}
                    onChange={(values) => setFormData({ ...formData, tagIds: values })}
                    placeholder="Select tags (optional)"
                  />
                </div>
                <Button type="submit" className="w-full shadow-lg">
                  {isEditing ? 'Update Transaction' : 'Add Transaction'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4 text-primary" />
              All Transactions
              <span className="text-xs font-normal text-muted-foreground">
                ({filteredTransactions.length})
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <TransactionTable
            transactions={filteredTransactions}
            categories={categories}
            tags={tags}
            columns={[
              { key: 'icon', label: '', className: 'w-12' },
              { key: 'vendor', label: 'Vendor' },
              { key: 'category', label: 'Category' },
              { key: 'tags', label: 'Tags' },
              { key: 'date', label: 'Date' },
              { key: 'type', label: 'Type' },
              { key: 'amount', label: 'Amount', className: 'text-right' },
              { key: 'actions', label: '', className: 'w-20 text-right' },
            ]}
            actions={[
              { type: 'edit', onClick: handleEdit },
              { type: 'delete', onClick: (t) => handleDelete(t.id) },
            ]}
            groupByDate={true}
            layout="table"
            onAddTransactionForDate={handleAddTransactionForDate}
            emptyMessage={
              <div className="flex flex-col items-center justify-center py-8 text-center px-6">
                <div className="p-3 bg-muted rounded-md mb-3">
                  <Filter className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'No transactions found matching your search.' : 'No transactions yet.'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchQuery ? 'Try a different search term.' : 'Add your first transaction to get started.'}
                </p>
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
