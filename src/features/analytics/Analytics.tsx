import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiSelect } from '@/components/ui/multi-select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, Tag } from 'lucide-react';
import { ANALYTICS_PERIODS } from '@/types/constants';
import { getPeriodStartDate } from '@/lib/utils';

type AnalyticsPeriod = 'weekly' | 'monthly' | 'yearly';

// Theme-aware colors that work well on both light and dark themes
const COLORS = [
  'hsl(262 83% 58%)',  // primary
  'hsl(142 76% 45%)',  // success
  'hsl(38 92% 55%)',   // warning
  'hsl(0 72% 50%)',    // destructive
  'hsl(217 91% 60%)',  // blue
  'hsl(280 70% 60%)',  // purple
  'hsl(180 70% 50%)',  // cyan
  'hsl(340 75% 55%)',  // pink
  'hsl(160 70% 45%)',  // teal
  'hsl(30 90% 55%)',   // orange
];

export default function Analytics() {
  const transactions = useAppSelector((state) => state.transactions.transactions);
  const categories = useAppSelector((state) => state.categories.categories);
  const tags = useAppSelector((state) => state.tags.tags);
  const [period, setPeriod] = useState<AnalyticsPeriod>('monthly');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const getFilteredTransactions = () => {
    const startDate = getPeriodStartDate(period);
    let filtered = transactions.filter((t) => t.date >= startDate);
    
    // Filter by selected tags
    if (selectedTagIds.length > 0) {
      filtered = filtered.filter((t) =>
        t.tagIds.some(tagId => selectedTagIds.includes(tagId))
      );
    }
    
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryData = categories
    .filter((c) => c.type === 'expense')
    .map((category) => {
      const spent = filteredTransactions
        .filter((t) => t.categoryId === category.id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        name: category.name,
        value: spent,
        icon: category.icon,
        color: category.color,
      };
    })
    .filter((d) => d.value > 0);

  const tagData = tags.map((tag) => {
    const spent = filteredTransactions
      .filter((t) => t.tagIds.includes(tag.id))
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      name: tag.name,
      value: spent,
      color: tag.color,
    };
  }).filter((d) => d.value > 0);

  const totalTagAmount = tagData.reduce((sum, d) => sum + d.value, 0);

  const incomeExpenseData = getIncomeExpenseData(filteredTransactions);

  function getIncomeExpenseData(transactions: any[]) {
    const grouped: Record<string, { income: number; expense: number }> = {};
    
    transactions.forEach((t) => {
      const date = t.date;
      let key: string;
      
      if (period === 'weekly') {
        key = `${date.getUTCFullYear()}-W${getWeekNumber(date)}`;
      } else if (period === 'monthly') {
        key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      } else {
        key = `${date.getUTCFullYear()}`;
      }
      
      if (!grouped[key]) {
        grouped[key] = { income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        grouped[key].income += t.amount;
      } else {
        grouped[key].expense += t.amount;
      }
    });

    return Object.entries(grouped).map(([period, data]) => ({
      period,
      income: data.income,
      expense: data.expense,
    }));
  }

  function getWeekNumber(date: Date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Track your spending patterns</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Tabs value={period} onValueChange={(v: any) => setPeriod(v)}>
          <TabsList>
            {ANALYTICS_PERIODS.map((p) => (
              <TabsTrigger key={p.value} value={p.value}>
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="w-full sm:w-auto">
          <MultiSelect
            options={tags.map(tag => ({ value: tag.id, label: tag.name, color: tag.color }))}
            selectedValues={selectedTagIds}
            onChange={setSelectedTagIds}
            placeholder="Filter by tags..."
            className="w-full sm:w-64"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Income</CardTitle>
            <TrendingUp className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600 dark:text-green-400 amount">${totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-destructive amount">${totalExpense.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Net Savings</CardTitle>
            <PieChartIcon className="h-3.5 w-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold amount ${totalIncome - totalExpense >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
              ${(totalIncome - totalExpense).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income vs Expense Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Income vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={incomeExpenseData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="period"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                formatter={(value: number) => `$${value.toFixed(2)}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--popover-foreground))',
                  borderRadius: '0.5rem'
                }}
                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
              />
              <Bar dataKey="income" fill="hsl(var(--success))" name="Income" />
              <Bar dataKey="expense" fill="hsl(var(--destructive))" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No expense data for this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => (
                    <text
                      fill="hsl(var(--foreground))"
                      fontSize={11}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {`${entry.name}: $${entry.value.toFixed(0)}`}
                    </text>
                  )}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--popover-foreground))',
                    borderRadius: '0.5rem'
                  }}
                  itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                />
                <Legend
                  wrapperStyle={{ color: 'hsl(var(--foreground))', fontSize: 12 }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Category Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No expense data for this period.</p>
          ) : (
            <div className="space-y-2">
              {categoryData
                .sort((a, b) => b.value - a.value)
                .map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-2.5 border-b border-border">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-9 h-9 flex items-center justify-center text-lg"
                        style={{ backgroundColor: item.color + '20' }}
                      >
                        {item.icon}
                      </div>
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-base amount">${item.value.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {((item.value / totalExpense) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tag Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className="h-4 w-4 text-primary" />
            Spending by Tag
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tagData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No tag data for this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={tagData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => (
                    <text
                      fill="hsl(var(--foreground))"
                      fontSize={11}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {`${entry.name}: $${entry.value.toFixed(0)}`}
                    </text>
                  )}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tagData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--popover-foreground))',
                    borderRadius: '0.5rem'
                  }}
                  itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                />
                <Legend
                  wrapperStyle={{ color: 'hsl(var(--foreground))', fontSize: 12 }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Tag Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className="h-4 w-4 text-primary" />
            Tag Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tagData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No tag data for this period.</p>
          ) : (
            <div className="space-y-2">
              {tagData
                .sort((a, b) => b.value - a.value)
                .map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-2.5 border-b border-border">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-9 h-9 flex items-center justify-center text-lg rounded-full"
                        style={{ backgroundColor: item.color + '20' }}
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-base amount">${item.value.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {totalTagAmount > 0 ? ((item.value / totalTagAmount) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
