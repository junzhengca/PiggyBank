import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAccounts } from '@/store/hooks';
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
import { useRegisterShortcut } from '@/components/keyboard/useKeyboardShortcuts';
import { BANKS, getBankById } from '@/types/banks';

const accountIcons: Record<string, JSX.Element> = {
  checking: <Wallet className="h-5 w-5" />,
  savings: <PiggyBank className="h-5 w-5" />,
  credit: <CreditCard className="h-5 w-5" />,
  debit: <CreditCard className="h-5 w-5" />,
  investment: <TrendingUp className="h-5 w-5" />,
};

// Helper component to render account icon with bank fallback
function AccountIcon({ account, size = 'h-4 w-4' }: { account: Account; size?: string }) {
  const [imageError, setImageError] = useState(false);
  const bank = account.bankId ? getBankById(account.bankId) : null;
  
  if (bank && !imageError) {
    return (
      <img 
        src={bank.icon} 
        alt={bank.name} 
        className="w-full h-full object-contain p-1"
        onError={() => setImageError(true)}
      />
    );
  }
  
  return <>{accountIcons[account.type] || <Wallet className={size} />}</>;
}

export default function Accounts() {
  const dispatch = useAppDispatch();
  const accounts = useAccounts();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    type: AccountType;
    balance: string;
    currency: string;
    color: string;
    icon: string;
    bankId: string;
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
    bankId: '',
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
      bankId: formData.bankId || undefined,
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
      bankId: '',
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

  // Register keyboard shortcut for 'c' to add account
  useRegisterShortcut({
    key: 'c',
    description: 'Add account',
    category: 'actions',
    page: '/accounts',
    action: () => {
      setIsOpen(true);
    },
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your financial accounts</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25 justify-between">
              <div className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </div>
              <kbd className="ml-2 px-1.5 py-0.5 text-xs font-mono bg-muted text-muted-foreground rounded border border-border">
                C
              </kbd>
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
              <div>
                <Label htmlFor="bank">Bank (Optional)</Label>
                <Select
                  value={formData.bankId || 'none'}
                  onValueChange={(value: string) => setFormData({ ...formData, bankId: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {BANKS.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name}
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

      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-muted-foreground border-b bg-muted/50">
              <div className="col-span-1"></div>
              <div className="col-span-4">Name</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Last Reviewed</div>
              <div className="col-span-2 text-right">Balance</div>
              <div className="col-span-1"></div>
            </div>
            
            {/* Table Body */}
            <div className="divide-y divide-border">
              {accounts.map((account: Account) => {
                const needsReview = isAccountNeedsReview(account.lastReviewedAt);
                const isCreditCard = account.type === 'credit';
                const availableCredit = isCreditCard && account.creditCardDetails?.creditLimit
                  ? account.creditCardDetails.creditLimit + account.balance
                  : null;
                return (
                  <Link 
                    key={account.id} 
                    to={`/accounts/${account.id}`} 
                    className="block group"
                  >
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-accent transition-colors items-center">
                      <div className="col-span-1">
                        <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center overflow-hidden">
                          <AccountIcon account={account} size="h-4 w-4" />
                        </div>
                      </div>
                      <div className="col-span-4">
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
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-muted-foreground capitalize">{account.type}</span>
                      </div>
                      <div className="col-span-2">
                        <span className={`text-sm ${needsReview ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-muted-foreground'}`}>
                          {formatLastReviewed(account.lastReviewedAt)}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <div className="space-y-0.5">
                          <div className="amount font-semibold text-sm">
                            ${account.balance.toFixed(2)} {account.currency}
                          </div>
                          {isCreditCard && account.creditCardDetails?.creditLimit && availableCredit !== null && (
                            <div className="text-xs text-success">
                              ${availableCredit.toFixed(2)} available
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => handleMarkAsReviewed(e, account.id)}
                          className="h-7 w-7 text-success hover:text-success hover:bg-success/10 opacity-0 group-hover:opacity-100 transition-opacity"
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
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {accounts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="p-3 bg-muted rounded-md mb-3">
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
