import {
  LayoutDashboard,
  ArrowLeftRight,
  WalletCards,
  ChartNoAxesCombined,
  Lightbulb,
} from 'lucide-react'

export const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Entertainment',
  'Bills',
  'Shopping',
  'Health',
  'Education',
  'Other',
]
export const INCOME_CATEGORIES = ['Salary', 'Allowance', 'Freelance', 'Investment', 'Other']
export const CATEGORY_COLORS = [
  '#2f8c6a',
  '#72b98d',
  '#e7a948',
  '#6689a2',
  '#d7795e',
  '#9c7dba',
  '#75aab0',
  '#87948c',
]
export const NAV_ITEMS = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { label: 'Budgets', path: '/budgets', icon: WalletCards },
  { label: 'Reports', path: '/reports', icon: ChartNoAxesCombined },
  { label: 'Your plan', path: '/plan', icon: Lightbulb },
]
