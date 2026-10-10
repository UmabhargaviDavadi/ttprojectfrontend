# Mintwise

A responsive personal finance and investment tracker for students and young professionals. Track cash flow, organize transactions, set budgets, review spending patterns, and keep savings goals visible.

## Setup

Requirements: Node.js 18 or newer and npm.

```bash
npm install
copy .env.example .env
npm run dev
```

On Windows PowerShell systems where script execution blocks `npm.ps1`, use `npm.cmd install`, `npm.cmd run dev`, and `npm.cmd run build`.

The Vite dev server prints its local URL (normally `http://localhost:5173`). Create a production build with `npm run build`; preview it with `npm run preview`. Run static checks with `npm run lint` and format with `npm run format`.

## Environment

| Variable            | Default                     | Purpose                                                                                  |
| ------------------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Spring Boot API base URL                                                                 |
| `VITE_USE_MOCK`     | `true` in `.env.example`    | Use persistent browser mock data when exactly `true`; set to `false` to use the real API |

For real API development, set `VITE_USE_MOCK=false` and ensure the Spring API allows the Vite origin through CORS. The JWT is stored in local storage and attached as a Bearer token. A `401` clears the local session and routes to sign-in. Mock changes are stored under `finance_mock_state_v1` in local storage; clear that key to reset demo data. Any email/password pair works in mock mode.

## Features

- Register and sign in with inline validation
- Monthly overview with cash-flow, category, daily-spend, and budget visuals
- Transaction search, filters, sort, pagination, category suggestions, edit, and delete
- Monthly overall and category budgets with warning thresholds
- Monthly reports with CSV export and print view
- Saving ideas, basic investment guidance, and savings goals
- Budget notifications, profile editing, currency selection, and dark theme
- Responsive sidebar, loading/empty/error states, keyboard-accessible dialogs, and toast feedback

## Project structure

```text
src/
  api/          axiosInstance, resource API modules, mockData
  components/   common controls, charts, forms, layout
  context/      AuthContext, ThemeContext
  hooks/        useAuth, useTheme, useFetch, useDebounce
  pages/        authentication, overview, transactions, budgets, reports, plan, settings
  routes/       ProtectedRoute
  utils/        currency/date formatting, constants, validation schemas
  App.jsx
  main.jsx
  index.css
```

The endpoint paths, query parameters, request models, and response shapes expected by both the mock layer and Spring Boot are documented in [API_CONTRACT.md](API_CONTRACT.md).
