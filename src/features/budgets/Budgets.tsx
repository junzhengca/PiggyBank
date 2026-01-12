import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useBudgets, useCategories, useTransactions } from '@/store/hooks';
import { createBudget, deleteBudget, updateBudget } from '@/store/slices/budgetsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Target, AlertTriangle, TrendingUp, Edit } from 'lucide-react';
import { BUDGET_PERIODS } from '@/types/constants';
import { parseLocalDate, getTodayDateString, formatLocalDate, formatDisplayDate, calculateBudgetEndDate, isDateOnOrAfter, isDateOnOrBefore } from '@/lib/utils';
import { useRegisterShortcut } from '@/components/keyboard/useKeyboardShortcuts';
import { Budget } from '@/types';

export default function Budgets() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const budgets = useBudgets();
  const categories = useCategories();
  const transactions = useTransactions();
  
  // Force recalculation when budgets change by using budgets.length and budgets as dependencies
  // This ensures the component detects when budgets array updates
  const [isOpen, setIsOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const isEditing = editingBudget !== null;
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly' as const,
    startDate: getTodayDateString(),
  });

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
    } else {
      dispatch(createBudget({
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        startDate: parseLocalDate(formData.startDate),
      }));
    }
    setIsOpen(false);
    setEditingBudget(null);
    setFormData({
      categoryId: '',
      amount: '',
      period: 'monthly',
      startDate: getTodayDateString(),
    });
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      categoryId: budget.categoryId,
      amount: budget.amount.toString(),
      period: budget.period,
      startDate: formatLocalDate(budget.startDate),
    });
    setIsOpen(true);
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

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      dispatch(deleteBudget(id));
    }
  };

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Register keyboard shortcut for 'c' to add budget
  useRegisterShortcut({
    key: 'c',
    description: 'Add budget',
    category: 'actions',
    page: '/budgets',
    action: () => {
      setIsOpen(true);
    },
  });

  const budgetsWithProgress = useMemo(() => {
    return budgets.map((budget) => {
      const category = categories.find((c) => c.id === budget.categoryId);
      
      // Calculate the effective end date for the budget period
      const budgetStart = new Date(budget.startDate);
      const calculatedEndDate = calculateBudgetEndDate(budgetStart, budget.period);
      const budgetEnd = budget.endDate ? new Date(budget.endDate) : calculatedEndDate;
      
      // Get today's date in UTC (using local date components, then converting to UTC)
      // This matches how parseLocalDate works - it takes local date and converts to UTC
      const now = new Date();
      const todayUTC = new Date(Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ));
      
      // Use the earlier of budgetEnd or today (can't count future transactions)
      const effectiveEndDate = isDateOnOrBefore(budgetEnd, todayUTC) ? budgetEnd : todayUTC;
      
      const spent = transactions
        .filter((t) => {
          const transactionDate = new Date(t.date);
          // Compare dates ignoring time components
          return (
            t.categoryId === budget.categoryId &&
            t.type === 'expense' &&
            isDateOnOrAfter(transactionDate, budgetStart) &&
            isDateOnOrBefore(transactionDate, effectiveEndDate)
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
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
      };
    });
  }, [budgets, categories, transactions]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-sm text-muted-foreground mt-1">Set spending limits for your categories</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            resetForm();
          } else if (!isEditing) {
            // Reset form when opening for a new budget
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25 justify-between">
              <div className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Budget
              </div>
              <kbd className="ml-2 px-1.5 py-0.5 text-xs font-mono bg-muted text-muted-foreground rounded border border-border">
                C
              </kbd>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Budget' : 'Add New Budget'}</DialogTitle>
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
                {isEditing ? 'Update Budget' : 'Create Budget'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {budgetsWithProgress.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-muted mb-4">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-center">No budgets set.</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first budget to track spending.</p>
            </CardContent>
          </Card>
        ) : (
          budgetsWithProgress.map((budget) => (
            <Card 
              key={budget.id} 
              className="group cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/budgets/${budget.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center"
                      style={{ backgroundColor: budget.categoryColor + '20' }}
                    >
                      <span className="text-xl">{budget.categoryIcon}</span>
                    </div>
                    <span className="text-lg">{budget.categoryName}</span>
                  </CardTitle>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(budget);
                      }}
                      className="h-7 w-7"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(budget.id);
                      }}
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className={`font-semibold ${budget.isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {budget.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-4 bg-muted overflow-hidden rounded-full">
                    <div
                      className={`h-full progress-animated rounded-full ${
                        budget.isOverBudget ? 'bg-destructive' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Budget</span>
                    <span className="font-semibold text-lg amount">${budget.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Spent</span>
                    <span className={`font-semibold text-lg amount ${budget.isOverBudget ? 'text-destructive' : ''}`}>
                      ${budget.spent.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span className={`font-bold text-xl amount ${budget.remaining >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ${budget.remaining.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3">
                    <span className="text-sm text-muted-foreground">Period</span>
                    <span className="text-sm font-medium capitalize">{budget.period}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Start Date</span>
                    <span className="text-sm font-medium">{formatDisplayDate(budget.budgetStartDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">End Date</span>
                    <span className="text-sm font-medium">{formatDisplayDate(budget.budgetEndDate)}</span>
                  </div>
                </div>

                {budget.isOverBudget && (
                  <div className="flex items-center space-x-2 text-destructive bg-destructive/10 p-3 animate-pulse-slow">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-semibold">Over budget by ${Math.abs(budget.remaining).toFixed(2)}</span>
                  </div>
                )}

                {!budget.isOverBudget && budget.percentage > 75 && (
                  <div className="flex items-center space-x-2 text-warning bg-warning/10 p-3">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-semibold">Approaching budget limit</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
