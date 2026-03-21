import { userApi } from './client'

// Auth
export const authApi = {
  register:       (data) => userApi.post('/auth/register', data).then(r => r.data),
  login:          (data) => userApi.post('/auth/login', data).then(r => r.data),
  changePassword: (data) => userApi.post('/auth/change-password', data).then(r => r.data),
  verifyEmail:    (data) => userApi.post('/auth/verify-otp', data).then(r => r.data),
  resendOtp:      (data) => userApi.post('/auth/resend-otp', data).then(r => r.data),
}

// User
export const usersApi = {
  getProfile: ()     => userApi.get('/users/profile').then(r => r.data),
  updateProfile: (d) => userApi.put('/users/profile', d).then(r => r.data),

 uploadAvatar:  (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return userApi.post('/users/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

}

// Wallet
export const walletApi = {
  getBalance:     ()    => userApi.get('/wallet/balance').then(r => r.data),
  topup:          (d)   => userApi.post('/wallet/topup', d).then(r => r.data),
  verifyPayment:  (d)   => userApi.post('/wallet/verify-payment', d).then(r => r.data),
  getTransactions: (p)  => userApi.get('/wallet/transactions', { params: p }).then(r => r.data),
}

// Transactions
export const txApi = {
  getAll:      (p) => userApi.get('/transactions', { params: p }).then(r => r.data),
  getById:     (id) => userApi.get(`/transactions/${id}`).then(r => r.data),
  getStats:    (period) => userApi.get(`/transactions/statistics`, { params: { period } }).then(r => r.data),
}

// VTU
export const vtuApi = {
  // Airtime
  buyAirtime: (d) => userApi.post('/vtu/airtime', d).then(r => r.data),

  // Data
  getDataPlans: (network) => userApi.get(`/vtu/data/plans/${network}`).then(r => r.data),
  buyData:      (d)       => userApi.post('/vtu/data', d).then(r => r.data),

  // Electricity
  verifyMeter:      (d) => userApi.post('/vtu/electricity/verify', d).then(r => r.data),
  buyElectricity:   (d) => userApi.post('/vtu/electricity', d).then(r => r.data),

  // Cable
  verifySmartCard:  (d) => userApi.post('/vtu/cable/verify', d).then(r => r.data),
  getCablePackages: (p) => userApi.get(`/vtu/cable/packages/${p}`).then(r => r.data),
  buyCable:         (d) => userApi.post('/vtu/cable', d).then(r => r.data),
}
