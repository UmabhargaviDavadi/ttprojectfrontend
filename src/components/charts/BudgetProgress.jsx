import { formatCurrency } from '../../utils/formatCurrency'

export function BudgetProgress({ budget, spent = 0, currency = 'INR' }) {
  const percent = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0
  const tone = percent >= 100 ? 'bg-rose-500' : percent >= 70 ? 'bg-amber-500' : 'bg-forest'
  const textTone =
    percent >= 100
      ? 'text-rose-600'
      : percent >= 70
        ? 'text-amber-700 dark:text-amber-300'
        : 'text-forest dark:text-emerald-300'
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="truncate text-sm font-semibold text-ink dark:text-slate-100">
          {budget.category}
        </span>
        <span className={`shrink-0 text-xs font-bold ${textTone}`}>{percent}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        role="progressbar"
        aria-label={`${budget.category} budget used`}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.min(percent, 100)}
      >
        <div
          className={`h-full rounded-full transition-all ${tone}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted">
        {formatCurrency(spent, currency)} of {formatCurrency(budget.limit, currency)}
      </p>
    </div>
  )
}
