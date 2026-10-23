// components/chat_window.jsx
// ─────────────────────────────────────────────────────────────
// Message history is always loaded from the backend (GET .../messages),
// so a refresh never loses anything. New messages arrive live over
// Socket.IO (see lib/api.js onNewMessage) and are also persisted the
// moment they're sent, via POST .../messages.
// ─────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react"
import { getMessages, sendMessage, onNewMessage } from "../lib/api"

function timeLabel(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function ChatWindow({ conversation, currentUserId }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!conversation) return
    setLoading(true)
    getMessages(conversation.id)
      .then(setMessages)
      .finally(() => setLoading(false))
  }, [conversation])

  useEffect(() => {
    const unsubscribe = onNewMessage((msg) => {
      if (msg.conversationId === conversation?.id) {
        setMessages((prev) => [...prev, { ...msg, mine: msg.sender.id === currentUserId }])
      }
    })
    return unsubscribe
  }, [conversation, currentUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    const draft = text.trim()
    setText("")
    try {
      const sent = await sendMessage(conversation.id, draft)
      setMessages((prev) => [...prev, { ...sent, mine: true }])
    } catch (err) {
      alert(err.message)
    }
  }

  if (!conversation) {
    return <div className="flex-1 flex items-center justify-center text-sm text-gray-400">Select a conversation</div>
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-medium overflow-hidden">
          {conversation.otherUser?.profilePicture ? (
            <img src={conversation.otherUser.profilePicture} alt="" className="w-full h-full object-cover" />
          ) : (
            conversation.otherUser?.avatarInitials
          )}
        </div>
        <div className="text-sm font-medium text-gray-900">{conversation.otherUser?.fullName}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading && <p className="text-xs text-gray-400 text-center">Loading messages…</p>}
        {!loading && messages.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8">No messages yet — say hello 👋</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                m.mine ? "bg-emerald-700 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"
              }`}
            >
              <div>{m.text}</div>
              <div className={`text-[10px] mt-1 ${m.mine ? "text-emerald-100" : "text-gray-400"}`}>{timeLabel(m.createdAt)}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 p-3 border-t border-gray-100 flex-shrink-0">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />
        <button
          type="submit"
          className="w-10 h-10 flex-shrink-0 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-7-9-7-9 7 9 7z" transform="rotate(90 12 12)" />
          </svg>
        </button>
      </form>
    </div>
  )
}
