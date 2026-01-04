export interface DebtPayoffResult {
  monthlyPayment: number;
  monthsToPayoff: number;
  totalInterest: number;
  totalPaid: number;
  monthlyData: Array<{
    month: number;
    balance: number;
    payment: number;
    interest: number;
    principal: number;
  }>;
}

/**
 * Calculate debt payoff schedule based on principal, annual interest rate, and monthly payment.
 * 
 * @param principal - The initial debt amount (positive number)
 * @param annualRate - The annual interest rate as a percentage (e.g., 18.99 for 18.99%)
 * @param monthlyPayment - The fixed monthly payment amount
 * @returns DebtPayoffResult with monthly breakdown and summary statistics, or null if payoff is impossible
 */
export function calculateDebtPayoff(
  principal: number,
  annualRate: number,
  monthlyPayment: number
): DebtPayoffResult | null {
  // Handle edge cases
  if (principal <= 0) {
    return {
      monthlyPayment: 0,
      monthsToPayoff: 0,
      totalInterest: 0,
      totalPaid: 0,
      monthlyData: [],
    };
  }

  if (monthlyPayment <= 0) {
    return null;
  }

  const monthlyRate = annualRate / 100 / 12;
  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  const monthlyData: DebtPayoffResult['monthlyData'] = [];
  let month = 0;
  const maxMonths = 600; // Safety limit: 50 years

  while (balance > 0.01 && month < maxMonths) {
    const interest = balance * monthlyRate;
    const principalPayment = Math.min(monthlyPayment - interest, balance);
    
    // If payment doesn't cover interest, debt will never be paid off
    if (principalPayment <= 0) {
      return null;
    }

    balance -= principalPayment;
    totalInterest += interest;
    totalPaid += monthlyPayment;

    monthlyData.push({
      month: month + 1,
      balance: Math.max(0, balance),
      payment: monthlyPayment,
      interest,
      principal: principalPayment,
    });

    month++;
  }

  return {
    monthlyPayment,
    monthsToPayoff: month,
    totalInterest,
    totalPaid,
    monthlyData,
  };
}

/**
 * Calculate the minimum monthly payment to pay off debt within a given timeframe.
 * 
 * @param principal - The initial debt amount
 * @param annualRate - The annual interest rate as a percentage
 * @param targetMonths - Target number of months to pay off the debt
 * @returns Required monthly payment amount
 */
export function calculateMinimumPayment(
  principal: number,
  annualRate: number,
  targetMonths: number
): number {
  if (principal <= 0 || targetMonths <= 0) {
    return 0;
  }

  const monthlyRate = annualRate / 100 / 12;
  
  if (monthlyRate === 0) {
    return principal / targetMonths;
  }

  // Amortization formula: P = (r * PV) / (1 - (1 + r)^-n)
  const payment = (monthlyRate * principal) / (1 - Math.pow(1 + monthlyRate, -targetMonths));
  
  return payment;
}

/**
 * Calculate the recommended minimum monthly payment (typically 2% of balance).
 * 
 * @param balance - The current balance
 * @returns Recommended minimum payment
 */
export function calculateRecommendedMinimumPayment(balance: number): number {
  return Math.max(balance * 0.02, 15); // 2% of balance or $15, whichever is higher
}
