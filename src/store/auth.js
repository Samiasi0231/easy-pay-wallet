import { create } from 'zustand'

// ── User Store ──────────────────────────────────────────────────────────────
export const useUserStore = create((set) => ({
  user: (() => {
    try { return JSON.parse(localStorage.getItem('user_data')) } catch { return null }
  })(),
  token: localStorage.getItem('user_token'),

  setAuth: (user, token) => {
    localStorage.setItem('user_token', token)
    localStorage.setItem('user_data', JSON.stringify(user))
    set({ user, token })
  },

  updateUser: (user) => {
    localStorage.setItem('user_data', JSON.stringify(user))
    set({ user })
  },

  logout: () => {
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_data')
    set({ user: null, token: null })
  },

  isAuthenticated: () => !!localStorage.getItem('user_token'),
}))

// ── Admin Store ─────────────────────────────────────────────────────────────
export const useAdminStore = create((set, get) => ({
  admin: (() => {
    try { return JSON.parse(localStorage.getItem('admin_data')) } catch { return null }
  })(),
  token: localStorage.getItem('admin_token'),

  setAuth: (admin, token, refreshToken) => {
    localStorage.setItem('admin_token', token)
    if (refreshToken) localStorage.setItem('admin_refresh_token', refreshToken)
    localStorage.setItem('admin_data', JSON.stringify(admin))
    set({ admin, token })
  },

  updateAdmin: (admin) => {
    localStorage.setItem('admin_data', JSON.stringify(admin))
    set({ admin })
  },

  logout: () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_refresh_token')
    localStorage.removeItem('admin_data')
    set({ admin: null, token: null })
  },

  isAuthenticated: () => !!localStorage.getItem('admin_token'),
  isSuperAdmin: () => get().admin?.role === 'super_admin',
}))
