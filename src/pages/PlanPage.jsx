import { useCallback, useEffect, useState } from 'react'
import {
  ArrowUpRight,
  CalendarClock,
  Lightbulb,
  Pencil,
  Plus,
  ShieldCheck,
  Target,
  Trash2,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'
import { createGoal, deleteGoal, getGoals, updateGoal } from '../api/goalApi'
import { getInvestmentSuggestions, getSavingsSuggestions } from '../api/suggestionApi'
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
} from '../components/common/UI'
import { useAuth } from '../hooks/useAuth'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { goalSchema } from '../utils/validators'

function GoalModal({ open, onClose, onSaved, goal }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(goalSchema),
    defaultValues: { name: '', targetAmount: '', currentAmount: 0, deadline: '' },
  })
  useEffect(() => {
    if (open)
      reset(
        goal
          ? {
              ...goal,
              targetAmount: String(goal.targetAmount),
              currentAmount: String(goal.currentAmount || 0),
            }
          : { name: '', targetAmount: '', currentAmount: 0, deadline: '' },
      )
  }, [goal, open, reset])
  const submit = async (values) => {
    const payload = {
      ...values,
      targetAmount: Number(values.targetAmount),
      currentAmount: Math.max(0, Number(values.currentAmount) || 0),
    }
    try {
      if (goal) await updateGoal(goal.id, payload)
      else await createGoal(payload)
      toast.success(goal ? 'Goal updated' : 'Goal created')
      await onSaved()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save this goal')
    }
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={goal ? 'Update your goal' : 'Create a savings goal'}
      description="Give something you care about a number and a date."
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        <Input
          label="Goal name"
          placeholder="e.g. Emergency cushion"
          error={errors.name?.message}
          {...register('name')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Target amount"
            type="number"
            min="1"
            step="1"
            placeholder="50000"
            error={errors.targetAmount?.message}
            {...register('targetAmount')}
          />
          <Input
            label="Saved so far"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            {...register('currentAmount')}
          />
        </div>
        <Input
          label="Target date"
          type="date"
          error={errors.deadline?.message}
          {...register('deadline')}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {goal ? 'Save changes' : 'Create goal'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export function PlanPage() {
  const [savings, setSavings] = useState([])
  const [investments, setInvestments] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [goalOpen, setGoalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const { user } = useAuth()
  const currency = user?.currency || 'INR'
  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [savingsData, investmentData, goalData] = await Promise.all([
        getSavingsSuggestions(),
        getInvestmentSuggestions(),
        getGoals(),
      ])
      setSavings(savingsData.items || [])
      setInvestments(investmentData.items || [])
      setGoals(goalData)
    } catch {
      setError(true)
      toast.error('Could not load your plan')
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    load()
  }, [load])
  const removeGoal = async () => {
    try {
      await deleteGoal(deleting.id)
      toast.success('Goal removed')
      setDeleting(null)
      await load()
    } catch {
      toast.error('Could not remove this goal')
    }
  }
  const openCreate = () => {
    setEditing(null)
    setGoalOpen(true)
  }
  const riskClasses = {
    Low: 'bg-mint text-forest dark:bg-emerald-950 dark:text-emerald-300',
    Moderate: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    High: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  }

  return (
    <>
      <PageHeading
        eyebrow="Small steps, bigger plans"
        title="Savings & investing"
        description="Practical ideas for building a little more room over time."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            New savings goal
          </Button>
        }
      />
      <div className="mb-5 flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sky-900 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-100">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        <p className="text-sm">
          <span className="font-bold">Please keep in mind:</span> General guidance only, not
          financial advice.
        </p>
      </div>
      {loading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Loader rows={5} />
          <Loader rows={5} />
          <Loader rows={4} />
        </div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : (
        <>
          <section aria-labelledby="savings-title">
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb className="size-4 text-forest" />
              <h2
                id="savings-title"
                className="font-display text-lg font-extrabold text-ink dark:text-white"
              >
                Saving ideas
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {savings.map((item) => (
                <Card key={item.id} className="p-5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest">
                    {item.category}
                  </span>
                  <h3 className="mt-2 font-display text-base font-extrabold text-ink dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3 dark:border-slate-800">
                    <span className="text-xs font-semibold text-forest dark:text-emerald-300">
                      {item.impact}
                    </span>
                    <ArrowUpRight className="size-4 text-muted" />
                  </div>
                </Card>
              ))}
            </div>
          </section>
          <section className="mt-8" aria-labelledby="investment-title">
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="size-4 text-forest" />
              <h2
                id="investment-title"
                className="font-display text-lg font-extrabold text-ink dark:text-white"
              >
                Investment basics
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {investments.map((item) => (
                <Card key={item.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-base font-extrabold text-ink dark:text-white">
                      {item.title}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${riskClasses[item.riskLevel] || riskClasses.Low}`}
                    >
                      {item.riskLevel} risk
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-muted">
                    <CalendarClock className="size-3.5" />
                    {item.horizon}
                  </div>
                </Card>
              ))}
            </div>
          </section>
          <section className="mt-8" aria-labelledby="goals-title">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Target className="size-4 text-forest" />
                  <h2
                    id="goals-title"
                    className="font-display text-lg font-extrabold text-ink dark:text-white"
                  >
                    Savings goals
                  </h2>
                </div>
                <p className="mt-1 text-xs text-muted">Your progress, one milestone at a time.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={openCreate}>
                <Plus className="size-4" />
                Add goal
              </Button>
            </div>
            {goals.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {goals.map((goal) => {
                  const percent = goal.targetAmount
                    ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                    : 0
                  return (
                    <Card key={goal.id} className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-display text-base font-extrabold text-ink dark:text-white">
                            {goal.name}
                          </h3>
                          <p className="mt-1 text-xs text-muted">
                            Target date · {formatDate(goal.deadline)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="grid size-8 place-items-center rounded-md text-muted hover:bg-canvas hover:text-forest dark:hover:bg-slate-800"
                            onClick={() => {
                              setEditing(goal)
                              setGoalOpen(true)
                            }}
                            aria-label={`Edit ${goal.name}`}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            className="grid size-8 place-items-center rounded-md text-muted hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                            onClick={() => setDeleting(goal)}
                            aria-label={`Delete ${goal.name}`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-5 flex items-baseline justify-between gap-2">
                        <span className="font-display text-xl font-extrabold text-ink dark:text-white">
                          {formatCurrency(goal.currentAmount, currency)}
                        </span>
                        <span className="text-xs text-muted">
                          of {formatCurrency(goal.targetAmount, currency)}
                        </span>
                      </div>
                      <div
                        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                        role="progressbar"
                        aria-label={`${goal.name} progress`}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-valuenow={percent}
                      >
                        <div
                          className="h-full rounded-full bg-forest transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-right text-xs font-bold text-forest dark:text-emerald-300">
                        {percent}%
                      </p>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <EmptyState
                  icon={Target}
                  title="Give a goal a name"
                  message="Track your next big or small milestone here."
                  action={<Button onClick={openCreate}>Create a goal</Button>}
                />
              </Card>
            )}
          </section>
        </>
      )}
      <GoalModal
        open={goalOpen}
        onClose={() => {
          setGoalOpen(false)
          setEditing(null)
        }}
        onSaved={load}
        goal={editing}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={removeGoal}
        title="Remove this goal?"
        message={`${deleting?.name || 'This goal'} and its progress will be removed.`}
      />
    </>
  )
}
