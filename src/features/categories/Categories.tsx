import { useState } from 'react';
import { useAppDispatch, useCategories } from '@/store/hooks';
import { createCategory, deleteCategory } from '@/store/slices/categoriesSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, PieChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRegisterShortcut } from '@/components/keyboard/useKeyboardShortcuts';

export default function Categories() {
  const dispatch = useAppDispatch();
  const categories = useCategories();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as const,
    color: '#3b82f6',
    icon: '📦',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(createCategory(formData));
    setIsOpen(false);
    setFormData({
      name: '',
      type: 'expense',
      color: '#3b82f6',
      icon: '📦',
    });
  };

  const handleDelete = (id: string, isDefault: boolean) => {
    if (isDefault) {
      alert('Default categories cannot be deleted.');
      return;
    }
    if (confirm('Are you sure you want to delete this category?')) {
      dispatch(deleteCategory(id));
    }
  };

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Register keyboard shortcut for 'c' to add category
  useRegisterShortcut({
    key: 'c',
    description: 'Add category',
    category: 'actions',
    page: '/categories',
    action: () => {
      setIsOpen(true);
    },
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Organize your transactions</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25 justify-between">
              <div className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </div>
              <kbd className="ml-2 px-1.5 py-0.5 text-xs font-mono bg-muted text-muted-foreground rounded border border-border">
                C
              </kbd>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
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
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  required
                  className="h-10 w-full"
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon (emoji)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="📦"
                  required
                  className="text-xl text-center"
                />
              </div>
              <Button type="submit" className="w-full shadow-lg">
                Create Category
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="expense">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="expense" className="text-sm">Expenses</TabsTrigger>
          <TabsTrigger value="income" className="text-sm">Income</TabsTrigger>
        </TabsList>
        <TabsContent value="expense">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChart className="h-4 w-4 text-primary" />
                Expense Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenseCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3 bg-muted mb-3">
                    <PieChart className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No expense categories yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Add your first category to get started.</p>
                </div>
              ) : (
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {expenseCategories.map((category, index) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 border-b border-border hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-10 h-10 flex items-center justify-center text-lg"
                          style={{ backgroundColor: category.color + '20' }}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{category.name}</p>
                          {category.isDefault && (
                            <p className="text-xs text-muted-foreground">Default</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(category.id, category.isDefault)}
                        disabled={category.isDefault}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChart className="h-4 w-4 text-primary" />
                Income Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incomeCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3 bg-muted mb-3">
                    <PieChart className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No income categories yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Add your first category to get started.</p>
                </div>
              ) : (
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {incomeCategories.map((category, index) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 border-b border-border hover:bg-accent transition-colors group"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-10 h-10 flex items-center justify-center text-lg"
                          style={{ backgroundColor: category.color + '20' }}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{category.name}</p>
                          {category.isDefault && (
                            <p className="text-xs text-muted-foreground">Default</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(category.id, category.isDefault)}
                        disabled={category.isDefault}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
