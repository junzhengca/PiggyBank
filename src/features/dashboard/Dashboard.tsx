import { useAppDispatch, useAccounts, useTransactions, useCategories } from '@/store/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { formatDisplayDate, isAccountNeedsReview, formatLastReviewed } from '@/lib/utils';
import { Wallet, TrendingUp, TrendingDown, ArrowRight, PiggyBank, CreditCard, CheckCircle, AlertTriangle, CreditCard as CreditCardIcon } from 'lucide-react';
import { markAccountAsReviewed } from '@/store/slices/accountsSlice';
import { useNavigate } from 'react-router-dom';

const accountIcons: Record<string, JSX.Element> = {
  checking: <Wallet className="h-4 w-4" />,
  savings: <PiggyBank className="h-4 w-4" />,
  credit: <CreditCard className="h-4 w-4" />,
  debit: <CreditCard className="h-4 w-4" />,
  investment: <TrendingUp className="h-4 w-4" />,
};

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const accounts = useAccounts();
  const transactions = useTransactions();
  const categories = useCategories();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalAvailableCredit = accounts
    .filter((acc) => acc.type === 'credit' && acc.creditCardDetails?.creditLimit)
    .reduce((sum, acc) => sum + (acc.creditCardDetails!.creditLimit! + acc.balance), 0);

  const handleMarkAsReviewed = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(markAccountAsReviewed(id));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Balance</CardTitle>
            <div className="p-1.5 bg-primary/10">
              <Wallet className="h-3.5 w-3.5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold amount">${totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all accounts</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Income</CardTitle>
            <div className="p-1.5 bg-success/10">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-success amount">${totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">This period</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Total Expenses</CardTitle>
            <div className="p-1.5 bg-destructive/10">
              <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-destructive amount">${totalExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">This period</p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${totalIncome - totalExpense >= 0 ? 'border-l-success' : 'border-l-destructive'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Net Income</CardTitle>
            <div className={`p-1.5 ${totalIncome - totalExpense >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
              <ArrowRight className={`h-3.5 w-3.5 ${totalIncome - totalExpense >= 0 ? 'text-success' : 'text-destructive'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold amount ${totalIncome - totalExpense >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${(totalIncome - totalExpense).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Income minus expenses</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium">Available Credit</CardTitle>
            <div className="p-1.5 bg-indigo-500/10">
              <CreditCardIcon className="h-3.5 w-3.5 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-indigo-500 amount">${totalAvailableCredit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all credit cards</p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4 text-primary" />
            Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-6">
              <div className="p-3 bg-muted rounded-md mb-3">
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No accounts yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Add your first account to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground w-12"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Last Reviewed</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground">Balance</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {accounts.map((account) => {
                    const needsReview = isAccountNeedsReview(account.lastReviewedAt);
                    const isCreditCard = account.type === 'credit';
                    const availableCredit = isCreditCard && account.creditCardDetails?.creditLimit
                      ? account.creditCardDetails.creditLimit + account.balance
                      : null;
                    
                    return (
                      <tr key={account.id} className="group hover:bg-accent transition-colors cursor-pointer" onClick={() => navigate(`/accounts/${account.id}`)}>
                        <td className="px-6 py-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                            {accountIcons[account.type] || <Wallet className="h-4 w-4" />}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{account.name}</span>
                            {needsReview && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>This account hasn't been reviewed in over a week</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground capitalize">{account.type}</span>
                        </td>
                        <td className="px-6 py-3 hidden lg:table-cell">
                          <span className={`text-sm ${needsReview ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'}`}>
                            {formatLastReviewed(account.lastReviewedAt)}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="space-y-0.5">
                            <div className="amount font-semibold text-sm">
                              ${account.balance.toFixed(2)} {account.currency}
                            </div>
                            {isCreditCard && availableCredit !== null && (
                              <div className="text-xs text-success">
                                ${availableCredit.toFixed(2)} available
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsReviewed(e, account.id);
                            }}
                            className="h-7 w-7 text-success hover:text-success hover:bg-success/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Mark as reviewed"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ArrowRight className="h-4 w-4 text-primary" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TransactionTable
            transactions={transactions}
            categories={categories}
            columns={[
              { key: 'icon', label: '', className: 'w-12' },
              { key: 'vendor', label: 'Vendor' },
              { key: 'category', label: 'Category', hideOnMobile: true },
              { key: 'date', label: 'Date', hideOnTablet: true },
              { key: 'type', label: 'Type', hideOnMobile: true },
              { key: 'amount', label: 'Amount', className: 'text-right' },
            ]}
            limit={5}
            layout="table"
            emptyMessage={
              <div className="flex flex-col items-center justify-center py-8 text-center px-6">
                <div className="p-3 bg-muted rounded-md mb-3">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No transactions yet.</p>
              </div>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
