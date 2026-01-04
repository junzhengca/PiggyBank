import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createAccount, deleteAccount, markAccountAsReviewed } from '@/store/slices/accountsSlice';
import { Account, AccountType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Trash2, Wallet, CreditCard, PiggyBank, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { ACCOUNT_TYPES } from '@/types/constants';
import { isAccountNeedsReview, formatLastReviewed } from '@/lib/utils';

const accountIcons: Record<string, JSX.Element> = {
  checking: <Wallet className="h-5 w-5" />,
  savings: <PiggyBank className="h-5 w-5" />,
  credit: <CreditCard className="h-5 w-5" />,
  debit: <CreditCard className="h-5 w-5" />,
  investment: <TrendingUp className="h-5 w-5" />,
};

export default function Accounts() {
  const dispatch = useAppDispatch();
  const accounts = useAppSelector((state) => state.accounts.accounts);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<{
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const creditCardDetails = formData.type === 'credit' ? {
      interestRate: formData.creditCardDetails.interestRate ? parseFloat(formData.creditCardDetails.interestRate) : undefined,
      statementDay: formData.creditCardDetails.statementDay ? parseInt(formData.creditCardDetails.statementDay, 10) : undefined,
      creditLimit: formData.creditCardDetails.creditLimit ? parseFloat(formData.creditCardDetails.creditLimit) : undefined,
    } : undefined;
    
    dispatch(createAccount({
      ...formData,
      balance: parseFloat(formData.balance) || 0,
      creditCardDetails,
    }));
    setIsOpen(false);
    setFormData({
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
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      dispatch(deleteAccount(id));
    }
  };

  const handleMarkAsReviewed = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(markAccountAsReviewed(id));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your financial accounts</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Account Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
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
              {formData.type === 'credit' && (
                <div className="space-y-3 p-3 bg-muted/50 rounded-lg border border-border">
                  <p className="text-xs font-medium text-muted-foreground">Credit Card Details (Optional)</p>
                  <div>
                    <Label htmlFor="interestRate">Interest Rate (APR %)</Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 18.99"
                      value={formData.creditCardDetails.interestRate}
                      onChange={(e) => setFormData({
                        ...formData,
                        creditCardDetails: {
                          ...formData.creditCardDetails,
                          interestRate: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="statementDay">Statement Day (1-31)</Label>
                    <Input
                      id="statementDay"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="e.g., 15"
                      value={formData.creditCardDetails.statementDay}
                      onChange={(e) => setFormData({
                        ...formData,
                        creditCardDetails: {
                          ...formData.creditCardDetails,
                          statementDay: e.target.value
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="creditLimit">Credit Limit</Label>
                    <Input
                      id="creditLimit"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 2000"
                      value={formData.creditCardDetails.creditLimit}
                      onChange={(e) => setFormData({
                        ...formData,
                        creditCardDetails: {
                          ...formData.creditCardDetails,
                          creditLimit: e.target.value
                        }
                      })}
                    />
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="balance">Initial Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  required
                  className="text-lg"
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full shadow-lg">
                Create Account
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account: Account, index) => {
          const needsReview = isAccountNeedsReview(account.lastReviewedAt);
          const isCreditCard = account.type === 'credit';
          const availableCredit = isCreditCard && account.creditCardDetails?.creditLimit
            ? account.creditCardDetails.creditLimit + account.balance
            : null;
          
          return (
            <Link key={account.id} to={`/accounts/${account.id}`} className="group">
              <Card className={`border-l-4 h-full cursor-pointer transition-all ${needsReview ? 'border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/10' : ''}`} style={{ borderLeftColor: account.color }}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                          {accountIcons[account.type] || <Wallet className="h-5 w-5" />}
                        </div>
                        <span>{account.name}</span>
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
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleMarkAsReviewed(e, account.id)}
                        className="text-success hover:text-success hover:bg-success/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Mark as reviewed"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(account.id);
                        }}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                      {accountIcons[account.type] || <Wallet className="h-4 w-4" />}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{account.type}</span>
                  </div>
                  <div className="text-xl font-bold amount">${account.balance.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{account.currency}</div>
                  {isCreditCard && account.creditCardDetails?.creditLimit && (
                    <div className="text-xs text-muted-foreground">
                      {availableCredit !== null && (
                        <span className="text-success font-medium">
                          ${availableCredit.toFixed(2)} available
                        </span>
                      )}{' '}
                      of ${account.creditCardDetails.creditLimit.toFixed(2)} limit
                    </div>
                  )}
                  <div className={`text-xs ${needsReview ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'}`}>
                    {formatLastReviewed(account.lastReviewedAt)}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {accounts.length === 0 && (
        <Card className="md:col-span-2 lg:col-span-3">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="p-3 bg-muted mb-3">
              <Wallet className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground text-center">No accounts yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first account to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
