
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  Briefcase,
  UserRound,
  BadgeCheck,
  Forward,
  X,
} from 'lucide-react'

import { useMessages } from '../hooks/useMessages'
import { useSendMessage } from '../hooks/useSendMessage'
import { useConversation } from '../hooks/useConversation'
import { MessageBubble } from '../components/MessageBubble'
import { MessageComposer } from '../components/MessageComposer'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { fetchConversations, deleteMessage, sendMessage,} from '../services/messagingApi'

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).slice(0, 2)
    .map((part) => part[0]?.toUpperCase()).join('')
}

function formatJobStatus(status) {
  if (!status) return null
  return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function ChatThread() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: conversation,
    isLoading: isConversationLoading,
    isError: isConversationError,
  } = useConversation(id)

  const { messages = [], isLoading: areMessagesLoading } = useMessages(id)
  const sendMessageMutation = useSendMessage(id)

  const bottomRef = useRef(null)
  const [replyTo, setReplyTo] = useState(null)
  const [forwardMessage, setForwardMessage] = useState(null)
  const [conversations, setConversations] = useState([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [forwardError, setForwardError] = useState('')
  const [actionError, setActionError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const otherUser = conversation?.otherUser
  const professional = conversation?.otherProfessional
  const job = conversation?.job
  const name = otherUser?.full_name ?? 'SurePro user'
  const isProfessional =
    otherUser?.account_type === 'professional' || Boolean(professional)
  const accountLabel = isProfessional ? 'Professional' : 'Customer'
  const professionalHeadline = professional?.headline
  const jobStatus = formatJobStatus(job?.status)

  const invalidateMessages = async (conversationId = id) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] }),
      queryClient.invalidateQueries({ queryKey: ['conversations'] }),
    ])
  }

  const handleDelete = async (message) => {
    if (!message?.id || message.sender_id !== user?.id) return

    const confirmed = window.confirm('Delete this message? This cannot be undone.')
    if (!confirmed) return

    setActionError('')
    setIsDeleting(true)

    try {
      await deleteMessage(message.id)
      if (replyTo?.id === message.id) setReplyTo(null)
      await invalidateMessages()
    } catch (error) {
      console.error('Could not delete message:', error)
      setActionError('Could not delete that message. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const openForwardDialog = async (message) => {
    setForwardMessage(message)
    setForwardError('')
    setIsLoadingConversations(true)

    try {
      const results = await fetchConversations(user.id)
      setConversations(results.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Could not load conversations:', error)
      setForwardError('Could not load your conversations. Please try again.')
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const handleForward = async (destination) => {
    if (!forwardMessage || !destination || !user?.id) return

    setForwardError('')

    try {
      await sendMessage({
        conversationId: destination.id,
        senderId: user.id,
        content: forwardMessage.content ?? null,
        messageType: forwardMessage.message_type ?? 'text',
        imageUrl: forwardMessage.image_url ?? null,
        metadata: {
          forwarded: true,
          forwarded_from: forwardMessage.id,
        },
      })

      await invalidateMessages(destination.id)
      setForwardMessage(null)
    } catch (error) {
      console.error('Could not forward message:', error)
      setForwardError('Could not forward this message. Please try again.')
    }
  }

  return (
    <div className="h-dvh overflow-hidden bg-bg">
      <div className="mobile-shell mx-auto flex h-full min-h-0 max-w-2xl flex-col overflow-hidden">
        {/* Fixed conversation header */}
        <header className="relative z-20 shrink-0 border-b border-border bg-surface">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-ink-soft"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-light">
              {otherUser?.avatar_url ? (
                <img src={otherUser.avatar_url} alt={name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-primary">{getInitials(name)}</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate text-sm font-bold text-ink">{name}</h1>
                {isProfessional && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-muted">{accountLabel}</span>
                {professionalHeadline && (
                  <>
                    <span className="text-muted">·</span>
                    <span className="truncate text-[11px] text-muted">{professionalHeadline}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {job && (
            <div className="border-t border-border bg-bg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-light">
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Job</p>
                  <p className="truncate text-xs font-semibold text-ink">{job.title ?? 'Service request'}</p>
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

        {isConversationError && (
          <div className="m-4 shrink-0 rounded-xl border border-danger/20 bg-danger/10 p-4">
            <p className="text-sm font-semibold text-danger">Couldn't load this conversation.</p>
            <p className="mt-1 text-xs text-danger/80">This conversation may no longer be available.</p>
          </div>
        )}

        {actionError && (
          <p role="alert" className="shrink-0 px-4 py-2 text-xs text-danger">{actionError}</p>
        )}

        {/* Only this section scrolls */}
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 py-4">
          {(isConversationLoading || areMessagesLoading) && (
            <div className="space-y-2">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-10 w-2/3 animate-pulse rounded-2xl bg-surface" />
              ))}
            </div>
          )}

          {!isConversationLoading && !areMessagesLoading && messages.length === 0 && (
            <div className="pt-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                <UserRound className="h-5 w-5 text-primary" />
              </div>
              <p className="mt-3 text-sm font-medium text-ink">Start your conversation</p>
              <p className="mt-1 text-xs text-muted">Say hello to {name}.</p>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.id}
              onReply={(item) => {
                setReplyTo(item)
                setActionError('')
              }}
              onCopy={async (item) => {
                try {
                  const copyText = item.content || item.image_url || ''
                  if (!copyText) throw new Error('Nothing to copy')
                  await navigator.clipboard.writeText(copyText)
                  setActionError('')
                } catch {
                  setActionError('Could not copy this message. Your browser may block clipboard access.')
                }
              }}
              onForward={openForwardDialog}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Composer stays below the scrollable message list */}
        <div className="z-10 shrink-0 border-t border-border bg-surface">
          <MessageComposer
            conversationId={id}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onSend={(values) =>
              sendMessageMutation.mutateAsync({
                senderId: user.id,
                ...values,
                metadata: {
                  ...(values.metadata ?? {}),
                  ...(replyTo ? {
                    reply_to: {
                      id: replyTo.id,
                      content: replyTo.content ?? null,
                      sender_id: replyTo.sender_id,
                    },
                  } : {}),
                },
              }).then((result) => {
                setReplyTo(null)
                return result
              })
            }
            isSending={sendMessageMutation.isPending}
          />
        </div>
      </div>

      {/* Forward message dialog */}
      {forwardMessage && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="forward-title"
            className="max-h-[80dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-surface p-4 shadow-xl sm:rounded-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 id="forward-title" className="text-base font-bold text-ink">Forward message</h2>
                <p className="mt-1 text-xs text-muted">Choose a conversation.</p>
              </div>
              <button
                type="button"
                onClick={() => setForwardMessage(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft hover:bg-bg"
                aria-label="Close forward dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {forwardError && <p role="alert" className="mb-3 text-xs text-danger">{forwardError}</p>}

            {isLoadingConversations ? (
              <p className="py-6 text-center text-sm text-muted">Loading conversations…</p>
            ) : conversations.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No other conversations available.</p>
            ) : (
              <div className="space-y-1">
                {conversations.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleForward(item)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-bg"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary">
                      {getInitials(item.otherUser?.full_name)}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                      {item.otherUser?.full_name ?? 'SurePro user'}
                    </span>
                    <Forward className="h-4 w-4 shrink-0 text-muted" />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
