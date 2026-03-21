import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authApi } from '../../api/user'
import { Input, Spinner } from '../../components/shared/UI'

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

function getFriendlyError(err) {
  const msg = err?.response?.data?.message || err?.message || ''
  const status = err?.response?.status

  if (status === 409 || msg.toLowerCase().includes('already exists')) {
    if (msg.toLowerCase().includes('email')) return 'An account with this email already exists. Try signing in instead.'
    if (msg.toLowerCase().includes('phone')) return 'This phone number is already registered.'
    return 'Account already exists. Try signing in instead.'
  }
  if (msg.toLowerCase().includes('phone') && msg.toLowerCase().includes('valid')) {
    return 'Enter a valid Nigerian phone number (e.g. 08012345678).'
  }
  if (status >= 500) return 'Server error. Please try again in a few moments.'
  return msg || 'Registration failed. Please try again.'
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldError, setFieldError] = useState('')

  const { mutate: register, isPending } = useMutation({
    mutationFn: () => authApi.register(form),
    onSuccess: () => {
      setFieldError('')
      toast.success('Account created! Check your email for a verification code.')
      navigate('/verify-email', { replace: true, state: { email: form.email } })
    },
    onError: (err) => setFieldError(getFriendlyError(err)),
  })

  const set = (k) => (e) => {
    setFieldError('')
    setForm((p) => ({ ...p, [k]: e.target.value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent mb-4">
            <span className="text-navy-900 font-display font-black text-2xl">P</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white">Create account</h1>
          <p className="text-white/40 mt-2">Join PayEasy and start transacting</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); register() }} className="space-y-4">
          <Input label="Full Name" placeholder="John Doe" value={form.fullName} onChange={set('fullName')} required />
          <Input label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          <Input label="Phone number" placeholder="08012345678" value={form.phone} onChange={set('phone')} required />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={set('password')}
              required
              minLength={6}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-[38px] text-white/40 hover:text-white/70 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {form.password.length > 0 && form.password.length < 6 && (
            <p className="text-yellow-400/70 text-xs -mt-1">
              Password must be at least 6 characters
            </p>
          )}

          {fieldError && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-red-400 text-sm leading-snug">{fieldError}</p>
                {fieldError.includes('already exists') && (
                  <Link to="/login" className="text-accent text-sm hover:underline mt-1 inline-block">
                    Sign in instead →
                  </Link>
                )}
              </div>
            </div>
          )}

          <button type="submit" disabled={isPending} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {isPending ? <><Spinner size="sm" /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-dim transition-colors font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}