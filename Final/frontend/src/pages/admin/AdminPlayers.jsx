import { useState, useEffect, useMemo } from 'react'
import { playersAPI, teamsAPI } from '../../services/api'
import { Modal, ConfirmDialog } from '../../components/Modal'
import { useToast } from '../../components/Toast'

const ROLES = ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper']
const EMPTY = { first_name: '', last_name: '', date_of_birth: '', role: 'Batsman', batting_style: '', bowling_style: '', nationality: '', team_id: '' }

const roleBadge = (r) => {
  const map = { Batsman: 'badge-gold', Bowler: 'badge-green', 'All-Rounder': 'badge-sky', Wicketkeeper: 'badge-muted' }
  return map[r] || 'badge-muted'
}

export default function AdminPlayers() {
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterTeam, setFilterTeam] = useState('')
  const [filterNat, setFilterNat] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null })
  const [confirm, setConfirm] = useState({ open: false, id: null })
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const toast = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const [pRes, tRes] = await Promise.all([playersAPI.getAll(), teamsAPI.getAll()])
      setPlayers(pRes.data.data || [])
      setTeams(tRes.data.data || [])
    } catch { toast('Failed to load data', 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const nationalities = useMemo(() => [...new Set(players.map(p => p.nationality).filter(Boolean))].sort(), [players])

  const filtered = useMemo(() => players.filter(p => {
    const q = search.toLowerCase()
    const matchQ = !q || `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) || p.nationality?.toLowerCase().includes(q)
    const matchRole = !filterRole || p.role === filterRole
    const matchTeam = !filterTeam || String(p.team_id) === filterTeam
    const matchNat  = !filterNat  || p.nationality === filterNat
    return matchQ && matchRole && matchTeam && matchNat
  }), [players, search, filterRole, filterTeam, filterNat])

  const openCreate = () => { setForm(EMPTY); setErrors({}); setModal({ open: true, mode: 'create', data: null }) }
  const openEdit = (p) => {
    setForm({ first_name: p.first_name, last_name: p.last_name, date_of_birth: p.date_of_birth?.slice(0, 10) || '', role: p.role, batting_style: p.batting_style || '', bowling_style: p.bowling_style || '', nationality: p.nationality || '', team_id: p.team_id || '' })
    setErrors({})
    setModal({ open: true, mode: 'edit', data: p })
  }

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'First name required'
    if (!form.last_name.trim())  e.last_name  = 'Last name required'
    if (!form.role)              e.role       = 'Role is required'
    return e
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const payload = { ...form, team_id: form.team_id ? parseInt(form.team_id) : null }
      if (modal.mode === 'create') {
        await playersAPI.create(payload)
        toast('Player created!', 'success')
      } else {
        await playersAPI.update(modal.data.player_id, payload)
        toast('Player updated!', 'success')
      }
      setModal(m => ({ ...m, open: false }))
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Operation failed', 'error')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await playersAPI.delete(confirm.id)
      toast('Player deleted.', 'success')
      setConfirm({ open: false, id: null })
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete player', 'error')
    } finally { setDeleting(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Players <span>Management</span></h1>
          <p className="page-subtitle">{players.length} players · {filtered.length} shown</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Player</button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search name or nationality..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="filter-select" value={filterTeam} onChange={e => setFilterTeam(e.target.value)}>
          <option value="">All Teams</option>
          {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
        </select>
        <select className="filter-select" value={filterNat} onChange={e => setFilterNat(e.target.value)}>
          <option value="">All Nationalities</option>
          {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        {(search || filterRole || filterTeam || filterNat) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterRole(''); setFilterTeam(''); setFilterNat('') }}>✕ Clear</button>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-overlay"><div className="spinner" style={{ width: 28, height: 28 }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧢</div>
            <h3>No players found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Nationality</th>
                  <th>Team</th>
                  <th>Batting</th>
                  <th>Bowling</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.player_id}>
                    <td>
                      <strong>{p.first_name} {p.last_name}</strong>
                    </td>
                    <td><span className={`badge ${roleBadge(p.role)}`}>{p.role}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.nationality || '—'}</td>
                    <td style={{ fontSize: '0.82rem' }}>{p.team_name || <span style={{ color: 'var(--text-dim)' }}>Unassigned</span>}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{p.batting_style || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{p.bowling_style || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ open: true, id: p.player_id })}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={() => setModal(m => ({ ...m, open: false }))} title={modal.mode === 'create' ? 'Add New Player' : 'Edit Player'} maxWidth="600px">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input className={`form-input ${errors.first_name ? 'error' : ''}`} value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="e.g. Virat" />
            {errors.first_name && <p className="form-error">{errors.first_name}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input className={`form-input ${errors.last_name ? 'error' : ''}`} value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="e.g. Kohli" />
            {errors.last_name && <p className="form-error">{errors.last_name}</p>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select className={`form-select ${errors.role ? 'error' : ''}`} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Nationality</label>
            <input className="form-input" value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} placeholder="e.g. Indian" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Batting Style</label>
            <input className="form-input" value={form.batting_style} onChange={e => setForm(f => ({ ...f, batting_style: e.target.value }))} placeholder="Right-hand / Left-hand" />
          </div>
          <div className="form-group">
            <label className="form-label">Bowling Style</label>
            <input className="form-input" value={form.bowling_style} onChange={e => setForm(f => ({ ...f, bowling_style: e.target.value }))} placeholder="Fast / Spin / None" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input className="form-input" type="date" value={form.date_of_birth} onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Team</label>
            <select className="form-select" value={form.team_id} onChange={e => setForm(f => ({ ...f, team_id: e.target.value }))}>
              <option value="">— Unassigned —</option>
              {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setModal(m => ({ ...m, open: false }))}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving...</> : modal.mode === 'create' ? '+ Create Player' : '✓ Update Player'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open: false, id: null })} onConfirm={handleDelete} title="Delete Player" message="Are you sure? This will also remove their statistics." loading={deleting} />
    </div>
  )
}