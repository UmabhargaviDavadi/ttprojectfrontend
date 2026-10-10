export const formatCurrency = (amount, currency = 'INR', options = {}) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
    ...options,
  }).format(Number(amount) || 0)
