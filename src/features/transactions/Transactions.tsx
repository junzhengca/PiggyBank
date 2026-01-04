import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createTransaction, deleteTransaction, updateTransaction } from '@/store/slices/transactionsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Filter, Search, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Edit } from 'lucide-react';
import { Transaction, TransactionType } from '@/types';
import { parseLocalDate, formatLocalDate, formatDisplayDate, getTodayDateString } from '@/lib/utils';

export default function Transactions() {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector((state) => state.transactions.transactions);
  const accounts = useAppSelector((state) => state.accounts.accounts);
  const categories = useAppSelector((state) => state.categories.categories);
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

  const filteredTransactions = transactions.filter(t =>
    t.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    categories.find(c => c.id === t.categoryId)?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Transactions</h1>
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
              <Button className="shadow-lg shadow-primary/25">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
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
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-3 bg-muted mb-3">
                <Filter className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No transactions found matching your search.' : 'No transactions yet.'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery ? 'Try a different search term.' : 'Add your first transaction to get started.'}
              </p>
            </div>
          ) : (
            <div className="excel-table">
              {/* Table Header */}
              <div className="excel-table-header">
                <div className="excel-table-header-cell col-icon"></div>
                <div className="excel-table-header-cell col-vendor">Vendor</div>
                <div className="excel-table-header-cell col-category">Category</div>
                <div className="excel-table-header-cell col-date">Date</div>
                <div className="excel-table-header-cell col-type">Type</div>
                <div className="excel-table-header-cell col-amount">Amount</div>
                <div className="excel-table-header-cell w-20 flex-shrink-0"></div>
              </div>
              {/* Table Body */}
              <div className="excel-table-body">
                {filteredTransactions.map((transaction) => {
                  const category = categories.find((c) => c.id === transaction.categoryId);
                  return (
                    <div key={transaction.id} className="excel-table-row group">
                      <div className="excel-table-cell col-icon">
                        <div className={`icon-cell ${transaction.type === 'income' ? 'icon-income' : 'icon-expense'}`}>
                          {category?.icon || '💰'}
                        </div>
                      </div>
                      <div className="excel-table-cell col-vendor">
                        <span className="font-semibold">{transaction.vendor}</span>
                      </div>
                      <div className="excel-table-cell col-category">
                        <span className="text-muted-foreground">{category?.name || 'Unknown'}</span>
                      </div>
                      <div className="excel-table-cell col-date">
                        <span className="text-muted-foreground">{formatDisplayDate(transaction.date)}</span>
                      </div>
                      <div className="excel-table-cell col-type">
                        <div className={`flex items-center gap-2 text-xs font-medium ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                          {transaction.type === 'income' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {transaction.type}
                        </div>
                      </div>
                      <div className="excel-table-cell col-amount">
                        <span className={`amount font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="excel-table-cell w-20 flex-shrink-0">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(transaction)} className="h-7 w-7">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(transaction.id)} className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
