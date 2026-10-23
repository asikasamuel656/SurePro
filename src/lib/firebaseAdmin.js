// lib/firebaseAdmin.js
// ─────────────────────────────────────────────────────────────
// The Admin SDK bypasses Firestore Security Rules entirely — that's
// exactly why the OTP records live here and not somewhere the client
// SDK can touch. This is the ONLY thing in the whole system allowed
// to read/write the `otps` collection.
// ─────────────────────────────────────────────────────────────
const admin = require('firebase-admin')

if (!admin.apps.length) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    throw new Error(
      'Missing FIREBASE_SERVICE_ACCOUNT_JSON. Download a service account key from ' +
      'Firebase Console → Project settings → Service accounts → Generate new private key, ' +
      'and paste its full JSON contents into that env var.'
    )
  }
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
}

const db = admin.firestore()

module.exports = { admin, db }