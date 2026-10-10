const STORAGE_KEY = 'finance_mock_state_v1'
const expenseCategories = [
  'Food',
  'Travel',
  'Entertainment',
  'Bills',
  'Shopping',
  'Health',
  'Education',
  'Other',
]
const incomeCategories = ['Salary', 'Allowance', 'Freelance', 'Investment', 'Other']
const palette = [
  '#2f8c6a',
  '#72b98d',
  '#e7a948',
  '#6689a2',
  '#d7795e',
  '#9c7dba',
  '#75aab0',
  '#87948c',
]

const dateOffset = (days) => {
  const value = new Date()
  value.setDate(value.getDate() - days)
  return value.toISOString().slice(0, 10)
}

const initialState = () => ({
  user: { id: 1, name: 'Aarav Mehta', email: 'aarav@example.com', currency: 'INR' },
  transactions: [
    {
      id: 101,
      date: dateOffset(0),
      description: 'Monthly salary',
      category: 'Salary',
      type: 'income',
      amount: 52000,
      paymentMethod: 'Bank transfer',
    },
    {
      id: 102,
      date: dateOffset(1),
      description: 'Groceries at Nature Basket',
      category: 'Food',
      type: 'expense',
      amount: 1280,
      paymentMethod: 'UPI',
    },
    {
      id: 103,
      date: dateOffset(2),
      description: 'Metro card recharge',
      category: 'Travel',
      type: 'expense',
      amount: 600,
      paymentMethod: 'UPI',
    },
    {
      id: 104,
      date: dateOffset(3),
      description: 'Electricity bill',
      category: 'Bills',
      type: 'expense',
      amount: 1840,
      paymentMethod: 'UPI',
    },
    {
      id: 105,
      date: dateOffset(4),
      description: 'Weekend brunch',
      category: 'Food',
      type: 'expense',
      amount: 940,
      paymentMethod: 'Card',
    },
    {
      id: 106,
      date: dateOffset(6),
      description: 'Freelance design project',
      category: 'Freelance',
      type: 'income',
      amount: 8500,
      paymentMethod: 'Bank transfer',
    },
    {
      id: 107,
      date: dateOffset(7),
      description: 'Netflix subscription',
      category: 'Entertainment',
      type: 'expense',
      amount: 649,
      paymentMethod: 'Card',
    },
    {
      id: 108,
      date: dateOffset(9),
      description: 'Pharmacy',
      category: 'Health',
      type: 'expense',
      amount: 420,
      paymentMethod: 'UPI',
    },
    {
      id: 109,
      date: dateOffset(12),
      description: 'New running shoes',
      category: 'Shopping',
      type: 'expense',
      amount: 2899,
      paymentMethod: 'Card',
    },
    {
      id: 110,
      date: dateOffset(15),
      description: 'Online course',
      category: 'Education',
      type: 'expense',
      amount: 1499,
      paymentMethod: 'UPI',
    },
    {
      id: 111,
      date: dateOffset(18),
      description: 'Auto ride',
      category: 'Travel',
      type: 'expense',
      amount: 275,
      paymentMethod: 'Cash',
    },
    {
      id: 112,
      date: dateOffset(22),
      description: 'Dinner with friends',
      category: 'Food',
      type: 'expense',
      amount: 1650,
      paymentMethod: 'UPI',
    },
  ],
  budgets: [
    {
      id: 1,
      category: 'Overall',
      limit: 30000,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
    {
      id: 2,
      category: 'Food',
      limit: 8000,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
    {
      id: 3,
      category: 'Travel',
      limit: 4000,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
    {
      id: 4,
      category: 'Entertainment',
      limit: 2500,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
    {
      id: 5,
      category: 'Shopping',
      limit: 5000,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
  ],
  goals: [
    {
      id: 1,
      name: 'Emergency cushion',
      targetAmount: 100000,
      currentAmount: 42000,
      deadline: dateOffset(-150),
    },
    {
      id: 2,
      name: 'New laptop',
      targetAmount: 75000,
      currentAmount: 28500,
      deadline: dateOffset(-240),
    },
  ],
  notifications: [
    {
      id: 1,
      title: 'Food budget is getting close',
      message: 'You have used 61% of this month’s food budget.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      severity: 'warning',
    },
    {
      id: 2,
      title: 'A little room to save',
      message: 'Your spending is lower than last month so far.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      read: false,
      severity: 'positive',
    },
    {
      id: 3,
      title: 'Budget updated',
      message: 'Your monthly budget is ready for a fresh start.',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      read: true,
      severity: 'info',
    },
  ],
})

const loadState = () => {
  try {
    return { ...initialState(), ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  } catch {
    return initialState()
  }
}

let state = loadState()
const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
const clone = (value) => JSON.parse(JSON.stringify(value))
const monthFor = (date) => {
  const parsed = new Date(`${date}T00:00:00`)
  return { month: parsed.getMonth() + 1, year: parsed.getFullYear() }
}
const matchesMonth = (entry, month, year) => {
  const key = monthFor(entry.date)
  return key.month === Number(month) && key.year === Number(year)
}

function makeReport(month = new Date().getMonth() + 1, year = new Date().getFullYear()) {
  const monthItems = state.transactions.filter((item) => matchesMonth(item, month, year))
  const income = monthItems
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0)
  const expenses = monthItems.filter((item) => item.type === 'expense')
  const expense = expenses.reduce((sum, item) => sum + item.amount, 0)
  const categories = expenseCategories
    .map((category, index) => {
      const amount = expenses
        .filter((item) => item.category === category)
        .reduce((sum, item) => sum + item.amount, 0)
      return {
        category,
        amount,
        percentage: expense ? Math.round((amount / expense) * 100) : 0,
        color: palette[index],
      }
    })
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount)
  return {
    month: Number(month),
    year: Number(year),
    income,
    expense,
    balance: income - expense,
    savingsRate: income ? Math.max(0, Math.round(((income - expense) / income) * 100)) : 0,
    categories,
    comparison: { incomeChange: 8.4, expenseChange: -4.2 },
  }
}

function makeTrend() {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - index))
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    const report = makeReport(month, year)
    const income = report.income || [48500, 51000, 49200, 53000, 50500, 52000][index]
    const expense = report.expense || [31200, 29400, 33700, 30100, 28600, 26800][index]
    return {
      month: date.toLocaleString('en-IN', { month: 'short' }),
      monthNumber: month,
      year,
      income,
      expense,
    }
  })
}

