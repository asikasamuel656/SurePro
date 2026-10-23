// lib/api.js
// ─────────────────────────────────────────────────────────────
// Real backend client. Function names intentionally mirror the old
// lib/mockBackend.js so existing components (feed.jsx, etc.) need
// minimal changes — mostly just swapping the import path.
//
// Set VITE_API_URL (or REACT_APP_API_URL, adjust to your bundler)
// in your frontend .env to point at the backend, e.g.
//   VITE_API_URL=http://localhost:5000
// ─────────────────────────────────────────────────────────────
// import { io } from 'socket.io-client'

// const API_URL = import.meta?.env?.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000'
// const TOKEN_KEY = 'localpro_token'

// function getToken() {
//   return localStorage.getItem(TOKEN_KEY)
// }
// function setToken(token) {
//   if (token) localStorage.setItem(TOKEN_KEY, token)
//   else localStorage.removeItem(TOKEN_KEY)
// }

// async function request(path, { method = 'GET', body, isForm = false } = {}) {
//   const headers = {}
//   const token = getToken()
//   if (token) headers.Authorization = `Bearer ${token}`
//   if (!isForm) headers['Content-Type'] = 'application/json'

//   const res = await fetch(`${API_URL}/api${path}`, {
//     method,
//     headers,
//     body: isForm ? body : body ? JSON.stringify(body) : undefined,
//   })

//   const data = await res.json().catch(() => ({}))
//   if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
//   return data
// }

// // ── auth ─────────────────────────────────────────────────────
// let currentUser = null
// const authListeners = new Set()
// function notifyAuth() {
//   authListeners.forEach((cb) => cb(currentUser))
// }

// export const auth = {
//   onAuthChange(cb) {
//     authListeners.add(cb)
//     cb(currentUser)
//     return () => authListeners.delete(cb)
//   },

//   getCurrentUser() {
//     return currentUser
//   },

//   /** Step 1 of registration: creates the account, logs the user in. */
//   async registerStep1(payload) {
//     const { token, user } = await request('/auth/register-step1', { method: 'POST', body: payload })
//     setToken(token)
//     currentUser = user
//     notifyAuth()
//     return user
//   },

//   /** Step 2 of registration: profile picture (File) + short bio. */
//   async completeProfile({ avatarFile, bio }) {
//     const form = new FormData()
//     if (avatarFile) form.append('avatar', avatarFile)
//     if (bio !== undefined) form.append('bio', bio)
//     const { user } = await request('/auth/complete-profile', { method: 'POST', body: form, isForm: true })
//     currentUser = user
//     notifyAuth()
//     return user
//   },

//   async login({ email, password }) {
//     const { token, user } = await request('/auth/login', { method: 'POST', body: { email, password } })
//     setToken(token)
//     currentUser = user
//     notifyAuth()
//     return user
//   },

//   async logout() {
//     setToken(null)
//     currentUser = null
//     disconnectSocket()
//     notifyAuth()
//     return true
//   },

//   /** Call once on app load to restore a session from a saved token. */
//   async restoreSession() {
//     if (!getToken()) {
//       notifyAuth()
//       return null
//     }
//     try {
//       const { user } = await request('/auth/me')
//       currentUser = user
//       notifyAuth()
//       return user
//     } catch (err) {
//       setToken(null)
//       currentUser = null
//       notifyAuth()
//       return null
//     }
//   },
// }

// // ── users ────────────────────────────────────────────────────
// export async function getProviders() {
//   const { providers } = await request('/users/providers')
//   return providers
// }

// export async function toggleFollow(customerId, providerId) {
//   return request(`/users/${providerId}/follow`, { method: 'POST' })
// }

// export async function updateProfile(fields) {
//   const { user } = await request('/users/me', { method: 'PATCH', body: fields })
//   currentUser = user
//   notifyAuth()
//   return user
// }

// // ── professions (static reference data, unchanged from before) ─
// export const PROFESSIONS = [
//   { id: 'electrician', name: 'Electrician', icon: '⚡', category: 'Home Repair' },
//   { id: 'plumber', name: 'Plumber', icon: '💧', category: 'Home Repair' },
//   { id: 'painter', name: 'Painter', icon: '🎨', category: 'Home Repair' },
//   { id: 'carpenter', name: 'Carpenter', icon: '🪚', category: 'Home Repair' },
//   { id: 'mechanic', name: 'Mechanic', icon: '🔧', category: 'Automotive' },
//   { id: 'ac_technician', name: 'AC Technician', icon: '❄️', category: 'Home Repair' },
//   { id: 'cleaner', name: 'Cleaner', icon: '🏠', category: 'Home Services' },
//   { id: 'barber', name: 'Barber', icon: '💈', category: 'Personal Care' },
//   { id: 'hair_stylist', name: 'Hair Stylist', icon: '💇', category: 'Personal Care' },
//   { id: 'makeup_artist', name: 'Makeup Artist', icon: '💄', category: 'Personal Care' },
//   { id: 'welder', name: 'Welder', icon: '🔥', category: 'Construction' },
//   { id: 'mason', name: 'Mason', icon: '🧱', category: 'Construction' },
//   { id: 'pop_installer', name: 'POP Installer', icon: '🏗️', category: 'Construction' },
//   { id: 'cctv_installer', name: 'CCTV Installer', icon: '📹', category: 'Technology' },
//   { id: 'roofer', name: 'Roofer', icon: '🏚️', category: 'Construction' },
//   { id: 'solar_installer', name: 'Solar Installer', icon: '☀️', category: 'Technology' },
//   { id: 'interior_designer', name: 'Interior Designer', icon: '🛋️', category: 'Design' },
//   { id: 'furniture_maker', name: 'Furniture Maker', icon: '🪑', category: 'Construction' },
//   { id: 'generator_tech', name: 'Generator Technician', icon: '🔌', category: 'Technology' },
//   { id: 'computer_tech', name: 'Computer Technician', icon: '💻', category: 'Technology' },
// ]
// export async function getProfessions() {
//   return PROFESSIONS
// }

