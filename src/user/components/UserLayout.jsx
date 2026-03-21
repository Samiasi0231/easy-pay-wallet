import { NavLink, useNavigate } from 'react-router-dom'
import { useUserStore } from '../../store/auth'
import { authApi } from '../../api/user'

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/wallet',    icon: '💳', label: 'Wallet' },
  { to: '/airtime',   icon: '📱', label: 'Airtime' },
  { to: '/data',      icon: '🌐', label: 'Data' },
  { to: '/electricity', icon: '⚡', label: 'Electricity' },
  { to: '/cable',     icon: '📺', label: 'Cable TV' },
  { to: '/transactions', icon: '📊', label: 'Transactions' },
  { to: '/profile',   icon: '👤', label: 'Profile' },
]

export default function UserLayout({ children }) {
  const { user, logout } = useUserStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await authApi.logout?.() } catch {}
    logout()
    navigate('/login')
  }

const AvatarCircle = ({ size = 'sm' }) => {
    const dim = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-10 h-10 text-base'
    return user?.avatar ? (
      <img
        src={user.avatar}
        alt="avatar"
        className={`${dim} rounded-full object-cover`}
      />
    ) : (
      <div className={`${dim} rounded-full bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center`}>
        <span className="text-navy-900 font-bold">
          {user?.fullName?.[0]?.toUpperCase() || 'U'}
        </span>
      </div>
    )
  }


  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 fixed top-0 left-0 h-full bg-navy-950 border-r border-white/5 flex flex-col z-30">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-navy-900 font-display font-black text-sm">P</span>
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">PayEasy</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="text-lg w-6 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl">
            <AvatarCircle size="sm" /> 
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-white/40 text-xs truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} title="Logout" className="text-white/30 hover:text-red-400 transition-colors text-lg">
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
