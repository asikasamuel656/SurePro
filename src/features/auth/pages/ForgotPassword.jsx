import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Mail, KeyRound } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { forgotPasswordSchema } from '../schemas/authSchemas'
import { requestPasswordReset } from '../services/authApi'
import { ROUTES } from '@/constants/routes'

export function ForgotPassword() {
  const navigate = useNavigate()
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async ({ email }) => {
    setServerError(null)
    setIsSubmitting(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch (err) {
      setServerError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout onBack={() => navigate(ROUTES.LOGIN)}>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
            <KeyRound className="h-8 w-8" />
          </span>
          <h1 className="text-2xl font-bold text-ink">Reset link sent</h1>
          <p className="mt-2 max-w-xs text-sm text-muted">
            Check your inbox for a link to reset your password.
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate(ROUTES.LOGIN)}>
          Back to login
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout onBack={() => navigate(ROUTES.LOGIN)}>
      <h1 className="text-2xl font-bold text-ink">Forgot password?</h1>
      <p className="mt-1 text-sm text-muted">
        Enter your email and we'll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-1 flex-col gap-4">
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          {...register('email')}
          error={errors.email?.message}
        />
        {serverError && (
          <p className="rounded-control bg-danger/10 px-3 py-2 text-sm text-danger">
            {serverError}
          </p>
        )}
        <div className="mt-auto pt-4">
          <Button type="submit" isLoading={isSubmitting}>
            Send reset link
          </Button>
        </div>
      </form>
    </AuthLayout>
  )
}