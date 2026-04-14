import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'
import { teamsAPI, playersAPI } from '../../services/api'
import api from '../../services/api'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'Player', team_id: '', player_id: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [allTeams, setAllTeams] = useState([])
  const [assignedTeamIds, setAssignedTeamIds] = useState([])
  const [players, setPlayers] = useState([])
  const { register } = useAuth()
  const toast = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all teams
        const tRes = await teamsAPI.getAll()
        setAllTeams(tRes.data.data || [])

        // Load all users to find which teams already have managers
        const uRes = await api.get('/auth/managers')
        const managerTeamIds = (uRes.data.data || []).map(u => u.team_id).filter(Boolean)
        setAssignedTeamIds(managerTeamIds)

        // Load players
        const pRes = await playersAPI.getAll()
        setPlayers(pRes.data.data || [])
      } catch {}
    }
    loadData()
  }, [])

  // Teams not yet assigned to any manager
  const availableTeams = allTeams.filter(t => !assignedTeamIds.includes(t.team_id))

  const validate = () => {
    const e = {}
    if (!form.username.trim()) e.username = 'Username is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    if (form.role === 'Team Manager' && !form.team_id) e.team_id = 'You must assign a team to this manager'
    if (form.role === 'Player' && !form.player_id) e.player_id = 'Player profile is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
        team_id: form.team_id ? parseInt(form.team_id) : null,
        player_id: form.player_id ? parseInt(form.player_id) : null,
      }
      await register(payload)
      toast(`${form.role} account created successfully! Password auto-hashed.`, 'success')
      setForm({ username: '', email: '', password: '', role: 'Player', team_id: '', player_id: '' })
      // Refresh assigned teams list
      const uRes = await api.get('/auth/managers')
      const managerTeamIds = (uRes.data.data || []).map(u => u.team_id).filter(Boolean)
      setAssignedTeamIds(managerTeamIds)
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to create user.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Create <span>User Account</span></h1>
          <p className="page-subtitle">Register system users — passwords are automatically bcrypt-hashed</p>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        <span>ℹ</span>
        <span>Passwords are <strong>automatically hashed</strong> — just enter plain text. No manual SQL needed.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Registration Form */}
        <div className="card">
          <div className="card-header"><span className="card-title">New User</span></div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select
                className="form-select"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value, team_id: '', player_id: '' }))}
              >
                <option value="Administrator">Administrator</option>
                <option value="Team Manager">Team Manager</option>
                <option value="Player">Player</option>
                <option value="Analyst">Analyst</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Username *</label>
              <input
                className={`form-input ${errors.username ? 'error' : ''}`}
                type="text"
                placeholder="e.g. manager_india"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              />
              {errors.username && <p className="form-error">{errors.username}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                className={`form-input ${errors.email ? 'error' : ''}`}
                type="email"
                placeholder="user@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Password * (auto-hashed)</label>
              <input
                className={`form-input ${errors.password ? 'error' : ''}`}
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            {/* Team Manager — assign team */}
            {form.role === 'Team Manager' && (
              <div className="form-group">
                <label className="form-label">Assign Team * (unassigned teams only)</label>
                {availableTeams.length === 0 ? (
                  <div className="alert alert-error" style={{ margin: 0 }}>
                    <span>⚠</span> All teams already have managers assigned. No teams available.
                  </div>
                ) : (
                  <>
                    <select
                      className={`form-select ${errors.team_id ? 'error' : ''}`}
                      value={form.team_id}
                      onChange={e => setForm(f => ({ ...f, team_id: e.target.value }))}
                    >
                      <option value="">— Select team —</option>
                      {availableTeams.map(t => (
                        <option key={t.team_id} value={t.team_id}>{t.team_name} ({t.city})</option>
                      ))}
                    </select>
                    {errors.team_id && <p className="form-error">{errors.team_id}</p>}
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                      Only teams without a manager are shown. {assignedTeamIds.length} team(s) already have managers.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Player — link to player profile */}
            {form.role === 'Player' && (
              <div className="form-group">
                <label className="form-label">Link to Player Profile *</label>
                <select
                  className={`form-select ${errors.player_id ? 'error' : ''}`}
                  value={form.player_id}
                  onChange={e => setForm(f => ({ ...f, player_id: e.target.value }))}
                >
                  <option value="">— Select player —</option>
                  {players.map(p => (
                    <option key={p.player_id} value={p.player_id}>
                      {p.first_name} {p.last_name} · {p.role} · {p.team_name || 'Unassigned'}
                    </option>
                  ))}
                </select>
                {errors.player_id && <p className="form-error">{errors.player_id}</p>}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', marginTop: '0.5rem' }}
              disabled={loading || (form.role === 'Team Manager' && availableTeams.length === 0)}
            >
              {loading ? <><span className="spinner" /> Creating...</> : '+ Create Account'}
            </button>
          </form>
        </div>

        {/* Teams Status Panel */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Teams Status</span>
            <span className="badge badge-muted">{allTeams.length} total</span>
          </div>
          <div style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="badge badge-green">✓ {assignedTeamIds.length} have manager</span>
            <span className="badge badge-gold">◎ {availableTeams.length} available</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: 400, overflowY: 'auto' }}>
            {allTeams.map(t => {
              const hasManager = assignedTeamIds.includes(t.team_id)
              return (
                <div
                  key={t.team_id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.6rem 0.75rem',
                    background: 'var(--pitch-mid)',
                    borderRadius: 6,
                    border: `1px solid ${hasManager ? 'var(--border)' : 'rgba(201,168,76,0.2)'}`,
                    opacity: hasManager ? 0.6 : 1,
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{t.team_name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{t.city}</div>
                  </div>
                  {hasManager
                    ? <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>✓ Manager</span>
                    : <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>No Manager</span>
                  }
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}