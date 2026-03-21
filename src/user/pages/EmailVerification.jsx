import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authApi } from '../../api/user'
import { useUserStore } from '../../store/auth'

function getFriendlyError(err) {
  const msg = err?.response?.data?.message || err?.message || ''
  const status = err?.response?.status

  if (status === 400 && msg.toLowerCase().includes('invalid')) {
    return 'That code is incorrect. Please check and try again.'
  }
  if (status === 400 && msg.toLowerCase().includes('expired')) {
    return 'Your code has expired. Request a new one below.'
  }
  if (status === 429) {
    return 'Too many attempts. Please wait a moment and try again.'
  }
  if (status >= 500) {
    return 'Server error. Please try again in a few moments.'
  }
  return msg || 'Verification failed. Please try again.'
}

const OTP_LENGTH = 6

export default function EmailVerificationPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const setAuth   = useUserStore((s) => s.setAuth)
  const email = location.state?.email || ''

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [fieldError, setFieldError] = useState('')
  const inputRefs = useRef([])
  useEffect(() => { inputRefs.current[0]?.focus() }, [])

  const otp = digits.join('')

  const { mutate: verify, isPending } = useMutation({
    mutationFn: () => authApi.verifyEmail({ email, otp }),
    onSuccess: (data) => {
      const user  = data?.data?.user  || data?.user
      const token = data?.data?.token || data?.token

      if (!user || !token) {
        setFieldError('Unexpected response. Please try again.')
        return
      }

      setFieldError('')
      setAuth(user, token)
      toast.success('Email verified! Welcome 🎉')
      navigate('/dashboard', { replace: true })
    },
    onError: (err) => setFieldError(getFriendlyError(err)),
  })

  const handleDigitChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, '')  
    if (!val && e.nativeEvent?.inputType !== 'deleteContentBackward') return

    const next = [...digits]

    if (val.length > 1) {
      const pasted = val.slice(0, OTP_LENGTH - index)
      pasted.split('').forEach((ch, i) => { next[index + i] = ch })
      setDigits(next)
      const focusNext = Math.min(index + pasted.length, OTP_LENGTH - 1)
      inputRefs.current[focusNext]?.focus()
      return
    }

    next[index] = val
    setDigits(next)
    setFieldError('')

    if (val && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]
        next[index] = ''
        setDigits(next)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (otp.length < OTP_LENGTH) {
      setFieldError('Please enter all 6 digits.')
      return
    }
    verify()
  }

  const isComplete = otp.length === OTP_LENGTH

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background blobs — matches Login/Register */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent mb-4">
            <span className="text-navy-900 font-display font-black text-2xl">P</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white">Check your email</h1>
          <p className="text-white/40 mt-2 text-sm leading-relaxed">
            We sent a 6-digit code to{' '}
            {email ? (
              <span className="text-white/70 font-medium">{email}</span>
            ) : (
              'your email address'
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP boxes */}
          <div>
            <label className="block text-white/60 text-sm mb-3 text-center">
              Enter verification code
            </label>
            <div className="flex gap-2 justify-center">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`
                    w-11 h-13 text-center text-xl font-bold rounded-xl border bg-white/5
                    text-white outline-none transition-all duration-150
                    ${d ? 'border-accent' : 'border-white/10'}
                    focus:border-accent focus:bg-accent/5 focus:ring-2 focus:ring-accent/20
                    ${fieldError ? 'border-red-500/50' : ''}
                  `}
                  style={{ height: '52px' }}
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                />
              ))}
            </div>
          </div>

          {/* Error */}
          {fieldError && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-red-400 text-sm leading-snug">{fieldError}</p>
                {fieldError.toLowerCase().includes('expired') && (
                  <Link
                    to="/resend-otp"
                    state={{ email }}
                    className="text-accent text-sm hover:underline mt-1 inline-block"
                  >
                    Resend code →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !isComplete}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Verifying…
              </>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-white/40 text-sm">
            Didn't receive the code?{' '}
            <Link
              to="/resend-otp"
              state={{ email }}
              className="text-accent hover:text-accent-dim transition-colors font-medium"
            >
              Resend it
            </Link>
          </p>
          <p className="text-white/25 text-sm">
            Wrong email?{' '}
            <Link to="/register" className="text-white/40 hover:text-white/60 transition-colors">
              Go back
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}