export const WEEKS_PER_MONTH = 4; // average weeks per month

function toNumber(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Sum numeric fields of an object, ignoring keys provided to exclude.
 */
function sumObjectValues(obj: Record<string, any> | undefined, exclude: string[] = []) {
  if (!obj) return 0;
  return Object.keys(obj).reduce((acc, k) => {
    if (exclude.includes(k)) return acc;
    return acc + toNumber(obj[k]);
  }, 0);
}

/**
 * Given an economicConditions object, returns a new object
 * with weekly_total and monthly_total filled for both income and expenses.
 */
export default function calculateEconomicTotals(econ: any = {}) {
  const weeklyIncome = econ.weekly_income || {};
  const weeklyExpenses = econ.weekly_expenses || {};

  const incomeWeeklyTotal = sumObjectValues(weeklyIncome, ['weekly_total', 'monthly_total']);
  const expensesWeeklyTotal = sumObjectValues(weeklyExpenses, ['weekly_total', 'monthly_total']);

  const incomeMonthlyTotal = +(incomeWeeklyTotal * WEEKS_PER_MONTH).toFixed(2);
  const expensesMonthlyTotal = +(expensesWeeklyTotal * WEEKS_PER_MONTH).toFixed(2);

  return {
    ...econ,
    weekly_income: {
      ...weeklyIncome,
      weekly_total: incomeWeeklyTotal,
      monthly_total: incomeMonthlyTotal,
    },
    weekly_expenses: {
      ...weeklyExpenses,
      weekly_total: expensesWeeklyTotal,
      monthly_total: expensesMonthlyTotal,
    },
  };
}