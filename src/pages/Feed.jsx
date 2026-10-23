// // pages/feed.jsx
// // ─────────────────────────────────────────────────────────────
// // The social feed. Posts, reactions, comments, and shares are all
// // persisted on the backend now (lib/api.js) — refreshing the page
// // no longer clears anything. Only two changes from the previous
// // version: the import swapped from lib/mockBackend to lib/api, and
// // the "Share" button (previously decorative) now calls sharePost.
// // ─────────────────────────────────────────────────────────────
// import { useEffect, useState, useCallback } from 'react'
// import { useAuth } from '../context/AuthContext'
// // import { getFeed, toggleReaction, addComment, sharePost, REACTIONS } from '../lib/api'
// import { getFeed, toggleReaction, addComment, sharePost, REACTIONS } from '../lib/api'

// function timeAgo(ts) {
//   const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
//   if (mins < 60) return `${mins}m ago`
//   const hrs = Math.floor(mins / 60)
//   if (hrs < 24) return `${hrs}h ago`
//   return `${Math.floor(hrs / 24)}d ago`
// }

// function ReactionPicker({ myReaction, onPick }) {
//   const [open, setOpen] = useState(false)
//   return (
//     <div className="relative">
//       <button
//         onClick={() => setOpen((o) => !o)}
//         className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${myReaction ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}
//       >
//         <span>{myReaction ? REACTIONS[myReaction] : '👍'}</span>
//         {myReaction ? myReaction.charAt(0).toUpperCase() + myReaction.slice(1) : 'Like'}
//       </button>
//       {open && (
//         <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-full shadow-md px-2 py-1.5 flex gap-1 z-10">
//           {Object.entries(REACTIONS).map(([key, emoji]) => (
//             <button
//               key={key}
//               onClick={() => { onPick(key); setOpen(false) }}
//               className="text-lg hover:scale-125 transition-transform"
//               title={key}
//             >
//               {emoji}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// function PostCard({ post, onReact, onComment, onShare }) {
//   const [commentText, setCommentText] = useState('')
//   const [showComments, setShowComments] = useState(false)
//   const [sharing, setSharing] = useState(false)

//   function submitComment(e) {
//     e.preventDefault()
//     if (!commentText.trim()) return
//     onComment(post.id, commentText.trim())
//     setCommentText('')
//   }

//   async function handleShare() {
//     setSharing(true)
//     try {
//       await onShare(post.id)
//     } finally {
//       setSharing(false)
//     }
//   }

//   return (
//     <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden">
//       {/* author row */}
//       <div className="flex items-center gap-2.5 px-4 py-3">
//         <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-medium flex-shrink-0 overflow-hidden">
//           {post.author?.profilePicture ? (
//             <img src={post.author.profilePicture} alt="" className="w-full h-full object-cover" />
//           ) : (
//             post.author?.avatarInitials || '?'
//           )}
//         </div>
//         <div className="flex-1 min-w-0">
//           <div className="text-sm font-medium text-gray-900 truncate">{post.author?.fullName || 'Unknown'}</div>
//           <div className="text-xs text-gray-400">
//             {post.type === 'job_completion' ? '✅ Completed a job' : 'Posted an update'} · {timeAgo(post.createdAt)}
//             {post.location && ` · 📍 ${post.location}`}
//           </div>
//         </div>
//       </div>

//       {/* body */}
//       <div className="px-4 pb-3">
//         {post.title && <div className="text-sm font-medium text-gray-900 mb-1">{post.title}</div>}
//         {post.description && <p className="text-sm text-gray-600 leading-relaxed mb-2">{post.description}</p>}
//         {post.photos?.length > 0 && (
//           <div className="grid grid-cols-2 gap-1.5 mb-2">
//             {post.photos.map((src, i) => (
//               <img key={i} src={src} alt="" className="w-full h-32 object-cover rounded-lg" />
//             ))}
//           </div>
//         )}
//         {post.taggedCustomer && (
//           <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 inline-block mb-2">
//             Tagged: {post.taggedCustomer.fullName}
//           </div>
//         )}
//         {post.hashtags?.length > 0 && (
//           <div className="flex flex-wrap gap-1.5">
//             {post.hashtags.map((h) => (
//               <span key={h} className="text-xs text-emerald-600">{h}</span>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* reaction / share summary */}
//       {(post.totalReactions > 0 || post.shareCount > 0) && (
//         <div className="px-4 pb-2 flex items-center justify-between text-xs text-gray-400">
//           <span>{post.totalReactions > 0 ? `${post.totalReactions} reaction${post.totalReactions !== 1 ? 's' : ''}` : ''}</span>
//           <span>{post.shareCount > 0 ? `${post.shareCount} share${post.shareCount !== 1 ? 's' : ''}` : ''}</span>
//         </div>
//       )}

