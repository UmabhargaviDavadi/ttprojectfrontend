import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDownUp, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { deleteTransaction, getTransactions } from '../api/transactionApi'
import {
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  Input,
  Loader,
  PageHeading,
  Pagination,
  Select,
} from '../components/common/UI'
import { TransactionModal } from '../components/forms/TransactionModal'
import { useDebounce } from '../hooks/useDebounce'
import { useAuth } from '../hooks/useAuth'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/constants'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'

const PAGE_SIZE = 10

export function TransactionsPage() {
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 })
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
    from: '',
    to: '',
    minAmount: '',
    maxAmount: '',
  })
  const [sortBy, setSortBy] = useState('date-desc')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const search = useDebounce(filters.search, 300)
  const { user } = useAuth()
  const currency = user?.currency || 'INR'

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [sortField, sortDirection] = sortBy.split('-')
      const response = await getTransactions({
        page,
        size: PAGE_SIZE,
        category: filters.category || undefined,
        type: filters.type || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        minAmount: filters.minAmount || undefined,
        maxAmount: filters.maxAmount || undefined,
        sort: `${sortField},${sortDirection}`,
        search: search || undefined,
      })
      setData(response)
    } catch {
      setError(true)
      toast.error('Could not load transactions')
    } finally {
      setLoading(false)
    }
  }, [
    filters.category,
    filters.from,
    filters.maxAmount,
    filters.minAmount,
    filters.to,
    filters.type,
    page,
    search,
    sortBy,
  ])

  useEffect(() => {
    load()
  }, [load])
  useEffect(() => {
    setPage(0)
  }, [
    filters.category,
    filters.from,
    filters.maxAmount,
    filters.minAmount,
    filters.to,
    filters.type,
    search,
    sortBy,
  ])
  useEffect(() => {
    const openForm = () => {
      setEditing(null)
      setModalOpen(true)
    }
    window.addEventListener('finance:quick-add', openForm)
    return () => window.removeEventListener('finance:quick-add', openForm)
  }, [])

  const rows = useMemo(() => {
    const min = filters.minAmount === '' ? -Infinity : Number(filters.minAmount)
    const max = filters.maxAmount === '' ? Infinity : Number(filters.maxAmount)
    return [...(data.content || [])]
      .filter((row) => row.amount >= min && row.amount <= max)
      .sort((a, b) => {
        if (sortBy === 'date-asc') return a.date.localeCompare(b.date)
        if (sortBy === 'amount-desc') return b.amount - a.amount
        if (sortBy === 'amount-asc') return a.amount - b.amount
        if (sortBy === 'description-asc') return a.description.localeCompare(b.description)
        return b.date.localeCompare(a.date)
      })
  }, [data.content, filters.maxAmount, filters.minAmount, sortBy])

  const updateFilter = (key) => (event) =>
    setFilters((current) => ({ ...current, [key]: event.target.value }))
  const startEdit = (transaction) => {
    setEditing(transaction)
    setModalOpen(true)
  }
  const confirmDelete = async () => {
    try {
      await deleteTransaction(deleting.id)
      toast.success('Transaction deleted')
      setDeleting(null)
      await load()
    } catch {
      toast.error('Could not delete this transaction')
    }
  }
  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const categoryOptions = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])].sort()

  return (
    <>
      <PageHeading
        eyebrow="Your activity"
        title="Transactions"
        description="Every inflow and outflow, in one tidy ledger."
        action={
          <Button onClick={openNew}>
            <Plus className="size-4" />
            Add transaction
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="space-y-3 border-b border-line p-4 dark:border-slate-800 sm:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              aria-label="Search transactions"
              placeholder="Search description or category"
              value={filters.search}
              onChange={updateFilter('search')}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-7">
            <Select
              aria-label="Filter by type"
              value={filters.type}
              onChange={(event) => {
                updateFilter('type')(event)
                setFilters((current) => ({ ...current, category: '' }))
              }}
              options={[
                { value: '', label: 'All types' },
                { value: 'expense', label: 'Expenses' },
                { value: 'income', label: 'Income' },
              ]}
            />
            <Select
              aria-label="Filter by category"
              value={filters.category}
              onChange={updateFilter('category')}
              options={[{ value: '', label: 'All categories' }, ...categoryOptions]}
            />
            <Input
              aria-label="From date"
              type="date"
              value={filters.from}
              onChange={updateFilter('from')}
            />
            <Input
              aria-label="To date"
              type="date"
              value={filters.to}
              onChange={updateFilter('to')}
            />
            <Input
              aria-label="Minimum amount"
              type="number"
              min="0"
              placeholder="Min ₹"
              value={filters.minAmount}
              onChange={updateFilter('minAmount')}
            />
            <Input
              aria-label="Maximum amount"
              type="number"
              min="0"
              placeholder="Max ₹"
              value={filters.maxAmount}
              onChange={updateFilter('maxAmount')}
            />
            <Select
              aria-label="Sort transactions"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              options={[
                { value: 'date-desc', label: 'Newest first' },
                { value: 'date-asc', label: 'Oldest first' },
                { value: 'amount-desc', label: 'Amount: high' },
                { value: 'amount-asc', label: 'Amount: low' },
                { value: 'description-asc', label: 'Description A–Z' },
              ]}
            />
          </div>
        </div>
        {loading ? (
          <div className="p-5">
            <Loader rows={6} />
          </div>
        ) : error ? (
          <ErrorState onRetry={load} />
        ) : (
          <>
            <div className="flex items-center gap-2 px-5 pt-4 text-xs text-muted">
              <ArrowDownUp className="size-3.5" />
              {data.totalElements} transactions
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
                      <span className="rounded-md bg-canvas px-2 py-1 text-xs font-semibold dark:bg-slate-800">
                        {row.category}
                      </span>
                    ),
                  },
                  {
                    key: 'type',
                    label: 'Type',
                    render: (row) => (
                      <span
                        className={`text-xs font-bold capitalize ${row.type === 'income' ? 'text-forest dark:text-emerald-300' : 'text-muted'}`}
                      >
                        {row.type}
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
                        {formatCurrency(row.amount, currency)}
                      </span>
                    ),
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    className: 'text-right',
                    render: (row) => (
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="grid size-8 place-items-center rounded-md text-muted hover:bg-canvas hover:text-forest dark:hover:bg-slate-800"
                          onClick={() => startEdit(row)}
                          aria-label={`Edit ${row.description}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          className="grid size-8 place-items-center rounded-md text-muted hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                          onClick={() => setDeleting(row)}
                          aria-label={`Delete ${row.description}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ),
                  },
                ]}
              />
            ) : (
              <EmptyState
                title="No matching transactions"
                message="Try widening your filters, or add a new transaction."
                action={
                  <Button size="sm" onClick={openNew}>
                    <Plus className="size-4" />
                    Add transaction
                  </Button>
                }
              />
            )}
            <Pagination page={page} totalPages={data.totalPages || 0} onPageChange={setPage} />
          </>
        )}
      </Card>
      <TransactionModal
        open={modalOpen}
        transaction={editing}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        onSaved={load}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete this transaction?"
        message={`“${deleting?.description || 'This transaction'}” will be removed permanently.`}
      />
    </>
  )
}
