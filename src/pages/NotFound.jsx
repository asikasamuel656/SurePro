import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ROUTES } from "@/constants/Routes";

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell mx-auto max-w-md flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
          <Compass className="h-8 w-8" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-ink">Page not found</h1>
          <p className="mt-1 text-sm text-muted">
            This page doesn't exist or may have moved.
          </p>
        </div>
        <Button onClick={() => navigate(ROUTES.HOME)} className="w-auto px-6">
          Back to Home
        </Button>
      </div>
    </div>
  )
}