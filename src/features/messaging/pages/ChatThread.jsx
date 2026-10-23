import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  useEffect,
  useRef,
} from 'react'

import {
  ChevronLeft,
  Briefcase,
  UserRound,
  BadgeCheck,
  Circle,
} from 'lucide-react'

import { useMessages } from '../hooks/useMessages'
import { useSendMessage } from '../hooks/useSendMessage'
import { useConversation } from '../hooks/useConversation'

import { MessageBubble } from '../components/MessageBubble'
import { MessageComposer } from '../components/MessageComposer'

import { useAuth } from '@/features/auth/hooks/useAuth'

function getInitials(name) {
  if (!name) return '?'

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase()
    )
    .join('')
}

function formatJobStatus(status) {
  if (!status) return null

  return status
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    )
}

export function ChatThread() {
  const navigate =
    useNavigate()

  const { id } =
    useParams()

  const { user } =
    useAuth()

  const {
    data: conversation,
    isLoading:
      isConversationLoading,
    isError:
      isConversationError,
  } = useConversation(id)

  const {
    messages,
    isLoading:
      areMessagesLoading,
  } = useMessages(id)

  const sendMessageMutation =
    useSendMessage(id)

  const bottomRef =
    useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages.length])

  const otherUser =
    conversation?.otherUser

  const professional =
    conversation?.otherProfessional

  const job =
    conversation?.job

  const name =
    otherUser?.full_name ??
    'SurePro user'

  const isProfessional =
    otherUser?.account_type ===
    'professional' ||
    Boolean(professional)

  const accountLabel =
    isProfessional
      ? 'Professional'
      : 'Customer'

  const professionalHeadline =
    professional?.headline

  const jobStatus =
    formatJobStatus(
      job?.status
    )

  return (
    <div className="min-h-dvh bg-bg">

      <div className="mobile-shell mx-auto flex min-h-dvh max-w-2xl flex-col">

        {/* CHAT HEADER */}
        <header className="shrink-0 border-b border-border bg-surface">

          <div className="flex items-center gap-3 px-4 py-3">

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

            {/* AVATAR */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-light">

              {otherUser?.avatar_url ? (
                <img
                  src={
                    otherUser.avatar_url
                  }
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-primary">
                  {getInitials(name)}
                </span>
              )}
            </div>

            {/* IDENTITY */}
            <div className="min-w-0 flex-1">

              <div className="flex items-center gap-1.5">

                <h1 className="truncate text-sm font-bold text-ink">
                  {name}
                </h1>

                {isProfessional && (
                  <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
                )}
              </div>

              <div className="mt-0.5 flex items-center gap-1.5">

                <span className="text-[11px] font-medium text-muted">
                  {accountLabel}
                </span>

                {professionalHeadline && (
                  <>
                    <span className="text-muted">
                      ·
                    </span>

                    <span className="truncate text-[11px] text-muted">
                      {professionalHeadline}
                    </span>
                  </>
                )}

              </div>
            </div>

          </div>

          {/* JOB CONTEXT */}
          {job && (
            <div className="border-t border-border bg-bg px-4 py-3">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-light">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                    Job
                  </p>

                  <p className="truncate text-xs font-semibold text-ink">
                    {job.title ??
                      'Service request'}
                  </p>
                </div>

                {jobStatus && (
                  <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-[10px] font-semibold text-ink-soft">
                    {jobStatus}
                  </span>
                )}

              </div>
            </div>
          )}

        </header>

        {/* CONVERSATION ERROR */}
        {isConversationError && (
          <div className="m-4 rounded-xl border border-danger/20 bg-danger/10 p-4">

            <p className="text-sm font-semibold text-danger">
              Couldn't load this conversation.
            </p>

            <p className="mt-1 text-xs text-danger/80">
              This conversation may no longer be available.
            </p>

          </div>
        )}

        {/* MESSAGES */}
        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">

          {(isConversationLoading ||
            areMessagesLoading) && (
            <div className="space-y-2">

              {[0, 1, 2].map(
                (item) => (
                  <div
                    key={item}
                    className="h-10 w-2/3 animate-pulse rounded-2xl bg-surface"
                  />
                )
              )}

            </div>
          )}

          {!isConversationLoading &&
            !areMessagesLoading &&
            messages.length === 0 && (
              <div className="pt-8 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                  <UserRound className="h-5 w-5 text-primary" />
                </div>

                <p className="mt-3 text-sm font-medium text-ink">
                  Start your conversation
                </p>

                <p className="mt-1 text-xs text-muted">
                  Say hello to {name}.
                </p>

              </div>
            )}

          {messages.map(
            (message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={
                  message.sender_id ===
                  user?.id
                }
              />
            )
          )}

          <div ref={bottomRef} />

        </div>

        {/* COMPOSER */}
        <MessageComposer
          conversationId={id}
          onSend={(values) =>
            sendMessageMutation.mutateAsync(
              {
                senderId:
                  user.id,
                ...values,
              }
            )
          }
          isSending={
            sendMessageMutation.isPending
          }
        />

      </div>
    </div>
  )
}