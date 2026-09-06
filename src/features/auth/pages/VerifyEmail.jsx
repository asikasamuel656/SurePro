import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MailCheck } from 'lucide-react'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '@/components/ui/Button'
import { resendVerificationEmail } from '../services/authApi'
import { ROUTES } from '@/constants/routes'

export function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const handleResend = async () => {
    if (!email) return
    setStatus('sending')
    try {
      await resendVerificationEmail(email)
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <AuthLayout onBack={() => navigate(ROUTES.REGISTER)}>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
          <MailCheck className="h-8 w-8" />
        </span>
        <h1 className="text-2xl font-bold text-ink">Check your email</h1>
        <p className="mt-2 max-w-xs text-sm text-muted">
          We sent a verification link to{' '}
          <span className="font-medium text-ink">{email ?? 'your email address'}</span>.
          Open it to activate your account.
        </p>
      </div>

      <div className="space-y-3 pb-2">
        {status === 'sent' && (
          <p className="text-center text-sm text-primary">Verification email resent.</p>
        )}
        {status === 'error' && (
          <p className="text-center text-sm text-danger">
            Couldn't resend the email. Try again shortly.
          </p>
        )}
        <Button
          variant="secondary"
          onClick={handleResend}
          isLoading={status === 'sending'}
          disabled={!email}
        >
          Resend email
        </Button>
        <Button variant="ghost" onClick={() => navigate(ROUTES.LOGIN)}>
          Back to login
        </Button>
      </div>
    </AuthLayout>
  )
}