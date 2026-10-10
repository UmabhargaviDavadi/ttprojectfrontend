import * as yup from 'yup'

export const loginSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Use at least 6 characters').required('Password is required'),
})

export const registerSchema = yup.object({
  name: yup.string().trim().min(2, 'Use at least 2 characters').required('Name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(8, 'Use at least 8 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
})

export const transactionSchema = yup.object({
  type: yup.string().oneOf(['income', 'expense']).required(),
  amount: yup
    .number()
    .typeError('Enter an amount')
    .positive('Amount must be greater than zero')
    .required('Amount is required'),
  category: yup.string().required('Choose a category'),
  date: yup.string().required('Choose a date'),
  description: yup
    .string()
    .trim()
    .max(120, 'Keep this under 120 characters')
    .required('Description is required'),
  paymentMethod: yup.string().max(40),
})

export const budgetSchema = yup.object({
  category: yup.string().required('Choose a category'),
  limit: yup
    .number()
    .typeError('Enter a limit')
    .positive('Limit must be greater than zero')
    .required('Limit is required'),
})

export const goalSchema = yup.object({
  name: yup.string().trim().min(2, 'Use at least 2 characters').required('Goal name is required'),
  targetAmount: yup
    .number()
    .typeError('Enter a target')
    .positive('Target must be greater than zero')
    .required('Target is required'),
  deadline: yup.string().required('Choose a deadline'),
})
