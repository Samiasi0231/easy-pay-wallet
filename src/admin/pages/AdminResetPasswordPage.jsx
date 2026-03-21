import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminAuthApi } from '../../api/admin'
import { Input, Spinner } from '../../components/shared/UI'
import { getErrorMessage } from '../../api/client'

export default function AdminResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ token: params.get('token') || '', newPassword: '' })

  const { mutate, isPending } = useMutation({
    mutationFn: () => adminAuthApi.resetPassword(form),
    onSuccess: () => {
      toast.success('Password reset successfully! Please log in.')
      navigate('/admin/login')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #050A14 0%, #0A0F1E 100%)' }}>
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400 mb-4">
            <span className="text-navy-900 font-display font-black text-2xl">🔐</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Reset Password</h1>
          <p className="text-white/40 mt-2">Enter your reset token and new password</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutate() }} className="space-y-4">
          <Input label="Reset Token" placeholder="Paste token from email" value={form.token} onChange={set('token')} required />
          <Input label="New Password" type="password" placeholder="Min. 8 chars + uppercase + special" value={form.newPassword} onChange={set('newPassword')} required minLength={8} />
          <button type="submit" disabled={isPending}
            className="w-full py-3 rounded-xl font-display font-semibold text-navy-900 flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
            {isPending ? <><Spinner size="sm" /> Resetting…</> : 'Reset Password'}
          </button>
        </form>
        <Link to="/admin/login" className="block text-center text-white/30 text-sm hover:text-white/50 mt-4">← Back to Login</Link>
      </div>
    </div>
  )
}