//       {/* actions */}
//       <div className="flex items-center gap-1 px-2 py-1.5 border-t border-gray-100">
//         <ReactionPicker myReaction={post.myReaction} onPick={(key) => onReact(post.id, key)} />
//         <button
//           onClick={() => setShowComments((s) => !s)}
//           className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full text-gray-500 hover:bg-gray-50 transition-colors"
//         >
//           💬 Comment{post.comments?.length ? ` (${post.comments.length})` : ''}
//         </button>
//         <button
//           onClick={handleShare}
//           disabled={sharing}
//           className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
//         >
//           ↗ {sharing ? 'Sharing…' : 'Share'}
//         </button>
//       </div>

//       {/* comments */}
//       {showComments && (
//         <div className="border-t border-gray-100 px-4 py-3">
//           {post.comments?.map((c) => (
//             <div key={c.id} className="flex items-start gap-2 mb-2 last:mb-0">
//               <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-medium flex-shrink-0 overflow-hidden">
//                 {c.author?.profilePicture ? (
//                   <img src={c.author.profilePicture} alt="" className="w-full h-full object-cover" />
//                 ) : (
//                   c.author?.avatarInitials || '?'
//                 )}
//               </div>
//               <div className="bg-gray-50 rounded-xl px-3 py-1.5 flex-1">
//                 <div className="text-xs font-medium text-gray-900">{c.author?.fullName}</div>
//                 <div className="text-xs text-gray-600">{c.text}</div>
//               </div>
//             </div>
//           ))}
//           <form onSubmit={submitComment} className="flex items-center gap-2 mt-2">
//             <input
//               value={commentText}
//               onChange={(e) => setCommentText(e.target.value)}
//               placeholder="Write a comment…"
//               className="flex-1 border border-gray-200 rounded-full px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition"
//             />
//             <button type="submit" className="text-xs font-medium text-emerald-700 px-2">Post</button>
//           </form>
//         </div>
//       )}
//     </div>
//   )
// }

// export default function Feed() {
//   const { user } = useAuth()
//   const [posts, setPosts] = useState([])
//   const [loading, setLoading] = useState(true)

//   const load = useCallback(async () => {
//     setLoading(true)
//     const data = await getFeed()
//     setPosts(data)
//     setLoading(false)
//   }, [])

//   useEffect(() => { load() }, [load])

//   async function handleReact(postId, key) {
//     const updated = await toggleReaction(postId, key)
//     setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)))
//   }

//   async function handleComment(postId, text) {
//     const updated = await addComment(postId, text)
//     setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)))
//   }

//   async function handleShare(postId) {
//     const updated = await sharePost(postId)
//     setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)))
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
//         <div className="text-lg font-semibold">Sure<span className="text-emerald-600">Pro</span></div>
//         <div className="text-xs text-gray-400">Feed</div>
//       </nav>

//       <div className="max-w-xl mx-auto px-4 py-6">
//         {loading ? (
//           <p className="text-sm text-gray-400 text-center py-16">Loading feed…</p>
//         ) : posts.length === 0 ? (
//           <p className="text-sm text-gray-400 text-center py-16">No posts yet — follow some providers to see updates here.</p>
//         ) : (
//           posts.map((post) => (
//             <PostCard key={post.id} post={post} onReact={handleReact} onComment={handleComment} onShare={handleShare} />
//           ))
//         )}
//       </div>
//     </div>
//   )
// }



