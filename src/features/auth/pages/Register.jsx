import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { User, Mail, Phone } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'
import { registerSchema } from '../schemas/authSchemas'
import { signUp } from '../services/authApi'
import { ROUTES } from '@/constants/routes'
import { ACCOUNT_TYPES } from '@/constants/accountTypes'

export function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const accountType = location.state?.accountType ?? ACCOUNT_TYPES.CUSTOMER
  const [serverError, setServerError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (values) => {
    setServerError(null)
    setIsSubmitting(true)
    try {
      await signUp({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        accountType,
      })
      navigate(ROUTES.VERIFY_EMAIL, { state: { email: values.email } })
    } catch (err) {
      setServerError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout onBack={() => navigate(ROUTES.SELECT_ACCOUNT_TYPE)}>
      <h1 className="text-2xl font-bold text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-muted">
        {accountType === ACCOUNT_TYPES.PROFESSIONAL
          ? "Start building your professional reputation on SurePro."
          : 'Find trusted professionals near you.'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-1 flex-col gap-4">
        <Input
          label="Full name"
          icon={User}
          placeholder="e.g. Tunde Adisa"
          {...register('fullName')}
          error={errors.fullName?.message}
        />
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Phone number"
          type="tel"
          icon={Phone}
          placeholder="0803 123 4567"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <PasswordInput
          label="Password"
          placeholder="At least 8 characters"
          {...register('password')}
          error={errors.password?.message}
        />
        <PasswordInput
          label="Confirm password"
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
            Create Account
          </Button>
          <p className="mt-4 text-center text-xs text-muted">
            By continuing you agree to SurePro's Terms of Service and Privacy Policy.
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}