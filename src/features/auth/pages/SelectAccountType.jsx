import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { AccountTypeCard } from '../components/AccountTypeCard'
import { Button } from '@/components/ui/Button'
import { ACCOUNT_TYPE_OPTIONS } from '@/constants/accountTypes'
import { ROUTES } from '@/constants/routes'

export function SelectAccountType() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)

  const handleContinue = () => {
    if (!selected) return
    navigate(ROUTES.REGISTER, { state: { accountType: selected } })
  }

  return (
    <AuthLayout onBack={() => navigate(ROUTES.ONBOARDING)}>
      <div className="flex flex-1 flex-col">
        <h1 className="text-2xl font-bold text-ink">Choose how you'll join</h1>
        <p className="mt-1 text-sm text-muted">
          You can change this later from your settings.
        </p>

        <div className="mt-8 space-y-3">
          {ACCOUNT_TYPE_OPTIONS.map((option) => (
            <AccountTypeCard
              key={option.value}
              option={option}
              selected={selected === option.value}
              onSelect={setSelected}
            />
          ))}
        </div>

        <div className="mt-auto pt-8">
          <Button onClick={handleContinue} disabled={!selected}>
            Continue
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}