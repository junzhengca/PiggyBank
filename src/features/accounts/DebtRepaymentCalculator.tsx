import { useState, useEffect, useMemo } from 'react';
import { Account } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calculator, AlertCircle, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { calculateDebtPayoff, calculateRecommendedMinimumPayment, type DebtPayoffResult } from '@/lib/debtCalculator';

interface DebtRepaymentCalculatorProps {
  account: Account;
}

export default function DebtRepaymentCalculator({ account }: DebtRepaymentCalculatorProps) {
  // Form state
  const [balance, setBalance] = useState(Math.abs(account.balance).toString());
  const [interestRate, setInterestRate] = useState(
    account.creditCardDetails?.interestRate?.toString() || '0'
  );
  const [monthlyPayment, setMonthlyPayment] = useState<string>('');

  // Derived values
  const balanceNum = parseFloat(balance) || 0;
  const interestRateNum = parseFloat(interestRate) || 0;
  const monthlyPaymentNum = parseFloat(monthlyPayment) || 0;

  // Calculate recommended minimum payment
  const recommendedMinPayment = useMemo(
    () => calculateRecommendedMinimumPayment(balanceNum),
    [balanceNum]
  );

  // Calculate slider range
  const sliderMin = recommendedMinPayment;
  const sliderMax = Math.max(balanceNum * 0.2, sliderMin * 5); // 20% of balance or 5x min payment

  // Initialize monthly payment on mount and when balance changes
  useEffect(() => {
    if (!monthlyPayment) {
      setMonthlyPayment(recommendedMinPayment.toFixed(2));
    }
  }, [recommendedMinPayment, monthlyPayment]);

  // Calculate debt payoff
  const payoffResult: DebtPayoffResult | null = useMemo(() => {
    if (monthlyPaymentNum > 0) {
      return calculateDebtPayoff(balanceNum, interestRateNum, monthlyPaymentNum);
    }
    return null;
  }, [balanceNum, interestRateNum, monthlyPaymentNum]);

  // Format chart data
  const chartData = useMemo(() => {
    if (!payoffResult) return [];
    
    return payoffResult.monthlyData.map((data) => ({
      month: `Month ${data.month}`,
      balance: data.balance,
    }));
  }, [payoffResult]);

  // Determine if payment is insufficient
  const isPaymentInsufficient = payoffResult === null && monthlyPaymentNum > 0;

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    setMonthlyPayment(value[0].toFixed(2));
  };

  // Handle direct input change
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyPayment(e.target.value);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <Calculator className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Debt Repayment Calculator</h3>
      </div>

      {/* Account Info */}
      <div className="bg-muted/50 p-3 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">Account</p>
        <p className="font-semibold">{account.name}</p>
      </div>

      {/* Form Inputs */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="balance">Current Balance</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="interest">Interest Rate (APR %)</Label>
            <Input
              id="interest"
              type="number"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="payment">Monthly Payment</Label>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex-1">
              <Slider
                id="payment"
                min={sliderMin}
                max={sliderMax}
                step={1}
                value={[monthlyPaymentNum]}
                onValueChange={handleSliderChange}
                className="w-full"
              />
            </div>
            <div className="w-32">
              <Input
                type="number"
                step="0.01"
                value={monthlyPayment}
                onChange={handlePaymentChange}
                min={0}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Range: ${sliderMin.toFixed(2)} - ${sliderMax.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Warning for insufficient payment */}
      {isPaymentInsufficient && (
        <Card className="border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/10">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Payment Too Low
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                  Your monthly payment doesn't cover the interest. Increase your payment to make progress.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Statistics */}
      {payoffResult && payoffResult.monthsToPayoff > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Months to Payoff</p>
                  <p className="text-lg font-bold">{payoffResult.monthsToPayoff}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Interest</p>
                  <p className="text-lg font-bold amount">${payoffResult.totalInterest.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-success">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-success" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Paid</p>
                  <p className="text-lg font-bold amount">${payoffResult.totalPaid.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Zero balance message */}
      {balanceNum <= 0 && (
        <Card className="border-success/50 bg-success/10">
          <CardContent className="p-4 text-center">
            <p className="text-sm font-medium text-success">
              This account has no balance to pay off!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      {payoffResult && payoffResult.monthsToPayoff > 0 && chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Balance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3b82f6" 
                  fillOpacity={1}
                  fill="url(#colorBalance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Monthly breakdown table */}
      {payoffResult && payoffResult.monthsToPayoff > 0 && payoffResult.monthsToPayoff <= 24 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium text-muted-foreground">Month</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Payment</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Interest</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Principal</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {payoffResult.monthlyData.map((data) => (
                    <tr key={data.month} className="border-b border-border/50">
                      <td className="py-2">{data.month}</td>
                      <td className="text-right py-2 amount">${data.payment.toFixed(2)}</td>
                      <td className="text-right py-2 text-amber-600 dark:text-amber-400">
                        ${data.interest.toFixed(2)}
                      </td>
                      <td className="text-right py-2 text-success">
                        ${data.principal.toFixed(2)}
                      </td>
                      <td className="text-right py-2 font-medium">
                        ${data.balance.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
