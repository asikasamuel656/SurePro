// pages/messages.jsx
// ─────────────────────────────────────────────────────────────
// Customer <-> provider chat. Conversation list and message history
// both come from the backend, so switching tabs or refreshing never
// loses anything.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { getConversations, connectSocket } from "../lib/api"
import ChatWindow from "../components/chat_window"

export default function Messages({ openWithUserId }) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [active, setActive] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    connectSocket()
    getConversations()
      .then((list) => {
        setConversations(list)
        if (openWithUserId) {
          const match = list.find((c) => c.otherUser?.id === openWithUserId)
          if (match) setActive(match)
        } else if (list.length) {
          setActive(list[0])
        }
      })
      .finally(() => setLoading(false))
  }, [openWithUserId])

  return (
    <div className="h-[calc(100vh-56px)] flex bg-white">
      <aside className="w-72 flex-shrink-0 border-r border-gray-100 overflow-y-auto">
        <div className="px-4 py-3 border-b border-gray-100">
          <h1 className="text-sm font-medium text-gray-900">Messages</h1>
        </div>
        {loading && <p className="text-xs text-gray-400 text-center py-8">Loading…</p>}
        {!loading && conversations.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8">No conversations yet.</p>
        )}
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c)}
            className={`w-full flex items-center gap-2.5 px-4 py-3 text-left border-b border-gray-50 transition-colors ${
              active?.id === c.id ? "bg-emerald-50" : "hover:bg-gray-50"
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-medium flex-shrink-0 overflow-hidden">
              {c.otherUser?.profilePicture ? (
                <img src={c.otherUser.profilePicture} alt="" className="w-full h-full object-cover" />
              ) : (
                c.otherUser?.avatarInitials
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-gray-900 truncate">{c.otherUser?.fullName}</div>
              <div className="text-[11px] text-gray-400 truncate">{c.lastMessage || "No messages yet"}</div>
            </div>
          </button>
        ))}
      </aside>

      <ChatWindow conversation={active} currentUserId={user?.id} />
    </div>
  )
}
