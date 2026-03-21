import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authApi } from '../../api/user'
import { Input, Spinner } from '../../components/shared/UI'

function getFriendlyError(err) {
  const msg = err?.response?.data?.message || err?.message || ''
  const status = err?.response?.status

  if (status === 404 || msg.toLowerCase().includes('not found')) {
    return 'No account found with that email. Please check and try again.'
  }
  if (status === 400 && msg.toLowerCase().includes('already verified')) {
    return 'This email is already verified. You can sign in.'
  }
  if (status === 429) {
    return 'Too many requests. Please wait a moment before trying again.'
  }
  if (status >= 500) {
    return 'Server error. Please try again in a few moments.'
  }
  return msg || 'Could not resend code. Please try again.'
}

export default function ResendOtpPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [fieldError, setFieldError]   = useState('')
  const [sent, setSent]               = useState(false)

  const { mutate: resend, isPending } = useMutation({
    mutationFn: () => authApi.resendOtp({ email }),
    onSuccess: () => {
      setFieldError('')
      setSent(true)
      toast.success('Verification code sent!')
    },
    onError: (err) => {
      const msg = getFriendlyError(err)
      setFieldError(msg)
      setSent(false)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setFieldError('Please enter your email address.')
      return
    }
    resend()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
    
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-slide-up">

      
        {sent ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h1 className="font-display font-bold text-3xl text-white mb-3">Code sent!</h1>
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              A new verification code has been sent to{' '}
              <span className="text-white/70 font-medium">{email}</span>.
              Check your inbox (and spam folder just in case).
            </p>

            <button
              onClick={() => navigate('/verify-email', { state: { email } })}
              className="btn-primary w-full mb-4"
            >
              Enter Code
            </button>

            <button
              onClick={() => setSent(false)}
              className="w-full text-white/40 text-sm hover:text-white/60 transition-colors"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
          
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent mb-4">
                <span className="text-navy-900 font-display font-black text-2xl">P</span>
              </div>
              <h1 className="font-display font-bold text-3xl text-white">Resend code</h1>
              <p className="text-white/40 mt-2 text-sm">
                Enter your email and we'll send a new verification code
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setFieldError('')
                }}
                required
              />

              {/* Error */}
              {fieldError && (
                <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-400 text-sm leading-snug">{fieldError}</p>
                    {fieldError.toLowerCase().includes('already verified') && (
                      <Link to="/login" className="text-accent text-sm hover:underline mt-1 inline-block">
                        Sign in instead →
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {isPending ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Sending…
                  </>
                ) : (
                  'Send New Code'
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-white/40 text-sm">
                Already have a code?{' '}
                <Link
                  to="/verify-email"
                  state={{ email }}
                  className="text-accent hover:text-accent-dim transition-colors font-medium"
                >
                  Enter it here
                </Link>
              </p>
              <p className="text-white/25 text-sm">
                Back to{' '}
                <Link to="/login" className="text-white/40 hover:text-white/60 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}