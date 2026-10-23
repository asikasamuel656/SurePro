import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'
import { logError } from '@/lib/analytics'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    logError(error, { componentStack: info.componentStack })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-dvh bg-bg">
        <div className="mobile-shell mx-auto max-w-md flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
            <AlertTriangle className="h-8 w-8" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-ink">Something went wrong</h1>
            <p className="mt-1 text-sm text-muted">
              SurePro hit an unexpected error. Try reloading — if this keeps happening, let us know
              from Help &amp; Support.
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-control bg-primary px-5 py-3 text-sm font-semibold text-white"
          >
            Reload SurePro
          </button>
        </div>
      </div>
    )
  }
}