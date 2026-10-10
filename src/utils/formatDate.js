export const formatDate = (date, options = {}) => {
  if (!date) return '—'
  const value = new Date(`${String(date).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(value.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(value)
}

export const monthLabel = (month, year) =>
  new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  )
