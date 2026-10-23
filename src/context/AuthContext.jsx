// src/context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────
// This consolidates the auth API around the method names your
// registration files already assume: `registerStep1` (creates the
// Firebase Auth account + initial Firestore doc — called AFTER
// email OTP verification) and `completeProfile` (uploads an avatar
// if provided, saves bio, marks registrationComplete: true). Also
// exposes `login`, `logout`, and a generic `updateProfile` for
// anything else (profession selection, address, etc.).
// ─────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as fbUpdateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/firebase'
import { uploadToCloudinary } from '../services/cloudinary'

const AuthContext = createContext(null)

async function fetchProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    uid,
    ...data,
    registrationComplete: data.registrationComplete === true,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setInitializing(false)
        return
      }
      try {
        const profile = await fetchProfile(firebaseUser.uid)
        setUser(
          profile || {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || '',
            role: null,
            registrationComplete: false,
          }
        )
      } catch (err) {
        console.error('Failed to load user profile:', err)
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email || '', name: firebaseUser.displayName || '', role: null, registrationComplete: false })
      } finally {
        setInitializing(false)
      }
    })
    return unsubscribe
  }, [])

  // Fetches the latest Firestore doc and pushes it into context — call
  // this after any write that should immediately reflect in `user`.
  const fetchUserData = useCallback(async (uid) => {
    const profile = await fetchProfile(uid)
    setUser(profile)
    return profile
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const profile = await fetchProfile(cred.user.uid)
    setUser(profile)
    return profile
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
    setUser(null)
  }, [])

  // Step 1 of registration for BOTH roles. Assumes the email has
  // already been OTP-verified — Firestore rules independently confirm
  // that against the otps collection before allowing emailVerified:
  // true to be written (see firestore.rules), so this isn't something
  // the client can fake on its own.
  const registerStep1 = useCallback(async ({ role, fullName, email, phone, password, address }) => {
    if (!['customer', 'provider'].includes(role)) throw new Error('Invalid role.')

    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = cred.user
    await fbUpdateProfile(firebaseUser, { displayName: fullName })

    const profile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || email,
      name: fullName,
      phone,
      role,
      emailVerified: true,
      registrationComplete: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(role === 'customer' ? { address: address || '', followingIds: [], taggable: true } : {}),
      ...(role === 'provider' ? { professionId: null, accountStatus: 'pending', rating: 0, jobsDone: 0, followerIds: [] } : {}),
    }
    await setDoc(doc(db, 'users', firebaseUser.uid), profile)

    const result = { ...profile, createdAt: Date.now(), updatedAt: Date.now() }
    setUser(result)
    return result
  }, [])

  // Generic profile patch (bio, location, professionId, address, etc.)
  const updateProfile = useCallback(async (patch) => {
    const uid = auth.currentUser?.uid
    if (!uid) throw new Error('You must be signed in.')
    await updateDoc(doc(db, 'users', uid), { ...patch, updatedAt: serverTimestamp() })
    return fetchUserData(uid)
  }, [fetchUserData])

  // Finishes registration for the customer's short 2-step flow:
  // optional avatar upload + bio + registrationComplete: true.
  const completeProfile = useCallback(async (tempUser, { avatarFile, bio }) => {
    const uid = tempUser?.uid || auth.currentUser?.uid
    if (!uid) throw new Error('Your session has expired. Please register again.')

    let avatarUrl = null
    if (avatarFile) {
      const result = await uploadToCloudinary(avatarFile)
      avatarUrl = result.url
    }

    await setDoc(
      doc(db, 'users', uid),
      {
        bio: bio || '',
        ...(avatarUrl ? { profileImageUrl: avatarUrl } : {}),
        registrationComplete: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return fetchUserData(uid)
  }, [fetchUserData])

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        login,
        logout,
        registerStep1,
        updateProfile,
        completeProfile,
        fetchUserData,
        isAuthenticated: !!user,
        isProvider: user?.role === 'provider',
        isCustomer: user?.role === 'customer',
        registrationComplete: user?.registrationComplete === true,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}