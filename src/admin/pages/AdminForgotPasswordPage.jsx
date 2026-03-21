import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminAuthApi } from '../../api/admin'
import { Input, Spinner } from '../../components/shared/UI'
import { getErrorMessage } from '../../api/client'

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [devToken, setDevToken] = useState(null)

  const { mutate, isPending } = useMutation({
    mutationFn: () => adminAuthApi.forgotPassword({ email }),
    onSuccess: (data) => {
      setSent(true)
      if (data._devToken) setDevToken(data._devToken)
      toast.success('Reset email sent (if registered)')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #050A14 0%, #0A0F1E 100%)' }}>
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400 mb-4">
            <span className="text-navy-900 font-display font-black text-2xl">A</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Forgot Password</h1>
          <p className="text-white/40 mt-2">Enter your admin email to reset</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-4xl">📧</div>
            <p className="text-white">Check your email for a reset link</p>
            {devToken && (
              <div className="glass-card p-3 text-left">
                <p className="text-white/40 text-xs mb-1">DEV TOKEN (remove in production):</p>
                <p className="text-accent font-mono text-xs break-all">{devToken}</p>
                <Link to={`/admin/reset-password?token=${devToken}`} className="text-amber-400 text-xs hover:underline mt-2 block">
                  → Use this token to reset
                </Link>
              </div>
            )}
            <Link to="/admin/login" className="btn-ghost block text-center mt-4">← Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); mutate() }} className="space-y-4">
            <Input label="Admin Email" type="email" placeholder="admin@payeasy.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" disabled={isPending}
              className="w-full py-3 px-6 rounded-xl font-display font-semibold text-navy-900 flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              {isPending ? <><Spinner size="sm" /> Sending…</> : 'Send Reset Link'}
            </button>
            <Link to="/admin/login" className="block text-center text-white/30 text-sm hover:text-white/50 mt-3">← Back to Login</Link>
          </form>
        )}
      </div>
    </div>
  )
}
