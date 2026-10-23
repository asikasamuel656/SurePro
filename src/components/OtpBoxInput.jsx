// src/components/OtpBoxInput.jsx
import { useRef, useState, useEffect } from 'react'

export default function OtpBoxInput({ length = 6, onComplete, disabled, resetKey }) {
  const [digits, setDigits] = useState(Array(length).fill(''))
  const inputRefs = useRef([])

  useEffect(() => {
    setDigits(Array(length).fill(''))
    inputRefs.current[0]?.focus()
  }, [resetKey, length])

  function setDigitAt(index, value) {
    const next = [...digits]
    next[index] = value
    setDigits(next)
    if (next.every((d) => d !== '')) onComplete(next.join(''))
  }

  function handleChange(index, e) {
    const value = e.target.value.replace(/\D/g, '')
    if (!value) return setDigitAt(index, '')
    const char = value.slice(-1)
    setDigitAt(index, char)
    if (index < length - 1) inputRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus()
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const next = Array(length).fill('')
    pasted.split('').forEach((char, i) => { next[i] = char })
    setDigits(next)
    inputRefs.current[Math.min(pasted.length, length) - 1]?.focus()
    if (pasted.length === length) onComplete(pasted)
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 text-center text-lg font-semibold border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition disabled:bg-gray-50 disabled:text-gray-400"
          style={{ height: '52px' }}
        />
      ))}
    </div>
  )
}