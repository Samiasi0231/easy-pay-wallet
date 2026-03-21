import { adminApi } from './client'

// Auth
export const adminAuthApi = {
  login:          (d) => adminApi.post('/admin/auth/login', d).then(r => r.data),
  logout:         ()  => adminApi.post('/admin/auth/logout').then(r => r.data),
  getMe:          ()  => adminApi.get('/admin/auth/me').then(r => r.data),
  refresh:        (d) => adminApi.post('/admin/auth/refresh', d).then(r => r.data),
  forgotPassword: (d) => adminApi.post('/admin/auth/forgot-password', d).then(r => r.data),
  resetPassword:  (d) => adminApi.post('/admin/auth/reset-password', d).then(r => r.data),
  changePassword: (d) => adminApi.patch('/admin/auth/change-password', d).then(r => r.data),

  // Admin mgmt (super admin)
  createAdmin:      (d)  => adminApi.post('/admin/auth/admins', d).then(r => r.data),
  getAllAdmins:      ()   => adminApi.get('/admin/auth/admins').then(r => r.data),
  updateAdminStatus:(id, status) => adminApi.patch(`/admin/auth/admins/${id}/status`, { status }).then(r => r.data),
}

// Dashboard
export const adminDashApi = {
  getDashboard:    (p)  => adminApi.get('/admin/dashboard', { params: p }).then(r => r.data),
  getVolumeChart:  (period) => adminApi.get('/admin/analytics/volume', { params: { period } }).then(r => r.data),
  getServiceBreakdown: (period) => adminApi.get('/admin/analytics/services', { params: { period } }).then(r => r.data),
}

// Users
export const adminUsersApi = {
  getAll:    (p) => adminApi.get('/admin/users', { params: p }).then(r => r.data),
  getById:   (id) => adminApi.get(`/admin/users/${id}`).then(r => r.data),
  updateStatus: (id, d) => adminApi.patch(`/admin/users/${id}/status`, d).then(r => r.data),
  getWallet: (id) => adminApi.get(`/admin/users/${id}/wallet`).then(r => r.data),
}

// Wallets
export const adminWalletApi = {
  fund:  (d) => adminApi.post('/admin/wallets/fund', d).then(r => r.data),
  debit: (d) => adminApi.post('/admin/wallets/debit', d).then(r => r.data),
}

// Transactions
export const adminTxApi = {
  getAll:    (p)  => adminApi.get('/admin/transactions', { params: p }).then(r => r.data),
  getById:   (id) => adminApi.get(`/admin/transactions/${id}`).then(r => r.data),
  updateStatus: (id, d) => adminApi.patch(`/admin/transactions/${id}/status`, d).then(r => r.data),
}
