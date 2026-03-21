import { useState, useRef } from 'react'  // ← add useRef
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { usersApi, authApi } from '../../api/user'
import { useUserStore } from '../../store/auth'
import { Input, Spinner, Card } from '../../components/shared/UI'
import { getErrorMessage } from '../../api/client'
import { fmt } from '../../utils'

export default function ProfilePage() {
  const { user, updateUser } = useUserStore()
  const qc = useQueryClient()
  const [editMode, setEditMode] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' })
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' })
  const [avatarPreview, setAvatarPreview] = useState(null)  // ← ADD
  const fileInputRef = useRef(null)                          // ← ADD

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getProfile,
  })

  const { mutate: updateProfile, isPending: updating } = useMutation({
    mutationFn: () => usersApi.updateProfile(profileForm),
    onSuccess: (data) => {
      toast.success('Profile updated!')
      updateUser(data)
      setEditMode(false)
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const { mutate: changePw, isPending: changingPw } = useMutation({
    mutationFn: () => authApi.changePassword(pwForm),
    onSuccess: () => {
      toast.success('Password changed successfully!')
      setPwForm({ currentPassword: '', newPassword: '' })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  // ── ADD THIS ──────────────────────────────────────────────────────────────
  const { mutate: uploadAvatar, isPending: uploadingAvatar } = useMutation({
    mutationFn: (file) => usersApi.uploadAvatar(file),
    onSuccess: (data) => {
      toast.success('Profile picture updated!')
      updateUser({ ...user, avatar: data.imageUrl })
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (err) => {
      toast.error(getErrorMessage(err))
      setAvatarPreview(null)
    },
  })

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    uploadAvatar(file)
  }
  // ─────────────────────────────────────────────────────────────────────────

  const displayUser = profile || user
  const avatarUrl = avatarPreview || displayUser?.avatar  // ← ADD

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-sub">Manage your account settings</p>
      </div>

      {/* Profile card */}
      <Card className="mb-5">
        <div className="flex items-center gap-5 mb-6">

          {/* ── REPLACE the old avatar div with this ── */}
          <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-navy-900 font-display font-black text-2xl">
                  {displayUser?.fullName?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            {/* upload indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
              {uploadingAvatar ? <Spinner size="sm" /> : <span className="text-[10px]">✏️</span>}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          {/* ── End avatar ── */}

          <div>
            <h2 className="font-display font-bold text-xl text-white">{displayUser?.fullName}</h2>
            <p className="text-white/40">{displayUser?.email}</p>
            <div className="flex gap-2 mt-2">
              {displayUser?.isActive && <span className="badge-success">Active</span>}
              {displayUser?.isEmailVerified && <span className="badge badge-processing bg-blue-500/15 text-blue-400">Email Verified</span>}
            </div>
          </div>
        </div>

        {/* ── Everything below is EXACTLY your original code ── */}
        {!editMode ? (
          <div className="space-y-3 text-sm">
            {[
              ['Full Name', displayUser?.fullName],
              ['Email', displayUser?.email],
              ['Phone', displayUser?.phone],
              ['Member since', fmt.date(displayUser?.createdAt)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-white/40">{k}</span>
                <span className="text-white">{v}</span>
              </div>
            ))}
            <button onClick={() => setEditMode(true)} className="btn-ghost w-full mt-3">Edit Profile</button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input label="Full Name" value={profileForm.fullName} onChange={(e) => setProfileForm(p => ({ ...p, fullName: e.target.value }))} />
            <Input label="Phone Number" value={profileForm.phone} onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} />
            <div className="flex gap-3">
              <button onClick={() => setEditMode(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={() => updateProfile()} disabled={updating} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {updating ? <><Spinner size="sm" /> Saving…</> : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Change password — untouched */}
      <Card>
        <h3 className="font-display font-semibold text-white mb-5">Change Password</h3>
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Min. 6 characters"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
          />
          <button
            onClick={() => changePw()}
            disabled={changingPw || !pwForm.currentPassword || !pwForm.newPassword}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {changingPw ? <><Spinner size="sm" /> Updating…</> : 'Update Password'}
          </button>
        </div>
      </Card>
    </div>
  )
}
