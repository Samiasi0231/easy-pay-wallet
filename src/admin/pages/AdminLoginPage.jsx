import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { adminAuthApi } from '../../api/admin'
import { useAdminStore } from '../../store/auth'
import { getErrorMessage } from '../../api/client'
import { Input, Spinner } from '../../components/shared/UI'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const setAuth = useAdminStore((s) => s.setAuth)
  const [form, setForm] = useState({ email: '', password: '' })

  const { mutate: login, isPending } = useMutation({
    mutationFn: () => adminAuthApi.login(form),
    onSuccess: (data) => {
      setAuth(data.admin, data.accessToken, data.refreshToken)
      toast.success(`Welcome, ${data.admin.firstName}!`)
      navigate('/admin/dashboard')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #050A14 0%, #0A0F1E 50%, #0D1520 100%)' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-amber-400/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-orange-500/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-400 mb-4">
            <span className="text-navy-900 font-display font-black text-2xl">A</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-white">Admin Portal</h1>
          <p className="text-white/40 mt-2">Sign in to manage PayEasy</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); login() }} className="space-y-4">
          <Input label="Admin Email" type="email" placeholder="admin@payeasy.com" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} required />
          <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))} required />

          <button type="submit" disabled={isPending}
            className="w-full mt-6 py-3 px-6 rounded-xl font-display font-semibold text-navy-900 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
            {isPending ? <><Spinner size="sm" /> Signing in…</> : 'Sign In to Admin'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link to="/admin/forgot-password" className="text-amber-400/70 text-sm hover:text-amber-400 transition-colors">
            Forgot password?
          </Link>
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          This portal is for authorized administrators only
        </p>
      </div>
    </div>
  )
}
