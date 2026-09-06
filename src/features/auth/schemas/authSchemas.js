import { z } from 'zod'

const ngPhone = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .regex(/^(\+234|0)[789][01]\d{8}$/, 'Enter a valid Nigerian phone number')

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name'),
    email: z.string().trim().email('Enter a valid email address'),
    phone: ngPhone,
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })