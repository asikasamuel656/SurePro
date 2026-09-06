import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'
import { resetPasswordSchema } from '../schemas/authSchemas'
import { updatePassword } from '../services/authApi'
import { ROUTES } from '@/constants/routes'

export function ResetPassword() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = async ({ password }) => {
    setServerError(null)
    setIsSubmitting(true)
    try {
      await updatePassword(password)
      setDone(true)
    } catch (err) {
      setServerError(err.message ?? 'Could not reset your password. Try the link again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (done) {
    return (
      <AuthLayout showBack={false}>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold text-ink">Password updated</h1>
          <p className="mt-2 max-w-xs text-sm text-muted">
            You can now log in with your new password.
          </p>
        </div>
        <Button onClick={() => navigate(ROUTES.LOGIN)}>Log in</Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout showBack={false}>
      <h1 className="text-2xl font-bold text-ink">Set a new password</h1>
      <p className="mt-1 text-sm text-muted">Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-1 flex-col gap-4">
        <PasswordInput
          label="New password"
          placeholder="At least 8 characters"
          {...register('password')}
          error={errors.password?.message}
        />
        <PasswordInput
          label="Confirm new password"
          placeholder="Re-enter your password"
          {...register('confirmPassword')}
          error={errors.confirmPassword?.message}
        />
        {serverError && (
          <p className="rounded-control bg-danger/10 px-3 py-2 text-sm text-danger">
            {serverError}
          </p>
        )}
        <div className="mt-auto pt-4">
          <Button type="submit" isLoading={isSubmitting}>
            Update password
          </Button>
        </div>
      </form>
    </AuthLayout>
  )
}