import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Leaf, LockKeyhole } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'
import { Button, Input } from '../components/common/UI'
import { useAuth } from '../hooks/useAuth'
import { loginSchema, registerSchema } from '../utils/validators'

export function AuthPage({ mode = 'login' }) {
  const registering = mode === 'register'
  const [showPassword, setShowPassword] = useState(false)
  const { token, login, register: createAccount } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(registering ? registerSchema : loginSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })
  if (token) return <Navigate to="/" replace />
  const onSubmit = async (values) => {
    try {
      await (registering ? createAccount(values) : login(values))
      toast.success(registering ? 'Your account is ready' : 'Welcome back')
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'We couldn’t sign you in. Please try again.')
    }
  }
  return (
    <div className="grid min-h-screen bg-white dark:bg-slate-950 lg:grid-cols-[minmax(380px,0.9fr)_1.1fr]">
      <section className="flex flex-col px-6 py-7 sm:px-12 lg:px-16 lg:py-10">
        <Link to="/" className="flex items-center gap-2.5 self-start">
          <span className="grid size-9 place-items-center rounded-xl bg-forest text-white">
            <Leaf className="size-5" />
          </span>
          <span className="font-display text-lg font-extrabold text-ink dark:text-white">
            mintwise<span className="text-forest">.</span>
          </span>
        </Link>
        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-12">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest">
              Your money, more mindful
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink dark:text-white">
              {registering ? 'Start with a clear view.' : 'Welcome back.'}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              {registering
                ? 'Create your account and give your goals a place to grow.'
                : 'Sign in to see where your money is taking you.'}
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {registering && (
              <Input
                label="Your name"
                autoComplete="name"
                placeholder="Aarav Mehta"
                error={errors.name?.message}
                {...register('name')}
              />
            )}
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={registering ? 'new-password' : 'current-password'}
                placeholder={registering ? 'At least 8 characters' : 'Enter your password'}
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-[38px] rounded p-1 text-muted hover:text-ink"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {registering && (
              <Input
                label="Confirm password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Enter it once more"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
            )}
            <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
              {registering ? 'Create account' : 'Sign in'}
              <ArrowRight className="size-4" />
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            {registering ? 'Already have an account?' : 'New to Mintwise?'}{' '}
            <Link
              to={registering ? '/login' : '/register'}
              className="font-bold text-forest hover:underline"
            >
              {registering ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
          <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <LockKeyhole className="size-3.5" />
            Your financial data stays private.
          </p>
        </div>
      </section>
      <aside className="relative hidden overflow-hidden bg-[#173e35] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(#a7d8b8 0.7px, transparent 0.7px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="relative max-w-lg">
          <span className="inline-flex rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold text-emerald-100">
            A little more clarity, every day
          </span>
          <h2 className="mt-9 font-display text-5xl font-extrabold leading-[1.1]">
            Make your next money move a good one.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-emerald-50/75">
            See what’s coming in, where it’s going, and what you’re building toward.
          </p>
        </div>
        <div className="relative grid max-w-lg grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/15 bg-white/15">
          <div className="bg-[#173e35] p-5">
            <p className="text-xs text-emerald-100/70">MONTHLY SAVINGS</p>
            <p className="mt-2 font-display text-2xl font-bold">₹18,420</p>
            <p className="mt-1 text-xs text-emerald-100/70">A steady step forward</p>
          </div>
          <div className="bg-[#173e35] p-5">
            <p className="text-xs text-emerald-100/70">ACTIVE GOALS</p>
            <p className="mt-2 font-display text-2xl font-bold">03</p>
            <p className="mt-1 text-xs text-emerald-100/70">Plans in motion</p>
          </div>
        </div>
        <p className="relative text-xs text-emerald-100/60">
          Thoughtful tools for everyday finances.
        </p>
      </aside>
    </div>
  )
}
