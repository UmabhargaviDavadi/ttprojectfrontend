import { forwardRef, useEffect, useId, useRef } from 'react'
import { AlertCircle, ArrowLeft, ArrowRight, Check, LoaderCircle, X } from 'lucide-react'

const styles = {
  primary: 'bg-forest text-white hover:bg-[#125640] focus-visible:ring-forest',
  secondary:
    'border border-line bg-white text-ink hover:bg-canvas dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
  ghost: 'text-muted hover:bg-canvas hover:text-ink dark:hover:bg-slate-800 dark:hover:text-white',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${size === 'sm' ? 'min-h-9 px-3 text-sm' : size === 'icon' ? 'size-10 p-0' : 'min-h-11 px-4 text-sm'} ${styles[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : children}
    </button>
  )
}

export const Input = forwardRef(function Input(
  { label, error, hint, className = '', id, ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id || generatedId
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-semibold text-ink dark:text-slate-200"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`min-h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-forest focus:ring-2 focus:ring-forest/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${error ? 'border-rose-400' : 'border-line'} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
    </div>
  )
})

export const Select = forwardRef(function Select(
  { label, error, options = [], className = '', id, ...props },
  ref,
) {
  const generatedId = useId()
  const selectId = id || generatedId
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-semibold text-ink dark:text-slate-200"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`min-h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${error ? 'border-rose-400' : 'border-line'} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {options.map((option) =>
          typeof option === 'string' ? (
            <option key={option} value={option}>
              {option}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ),
        )}
      </select>
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  )
})

export function Card({ children, className = '', ...props }) {
  return (
    <section
      className={`rounded-xl border border-line bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900 ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}

export function Modal({ open, onClose, title, description, children, size = 'md' }) {
  const dialogRef = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    dialogRef.current?.focus()
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl outline-none dark:bg-slate-900 sm:rounded-xl sm:p-6 ${size === 'lg' ? 'max-w-2xl' : 'max-w-lg'}`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id="modal-title"
              className="font-display text-xl font-extrabold text-ink dark:text-white"
            >
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest dark:hover:bg-slate-800"
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Delete this item?',
  message = 'This action cannot be undone.',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={message}>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          Delete
        </Button>
      </div>
    </Modal>
  )
}

export function Loader({ rows = 3, className = '' }) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`} aria-label="Loading" role="status">
      <span className="sr-only">Loading content</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800" />
      ))}
    </div>
  )
}

export function EmptyState({ icon: Icon = Check, title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-5 py-9 text-center">
      <div className="mb-3 grid size-11 place-items-center rounded-full bg-mint text-forest dark:bg-emerald-950 dark:text-emerald-300">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h3 className="font-display text-base font-bold text-ink dark:text-white">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-muted">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({ onRetry, message = 'We couldn’t load this just now.' }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center text-center">
      <AlertCircle className="size-6 text-rose-500" />
      <p className="mt-2 text-sm text-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  return (
    <nav
      className="flex items-center justify-between border-t border-line px-4 py-3 dark:border-slate-800"
      aria-label="Pagination"
    >
      <span className="text-xs text-muted">
        Page {page + 1} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          aria-label="Previous page"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page + 1 >= totalPages}
          aria-label="Next page"
        >
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </nav>
  )
}

export function DataTable({
  columns,
  rows,
  emptyTitle = 'No results',
  emptyMessage = 'Try adjusting your filters.',
}) {
  if (!rows.length) return <EmptyState title={emptyTitle} message={emptyMessage} />
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wider text-muted dark:border-slate-800">
            {columns.map((column) => (
              <th key={column.key} className={`px-5 py-3 ${column.className || ''}`}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line dark:divide-slate-800">
          {rows.map((row) => (
            <tr key={row.id} className="text-ink dark:text-slate-100">
              {columns.map((column) => (
                <td key={column.key} className={`px-5 py-3.5 ${column.className || ''}`}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-forest">{eyebrow}</p>
        )}
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink dark:text-white sm:text-[28px]">
          {title}
        </h1>
        {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