// // ── social feed (persisted — refresh no longer clears anything) ─
// export async function getFeed() {
//   const { posts } = await request('/posts')
//   return posts
// }

// export async function createPost({ title, description, location, hashtags = [], taggedCustomerId = null, type = 'update', photoFiles = [] }) {
//   const form = new FormData()
//   form.append('title', title || '')
//   form.append('description', description || '')
//   form.append('location', location || '')
//   form.append('hashtags', JSON.stringify(hashtags))
//   if (taggedCustomerId) form.append('taggedCustomerId', taggedCustomerId)
//   form.append('type', type)
//   photoFiles.forEach((f) => form.append('photos', f))
//   const { post } = await request('/posts', { method: 'POST', body: form, isForm: true })
//   return post
// }

// export const REACTIONS = { like: '👍', love: '❤️', fire: '🔥', clap: '👏', party: '🎉', laugh: '😂', wow: '😮' }

// export async function toggleReaction(postId, reactionKey) {
//   const { post } = await request(`/posts/${postId}/react`, { method: 'POST', body: { reaction: reactionKey } })
//   return post
// }

// export async function addComment(postId, text) {
//   const { post } = await request(`/posts/${postId}/comments`, { method: 'POST', body: { text } })
//   return post
// }

// export async function sharePost(postId) {
//   const { post } = await request(`/posts/${postId}/share`, { method: 'POST' })
//   return post
// }

// // ── requests — the merged "post a job" / "request a service" flow ─
// export async function createRequest({ title, description, professionId, address, preferredDate, budgetMin, budgetMax, photoFiles = [], mode = 'open_bidding' }) {
//   const form = new FormData()
//   form.append('title', title)
//   form.append('description', description)
//   form.append('professionId', professionId)
//   form.append('address', address)
//   form.append('mode', mode)
//   if (preferredDate) form.append('preferredDate', preferredDate)
//   if (budgetMin) form.append('budgetMin', budgetMin)
//   if (budgetMax) form.append('budgetMax', budgetMax)
//   photoFiles.forEach((f) => form.append('photos', f))
//   const { request: created } = await request('/requests', { method: 'POST', body: form, isForm: true })
//   return created
// }

// export async function getRequests() {
//   const { requests } = await request('/requests')
//   return requests
// }

// export async function applyToRequest(requestId, message = '') {
//   const { request: updated } = await request(`/requests/${requestId}/apply`, { method: 'POST', body: { message } })
//   return updated
// }

// export async function hireProvider(requestId, providerId, agreedPrice) {
//   const { request: updated } = await request(`/requests/${requestId}/hire`, { method: 'POST', body: { providerId, agreedPrice } })
//   return updated
// }

// export async function completeRequest(requestId) {
//   const { request: updated } = await request(`/requests/${requestId}/complete`, { method: 'POST' })
//   return updated
// }

// // ── chat (persisted messages + live delivery via Socket.IO) ────
// let socket = null
// export function connectSocket() {
//   if (socket) return socket
//   const token = getToken()
//   if (!token) return null
//   socket = io(API_URL, { auth: { token } })
//   return socket
// }
// export function disconnectSocket() {
//   if (socket) {
//     socket.disconnect()
//     socket = null
//   }
// }
// export function onNewMessage(cb) {
//   const s = connectSocket()
//   if (!s) return () => {}
//   s.on('new_message', cb)
//   return () => s.off('new_message', cb)
// }

// export async function getConversations() {
//   const { conversations } = await request('/messages/conversations')
//   return conversations
// }

// export async function getOrCreateConversation(userId) {
//   const { conversation } = await request('/messages/conversations', { method: 'POST', body: { userId } })
//   return conversation
// }

// export async function getMessages(conversationId) {
//   const { messages } = await request(`/messages/conversations/${conversationId}/messages`)
//   return messages
// }

// export async function sendMessage(conversationId, text) {
//   const { message } = await request(`/messages/conversations/${conversationId}/messages`, {
//     method: 'POST',
//     body: { text },
//   })
//   return message
// }
