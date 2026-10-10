import { useCallback, useEffect, useState } from 'react'
import { Download, Printer, TrendingDown, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { getMonthlyReport, getTrend } from '../api/reportApi'
import { getTransactions } from '../api/transactionApi'
import { CategoryRankChart, ExpenseDonut, MonthlyTrendChart } from '../components/charts/Charts'
import { Card, EmptyState, ErrorState, Input, Loader, PageHeading } from '../components/common/UI'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate, monthLabel } from '../utils/formatDate'
import { useAuth } from '../hooks/useAuth'

const thisMonth = new Date().toISOString().slice(0, 7)

export function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(thisMonth)
  const [report, setReport] = useState(null)
  const [trend, setTrend] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { user } = useAuth()
  const currency = user?.currency || 'INR'
  const [year, month] = selectedMonth.split('-').map(Number)
  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const from = `${selectedMonth}-01`
      const to = `${selectedMonth}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`
      const [summary, cashflow, page] = await Promise.all([
        getMonthlyReport({ month, year }),
        getTrend({ month, year }),
        getTransactions({ page: 0, size: 1000, from, to }),
      ])
      setReport(summary)
      setTrend(cashflow.items || [])
      setTransactions(page.content || [])
    } catch {
      setError(true)
      toast.error('Could not load this report')
    } finally {
      setLoading(false)
    }
  }, [month, selectedMonth, year])
  useEffect(() => {
    load()
  }, [load])

  const exportCsv = () => {
    if (!report) return
    const lines = [
      ['Monthly report', monthLabel(month, year)].join(','),
      ['Income', report.income],
      ['Expenses', report.expense],
      ['Balance', report.balance],
      ['Savings rate', `${report.savingsRate}%`].join(','),
      '',
      ['Category', 'Amount', 'Share'].join(','),
      ...report.categories.map((item) =>
        [item.category, item.amount, `${item.percentage}%`].join(','),
      ),
      '',
      ['Date', 'Description', 'Category', 'Type', 'Amount'].join(','),
      ...transactions.map((item) =>
        [
          item.date,
          `"${String(item.description).replaceAll('"', '""')}"`,
          item.category,
          item.type,
          item.amount,
        ].join(','),
      ),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `mintwise-report-${year}-${String(month).padStart(2, '0')}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported')
  }

  return (
    <>
      <PageHeading
        eyebrow="Patterns, not pressure"
        title="Reports & analytics"
        description="See how this month compares, and what’s shaping your spending."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Input
              aria-label="Select report month"
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="w-[160px]"
            />
            <button
              type="button"
              onClick={exportCsv}
              disabled={!report}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink hover:bg-canvas disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              aria-label="Export report as CSV"
            >
              <Download className="size-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink hover:bg-canvas dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              aria-label="Print report"
            >
              <Printer className="size-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        }
      />
      {loading ? (
        <div className="space-y-5">
          <Loader rows={4} className="grid gap-4 sm:grid-cols-4" />
          <Loader rows={5} className="grid gap-5 lg:grid-cols-2" />
        </div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : (
        report && (
          <div className="report-content">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted">
              <span className="grid size-8 place-items-center rounded-lg bg-mint text-forest dark:bg-emerald-950 dark:text-emerald-300">
                {monthLabel(month, year).slice(0, 1)}
              </span>
              {monthLabel(month, year)} summary
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: 'Income',
                  value: report.income,
                  change: report.comparison?.incomeChange,
                  positive: true,
                },
                {
                  label: 'Expenses',
                  value: report.expense,
                  change: report.comparison?.expenseChange,
                  positive: Number(report.comparison?.expenseChange) <= 0,
                },
                { label: 'Net balance', value: report.balance },
                { label: 'Savings rate', value: `${report.savingsRate}%` },
              ].map((metric) => (
                <Card key={metric.label} className="p-4">
                  <p className="text-xs font-semibold text-muted">{metric.label}</p>
                  <p className="mt-2 font-display text-xl font-extrabold text-ink dark:text-white">
                    {typeof metric.value === 'number'
                      ? formatCurrency(metric.value, currency)
                      : metric.value}
                  </p>
                  {metric.change !== undefined && (
                    <p
                      className={`mt-1 flex items-center gap-1 text-xs font-semibold ${metric.positive ? 'text-forest dark:text-emerald-300' : 'text-rose-600'}`}
                    >
                      {metric.positive ? (
                        <TrendingUp className="size-3.5" />
                      ) : (
                        <TrendingDown className="size-3.5" />
                      )}
                      {Math.abs(metric.change)}% from last month
                    </p>
                  )}
                </Card>
              ))}
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.25fr]">
              <Card className="p-5">
                <div className="mb-3">
                  <h2 className="font-display text-base font-extrabold text-ink dark:text-white">
                    Category breakdown
                  </h2>
                  <p className="mt-1 text-xs text-muted">Where your spending went</p>
                </div>
                <ExpenseDonut data={report.categories || []} currency={currency} />
              </Card>
              <Card className="p-5">
                <div className="mb-3">
                  <h2 className="font-display text-base font-extrabold text-ink dark:text-white">
                    Monthly trend
                  </h2>
                  <p className="mt-1 text-xs text-muted">Income against expenses</p>
                </div>
                <MonthlyTrendChart data={trend} currency={currency} />
              </Card>
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.2fr]">
              <Card className="p-5">
                <div className="mb-3">
                  <h2 className="font-display text-base font-extrabold text-ink dark:text-white">
                    Top spending categories
                  </h2>
                  <p className="mt-1 text-xs text-muted">Your five largest categories this month</p>
                </div>
                {report.categories?.length ? (
                  <CategoryRankChart data={report.categories} currency={currency} />
                ) : (
                  <EmptyState
                    title="No spending yet"
                    message="Expenses will appear here as you add them."
                  />
                )}
              </Card>
              <Card className="overflow-hidden">
                <div className="px-5 py-4">
                  <h2 className="font-display text-base font-extrabold text-ink dark:text-white">
                    Month at a glance
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    {transactions.length} transactions recorded
                  </p>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {transactions.length ? (
                    transactions.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 dark:border-slate-800"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink dark:text-white">
                            {item.description}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            {formatDate(item.date)} · {item.category}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 text-sm font-bold ${item.type === 'income' ? 'text-forest dark:text-emerald-300' : 'text-ink dark:text-slate-100'}`}
                        >
                          {item.type === 'income' ? '+' : '−'}
                          {formatCurrency(item.amount, currency)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      title="Nothing recorded yet"
                      message="Transactions for the selected month will appear here."
                    />
                  )}
                </div>
              </Card>
            </div>
          </div>
        )
      )}
    </>
  )
}
