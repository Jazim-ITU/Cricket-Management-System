import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const NAV_CONFIG = {
  Administrator: [
    { section: 'Overview', items: [
      { to: '/admin', label: 'Dashboard', icon: '◈', end: true },
    ]},
    { section: 'Management', items: [
      { to: '/admin/teams',       label: 'Teams',       icon: '🏟' },
      { to: '/admin/players',     label: 'Players',     icon: '🧢' },
      { to: '/admin/coaches',     label: 'Coaches',     icon: '📋' },
      { to: '/admin/tournaments', label: 'Tournaments', icon: '🏆' },
      { to: '/admin/matches',     label: 'Matches',     icon: '⚡' },
    ]},
    { section: 'Analytics', items: [
      { to: '/admin/statistics',   label: 'Statistics',   icon: '📊' },
    ]},
    { section: 'Transactions', items: [
      { to: '/admin/transactions', label: 'Transactions', icon: '⚙' },
    ]},
    { section: 'System', items: [
      { to: '/admin/users',        label: 'User Accounts', icon: '👤' },
    ]},
  ],
  'Team Manager': [
    { section: 'Overview', items: [
      { to: '/manager', label: 'Dashboard', icon: '◈', end: true },
    ]},
    { section: 'My Team', items: [
      { to: '/manager/team',    label: 'Team Info',   icon: '🏟' },
      { to: '/manager/players', label: 'Players',     icon: '🧢' },
      { to: '/manager/coaches', label: 'Coaches',     icon: '📋' },
    ]},
    
  ],
  Player: [
    { section: 'Overview', items: [
      { to: '/player', label: 'Dashboard', icon: '◈', end: true },
    ]},
    { section: 'My Profile', items: [
      { to: '/player/stats',   label: 'My Statistics', icon: '📊' },
      { to: '/player/matches', label: 'Match Schedule', icon: '⚡' },
    ]},
  ],
  Analyst: [
    { section: 'Overview', items: [
      { to: '/analyst', label: 'Dashboard', icon: '◈', end: true },
    ]},
    { section: 'Performance', items: [
      { to: '/analyst/batsmen',     label: 'Top Batsmen',   icon: '🏏' },
      { to: '/analyst/bowlers',     label: 'Top Bowlers',   icon: '🎯' },
      { to: '/analyst/teams',       label: 'Team Analysis', icon: '📈' },
      { to: '/analyst/tournaments', label: 'Tournaments',   icon: '🏆' },
    ]},
  ],
}

const ROLE_LABELS = {
  Administrator: 'Admin',
  'Team Manager': 'Team Manager',
  Player: 'Player',
  Analyst: 'Analyst',
}

export default function AppLayout({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navSections = NAV_CONFIG[role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-icon">🏏</span>
          <h2>CRICKET MS</h2>
          <span>Management System</span>
        </div>

        <div className="sidebar-user">
          <div className="avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.username}</div>
            <div className="user-role">{ROLE_LABELS[user?.role]}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span>⎋</span>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            display: 'none',
            background: 'none', border: 'none', color: 'var(--text)',
            fontSize: '1.4rem', cursor: 'pointer', marginBottom: '1rem'
          }}
          className="hamburger"
        >
          ☰
        </button>

        <Outlet />
      </main>
    </div>
  )
}