import { Routes, Route, Navigate } from 'react-router-dom'
import { useUserStore, useAdminStore } from './store/auth'

// Layouts
import UserLayout from './user/components/UserLayout'
import AdminLayout from './admin/components/AdminLayout'

// User pages
import LoginPage from './user/pages/LoginPage'
import RegisterPage from './user/pages/RegisterPage'
import DashboardPage from './user/pages/DashboardPage'
import WalletPage from './user/pages/WalletPage'
import AirtimePage from './user/pages/AirtimePage'
import DataPage from './user/pages/DataPage'
import ElectricityPage from './user/pages/ElectricityPage'
import CablePage from './user/pages/CablePage'
import TransactionsPage from './user/pages/TransactionsPage'
import ProfilePage from './user/pages/ProfilePage'
import EmailVerificationPage from './user/pages/EmailVerification'


// Admin pages
import AdminLoginPage from './admin/pages/AdminLoginPage'
import AdminForgotPasswordPage from './admin/pages/AdminForgotPasswordPage'
import AdminResetPasswordPage from './admin/pages/AdminResetPasswordPage'
import AdminDashboard from './admin/pages/AdminDashboard'
import AdminUsersPage from './admin/pages/AdminUsersPage'
import AdminTransactionsPage from './admin/pages/AdminTransactionsPage'
import AdminWalletsPage from './admin/pages/AdminWalletsPage'
import AdminAnalyticsPage from './admin/pages/AdminAnalyticsPage'
import AdminsManagementPage from './admin/pages/AdminsManagementPage'
import ResendOtpPage from './user/pages/ResendEmail'
// ── Route Guards ─────────────────────────────────────────────────────────────
// Subscribe to `token` directly (not isAuthenticated()) so Zustand re-renders
// the guard immediately when the token is set in the store after login.

function UserGuard({ children }) {
  const token = useUserStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

function UserPublicGuard({ children }) {
  const token = useUserStore((s) => s.token)
  return token ? <Navigate to="/dashboard" replace /> : children
}

function AdminGuard({ children }) {
  const token = useAdminStore((s) => s.token)
  return token ? children : <Navigate to="/admin/login" replace />
}

function AdminPublicGuard({ children }) {
  const token = useAdminStore((s) => s.token)
  return token ? <Navigate to="/admin/dashboard" replace /> : children
}

export default function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* ── User public ───────────────────────────────────────── */}
      <Route path="/login"    element={<UserPublicGuard><LoginPage /></UserPublicGuard>} />
      <Route path="/register" element={<UserPublicGuard><RegisterPage /></UserPublicGuard>} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
       <Route path="/resend-otp"   element={<ResendOtpPage />} />
      {/* ── User protected ────────────────────────────────────── */}
      <Route path="/dashboard"   element={<UserGuard><UserLayout><DashboardPage /></UserLayout></UserGuard>} />
      <Route path="/wallet"      element={<UserGuard><UserLayout><WalletPage /></UserLayout></UserGuard>} />
      <Route path="/airtime"     element={<UserGuard><UserLayout><AirtimePage /></UserLayout></UserGuard>} />
      <Route path="/data"        element={<UserGuard><UserLayout><DataPage /></UserLayout></UserGuard>} />
      <Route path="/electricity" element={<UserGuard><UserLayout><ElectricityPage /></UserLayout></UserGuard>} />
      <Route path="/cable"       element={<UserGuard><UserLayout><CablePage /></UserLayout></UserGuard>} />
      <Route path="/transactions"element={<UserGuard><UserLayout><TransactionsPage /></UserLayout></UserGuard>} />
      <Route path="/profile"     element={<UserGuard><UserLayout><ProfilePage /></UserLayout></UserGuard>} />

      {/* ── Admin public ──────────────────────────────────────── */}
      <Route path="/admin"                  element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login"            element={<AdminPublicGuard><AdminLoginPage /></AdminPublicGuard>} />
      <Route path="/admin/forgot-password"  element={<AdminForgotPasswordPage />} />
      <Route path="/admin/reset-password"   element={<AdminResetPasswordPage />} />

      {/* ── Admin protected ───────────────────────────────────── */}
      <Route path="/admin/dashboard"    element={<AdminGuard><AdminLayout><AdminDashboard /></AdminLayout></AdminGuard>} />
      <Route path="/admin/users"        element={<AdminGuard><AdminLayout><AdminUsersPage /></AdminLayout></AdminGuard>} />
      <Route path="/admin/transactions" element={<AdminGuard><AdminLayout><AdminTransactionsPage /></AdminLayout></AdminGuard>} />
      <Route path="/admin/wallets"      element={<AdminGuard><AdminLayout><AdminWalletsPage /></AdminLayout></AdminGuard>} />
      <Route path="/admin/analytics"    element={<AdminGuard><AdminLayout><AdminAnalyticsPage /></AdminLayout></AdminGuard>} />
      <Route path="/admin/admins"       element={<AdminGuard><AdminLayout><AdminsManagementPage /></AdminLayout></AdminGuard>} />

      {/* 404 */}
      <Route path="*" element={
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-6xl font-display font-black text-white/10">404</p>
          <p className="text-white/40">Page not found</p>
          <a href="/" className="text-accent hover:text-accent-dim transition-colors">← Go home</a>
        </div>
      } />
    </Routes>
  )
}
