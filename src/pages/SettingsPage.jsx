import { useCallback, useEffect, useState } from 'react'
import { Check, Moon, Sun, UserRound, Wallet } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { getProfile, updateProfile } from '../api/profileApi'
import {
  Button,
  Card,
  ErrorState,
  Input,
  Loader,
  PageHeading,
  Select,
} from '../components/common/UI'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

export function SettingsPage() {
  const { updateUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [profile, setProfile] = useState({ name: '', email: '', currency: 'INR' })
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm()
  const {
    register: registerPassword,
    handleSubmit: submitPassword,
    reset: resetPassword,
    formState: { isSubmitting: passwordLoading, errors: passwordErrors },
  } = useForm()
  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const result = await getProfile()
      setProfile(result)
      reset(result)
    } catch {
      setLoadError(true)
      toast.error('Could not load your settings')
    } finally {
      setLoading(false)
    }
  }, [reset])
  useEffect(() => {
    load()
  }, [load])

  const saveProfile = async (values) => {
    try {
      const result = await updateProfile({
        name: values.name,
        email: values.email,
        currency: values.currency,
      })
      setProfile(result)
      updateUser(result)
      toast.success('Profile updated')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update your profile')
    }
  }
  const changePassword = async (values) => {
    try {
      await updateProfile({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success('Password changed')
      resetPassword()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not change your password')
    }
  }

  if (loading)
    return (
      <>
        <PageHeading
          eyebrow="Make it yours"
          title="Profile & settings"
          description="Update your details and how Mintwise looks."
        />
        <Loader rows={5} />
      </>
    )
  if (loadError)
    return (
      <>
        <PageHeading eyebrow="Make it yours" title="Profile & settings" />
        <ErrorState onRetry={load} />
      </>
    )
  return (
    <>
      <PageHeading
        eyebrow="Make it yours"
        title="Profile & settings"
        description="Update your details and how Mintwise looks."
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-mint text-forest dark:bg-emerald-950 dark:text-emerald-300">
                <UserRound className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-base font-extrabold text-ink dark:text-white">
                  Personal details
                </h2>
                <p className="text-xs text-muted">Your account information</p>
              </div>
            </div>
            <form onSubmit={handleSubmit(saveProfile)} className="space-y-4">
              <Input
                label="Full name"
                autoComplete="name"
                error={errors.name?.message}
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Use at least 2 characters' },
                })}
              />
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                })}
              />
              <Select
                label="Preferred currency"
                options={[
                  { value: 'INR', label: 'Indian Rupee (₹)' },
                  { value: 'USD', label: 'US Dollar ($)' },
                  { value: 'EUR', label: 'Euro (€)' },
                  { value: 'GBP', label: 'British Pound (£)' },
                ]}
                {...register('currency')}
              />
              <div className="flex justify-end">
                <Button type="submit" loading={isSubmitting}>
                  <Check className="size-4" />
                  Save profile
                </Button>
              </div>
            </form>
          </Card>
          <Card className="p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="font-display text-base font-extrabold text-ink dark:text-white">
                Change password
              </h2>
              <p className="mt-1 text-xs text-muted">Use a password you don’t use elsewhere.</p>
            </div>
            <form onSubmit={submitPassword(changePassword)} className="space-y-4">
              <Input
                label="Current password"
                type="password"
                autoComplete="current-password"
                error={passwordErrors.currentPassword?.message}
                {...registerPassword('currentPassword', {
                  required: 'Current password is required',
                })}
              />
              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                error={passwordErrors.newPassword?.message}
                {...registerPassword('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Use at least 8 characters' },
                })}
              />
              <Input
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                error={passwordErrors.confirmPassword?.message}
                {...registerPassword('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: (value, values) =>
                    value === values.newPassword || 'Passwords do not match',
                })}
              />
              <div className="flex justify-end">
                <Button type="submit" variant="secondary" loading={passwordLoading}>
                  Update password
                </Button>
              </div>
            </form>
          </Card>
        </div>
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                <Wallet className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-base font-extrabold text-ink dark:text-white">
                  Display
                </h2>
                <p className="text-xs text-muted">Make it comfortable to check in.</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-ink dark:text-white">Dark theme</p>
                <p className="mt-1 text-xs text-muted">Adjusts the appearance across the app.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={theme === 'dark'}
                aria-label="Toggle dark theme"
                onClick={toggleTheme}
                className={`relative h-7 w-12 rounded-full transition ${theme === 'dark' ? 'bg-forest' : 'bg-slate-300'}`}
              >
                <span
                  className={`absolute top-1 grid size-5 place-items-center rounded-full bg-white text-forest shadow-sm transition-all ${theme === 'dark' ? 'left-6' : 'left-1'}`}
                >
                  {theme === 'dark' ? <Moon className="size-3" /> : <Sun className="size-3" />}
                </span>
              </button>
            </div>
          </Card>
          <Card className="overflow-hidden">
            <div className="h-2 bg-forest" />
            <div className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-forest">
                Mintwise account
              </p>
              <h2 className="mt-2 font-display text-lg font-extrabold text-ink dark:text-white">
                {profile.name || 'Your account'}
              </h2>
              <p className="mt-1 text-sm text-muted">{profile.email}</p>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs dark:border-slate-800">
                <span className="text-muted">Currency</span>
                <span className="font-bold text-ink dark:text-slate-100">
                  {profile.currency || 'INR'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
