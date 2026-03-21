import { NavLink, useNavigate } from 'react-router-dom'
import { useAdminStore } from '../../store/auth'
import { adminAuthApi } from '../../api/admin'

const navItems = [
  { to: '/admin/dashboard',     icon: '📊', label: 'Dashboard' },
  { to: '/admin/users',         icon: '👥', label: 'Users' },
  { to: '/admin/transactions',  icon: '💱', label: 'Transactions' },
  { to: '/admin/wallets',       icon: '💳', label: 'Wallets' },
  { to: '/admin/analytics',     icon: '📈', label: 'Analytics' },
]

const superAdminItems = [
  { to: '/admin/admins', icon: '🛡️', label: 'Admin Accounts' },
]

export default function AdminLayout({ children }) {
  const { admin, logout, isSuperAdmin } = useAdminStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await adminAuthApi.logout() } catch {}
    logout()
    navigate('/admin/login')
  }

  const roleColor = {
    super_admin: 'text-amber-400',
    admin: 'text-blue-400',
    support: 'text-purple-400',
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 fixed top-0 left-0 h-full bg-navy-950 border-r border-white/5 flex flex-col z-30">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
              <span className="text-navy-900 font-display font-black text-sm">A</span>
            </div>
            <div>
              <p className="font-display font-bold text-white text-base leading-none">PayEasy</p>
              <p className="text-white/30 text-xs mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-white/20 text-xs uppercase tracking-widest px-4 mb-2">Main</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={({ isActive }) => isActive ? { '--tw-border-opacity': 1, borderColor: '#f59e0b33', color: '#f59e0b', background: 'rgba(245,158,11,0.08)' } : {}}
            >
              <span className="text-lg w-6 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          {isSuperAdmin() && (
            <>
              <p className="text-white/20 text-xs uppercase tracking-widest px-4 mb-2 mt-4">Super Admin</p>
              {superAdminItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  style={({ isActive }) => isActive ? { borderColor: '#f59e0b33', color: '#f59e0b', background: 'rgba(245,158,11,0.08)' } : {}}
                >
                  <span className="text-lg w-6 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Admin info */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="px-3 py-3 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-navy-900 font-bold text-sm">
                  {admin?.firstName?.[0]?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {admin?.firstName} {admin?.lastName}
                </p>
                <p className={`text-xs capitalize ${roleColor[admin?.role] || 'text-white/40'}`}>
                  {admin?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-3 text-xs text-white/30 hover:text-red-400 transition-colors text-left px-1"
            >
              ⏻ Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
