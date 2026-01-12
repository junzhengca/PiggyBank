import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useBudgets, useTransactions, useCategories, useAccounts, useTags } from '@/store/hooks';
import { updateBudget, deleteBudget } from '@/store/slices/budgetsSlice';
import { createTransaction } from '@/store/slices/transactionsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, Trash2, Target, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { BUDGET_PERIODS } from '@/types/constants';
import { Budget, TransactionFormData, BudgetPeriod } from '@/types';
import { parseLocalDate, formatDisplayDate, formatLocalDate, getTodayDateString, calculateBudgetEndDate, isDateOnOrAfter, isDateOnOrBefore } from '@/lib/utils';
import { MultiSelect } from '@/components/ui/multi-select';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { Link } from 'react-router-dom';
import { useRegisterShortcut } from '@/components/keyboard/useKeyboardShortcuts';

export default function BudgetDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const budgets = useBudgets();
  const allTransactions = useTransactions();
  const categories = useCategories();
  const accounts = useAccounts();
  const tags = useTags();
  
  const budget = budgets.find((b) => b.id === id);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const isEditing = editingBudget !== null;
  const [formData, setFormData] = useState<{
    categoryId: string;
    amount: string;
    period: BudgetPeriod;
    startDate: string;
  }>({
    categoryId: '',
    amount: '',
    period: 'monthly',
    startDate: getTodayDateString(),
  });
  const [transactionFormData, setTransactionFormData] = useState({
    accountId: '',
    categoryId: '',
    amount: '',
    type: 'expense' as const,
    date: getTodayDateString(),
    vendor: '',
    notes: '',
    tagIds: [] as string[],
  });

  // Calculate budget details
  const budgetWithProgress = budget ? (() => {
    const category = categories.find((c) => c.id === budget.categoryId);
    
    // Calculate the effective end date for the budget period
    const budgetStart = new Date(budget.startDate);
    const calculatedEndDate = calculateBudgetEndDate(budgetStart, budget.period);
    const budgetEnd = budget.endDate ? new Date(budget.endDate) : calculatedEndDate;
    
    // Get today's date in UTC
    const now = new Date();
    const todayUTC = new Date(Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ));
    
    // Use the earlier of budgetEnd or today
    const effectiveEndDate = isDateOnOrBefore(budgetEnd, todayUTC) ? budgetEnd : todayUTC;
    
    const budgetTransactions = allTransactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        t.categoryId === budget.categoryId &&
        t.type === 'expense' &&
        isDateOnOrAfter(transactionDate, budgetStart) &&
        isDateOnOrBefore(transactionDate, effectiveEndDate)
      );
    });
    
    const spent = budgetTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const isOverBudget = percentage > 100;

    return {
      ...budget,
      categoryName: category?.name || 'Unknown',
      categoryIcon: category?.icon || '📦',
      categoryColor: category?.color || '#64748b',
      spent,
      remaining: budget.amount - spent,
      percentage,
      isOverBudget,
      budgetStartDate: budgetStart,
      budgetEndDate: budgetEnd,
      effectiveEndDate,
      transactions: budgetTransactions,
    };
  })() : null;

  const handleEdit = () => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        categoryId: budget.categoryId,
        amount: budget.amount.toString(),
        period: budget.period,
        startDate: formatLocalDate(budget.startDate),
      });
      setIsEditOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingBudget) {
      dispatch(updateBudget({
        id: editingBudget.id,
        data: {
          ...formData,
          amount: parseFloat(formData.amount) || 0,
          startDate: parseLocalDate(formData.startDate),
        },
      }));
    }
    setIsEditOpen(false);
    setEditingBudget(null);
    setFormData({
      categoryId: '',
      amount: '',
      period: 'monthly',
      startDate: getTodayDateString(),
    });
  };

  const handleDelete = () => {
    if (budget) {
      dispatch(deleteBudget(budget.id));
      navigate('/budgets');
    }
  };

  const resetForm = () => {
    setEditingBudget(null);
    setFormData({
      categoryId: '',
      amount: '',
      period: 'monthly',
      startDate: getTodayDateString(),
    });
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Register keyboard shortcuts for budget details page
  // Must be called before early return to maintain hook order
  const budgetDetailsPagePattern = budget && location.pathname.startsWith('/budgets/') && location.pathname !== '/budgets'
    ? '/budgets/'
    : undefined;

  useRegisterShortcut({
    key: 'e',
    description: 'Edit budget',
    category: 'actions',
    page: budgetDetailsPagePattern,
    action: () => {
      if (budget) {
        handleEdit();
      }
    },
  });

  const handleAddTransactionForDate = (dateString: string) => {
    if (budget) {
      setTransactionFormData({
        accountId: '',
        categoryId: budget.categoryId, // Prefill with budget's category
        amount: '',
        type: 'expense',
        date: dateString, // Prefill with selected date
        vendor: '',
        notes: '',
        tagIds: [],
      });
      setIsAddTransactionOpen(true);
    }
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createTransaction({
      ...transactionFormData,
      amount: parseFloat(transactionFormData.amount) || 0,
      date: parseLocalDate(transactionFormData.date),
    } as TransactionFormData));
    setIsAddTransactionOpen(false);
    setTransactionFormData({
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

  if (!budget || !budgetWithProgress) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-xl font-semibold text-muted-foreground">Budget not found</p>
          <Link to="/budgets">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Budgets
            </Button>
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/budgets">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 flex items-center justify-center rounded-lg"
              style={{ backgroundColor: budgetWithProgress.categoryColor + '20' }}
            >
              <span className="text-2xl">{budgetWithProgress.categoryIcon}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{budgetWithProgress.categoryName}</h1>
              <p className="text-sm text-muted-foreground">Budget Details</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isEditOpen} onOpenChange={(open) => {
            setIsEditOpen(open);
            if (!open) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleEdit} className="justify-between">
                <div className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Budget
                </div>
                <kbd className="ml-2 px-1.5 py-0.5 text-xs font-mono bg-muted text-muted-foreground rounded border border-border">
                  E
                </kbd>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Budget</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3">
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
                      {expenseCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Budget Amount</Label>
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
                  <Label htmlFor="period">Period</Label>
                  <Select
                    value={formData.period}
                    onValueChange={(value: any) => setFormData({ ...formData, period: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUDGET_PERIODS.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full shadow-lg">
                  Update Budget
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Budget</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to delete this budget? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Budget Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${budgetWithProgress.amount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${budgetWithProgress.isOverBudget ? 'text-destructive' : ''}`}>
              ${budgetWithProgress.spent.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${budgetWithProgress.remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${budgetWithProgress.remaining.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${budgetWithProgress.isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
              {budgetWithProgress.percentage.toFixed(0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className={`font-semibold ${budgetWithProgress.isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                {budgetWithProgress.percentage.toFixed(0)}%
              </span>
            </div>
            <div className="h-4 bg-muted overflow-hidden rounded-full">
              <div
                className={`h-full progress-animated rounded-full ${
                  budgetWithProgress.isOverBudget ? 'bg-destructive' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(budgetWithProgress.percentage, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Details */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Period</span>
            <span className="text-sm font-medium capitalize">{budgetWithProgress.period}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Start Date</span>
            <span className="text-sm font-medium">{formatDisplayDate(budgetWithProgress.budgetStartDate)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">End Date</span>
            <span className="text-sm font-medium">{formatDisplayDate(budgetWithProgress.budgetEndDate)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Category</span>
            <span className="text-sm font-medium">{budgetWithProgress.categoryName}</span>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {budgetWithProgress.isOverBudget && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-semibold">Over budget by ${Math.abs(budgetWithProgress.remaining).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!budgetWithProgress.isOverBudget && budgetWithProgress.percentage > 75 && (
        <Card className="border-warning">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-warning">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold">Approaching budget limit</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transactions</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {budgetWithProgress.transactions.length} transaction{budgetWithProgress.transactions.length !== 1 ? 's' : ''} in this budget period
              </p>
            </div>
            <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="hidden">
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTransactionSubmit} className="space-y-3">
                  <div>
                    <Label htmlFor="trans-type">Type</Label>
                    <Select
                      value={transactionFormData.type}
                      onValueChange={(value: any) => setTransactionFormData({ ...transactionFormData, type: value })}
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
                    <Label htmlFor="trans-amount">Amount</Label>
                    <Input
                      id="trans-amount"
                      type="number"
                      step="0.01"
                      value={transactionFormData.amount}
                      onChange={(e) => setTransactionFormData({ ...transactionFormData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="trans-account">Account</Label>
                    <Select
                      value={transactionFormData.accountId}
                      onValueChange={(value: any) => setTransactionFormData({ ...transactionFormData, accountId: value })}
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
                    <Label htmlFor="trans-category">Category</Label>
                    <Select
                      value={transactionFormData.categoryId}
                      onValueChange={(value: any) => setTransactionFormData({ ...transactionFormData, categoryId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter((c) => c.type === transactionFormData.type)
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.icon} <span className="ml-2">{cat.name}</span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="trans-vendor">Vendor</Label>
                    <Input
                      id="trans-vendor"
                      value={transactionFormData.vendor}
                      onChange={(e) => setTransactionFormData({ ...transactionFormData, vendor: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="trans-date">Date</Label>
                    <Input
                      id="trans-date"
                      type="date"
                      value={transactionFormData.date}
                      onChange={(e) => setTransactionFormData({ ...transactionFormData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="trans-notes">Notes</Label>
                    <Input
                      id="trans-notes"
                      value={transactionFormData.notes}
                      onChange={(e) => setTransactionFormData({ ...transactionFormData, notes: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="trans-tags">Tags</Label>
                    <MultiSelect
                      options={tags.map(tag => ({ value: tag.id, label: tag.name, color: tag.color }))}
                      selectedValues={transactionFormData.tagIds}
                      onChange={(values) => setTransactionFormData({ ...transactionFormData, tagIds: values })}
                      placeholder="Select tags (optional)"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Transaction
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <TransactionTable
            transactions={budgetWithProgress.transactions}
            categories={categories}
            columns={[
              { key: 'icon', label: '', className: 'w-12' },
              { key: 'vendor', label: 'Vendor' },
              { key: 'category', label: 'Category', hideOnMobile: true },
              { key: 'date', label: 'Date' },
              { key: 'type', label: 'Type', hideOnMobile: true },
              { key: 'amount', label: 'Amount', className: 'text-right' },
            ]}
            groupByDate={true}
            layout="table"
            onAddTransactionForDate={handleAddTransactionForDate}
            emptyMessage={
              <div className="flex flex-col items-center justify-center py-12">
                <div className="p-4 bg-muted mb-4 rounded-full">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-center">No transactions found.</p>
                <p className="text-sm text-muted-foreground mt-1">Transactions in this category and period will appear here.</p>
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