export async function mockRequest(method, rawUrl, { params = {}, data = {} } = {}) {
  await new Promise((resolve) => setTimeout(resolve, 220))
  const url = rawUrl.replace(/^\//, '').split('?')[0]
  const verb = method.toLowerCase()

  if (url === 'auth/login' || url === 'auth/register') {
    state.user = {
      ...state.user,
      ...(data.name ? { name: data.name } : {}),
      ...(data.email ? { email: data.email } : {}),
    }
    persist()
    return { token: 'mock-jwt-token', user: clone(state.user) }
  }
  if (url === 'users/profile' && verb === 'get') return clone(state.user)
  if (url === 'users/profile' && verb === 'put') {
    if (data.newPassword) return clone(state.user)
    state.user = { ...state.user, ...data }
    persist()
    return clone(state.user)
  }
  if (url === 'transactions' && verb === 'get') {
    const {
      page = 0,
      size = 10,
      category,
      type,
      from,
      to,
      search,
      month,
      year,
      minAmount,
      maxAmount,
      sort,
    } = params
    let rows = [...state.transactions]
    if (category) rows = rows.filter((item) => item.category === category)
    if (type) rows = rows.filter((item) => item.type === type)
    if (from) rows = rows.filter((item) => item.date >= from)
    if (to) rows = rows.filter((item) => item.date <= to)
    if (minAmount !== undefined && minAmount !== '')
      rows = rows.filter((item) => item.amount >= Number(minAmount))
    if (maxAmount !== undefined && maxAmount !== '')
      rows = rows.filter((item) => item.amount <= Number(maxAmount))
    if (month && year) rows = rows.filter((item) => matchesMonth(item, month, year))
    if (search)
      rows = rows.filter((item) =>
        `${item.description} ${item.category}`.toLowerCase().includes(String(search).toLowerCase()),
      )
    const [sortField = 'date', sortDirection = 'desc'] = String(sort || 'date,desc').split(',')
    rows.sort((a, b) => {
      const comparison =
        sortField === 'amount'
          ? a.amount - b.amount
          : String(a[sortField] || '').localeCompare(String(b[sortField] || ''))
      return sortDirection === 'asc' ? comparison : -comparison
    })
    const start = Number(page) * Number(size)
    return {
      content: clone(rows.slice(start, start + Number(size))),
      totalElements: rows.length,
      totalPages: Math.ceil(rows.length / Number(size)),
      page: Number(page),
      size: Number(size),
    }
  }
  if (url === 'transactions' && verb === 'post') {
    const item = { id: Date.now(), ...data, amount: Number(data.amount) }
    state.transactions.unshift(item)
    persist()
    return clone(item)
  }
  if (url.startsWith('transactions/')) {
    const id = Number(url.split('/')[1])
    if (verb === 'put') {
      state.transactions = state.transactions.map((item) =>
        item.id === id ? { ...item, ...data, amount: Number(data.amount) } : item,
      )
      persist()
      return clone(state.transactions.find((item) => item.id === id))
    }
    if (verb === 'delete') {
      state.transactions = state.transactions.filter((item) => item.id !== id)
      persist()
      return { success: true }
    }
  }
  if (url === 'budgets' && verb === 'get')
    return clone(
      state.budgets.filter(
        (item) =>
          (!params.month || item.month === Number(params.month)) &&
          (!params.year || item.year === Number(params.year)),
      ),
    )
  if (url === 'budgets' && verb === 'post') {
    const item = {
      id: Date.now(),
      ...data,
      limit: Number(data.limit),
      month: Number(data.month),
      year: Number(data.year),
    }
    state.budgets.push(item)
    persist()
    return clone(item)
  }
  if (url.startsWith('budgets/')) {
    const id = Number(url.split('/')[1])
    if (verb === 'put') {
      state.budgets = state.budgets.map((item) =>
        item.id === id ? { ...item, ...data, limit: Number(data.limit) } : item,
      )
      persist()
      return clone(state.budgets.find((item) => item.id === id))
    }
    if (verb === 'delete') {
      state.budgets = state.budgets.filter((item) => item.id !== id)
      persist()
      return { success: true }
    }
  }
  if (url === 'reports/monthly') return makeReport(params.month, params.year)
  if (url === 'reports/category-summary')
    return { items: makeReport(params.month, params.year).categories }
  if (url === 'reports/trend') return { items: makeTrend() }
  if (url === 'suggestions/savings')
    return {
      items: [
        {
          id: 1,
          title: 'Give your food budget a weekly rhythm',
          description:
            'Set a simple weekly cap for eating out and leave room for one planned treat.',
          impact: 'Save around ₹1,200 / month',
          category: 'Spending habit',
        },
        {
          id: 2,
          title: 'Automate your first transfer',
          description:
            'Move a small amount to savings on payday, before the rest of your month begins.',
          impact: 'Build consistency',
          category: 'Save first',
        },
        {
          id: 3,
          title: 'Review recurring subscriptions',
          description:
            'Check the services you used this month and pause anything that no longer earns its place.',
          impact: 'Find easy wins',
          category: 'Monthly check-in',
        },
      ],
    }
  if (url === 'suggestions/investments')
    return {
      items: [
        {
          id: 1,
          title: 'Emergency fund',
          description:
            'Keep 3–6 months of essential expenses accessible in a savings account or liquid option.',
          riskLevel: 'Low',
          horizon: 'Immediate priority',
        },
        {
          id: 2,
          title: 'SIP in diversified mutual funds',
          description:
            'Consider learning about broad, diversified funds for long-term goals and invest only after reviewing risk.',
          riskLevel: 'Moderate',
          horizon: '5+ years',
        },
        {
          id: 3,
          title: 'Fixed deposit',
          description:
            'A fixed deposit may suit a known near-term goal where predictable returns matter more than growth.',
          riskLevel: 'Low',
          horizon: '1–3 years',
        },
        {
          id: 4,
          title: 'PPF',
          description:
            'Explore PPF for long-term, tax-aware saving and understand its lock-in and withdrawal rules first.',
          riskLevel: 'Low',
          horizon: '15 years',
        },
      ],
    }
  if (url === 'goals' && verb === 'get') return clone(state.goals)
  if (url === 'goals' && verb === 'post') {
    const goal = {
      id: Date.now(),
      currentAmount: 0,
      ...data,
      targetAmount: Number(data.targetAmount),
    }
    state.goals.push(goal)
    persist()
    return clone(goal)
  }
  if (url.startsWith('goals/')) {
    const id = Number(url.split('/')[1])
    if (verb === 'put') {
      state.goals = state.goals.map((goal) => (goal.id === id ? { ...goal, ...data } : goal))
      persist()
      return clone(state.goals.find((goal) => goal.id === id))
    }
    if (verb === 'delete') {
      state.goals = state.goals.filter((goal) => goal.id !== id)
      persist()
      return { success: true }
    }
  }
  if (url === 'notifications' && verb === 'get') return clone(state.notifications)
  if (url.endsWith('/read') && verb === 'put') {
    const id = Number(url.split('/')[1])
    state.notifications = state.notifications.map((item) =>
      item.id === id ? { ...item, read: true } : item,
    )
    persist()
    return clone(state.notifications.find((item) => item.id === id))
  }
  throw new Error(`Mock endpoint not implemented: ${verb.toUpperCase()} /${url}`)
}

export { expenseCategories, incomeCategories }
