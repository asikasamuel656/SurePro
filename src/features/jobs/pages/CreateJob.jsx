import { useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronLeft,
  ShieldCheck,
  Clock3,
  BadgeCheck,
} from 'lucide-react'

import { CreateJobForm } from '../components/CreateJobForm'
import { useCreateJob } from '../hooks/useCreateJob'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { jobDetailsPath } from '@/constants/routes'

export function CreateJob() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const createJobMutation = useCreateJob()

  const handleSubmit = ({
    categoryId,
    title,
    description,
    address,
    latitude,
    longitude,
    budgetMin,
    budgetMax,
  }) => {
    createJobMutation.mutate(
      {
        customerId: user.id,
        categoryId,
        title,
        description,
        address,
        latitude,
        longitude,
        budgetMin,
        budgetMax,
      },
      {
        onSuccess: (job) => {
          navigate(jobDetailsPath(job.id))
        },
      }
    )
  }

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mobile-shell">

        {/* Header */}
        <header className="border-b border-border bg-surface px-5 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-ink-soft transition hover:bg-bg"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                Service request
              </p>

              <h1 className="truncate text-lg font-bold text-ink">
                Post a job
              </h1>
            </div>
          </div>
        </header>

        {/* Normal page content */}
        <div className="px-5 pb-10 pt-5">

          {/* Intro */}
          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              What do you need help with?
            </h2>

            <p className="mt-1.5 text-sm leading-5 text-muted">
              Tell us what you need and we’ll help connect you
              with the right professional.
            </p>
          </div>

          {/* Trust indicators */}
          <div className="mb-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-primary-light px-2 py-3 text-center">
              <ShieldCheck className="mx-auto h-4 w-4 text-primary" />

              <p className="mt-1 text-[10px] font-semibold text-ink">
                Verified
              </p>
            </div>

            <div className="rounded-xl bg-bg px-2 py-3 text-center">
              <Clock3 className="mx-auto h-4 w-4 text-primary" />

              <p className="mt-1 text-[10px] font-semibold text-ink">
                Fast matching
              </p>
            </div>

            <div className="rounded-xl bg-bg px-2 py-3 text-center">
              <BadgeCheck className="mx-auto h-4 w-4 text-primary" />

              <p className="mt-1 text-[10px] font-semibold text-ink">
                Trusted pros
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <CreateJobForm
              initialCategoryId={location.state?.categoryId}
              onSubmit={handleSubmit}
              isSubmitting={createJobMutation.isPending}
              error={createJobMutation.error}
            />
          </div>

        </div>
      </div>
    </div>
  )
}