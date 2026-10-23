// lib/mockBackend.js
// ─────────────────────────────────────────────────────────────
// Same in-memory mock backend you already had — nothing here talks
// to a server yet. Everything resets on page refresh, same as before.
// The one real change: registration is split into two calls so it
// matches the new 2-step signup wizard:
//   registerStep1({role, fullName, email, phone, password, address, professionId})
//   completeProfile({avatarFile, bio})
// When you're ready to add a real backend, only this file needs to
// change — every page already calls these same function names.
// ─────────────────────────────────────────────────────────────

const LATENCY = 350
const delay = (data) => new Promise((res) => setTimeout(() => res(data), LATENCY))
const uid = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`

// ── seed data ────────────────────────────────────────────────
export const PROFESSIONS = [
  { id: 'electrician', name: 'Electrician', category: 'Home Repair' },
  { id: 'plumber', name: 'Plumber', category: 'Home Repair' },
  { id: 'painter', name: 'Painter', category: 'Home Repair' },
  { id: 'carpenter', name: 'Carpenter', category: 'Home Repair' },
  { id: 'bricklayer', name: 'Bricklayer', category: 'Home Repair' },
  { id: 'tiler', name: 'Tiler', category: 'Home Repair' },
  { id: 'waterproofing_specialist', name: 'Waterproofing Specialist', category: 'Home Repair' },
  { id: 'window_installer', name: 'Window Installer', category: 'Home Repair' },
  { id: 'door_installer', name: 'Door Installer', category: 'Home Repair' },
  { id: 'locksmith', name: 'Locksmith', category: 'Home Repair' },
  { id: 'borehole_tech', name: 'Borehole Technician', category: 'Home Repair' },
  { id: 'generator_tech', name: 'Generator Technician', category: 'Home Repair' },
  { id: 'gate_automation_installer', name: 'Gate Automation Installer', category: 'Home Repair' },
  { id: 'ac_tech', name: 'AC Technician', category: 'Home Repair' },
  { id: 'refrigerator_tech', name: 'Refrigerator Technician', category: 'Home Repair' },
  { id: 'washing_machine_tech', name: 'Washing Machine Technician', category: 'Home Repair' },
  { id: 'microwave_tech', name: 'Microwave Technician', category: 'Home Repair' },
  { id: 'cooker_tech', name: 'Cooker Technician', category: 'Home Repair' },
  { id: 'tv_tech', name: 'TV Technician', category: 'Home Repair' },
 
  { id: 'mechanic', name: 'Mechanic', category: 'Automotive' },
  { id: 'auto_electrician', name: 'Auto Electrician', category: 'Automotive' },
  { id: 'panel_beater', name: 'Panel Beater', category: 'Automotive' },
  { id: 'car_painter', name: 'Car Painter', category: 'Automotive' },
  { id: 'tyre_tech', name: 'Tyre Technician', category: 'Automotive' },
  { id: 'battery_tech', name: 'Battery Technician', category: 'Automotive' },
  { id: 'car_detailer', name: 'Car Detailer', category: 'Automotive' },
  { id: 'car_wash', name: 'Car Wash', category: 'Automotive' },
  { id: 'vehicle_inspector', name: 'Vehicle Inspector', category: 'Automotive' },
  { id: 'tow_truck_operator', name: 'Tow Truck Operator', category: 'Automotive' },
  
  { id: 'house_cleaner', name: 'House Cleaner', category: 'Home Services' },
  { id: 'office_cleaner', name: 'Office Cleaner', category: 'Home Services' },
  { id: 'deep_cleaner', name: 'Deep Cleaner', category: 'Home Services' },
  { id: 'carpet_cleaner', name: 'Carpet Cleaner', category: 'Home Services' },
  { id: 'sofa_cleaner', name: 'Sofa Cleaner', category: 'Home Services' },
  { id: 'mattress_cleaner', name: 'Mattress Cleaner', category: 'Home Services' },
  { id: 'window_cleaner', name: 'Window Cleaner', category: 'Home Services' },
  { id: 'waste_disposal', name: 'Waste Disposal', category: 'Home Services' },
  { id: 'Laundry_cleaner', name: 'Laundry Cleaner', category: 'Home Services' },
  { id: 'fumigation_expert', name: 'Fumigation Expert', category: 'Home Services' },
  { id: 'pest_control', name: 'Pest Control', category: 'Home Services' },

  { id: 'barber', name: 'Barber', category: 'Personal Care' },
  { id: 'hair_stylist', name: 'Hair Stylist', category: 'Personal Care' },
  { id: 'makeup_artist', name: 'Makeup Artist', category: 'Personal Care' },
  { id: 'nail_tech', name: 'Nail Technician', category: 'Personal Care' },
  { id: 'spa_therapist', name: 'Spa Therapist', category: 'Personal Care' },
  { id: 'massage_therapist', name: 'Massage Therapist', category: 'Personal Care' },
  { id: 'fashion_designer', name: 'Fashion Designer', category: 'Personal Care' },
  { id: 'tailor', name: 'Tailor', category: 'Personal Care' },
  { id: 'shoe_maker', name: 'Shoe Maker', category: 'Personal Care' },
  { id: 'jeweler', name: 'Jeweler', category: 'Personal Care' },

  { id: 'welder', name: 'Welder', category: 'Construction' },
  { id: 'mason', name: 'Mason', category: 'Construction' },
  { id: 'pop_installer', name: 'POP Installer', category: 'Construction' },
  { id: 'roofing_specialist', name: 'Roofing Specialist', category: 'Construction' },
  { id: 'furniture_maker', name: 'Furniture Maker', category: 'Construction' },

  { id: 'cctv_installer', name: 'CCTV Installer', category: 'Technology' },
  { id: 'solar_installer', name: 'Solar Installer', category: 'Technology' },
  { id: 'computer_tech', name: 'Computer Technician', category: 'Technology' },
  { id: 'laptop_tech', name: 'Laptop Technician', category: 'Technology' },
  { id: 'phone_tech', name: 'Phone Technician', category: 'Technology' },
  { id: 'network_tech', name: 'Network Technician', category: 'Technology' },
  { id: 'software_dev', name: 'Software Developer', category: 'Technology' },
  { id: 'web_dev', name: 'Website Developer', category: 'Technology' },
  { id: 'graphic_designer', name: 'Graphic Designer', category: 'Technology' },
  { id: 'photographer', name: 'Photographer', category: 'Technology' },
  { id: 'videographer', name: 'Videographer', category: 'Technology' },
  { id: 'drone_operator', name: 'Drone Operator', category: 'Technology' },
  { id: 'intercom_installer', name: 'Intercom Installer', category: 'Technology' },

  { id: 'interior_designer', name: 'Interior Designer', category: 'Event' },
  { id: 'event_planner', name: 'Event Planner', category: 'Event' },
  { id: 'mc', name: 'MC', category: 'Event' },
  { id: 'dj', name: 'DJ', category: 'Event' },
  { id: 'live_band', name: 'Live Band', category: 'Event' },
  { id: 'caterer', name: 'Caterer', category: 'Event' },
  { id: 'cake_designer', name: 'Cake Designer', category: 'Event' },
  { id: 'photobooth_service', name: 'Photobooth Service', category: 'Event' },
  { id: 'usher', name: 'Usher', category: 'Event' },

  { id: 'mover', name: 'Mover', category: 'Logistics' },
  { id: 'furniture_mover', name: 'Furniture Mover', category: 'Logistics' },
  { id: 'courier', name: 'Courier', category: 'Logistics' },
  { id: 'delivery_rider', name: 'Delivery Rider', category: 'Logistics' },
  { id: 'truck_hire', name: 'Truck Hire', category: 'Logistics' },
  { id: 'packer', name: 'Packer', category: 'Logistics' },

  { id: 'gardener', name: 'Gardener', category: 'Gardening' },
  { id: 'landscaper', name: 'Landscaper', category: 'Gardening' },
  { id: 'tree_cutter', name: 'Tree Cutter', category: 'Gardening' },
  { id: 'pool_cleaner', name: 'Pool Cleaner', category: 'Gardening' },

  { id: 'private_tutor', name: 'Private Tutor', category: 'Education' },
  { id: 'music_teacher', name: 'Music Teacher', category: 'Education' },
  { id: 'language_tutor', name: 'Language Tutor', category: 'Education' },
  { id: 'driving_instructor', name: 'Driving Instructor', category: 'Education' },

  { id: 'caregiver', name: 'Caregiver', category: 'Health Care' },
  { id: 'nurse', name: 'Nurse', category: 'Health Care' },
  { id: 'personal_trainer', name: 'Caregiver', category: 'Health Care' },
  { id: 'physiotherapist', name: 'Physiotherapist', category: 'Health Care' },
  { id: 'nutrition_coach', name: 'Nutrition Coach', category: 'Health Care' },

  { id: 'pet_trainer', name: 'Pet Trainer', category: 'Pets' },
  { id: 'pet_sitter', name: 'Pet Sitter', category: 'Pets' },
  { id: 'pet_groomer', name: 'Pet Groomer', category: 'Pets' },
  { id: 'veterinarian', name: 'Veterinarian', category: 'Pets' },
]

const db = {
  users: [
    {
      id: 'user_provider_1', role: 'provider', fullName: 'Adewale James', email: 'adewale.j@email.com',
      phone: '+234 812 345 6789', professionId: 'plumber', address: 'Surulere, Lagos State',
      bio: 'Master plumber, 3 years on SurePro.', profilePicture: null, avatarInitials: 'AJ',
      rating: 4.9, jobsDone: 47, verified: true, followerIds: ['user_customer_1'],
    },
    {
      id: 'user_customer_1', role: 'customer', fullName: 'Ngozi Kalu', email: 'ngozi.kalu@email.com',
      phone: '+234 803 456 7890', address: 'Ajah, Lagos State', bio: '', profilePicture: null,
      avatarInitials: 'NK', taggable: true, followingIds: ['user_provider_1'],
    },
    {
      id: 'user_admin_1', role: 'admin', fullName: 'SurePro Admin', email: 'admin@SurePro.ng',
      phone: '+234 800 000 0000', avatarInitials: 'LA',
    },
  ],
  requests: [], // the merged "post a job" / "request a service" list, see requests API below
  posts: [
    {
      id: 'post_1', authorId: 'user_provider_1', type: 'job_completion',
      title: 'Full bathroom pipe replacement', description: 'Replaced 3 cracked pipes and inspected the main valve — no more drips!',
      location: 'Lekki Phase 1, Lagos', hashtags: ['#Plumbing', '#HomeRepair', '#SurePro'],
      taggedCustomerId: null, createdAt: Date.now() - 1000 * 60 * 60 * 5,
      reactions: { like: 12, love: 4, fire: 2 }, myReaction: null, shareCount: 0,
    },
    {
      id: 'post_2', authorId: 'user_provider_1', type: 'update',
      title: 'New pipe-fitting tools just arrived 🛠️', description: 'Upgraded my kit this week — faster turnaround on leak repairs from now on.',
      location: 'Surulere, Lagos', hashtags: ['#Plumbing', '#Upgrade'],
      taggedCustomerId: null, createdAt: Date.now() - 1000 * 60 * 60 * 30,
      reactions: { like: 8, love: 1 }, myReaction: null, shareCount: 0,
    },
  ],
  comments: [
    { id: 'comment_1', postId: 'post_1', authorId: 'user_customer_1', text: 'Great work as always!', createdAt: Date.now() - 1000 * 60 * 60 * 4 },
  ],
}

let currentUser = null
const authListeners = new Set()
function notifyAuth() {
  authListeners.forEach((cb) => cb(currentUser))
}

function computeInitials(fullName) {
  return fullName.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase()
}

// ── auth ─────────────────────────────────────────────────────
export const auth = {
  onAuthChange(cb) {
    authListeners.add(cb)
    cb(currentUser)
    return () => authListeners.delete(cb)
  },

  getCurrentUser() {
    return currentUser
  },

  /** Step 1: account info. Creates the user and logs them in. */
  async registerStep1({ role, fullName, email, phone, password, address, professionId }) {
    if (db.users.some((u) => u.email === email)) {
      throw new Error('An account with this email already exists.')
    }
    const user = {
      id: uid('user'),
      role,
      fullName,
      email,
      phone,
      address: address || '',
      bio: '',
      profilePicture: null,
      avatarInitials: computeInitials(fullName),
      ...(role === 'provider' ? { professionId: professionId || null, rating: 0, jobsDone: 0, verified: false, followerIds: [] } : {}),
      ...(role === 'customer' ? { taggable: true, followingIds: [] } : {}),
    }
    db.users.push(user)
    currentUser = user
    notifyAuth()
    return delay(user)
  },

  /** Step 2: profile picture + short bio, added to the account created in step 1. */
  async completeProfile({ avatarFile, bio }) {
    if (!currentUser) throw new Error('No account in progress — start from step 1.')
    const user = db.users.find((u) => u.id === currentUser.id)
    if (bio !== undefined) user.bio = bio
    if (avatarFile) user.profilePicture = URL.createObjectURL(avatarFile)
    currentUser = user
    notifyAuth()
    return delay(user)
  },

  async login({ email, password }) {
    const user = db.users.find((u) => u.email === email)
    if (!user) throw new Error('No account found with that email.')
    // Note: mock backend does not check passwords — a real backend will.
    currentUser = user
    notifyAuth()
    return delay(user)
  },

  async logout() {
    currentUser = null
    notifyAuth()
    return delay(true)
  },
}

// ── professions ──────────────────────────────────────────────
export async function getProfessions() {
  return delay(PROFESSIONS)
}

// ── requests — the merged "post a job" / "request a service" ──
export async function createRequest({ title, description, professionId, address, preferredDate, budgetMin, budgetMax }) {
  const request = {
    id: uid('req'),
    customerId: currentUser?.id,
    title, description, professionId, address,
    preferredDate: preferredDate || null,
    budgetMin: budgetMin ? Number(budgetMin) : null,
    budgetMax: budgetMax ? Number(budgetMax) : null,
    status: 'open',
    applicants: [],
    hiredProvider: null,
    createdAt: Date.now(),
  }
  db.requests.unshift(request)
  return delay(request)
}

export async function getRequests() {
  const mine = currentUser?.role === 'customer'
    ? db.requests.filter((r) => r.customerId === currentUser.id)
    : db.requests.filter((r) => r.status === 'open' && r.professionId === currentUser?.professionId)
  return delay(mine)
}

// ── social feed ──────────────────────────────────────────────
function hydratePost(post) {
  const author = db.users.find((u) => u.id === post.authorId)
  const taggedCustomer = post.taggedCustomerId ? db.users.find((u) => u.id === post.taggedCustomerId) : null
  const comments = db.comments
    .filter((c) => c.postId === post.id)
    .map((c) => ({ ...c, author: db.users.find((u) => u.id === c.authorId) }))
  const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0)
  return { ...post, author, taggedCustomer, comments, totalReactions }
}

export async function getFeed() {
  const sorted = [...db.posts].sort((a, b) => b.createdAt - a.createdAt)
  return delay(sorted.map(hydratePost))
}

export async function createPost({ authorId, title, description, location, hashtags = [], taggedCustomerId = null, type = 'update' }) {
  const post = {
    id: uid('post'), authorId, type, title, description, location, hashtags,
    taggedCustomerId, createdAt: Date.now(), reactions: {}, myReaction: null, shareCount: 0,
  }
  db.posts.unshift(post)
  return delay(hydratePost(post))
}

const REACTIONS = { like: '👍', love: '❤️', fire: '🔥', clap: '👏', party: '🎉', laugh: '😂', wow: '😮' }
export { REACTIONS }

export async function toggleReaction(postId, reactionKey) {
  const post = db.posts.find((p) => p.id === postId)
  if (!post) throw new Error('Post not found')
  if (post.myReaction === reactionKey) {
    post.reactions[reactionKey] = Math.max(0, (post.reactions[reactionKey] || 1) - 1)
    post.myReaction = null
  } else {
    if (post.myReaction) post.reactions[post.myReaction] = Math.max(0, (post.reactions[post.myReaction] || 1) - 1)
    post.reactions[reactionKey] = (post.reactions[reactionKey] || 0) + 1
    post.myReaction = reactionKey
  }
  return delay(hydratePost(post))
}

export async function addComment(postId, authorId, text) {
  const comment = { id: uid('comment'), postId, authorId, text, createdAt: Date.now() }
  db.comments.push(comment)
  const post = db.posts.find((p) => p.id === postId)
  return delay(hydratePost(post))
}

export async function sharePost(postId) {
  const post = db.posts.find((p) => p.id === postId)
  if (!post) throw new Error('Post not found')
  post.shareCount = (post.shareCount || 0) + 1
  return delay(hydratePost(post))
}

// ── follow system ────────────────────────────────────────────
export async function toggleFollow(customerId, providerId) {
  const customer = db.users.find((u) => u.id === customerId)
  const provider = db.users.find((u) => u.id === providerId)
  if (!customer || !provider) throw new Error('User not found')
  customer.followingIds = customer.followingIds || []
  provider.followerIds = provider.followerIds || []
  const isFollowing = customer.followingIds.includes(providerId)
  if (isFollowing) {
    customer.followingIds = customer.followingIds.filter((id) => id !== providerId)
    provider.followerIds = provider.followerIds.filter((id) => id !== customerId)
  } else {
    customer.followingIds.push(providerId)
    provider.followerIds.push(customerId)
  }
  return delay({ following: !isFollowing })
}

export async function getProviders() {
  return delay(db.users.filter((u) => u.role === 'provider'))
}