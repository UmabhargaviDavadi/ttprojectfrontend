import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  Plus,
  PiggyBank,
  Wallet,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getBudgets } from '../api/budgetApi'
import { getMonthlyReport, getTrend } from '../api/reportApi'
import { getTransactions } from '../api/transactionApi'
import { BudgetProgress } from '../components/charts/BudgetProgress'
import { CashflowChart, DailySpendingChart, ExpenseDonut } from '../components/charts/Charts'
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  Input,
  Loader,
  PageHeading,
} from '../components/common/UI'
import { TransactionModal } from '../components/forms/TransactionModal'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { useAuth } from '../hooks/useAuth'

const thisMonth = new Date().toISOString().slice(0, 7)
const money = (amount, currency) => formatCurrency(amount, currency)

export function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState(thisMonth)
  const [report, setReport] = useState(null)
  const [trend, setTrend] = useState([])
  const [transactions, setTransactions] = useState([])
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const { user } = useAuth()
  const currency = user?.currency || 'INR'
  const [year, month] = selectedMonth.split('-').map(Number)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const from = `${selectedMonth}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const to = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`
      const [summary, cashflow, monthTransactions, monthBudgets] = await Promise.all([
        getMonthlyReport({ month, year }),
        getTrend({ month, year }),
        getTransactions({ page: 0, size: 250, from, to }),
        getBudgets({ month, year }),
      ])
      setReport(summary)
      setTrend(cashflow.items || [])
      setTransactions(monthTransactions.content || [])
      setBudgets(monthBudgets)
    } catch {
      setError(true)
      toast.error('Could not load your overview')
    } finally {
      setLoading(false)
    }
  }, [month, selectedMonth, year])

  useEffect(() => {
    load()
  }, [load])
  useEffect(() => {
    const openQuickAdd = () => setQuickAddOpen(true)
    window.addEventListener('finance:quick-add', openQuickAdd)
    return () => window.removeEventListener('finance:quick-add', openQuickAdd)
  }, [])

  const daily = useMemo(() => {
    const spent = new Map()
    transactions
      .filter((item) => item.type === 'expense')
      .forEach((item) => spent.set(item.date, (spent.get(item.date) || 0) + item.amount))
    const dayCount = new Date(year, month, 0).getDate()
    return Array.from({ length: dayCount }, (_, index) => {
      const date = `${selectedMonth}-${String(index + 1).padStart(2, '0')}`
      return {
        day: index % 5 === 0 || index === dayCount - 1 ? String(index + 1) : '',
        amount: spent.get(date) || 0,
      }
    })
  }, [month, selectedMonth, transactions, year])

  const budgetSpend = (category) =>
    transactions
      .filter(
        (item) => item.type === 'expense' && (category === 'Overall' || item.category === category),
      )
      .reduce((sum, item) => sum + item.amount, 0)
  const rows = transactions.slice(0, 5)
  const metrics = [
    {
      title: 'Income',
      amount: report?.income,
      icon: ArrowDownLeft,
      tone: 'text-forest bg-mint',
      note: 'Money in',
    },
    {
      title: 'Expenses',
      amount: report?.expense,
      icon: ArrowUpRight,
      tone: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40',
      note: 'Money out',
    },
    {
      title: 'Balance',
      amount: report?.balance,
      icon: Wallet,
      tone: 'text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-950/40',
      note: 'After expenses',
    },
    {
      title: 'Savings rate',
      amount: `${report?.savingsRate || 0}%`,
      icon: PiggyBank,
      tone: 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/40',
      note: 'Of income saved',
      isText: true,
    },
  ]

  if (error && !report)
    return <ErrorState onRetry={load} message="Your overview couldn’t be loaded." />
  return (
    <>
      <PageHeading
        eyebrow="Your money at a glance"
        title="Overview"
        description="A clear picture of where you are and what’s next."
        action={
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted" />
            <Input
              aria-label="Select month"
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="w-[160px]"
            />
            <Button
              className="sm:hidden"
              size="icon"
              onClick={() => setQuickAddOpen(true)}
              aria-label="Add transaction"
            >
              <Plus className="size-5" />
            </Button>
          </div>
        }
      />
      {loading ? (
        <div className="space-y-5">
          <Loader rows={4} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" />
          <div className="grid gap-5 xl:grid-cols-2">
            <Loader rows={4} />
            <Loader rows={4} />
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(({ title, amount, icon: Icon, tone, note, isText }) => (
              <Card key={title} className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted">{title}</p>
                    <p className="mt-2 font-display text-[22px] font-extrabold tracking-tight text-ink dark:text-white">
                      {isText ? amount : money(amount, currency)}
                    </p>
                    <p className="mt-1 text-xs text-muted">{note}</p>
                  </div>
                  <span className={`grid size-10 place-items-center rounded-lg ${tone}`}>
                    <Icon className="size-[18px]" />
                  </span>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-[1.05fr_1fr]">
            <Card className="p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base font-extrabold text-ink dark:text-white">
                    Spending mix
                  </h2>
                  <p className="mt-0.5 text-xs text-muted">By category this month</p>
                </div>
                <CircleDollarSign className="size-5 text-muted" />
              </div>
              <ExpenseDonut data={report?.categories || []} currency={currency} />
            </Card>
            <Card className="p-4 sm:p-5">
              <div className="mb-4">
                <h2 className="font-display text-base font-extrabold text-ink dark:text-white">
                  Income & expenses
                </h2>
                <p className="mt-0.5 text-xs text-muted">Your last six months</p>
              </div>
              <CashflowChart data={trend} currency={currency} />
            </Card>
          </div>
          <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
            <Card className="p-4 sm:p-5">
              <div className="mb-4">
                <h2 className="font-display text-base font-extrabold text-ink dark:text-white">
                  Daily spending
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  A day-by-day view for{' '}
                  {new Date(year, month - 1).toLocaleString('en-IN', { month: 'long' })}
                </p>
              </div>
              <DailySpendingChart data={daily} currency={currency} />
            </Card>
            <Card className="p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base font-extrabold text-ink dark:text-white">
                    Budget progress
                  </h2>
                  <p className="mt-0.5 text-xs text-muted">Keep your plans in view</p>
                </div>
                <Wallet className="size-5 text-muted" />
              </div>
              {budgets.length ? (
                <div className="space-y-5">
                  {budgets.slice(0, 4).map((budget) => (
                    <BudgetProgress
                      key={budget.id}
                      budget={budget}
                      spent={budgetSpend(budget.category)}
                      currency={currency}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No budgets set"
                  message="Create a budget to give your spending a helpful boundary."
                />
              )}
            </Card>
          </div>
          <Card className="mt-5 overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <div>
                <h2 className="font-display text-base font-extrabold text-ink dark:text-white">
                  Recent transactions
                </h2>
                <p className="mt-0.5 text-xs text-muted">The latest activity for this month</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setQuickAddOpen(true)}>
                <Plus className="size-4" />
                <span className="hidden sm:inline">Quick add</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
            {rows.length ? (
              <DataTable
                rows={rows}
                columns={[
                  {
                    key: 'date',
                    label: 'Date',
                    render: (row) => (
                      <span className="whitespace-nowrap text-muted">{formatDate(row.date)}</span>
                    ),
                  },
                  {
                    key: 'description',
                    label: 'Description',
                    render: (row) => <span className="font-semibold">{row.description}</span>,
                  },
                  {
                    key: 'category',
                    label: 'Category',
                    render: (row) => (
                      <span className="rounded-md bg-canvas px-2 py-1 text-xs font-medium dark:bg-slate-800">
                        {row.category}
                      </span>
                    ),
                  },
                  {
                    key: 'amount',
                    label: 'Amount',
                    className: 'text-right',
                    render: (row) => (
                      <span
                        className={`whitespace-nowrap font-bold ${row.type === 'income' ? 'text-forest dark:text-emerald-300' : 'text-ink dark:text-slate-100'}`}
                      >
                        {row.type === 'income' ? '+' : '−'}
                        {money(row.amount, currency)}
                      </span>
                    ),
                  },
                ]}
              />
            ) : (
              <EmptyState
                title="No activity for this month"
                message="Add a transaction to start seeing your cash flow."
                action={
                  <Button size="sm" onClick={() => setQuickAddOpen(true)}>
                    Add transaction
                  </Button>
                }
              />
            )}
          </Card>
        </>
      )}
      <TransactionModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} onSaved={load} />
    </>
  )
}
