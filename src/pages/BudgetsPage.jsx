import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Pencil, Plus, Trash2, WalletCards } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'
import { createBudget, deleteBudget, getBudgets, updateBudget } from '../api/budgetApi'
import { getTransactions } from '../api/transactionApi'
import { BudgetProgress } from '../components/charts/BudgetProgress'
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  Loader,
  Modal,
  PageHeading,
  Select,
} from '../components/common/UI'
import { EXPENSE_CATEGORIES } from '../utils/constants'
import { formatCurrency } from '../utils/formatCurrency'
import { monthLabel } from '../utils/formatDate'
import { budgetSchema } from '../utils/validators'
import { useAuth } from '../hooks/useAuth'

const currentMonth = () => new Date().toISOString().slice(0, 7)

function BudgetForm({ open, onClose, onSaved, month, budget }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(budgetSchema),
    defaultValues: { category: 'Overall', limit: '' },
  })
  useEffect(() => {
    if (open)
      reset(
        budget
          ? { category: budget.category, limit: String(budget.limit) }
          : { category: 'Overall', limit: '' },
      )
  }, [budget, open, reset])
  const [year, monthNumber] = month.split('-').map(Number)
  const submit = async (values) => {
    const payload = { ...values, limit: Number(values.limit), month: monthNumber, year }
    try {
      if (budget) await updateBudget(budget.id, payload)
      else await createBudget(payload)
      toast.success(budget ? 'Budget updated' : 'Budget created')
      await onSaved()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save this budget')
    }
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={budget ? 'Edit budget' : 'Set a budget'}
      description={`Give ${monthLabel(monthNumber, year)} a spending plan.`}
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Select
          label="Budget for"
          options={['Overall', ...EXPENSE_CATEGORIES]}
          error={errors.category?.message}
          {...register('category')}
        />
        <Input
          label="Monthly limit"
          type="number"
          min="1"
          step="1"
          placeholder="e.g. 30000"
          error={errors.limit?.message}
          {...register('limit')}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {budget ? 'Save budget' : 'Create budget'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export function BudgetsPage() {
  const [month, setMonth] = useState(currentMonth())
  const [budgets, setBudgets] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const { user } = useAuth()
  const currency = user?.currency || 'INR'
  const [year, monthNumber] = month.split('-').map(Number)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const from = `${month}-01`
      const to = `${month}-${String(new Date(year, monthNumber, 0).getDate()).padStart(2, '0')}`
      const [budgetList, transactionPage] = await Promise.all([
        getBudgets({ month: monthNumber, year }),
        getTransactions({ page: 0, size: 250, from, to }),
      ])
      setBudgets(budgetList)
      setTransactions(transactionPage.content || [])
    } catch {
      setError(true)
      toast.error('Could not load budgets')
    } finally {
      setLoading(false)
    }
  }, [month, monthNumber, year])
  useEffect(() => {
    load()
  }, [load])

  const spentFor = (category) =>
    transactions
      .filter(
        (item) => item.type === 'expense' && (category === 'Overall' || item.category === category),
      )
      .reduce((sum, item) => sum + item.amount, 0)
  const removeBudget = async () => {
    try {
      await deleteBudget(deleting.id)
      toast.success('Budget deleted')
      setDeleting(null)
      await load()
    } catch {
      toast.error('Could not delete budget')
    }
  }
  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const alerts = budgets
    .map((budget) => ({
      budget,
      spent: spentFor(budget.category),
      percent: budget.limit ? Math.round((spentFor(budget.category) / budget.limit) * 100) : 0,
    }))
    .filter(({ percent }) => percent >= 80)

  return (
    <>
      <PageHeading
        eyebrow="A little structure goes a long way"
        title="Budgets"
        description="Set a monthly boundary that still leaves room for real life."
        action={
          <div className="flex items-center gap-2">
            <Input
              aria-label="Select budget month"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="w-[160px]"
            />
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              New budget
            </Button>
          </div>
        }
      />
      {alerts.length > 0 && (
        <div className="mb-5 space-y-2">
          {alerts.map(({ budget, percent }) => (
            <div
              key={budget.id}
              role="status"
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${percent >= 100 ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200' : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200'}`}
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p className="text-sm">
                <span className="font-bold">
                  {percent >= 100 ? 'Budget exceeded' : 'Budget getting close'}:
                </span>{' '}
                {budget.category} is at {percent}% of its limit.
              </p>
            </div>
          ))}
        </div>
      )}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Loader rows={4} />
          <Loader rows={4} />
          <Loader rows={4} />
        </div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : budgets.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {budgets.map((budget) => {
            const spent = spentFor(budget.category)
            const remaining = budget.limit - spent
            const percent = budget.limit ? Math.round((spent / budget.limit) * 100) : 0
            return (
              <Card key={budget.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-muted">
                      {budget.category === 'Overall' ? 'Monthly budget' : 'Category budget'}
                    </p>
                    <h2 className="mt-1 font-display text-lg font-extrabold text-ink dark:text-white">
                      {budget.category}
                    </h2>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="grid size-8 place-items-center rounded-md text-muted hover:bg-canvas hover:text-forest dark:hover:bg-slate-800"
                      onClick={() => {
                        setEditing(budget)
                        setModalOpen(true)
                      }}
                      aria-label={`Edit ${budget.category} budget`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      className="grid size-8 place-items-center rounded-md text-muted hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                      onClick={() => setDeleting(budget)}
                      aria-label={`Delete ${budget.category} budget`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-display text-2xl font-extrabold text-ink dark:text-white">
                    {formatCurrency(spent, currency)}
                  </span>
                  <span className="text-xs text-muted">spent</span>
                </div>
                <BudgetProgress budget={budget} spent={spent} currency={currency} />
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs dark:border-slate-800">
                  <span className="text-muted">{percent > 100 ? 'Over by' : 'Remaining'}</span>
                  <span
                    className={`font-bold ${remaining < 0 ? 'text-rose-600' : 'text-ink dark:text-slate-100'}`}
                  >
                    {formatCurrency(Math.abs(remaining), currency)}
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={WalletCards}
            title="A fresh month, a blank page"
            message="Create an overall budget or set limits for the categories that matter to you."
            action={
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Set your first budget
              </Button>
            }
          />
        </Card>
      )}
      <BudgetForm
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        onSaved={load}
        month={month}
        budget={editing}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={removeBudget}
        title="Delete this budget?"
        message={`${deleting?.category || 'This'} budget will be removed.`}
      />
    </>
  )
}
