import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import toast from 'react-hot-toast'
import { createTransaction, updateTransaction } from '../../api/transactionApi'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../utils/constants'
import { transactionSchema } from '../../utils/validators'
import { Button, Input, Modal, Select } from '../common/UI'

const today = () => new Date().toISOString().slice(0, 10)
const suggestionFor = (description, type) => {
  const text = description.toLowerCase()
  const keywords = [
    [/uber|ola|metro|cab|taxi|fuel|bus|train/, 'Travel'],
    [/netflix|spotify|movie|cinema|concert|prime video/, 'Entertainment'],
    [/grocery|groceries|restaurant|cafe|food|lunch|dinner/, 'Food'],
    [/electric|water bill|internet|recharge|utility/, 'Bills'],
    [/pharmacy|doctor|clinic|medical/, 'Health'],
    [/course|tuition|book|class/, 'Education'],
    [/salary|payroll/, 'Salary'],
    [/freelance|client|project/, 'Freelance'],
  ]
  return (
    keywords.find(([pattern]) => pattern.test(text))?.[1] || (type === 'income' ? 'Other' : 'Other')
  )
}

export function TransactionModal({ open, onClose, onSaved, transaction = null }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm({
    resolver: yupResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: '',
      category: 'Food',
      date: today(),
      description: '',
      paymentMethod: '',
    },
  })
  const type = watch('type')
  const description = watch('description')
  useEffect(() => {
    if (!open) return
    reset(
      transaction
        ? {
            ...transaction,
            amount: String(transaction.amount),
            paymentMethod: transaction.paymentMethod || '',
          }
        : {
            type: 'expense',
            amount: '',
            category: 'Food',
            date: today(),
            description: '',
            paymentMethod: '',
          },
    )
  }, [open, transaction, reset])
  useEffect(() => {
    if (!dirtyFields.category && description)
      setValue('category', suggestionFor(description, type), { shouldValidate: true })
  }, [description, type, dirtyFields.category, setValue])
  const onSubmit = async (values) => {
    try {
      if (transaction) await updateTransaction(transaction.id, values)
      else await createTransaction(values)
      toast.success(transaction ? 'Transaction updated' : 'Transaction added')
      await onSaved?.()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save this transaction')
    }
  }
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={transaction ? 'Edit transaction' : 'Add a transaction'}
      description="Keep the details simple. You can update them later."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div
          className="grid grid-cols-2 gap-2 rounded-lg bg-canvas p-1 dark:bg-slate-800"
          role="group"
          aria-label="Transaction type"
        >
          {['expense', 'income'].map((choice) => (
            <button
              type="button"
              key={choice}
              onClick={() => {
                setValue('type', choice, { shouldValidate: true })
                setValue('category', choice === 'income' ? 'Salary' : 'Food', {
                  shouldDirty: false,
                })
              }}
              className={`min-h-10 rounded-md text-sm font-bold capitalize transition ${type === choice ? (choice === 'income' ? 'bg-white text-forest shadow-sm dark:bg-slate-700 dark:text-emerald-300' : 'bg-white text-rose-600 shadow-sm dark:bg-slate-700') : 'text-muted'}`}
              aria-pressed={type === choice}
            >
              {choice}
            </button>
          ))}
        </div>
        <Input
          label="Amount"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          placeholder="0"
          prefix="₹"
          error={errors.amount?.message}
          {...register('amount')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Category"
            options={categories}
            error={errors.category?.message}
            {...register('category')}
          />
          <Input label="Date" type="date" error={errors.date?.message} {...register('date')} />
        </div>
        <Input
          label="Description"
          placeholder="e.g. Metro card recharge"
          error={errors.description?.message}
          {...register('description')}
        />
        <Input
          label="Payment method"
          placeholder="UPI, card, cash..."
          error={errors.paymentMethod?.message}
          {...register('paymentMethod')}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {transaction ? 'Save changes' : 'Add transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
