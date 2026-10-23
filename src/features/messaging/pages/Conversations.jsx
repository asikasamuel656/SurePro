import { useNavigate } from 'react-router-dom'

import { ChevronLeft } from 'lucide-react'

import { useConversations } from '../hooks/useConversations'
import { ConversationListItem } from '../components/ConversationListItem'

import { chatPath } from '@/constants/routes'

export function Conversations() {
  const navigate =
    useNavigate()

  const {
    data: conversations = [],
    isLoading,
    isError,
  } = useConversations()

  return (
    <div className="min-h-dvh bg-bg">

      <div className="mobile-shell flex min-h-dvh flex-col">

        {/* HEADER */}
        <header className="border-b border-border bg-surface px-4 py-3">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-ink-soft"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-base font-bold text-ink">
                Messages
              </h1>

              <p className="text-[11px] text-muted">
                Your conversations with customers and professionals
              </p>
            </div>

          </div>

        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">

          {/* LOADING */}
          {isLoading && (
            <div className="space-y-3 p-4">

              {[0, 1, 2].map(
                (item) => (
                  <div
                    key={item}
                    className="h-14 animate-pulse rounded-card bg-surface"
                  />
                )
              )}

            </div>
          )}

          {/* ERROR */}
          {isError && (
            <div className="m-4 rounded-card bg-danger/10 p-4">

              <p className="text-sm font-semibold text-danger">
                Couldn't load your conversations.
              </p>

              <p className="mt-1 text-xs text-danger/80">
                Please try again.
              </p>

            </div>
          )}

          {/* EMPTY */}
          {!isLoading &&
            !isError &&
            conversations.length ===
              0 && (
              <div className="mx-4 mt-6 rounded-card border border-dashed border-border p-6 text-center">

                <p className="text-sm font-medium text-ink">
                  No conversations yet
                </p>

                <p className="mt-1 text-sm text-muted">
                  Message a professional from their profile to start chatting.
                </p>

              </div>
            )}

          {/* CONVERSATIONS */}
          {!isLoading &&
            !isError &&
            conversations.map(
              (conversation) => (
                <ConversationListItem
                  key={
                    conversation.id
                  }
                  conversation={
                    conversation
                  }
                  onClick={() =>
                    navigate(
                      chatPath(
                        conversation.id
                      )
                    )
                  }
                />
              )
            )}

        </div>

      </div>
    </div>
  )
}