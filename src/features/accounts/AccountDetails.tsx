import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateAccount, deleteAccount, markAccountAsReviewed } from '@/store/slices/accountsSlice';
import { createTransaction, deleteTransaction } from '@/store/slices/transactionsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Edit2, Trash2, Plus, Wallet, CreditCard, PiggyBank, TrendingUp, ArrowUp, ArrowDown, TrendingDown, CheckCircle, AlertTriangle, Calculator } from 'lucide-react';
import { ACCOUNT_TYPES } from '@/types/constants';
import { TransactionFormData, AccountType } from '@/types';
import { parseLocalDate, formatDisplayDate, getTodayDateString, isAccountNeedsReview, formatLastReviewed } from '@/lib/utils';
import DebtRepaymentCalculator from './DebtRepaymentCalculator';

const accountIcons: Record<string, JSX.Element> = {
  checking: <Wallet className="h-5 w-5" />,
  savings: <PiggyBank className="h-5 w-5" />,
  credit: <CreditCard className="h-5 w-5" />,
  debit: <CreditCard className="h-5 w-5" />,
  investment: <TrendingUp className="h-5 w-5" />,
};

export default function AccountDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const account = useAppSelector((state) => state.accounts.accounts.find((a) => a.id === id));
  const transactions = useAppSelector((state) => state.transactions.transactions.filter((t) => t.accountId === id));
  const categories = useAppSelector((state) => state.categories.categories);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  const handleEditOpenChange = (open: boolean) => {
    if (open && account) {
      setEditFormData({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        currency: account.currency,
        color: account.color || '#3b82f6',
        icon: account.icon || '💳',
        creditCardDetails: {
          interestRate: account.creditCardDetails?.interestRate?.toString() || '',
          statementDay: account.creditCardDetails?.statementDay?.toString() || '',
          creditLimit: account.creditCardDetails?.creditLimit?.toString() || '',
        },
      });
    }
    setIsEditOpen(open);
  };
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    type: AccountType;
    balance: string;
    currency: string;
    color: string;
    icon: string;
    creditCardDetails: {
      interestRate: string;
      statementDay: string;
      creditLimit: string;
    };
  }>({
    name: '',
    type: 'checking',
    balance: '',
    currency: 'USD',
    color: '#3b82f6',
    icon: '💳',
    creditCardDetails: {
      interestRate: '',
      statementDay: '',
      creditLimit: '',
    },
  });
  const [transactionFormData, setTransactionFormData] = useState({
    accountId: id || '',
    categoryId: '',
    amount: '',
    type: 'expense' as const,
    date: getTodayDateString(),
    vendor: '',
    notes: '',
    tagIds: [] as string[],
  });

  if (!account) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-xl font-semibold text-muted-foreground">Account not found</p>
          <Link to="/accounts">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Accounts
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const creditCardDetails = editFormData.type === 'credit' ? {
      interestRate: editFormData.creditCardDetails.interestRate ? parseFloat(editFormData.creditCardDetails.interestRate) : undefined,
      statementDay: editFormData.creditCardDetails.statementDay ? parseInt(editFormData.creditCardDetails.statementDay, 10) : undefined,
      creditLimit: editFormData.creditCardDetails.creditLimit ? parseFloat(editFormData.creditCardDetails.creditLimit) : undefined,
    } : undefined;
    
    dispatch(updateAccount({
      id: account.id,
      data: {
        ...editFormData,
        balance: parseFloat(editFormData.balance) || 0,
        creditCardDetails,
      }
    }));
    setIsEditOpen(false);
  };

  const handleDelete = () => {
    dispatch(deleteAccount(account.id));
    navigate('/accounts');
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
      accountId: id || '',
      categoryId: '',
      amount: '',
      type: 'expense',
      date: getTodayDateString(),
      vendor: '',
      notes: '',
      tagIds: [],
    });
  };

  const handleTransactionDelete = (transactionId: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      dispatch(deleteTransaction(transactionId));
    }
  };

  const handleMarkAsReviewed = () => {
    dispatch(markAccountAsReviewed(account.id));
  };

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const needsReview = isAccountNeedsReview(account.lastReviewedAt);
  const isCreditCard = account.type === 'credit';
  const availableCredit = isCreditCard && account.creditCardDetails?.creditLimit
    ? account.creditCardDetails.creditLimit + account.balance
    : null;

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Back Button */}
      <Link to="/accounts">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Accounts
        </Button>
      </Link>

      {/* Account Info Header */}
      <Card className={`border-l-4 ${needsReview ? 'border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/10' : ''}`} style={{ borderLeftColor: account.color }}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary/10 flex items-center justify-center">
                {accountIcons[account.type] || <Wallet className="h-4.5 w-4.5" />}
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {account.name}
                  {needsReview && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This account hasn't been reviewed in over a week</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground capitalize">{account.type} Account</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkAsReviewed}
                className="text-success hover:text-success hover:bg-success/10"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Reviewed
              </Button>
              {isCreditCard && (
                <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Calculator className="h-4 w-4 mr-2" />
                      Debt Calculator
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DebtRepaymentCalculator account={account} />
                  </DialogContent>
                </Dialog>
              )}
              <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-lg">Edit Account</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEditSubmit} className="space-y-3">
                    <div>
                      <Label htmlFor="edit-name">Account Name</Label>
                      <Input
                        id="edit-name"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-type">Account Type</Label>
                      <Select
                        value={editFormData.type}
                        onValueChange={(value: any) => setEditFormData({ ...editFormData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACCOUNT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {editFormData.type === 'credit' && (
                      <div className="space-y-3 p-3 bg-muted/50 rounded-lg border border-border">
                        <p className="text-xs font-medium text-muted-foreground">Credit Card Details (Optional)</p>
                        <div>
                          <Label htmlFor="edit-interestRate">Interest Rate (APR %)</Label>
                          <Input
                            id="edit-interestRate"
                            type="number"
                            step="0.01"
                            placeholder="e.g., 18.99"
                            value={editFormData.creditCardDetails.interestRate}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              creditCardDetails: {
                                ...editFormData.creditCardDetails,
                                interestRate: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-statementDay">Statement Day (1-31)</Label>
                          <Input
                            id="edit-statementDay"
                            type="number"
                            min="1"
                            max="31"
                            placeholder="e.g., 15"
                            value={editFormData.creditCardDetails.statementDay}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              creditCardDetails: {
                                ...editFormData.creditCardDetails,
                                statementDay: e.target.value
                              }
                            })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-creditLimit">Credit Limit</Label>
                          <Input
                            id="edit-creditLimit"
                            type="number"
                            step="0.01"
                            placeholder="e.g., 2000"
                            value={editFormData.creditCardDetails.creditLimit}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              creditCardDetails: {
                                ...editFormData.creditCardDetails,
                                creditLimit: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="edit-balance">Balance</Label>
                      <Input
                        id="edit-balance"
                        type="number"
                        step="0.01"
                        value={editFormData.balance}
                        onChange={(e) => setEditFormData({ ...editFormData, balance: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-currency">Currency</Label>
                      <Input
                        id="edit-currency"
                        value={editFormData.currency}
                        onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-color">Color</Label>
                      <Input
                        id="edit-color"
                        type="color"
                        value={editFormData.color}
                        onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                        className="h-10 w-full"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Save Changes
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-lg">Delete Account</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to delete <strong>{account.name}</strong>? This action cannot be undone.
                      All transactions associated with this account will also be deleted.
                    </p>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDelete}>
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Current Balance</p>
              <p className="text-xl font-bold amount">${account.balance.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Currency</p>
              <p className="text-lg font-semibold">{account.currency}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="text-lg font-semibold">{transactions.length}</p>
            </div>
          </div>
          {isCreditCard && account.creditCardDetails?.creditLimit && availableCredit !== null && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Available Credit</p>
                  <p className="text-lg font-bold text-success amount">${availableCredit.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Credit Limit</p>
                  <p className="text-lg font-semibold">${account.creditCardDetails.creditLimit.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
          <div className={`mt-3 pt-3 border-t ${needsReview ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'}`}>
            <p className="text-xs">{formatLastReviewed(account.lastReviewedAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Account Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Income</p>
                <p className="text-lg font-bold text-success amount">${totalIncome.toFixed(2)}</p>
              </div>
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Expenses</p>
                <p className="text-lg font-bold text-destructive amount">${totalExpense.toFixed(2)}</p>
              </div>
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingDown className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowUp className="h-4 w-4 text-primary" />
              Transactions
              <span className="text-xs font-normal text-muted-foreground">({transactions.length})</span>
            </CardTitle>
            <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-lg">Add Transaction to {account.name}</DialogTitle>
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
                  <Button type="submit" className="w-full">
                    Add Transaction
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-3 bg-muted mb-3">
                <ArrowUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No transactions yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Add your first transaction to get started.</p>
            </div>
          ) : (
            <div className="excel-table">
              {/* Table Header */}
              <div className="excel-table-header">
                <div className="excel-table-header-cell col-icon"></div>
                <div className="excel-table-header-cell col-vendor">Vendor</div>
                <div className="excel-table-header-cell col-category hide-on-mobile">Category</div>
                <div className="excel-table-header-cell col-date">Date</div>
                <div className="excel-table-header-cell col-type hide-on-mobile">Type</div>
                <div className="excel-table-header-cell col-amount">Amount</div>
                <div className="excel-table-header-cell w-12 flex-shrink-0"></div>
              </div>
              {/* Table Body */}
              <div className="excel-table-body">
                {transactions.map((transaction) => {
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
                      <div className="excel-table-cell col-category hide-on-mobile">
                        <span className="text-muted-foreground">{category?.name || 'Unknown'}</span>
                      </div>
                      <div className="excel-table-cell col-date">
                        <span className="text-muted-foreground">{formatDisplayDate(transaction.date)}</span>
                      </div>
                      <div className="excel-table-cell col-type hide-on-mobile">
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
                      <div className="excel-table-cell w-12 flex-shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleTransactionDelete(transaction.id)}
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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
