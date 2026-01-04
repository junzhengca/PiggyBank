import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createBudget, deleteBudget } from '@/store/slices/budgetsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Target, AlertTriangle, TrendingUp } from 'lucide-react';
import { BUDGET_PERIODS } from '@/types/constants';
import { parseLocalDate, getTodayDateString } from '@/lib/utils';

export default function Budgets() {
  const dispatch = useAppDispatch();
  const budgets = useAppSelector((state) => state.budgets.budgets);
  const categories = useAppSelector((state) => state.categories.categories);
  const transactions = useAppSelector((state) => state.transactions.transactions);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly' as const,
    startDate: getTodayDateString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createBudget({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      startDate: parseLocalDate(formData.startDate),
    }));
    setIsOpen(false);
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

  const budgetsWithProgress = budgets.map((budget) => {
    const category = categories.find((c) => c.id === budget.categoryId);
    const spent = transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        const budgetStart = new Date(budget.startDate);
        const budgetEnd = budget.endDate ? new Date(budget.endDate) : new Date();
        return (
          t.categoryId === budget.categoryId &&
          t.type === 'expense' &&
          transactionDate >= budgetStart &&
          transactionDate <= budgetEnd
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
    };
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Budgets</h1>
          <p className="text-sm text-muted-foreground mt-1">Set spending limits for your categories</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Budget</DialogTitle>
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
                Create Budget
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
          budgetsWithProgress.map((budget, index) => (
            <Card key={budget.id}>
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
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(budget.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
                  <div className="h-4 bg-muted overflow-hidden">
                    <div
                      className={`h-full progress-animated ${
                        budget.isOverBudget ? 'bg-gradient-to-r from-destructive to-red-600' : 'bg-gradient-to-r from-primary to-primary-light'
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
