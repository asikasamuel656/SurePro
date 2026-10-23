// lib/email.js
const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendOtpEmail(email, code) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY.')
  }
  await resend.emails.send({
    from: process.env.OTP_FROM_EMAIL,
    to: email,
    subject: 'Your SurePro verification code',
    text: `Your SurePro verification code is:\n\n${code}\n\nThis code expires in 10 minutes.\n\nIf you did not request this code, you can ignore this email.\n\n© SurePro`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 420px; margin: 0 auto; padding: 32px 24px;">
        <div style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 24px;">
          Sure<span style="color: #059669;">Pro</span>
        </div>
        <h1 style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 8px;">Verify your email</h1>
        <p style="font-size: 14px; color: #6b7280; margin: 0 0 24px;">Your SurePro verification code is:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px;">
          ${code}
        </div>
        <p style="font-size: 13px; color: #9ca3af; margin: 0 0 4px;">This code expires in 10 minutes.</p>
        <p style="font-size: 13px; color: #9ca3af; margin: 0;">If you did not request this code, you can safely ignore this email.</p>
      </div>
    `,
  })
}

module.exports = { sendOtpEmail }