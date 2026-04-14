import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ROLE_CREDS = [
  { role: 'Administrator', username: 'admin',   password: 'admin123' },
  { role: 'Team Manager',  username: 'manager', password: 'manager123' },
  { role: 'Player',        username: 'player1', password: 'player123' },
  { role: 'Analyst',       username: 'analyst', password: 'analyst123' },
]

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required'
    if (!form.password)        e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setErrors({})
    setApiError('')
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      const paths = {
        Administrator: '/admin',
        'Team Manager': '/manager',
        Player: '/player',
        Analyst: '/analyst',
      }
      navigate(paths[user.role] || '/admin')
    } catch (err) {
      setApiError(err.response?.data?.message || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  const quickFill = (cred) => {
    setForm({ username: cred.username, password: cred.password })
    setApiError('')
  }

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <h1>CRICKET<br/>MANAGEMENT</h1>
        <p>Professional cricket operations platform. Manage teams, tournaments, and performance analytics.</p>
        <div className="auth-taglines">
          {['Full RBAC enforcement', 'ACID transaction safety', 'Real-time analytics', 'Multi-tournament support'].map(t => (
            <div key={t} className="auth-tagline">
              <span className="dot" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-form-wrap">
        <h2>Sign In</h2>
        <p className="auth-sub">Access your cricket dashboard</p>

        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            <span>✕</span> {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className={`form-input ${errors.username ? 'error' : ''}`}
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              autoFocus
            />
            {errors.username && <p className="form-error">{errors.username}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className={`form-input ${errors.password ? 'error' : ''}`}
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In →'}
          </button>
        </form>

        {/* Quick Login Test Credentials */}
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--pitch-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            Quick Test Login
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            {ROLE_CREDS.map(c => (
              <button
                key={c.role}
                className="btn btn-ghost btn-sm"
                onClick={() => quickFill(c)}
                type="button"
                style={{ fontSize: '0.75rem' }}
              >
                {c.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}