// pages/feed.jsx
// ─────────────────────────────────────────────────────────────
// The social feed — this is the piece of the V2 spec that had no
// UI at all yet. Providers post job completions and updates;
// customers react, comment, and follow. Built against
// lib/mockBackend so it already behaves like a real async API.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getFeed, toggleReaction, addComment, toggleFollow, REACTIONS } from '../lib/mockBackend'

function timeAgo(ts) {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function ReactionPicker({ myReaction, onPick }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${myReaction ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50'}`}
      >
        <span>{myReaction ? REACTIONS[myReaction] : '👍'}</span>
        {myReaction ? myReaction.charAt(0).toUpperCase() + myReaction.slice(1) : 'Like'}
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 bg-white border border-gray-200 rounded-full shadow-md px-2 py-1.5 flex gap-1 z-10">
          {Object.entries(REACTIONS).map(([key, emoji]) => (
            <button
              key={key}
              onClick={() => { onPick(key); setOpen(false) }}
              className="text-lg hover:scale-125 transition-transform"
              title={key}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PostCard({ post, currentUserId, onReact, onComment }) {
  const [commentText, setCommentText] = useState('')
  const [showComments, setShowComments] = useState(false)

  function submitComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    onComment(post.id, commentText.trim())
    setCommentText('')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden">
      {/* author row */}
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm font-medium flex-shrink-0">
          {post.author?.avatarInitials || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{post.author?.fullName || 'Unknown'}</div>
          <div className="text-xs text-gray-400">
            {post.type === 'job_completion' ? '✅ Completed a job' : 'Posted an update'} · {timeAgo(post.createdAt)}
            {post.location && ` · 📍 ${post.location}`}
          </div>
        </div>
      </div>

      {/* body */}
      <div className="px-4 pb-3">
        {post.title && <div className="text-sm font-medium text-gray-900 mb-1">{post.title}</div>}
        {post.description && <p className="text-sm text-gray-600 leading-relaxed mb-2">{post.description}</p>}
        {post.taggedCustomer && (
          <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1.5 inline-block mb-2">
            Tagged: {post.taggedCustomer.fullName}
          </div>
        )}
        {post.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.hashtags.map((h) => (
              <span key={h} className="text-xs text-emerald-600">{h}</span>
            ))}
          </div>
        )}
      </div>

      {/* reaction summary */}
      {post.totalReactions > 0 && (
        <div className="px-4 pb-2 text-xs text-gray-400">
          {post.totalReactions} reaction{post.totalReactions !== 1 ? 's' : ''}
        </div>
      )}

      {/* actions */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-t border-gray-100">
        <ReactionPicker myReaction={post.myReaction} onPick={(key) => onReact(post.id, key)} />
        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full text-gray-500 hover:bg-gray-50 transition-colors"
        >
          💬 Comment{post.comments?.length ? ` (${post.comments.length})` : ''}
        </button>
        <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full text-gray-500 hover:bg-gray-50 transition-colors">
          ↗ Share
        </button>
      </div>

      {/* comments */}
      {showComments && (
        <div className="border-t border-gray-100 px-4 py-3">
          {post.comments?.map((c) => (
            <div key={c.id} className="flex items-start gap-2 mb-2 last:mb-0">
              <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                {c.author?.avatarInitials || '?'}
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-1.5 flex-1">
                <div className="text-xs font-medium text-gray-900">{c.author?.fullName}</div>
                <div className="text-xs text-gray-600">{c.text}</div>
              </div>
            </div>
          ))}
          <form onSubmit={submitComment} className="flex items-center gap-2 mt-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…"
              className="flex-1 border border-gray-200 rounded-full px-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            <button type="submit" className="text-xs font-medium text-emerald-700 px-2">Post</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getFeed()
    setPosts(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleReact(postId, key) {
    const updated = await toggleReaction(postId, key)
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)))
  }

  async function handleComment(postId, text) {
    const updated = await addComment(postId, user?.id, text)
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="text-lg font-semibold">Sure<span className="text-emerald-600">Pro</span></div>
        <div className="text-xs text-gray-400">Feed</div>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-6">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-16">Loading feed…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">No posts yet — follow some providers to see updates here.</p>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={user?.id} onReact={handleReact} onComment={handleComment} />
          ))
        )}
      </div>
    </div>
  )
}