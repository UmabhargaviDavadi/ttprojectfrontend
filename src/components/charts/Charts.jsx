import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'
import { CATEGORY_COLORS } from '../../utils/constants'

const axisStyle = { fontSize: 11, fill: '#87948c' }
const gridStroke = '#edf1ed'
const moneyTick = (value) => (value >= 1000 ? `₹${Math.round(value / 1000)}k` : `₹${value}`)

export function ExpenseDonut({ data = [], currency = 'INR' }) {
  if (!data.length)
    return (
      <div className="grid h-[230px] place-items-center text-sm text-muted">
        No expense data for this month
      </div>
    )
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[1fr_1fr]">
      <div className="relative h-[220px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius={64}
              outerRadius={88}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((item, index) => (
                <Cell
                  key={item.category}
                  fill={item.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value, currency)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted">
            Categories
          </span>
          <span className="mt-1 font-display text-xl font-extrabold text-ink dark:text-white">
            {data.length}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {data.slice(0, 5).map((item, index) => (
          <div key={item.category} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-ink dark:text-slate-200">
              <span
                className="size-2.5 shrink-0 rounded-sm"
                style={{
                  backgroundColor: item.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                }}
              />{' '}
              <span className="truncate">{item.category}</span>
            </span>
            <span className="text-xs font-bold text-muted">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CashflowChart({ data = [], currency = 'INR' }) {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barGap={5}>
          <CartesianGrid stroke={gridStroke} vertical={false} />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={moneyTick} tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => formatCurrency(value, currency)}
            contentStyle={{ borderRadius: 8, borderColor: '#e7ece8', fontSize: 12 }}
          />
          <Bar
            dataKey="income"
            name="Income"
            fill="#72b98d"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
          <Bar
            dataKey="expense"
            name="Expenses"
            fill="#e7a948"
            radius={[4, 4, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DailySpendingChart({ data = [], currency = 'INR' }) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 6, bottom: 0, left: -16 }}>
          <CartesianGrid stroke={gridStroke} vertical={false} />
          <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={moneyTick} tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => formatCurrency(value, currency)}
            contentStyle={{ borderRadius: 8, borderColor: '#e7ece8', fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            name="Daily spend"
            stroke="#2f8c6a"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#2f8c6a' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MonthlyTrendChart({ data = [], currency = 'INR' }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -12 }}>
          <CartesianGrid stroke={gridStroke} vertical={false} />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={moneyTick} tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => formatCurrency(value, currency)}
            contentStyle={{ borderRadius: 8, borderColor: '#e7ece8', fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#2f8c6a"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#2f8c6a' }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Expenses"
            stroke="#e7a948"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#e7a948' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CategoryRankChart({ data = [], currency = 'INR' }) {
  return (
    <div className="h-[270px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.slice(0, 5)}
          layout="vertical"
          margin={{ top: 4, right: 20, bottom: 0, left: 4 }}
        >
          <CartesianGrid stroke={gridStroke} horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={moneyTick}
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            width={92}
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => formatCurrency(value, currency)}
            contentStyle={{ borderRadius: 8, borderColor: '#e7ece8', fontSize: 12 }}
          />
          <Bar dataKey="amount" name="Spent" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.slice(0, 5).map((item, index) => (
              <Cell
                key={item.category}
                fill={item.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
