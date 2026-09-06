import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'
import { loginSchema } from '../schemas/authSchemas'
import { signIn } from '../services/authApi'
import { ROUTES } from '@/constants/routes'

export function Login() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values) => {
    setServerError(null)
    setIsSubmitting(true)
    try {
      const { user } = await signIn(values)
      if (!user.email_confirmed_at) {
        navigate(ROUTES.VERIFY_EMAIL, { state: { email: values.email } })
        return
      }
      navigate(ROUTES.HOME)
    } catch (err) {
      setServerError(err.message ?? 'Could not sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell flex min-h-dvh flex-col px-6 py-10">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>

        <h1 className="text-2xl font-bold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Log in to continue to SurePro.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-1 flex-col gap-4">
          <Input
            label="Email"
            type="email"
            icon={Mail}
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            {...register('password')}
            error={errors.password?.message}
          />

          <button
            type="button"
            onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
            className="self-end text-sm font-medium text-primary"
          >
            Forgot password?
          </button>

          {serverError && (
            <p className="rounded-control bg-danger/10 px-3 py-2 text-sm text-danger">
              {serverError}
            </p>
          )}

          <div className="mt-auto pt-4">
            <Button type="submit" isLoading={isSubmitting}>
              Log in
            </Button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.SELECT_ACCOUNT_TYPE)}
              className="mt-4 w-full text-center text-sm font-medium text-ink-soft"
            >
              New to SurePro? <span className="text-primary">Create an account</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}