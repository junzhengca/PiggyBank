import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDisplayDate, isAccountNeedsReview, formatLastReviewed } from '@/lib/utils';
import { Wallet, TrendingUp, TrendingDown, ArrowRight, ArrowUp, ArrowDown, PiggyBank, CreditCard, CheckCircle, AlertTriangle, CreditCard as CreditCardIcon } from 'lucide-react';
import { markAccountAsReviewed } from '@/store/slices/accountsSlice';
import { Link } from 'react-router-dom';

const accountIcons: Record<string, JSX.Element> = {
  checking: <Wallet className="h-4 w-4" />,
  savings: <PiggyBank className="h-4 w-4" />,
  credit: <CreditCard className="h-4 w-4" />,
  debit: <CreditCard className="h-4 w-4" />,
  investment: <TrendingUp className="h-4 w-4" />,
};

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((state) => state.accounts.accounts);
  const transactions = useAppSelector((state) => state.transactions.transactions);
  const categories = useAppSelector((state) => state.categories.categories);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="hidden sm:flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-primary-light shadow-lg shadow-primary/25">
          <PiggyBank className="h-6 w-6 text-primary-foreground" />
        </div>
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
        <CardContent>
          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-3 bg-muted mb-3">
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No accounts yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Add your first account to get started.</p>
            </div>
          ) : (
            <div className="excel-table">
              {/* Table Header */}
              <div className="excel-table-header">
                <div className="excel-table-header-cell col-icon"></div>
                <div className="excel-table-header-cell col-name">Name</div>
                <div className="excel-table-header-cell col-account-type hide-on-mobile">Type</div>
                <div className="excel-table-header-cell col-reviewed hide-on-tablet">Last Reviewed</div>
                <div className="excel-table-header-cell col-balance">Balance</div>
                <div className="excel-table-header-cell w-10 flex-shrink-0"></div>
              </div>
              {/* Table Body */}
              <div className="excel-table-body">
                {accounts.map((account) => {
                  const needsReview = isAccountNeedsReview(account.lastReviewedAt);
                  const isCreditCard = account.type === 'credit';
                  const availableCredit = isCreditCard && account.creditCardDetails?.creditLimit
                    ? account.creditCardDetails.creditLimit + account.balance
                    : null;
                  
                  return (
                    <Link key={account.id} to={`/accounts/${account.id}`} className="block">
                      <div className="excel-table-row group">
                        <div className="excel-table-cell col-icon">
                          <div className="icon-cell icon-account">
                            {accountIcons[account.type] || <Wallet className="h-4 w-4" />}
                          </div>
                        </div>
                        <div className="excel-table-cell col-name">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{account.name}</span>
                            {needsReview && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>This account hasn't been reviewed in over a week</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                        <div className="excel-table-cell col-account-type hide-on-mobile">
                          <span className="text-muted-foreground capitalize">{account.type}</span>
                        </div>
                        <div className={`excel-table-cell col-reviewed hide-on-tablet ${needsReview ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'}`}>
                          {formatLastReviewed(account.lastReviewedAt)}
                        </div>
                        <div className="excel-table-cell col-balance">
                          <div className="text-right">
                            <span className="amount font-semibold">${account.balance.toFixed(2)}</span>
                            {isCreditCard && availableCredit !== null && (
                              <div className="text-xs text-muted-foreground">
                                <span className="text-success">${availableCredit.toFixed(2)} available</span>
                              </div>
                            )}
                            {!isCreditCard && (
                              <div className="text-xs text-muted-foreground">{account.currency}</div>
                            )}
                          </div>
                        </div>
                        <div className="excel-table-cell w-10 flex-shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => handleMarkAsReviewed(e, account.id)}
                            className="h-7 w-7 text-success hover:text-success hover:bg-success/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Mark as reviewed"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
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
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-3 bg-muted mb-3">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
            </div>
          ) : (
            <div className="excel-table">
              {/* Table Header */}
              <div className="excel-table-header">
                <div className="excel-table-header-cell col-icon"></div>
                <div className="excel-table-header-cell col-vendor">Vendor</div>
                <div className="excel-table-header-cell col-category hide-on-mobile">Category</div>
                <div className="excel-table-header-cell col-date hide-on-tablet">Date</div>
                <div className="excel-table-header-cell col-type hide-on-mobile">Type</div>
                <div className="excel-table-header-cell col-amount">Amount</div>
              </div>
              {/* Table Body */}
              <div className="excel-table-body">
                {transactions.slice(0, 5).map((transaction) => {
                  const category = categories.find((c) => c.id === transaction.categoryId);
                  return (
                    <div key={transaction.id} className="excel-table-row group">
                      <div className="excel-table-cell col-icon">
                        <div className={`icon-cell ${transaction.type === 'income' ? 'icon-income' : 'icon-expense'}`}>
                          {category?.icon || (transaction.type === 'income' ? '↑' : '↓')}
                        </div>
                      </div>
                      <div className="excel-table-cell col-vendor">
                        <span className="font-semibold">{transaction.vendor}</span>
                      </div>
                      <div className="excel-table-cell col-category hide-on-mobile">
                        <span className="text-muted-foreground">{category?.name || 'Unknown'}</span>
                      </div>
                      <div className="excel-table-cell col-date hide-on-tablet">
                        <span className="text-muted-foreground">{formatDisplayDate(transaction.date)}</span>
                      </div>
                      <div className="excel-table-cell col-type hide-on-mobile">
                        <div className={transaction.type === 'income' ? 'status-income' : 'status-expense'}>
                          {transaction.type === 'income' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {transaction.type}
                        </div>
                      </div>
                      <div className="excel-table-cell col-amount">
                        <span className={`amount font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </span>
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
