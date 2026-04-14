import { useState, useEffect, useMemo } from 'react'
import { matchesAPI, teamsAPI, tournamentsAPI } from '../../services/api'
import { Modal, ConfirmDialog } from '../../components/Modal'
import { useToast } from '../../components/Toast'

const VENUES = [
  { venue_id: 1, venue_name: 'Eden Gardens' },
  { venue_id: 2, venue_name: 'MCG' },
  { venue_id: 3, venue_name: 'Lords' },
  { venue_id: 4, venue_name: 'Gaddafi Stadium' },
  { venue_id: 5, venue_name: 'Newlands' },
  { venue_id: 6, venue_name: 'Wankhede Stadium' },
  { venue_id: 7, venue_name: 'Chinnaswamy Stadium' },
  { venue_id: 8, venue_name: 'National Stadium' },
  { venue_id: 9, venue_name: 'Sher-e-Bangla' },
  { venue_id: 10, venue_name: 'Kensington Oval' },
]

const EMPTY = { tournament_id: '', venue_id: '', team1_id: '', team2_id: '', match_date: '', start_time: '', end_time: '', winner_team_id: '' }

export default function AdminMatches() {
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTournament, setFilterTournament] = useState('')
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
      const [mRes, tRes, tourRes] = await Promise.all([
        matchesAPI.getAll(), teamsAPI.getAll(), tournamentsAPI.getAll()
      ])
      setMatches(mRes.data.data || [])
      setTeams(tRes.data.data || [])
      setTournaments(tourRes.data.data || [])
    } catch { toast('Failed to load data', 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => matches.filter(m => {
    const q = search.toLowerCase()
    const matchQ = !q || m.team1_name?.toLowerCase().includes(q) || m.team2_name?.toLowerCase().includes(q) || m.venue_name?.toLowerCase().includes(q)
    const matchT = !filterTournament || String(m.tournament_id) === filterTournament
    return matchQ && matchT
  }), [matches, search, filterTournament])

  const openCreate = () => { setForm(EMPTY); setErrors({}); setModal({ open: true, mode: 'create', data: null }) }
  const openEdit = (m) => {
    setForm({
      tournament_id: m.tournament_id || '', venue_id: m.venue_id || '',
      team1_id: m.team1_id || '', team2_id: m.team2_id || '',
      match_date: m.match_date?.slice(0, 10) || '',
      start_time: m.start_time ? m.start_time.slice(0, 16) : '',
      end_time: m.end_time ? m.end_time.slice(0, 16) : '',
      winner_team_id: m.winner_team_id || ''
    })
    setErrors({})
    setModal({ open: true, mode: 'edit', data: m })
  }

  const validate = () => {
    const e = {}
    if (!form.tournament_id) e.tournament_id = 'Tournament required'
    if (!form.venue_id)      e.venue_id = 'Venue required'
    if (!form.team1_id)      e.team1_id = 'Team 1 required'
    if (!form.team2_id)      e.team2_id = 'Team 2 required'
    if (!form.match_date)    e.match_date = 'Date required'
    if (form.team1_id && form.team2_id && form.team1_id === form.team2_id) {
      e.team2_id = 'Teams must be different'
    }

    // Start time must be on the SAME date as match date
    if (form.match_date && form.start_time) {
      const matchDateOnly = new Date(form.match_date).toISOString().slice(0, 10)
      const startDateOnly = new Date(form.start_time).toISOString().slice(0, 10)
      if (startDateOnly !== matchDateOnly) {
        e.start_time = `Start time must be on the match date (${matchDateOnly})`
      }
    }

    // End time must be on or after match date
    if (form.match_date && form.end_time) {
      const matchDateOnly = new Date(form.match_date).toISOString().slice(0, 10)
      const endDateOnly = new Date(form.end_time).toISOString().slice(0, 10)
      if (endDateOnly < matchDateOnly) {
        e.end_time = `End time must be on or after match date (${matchDateOnly})`
      }
    }

    // End time must be after start time
    if (form.start_time && form.end_time) {
      if (new Date(form.end_time) <= new Date(form.start_time)) {
        e.end_time = 'End time must be after start time'
      }
    }

    return e
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        tournament_id: parseInt(form.tournament_id),
        venue_id: parseInt(form.venue_id),
        team1_id: parseInt(form.team1_id),
        team2_id: parseInt(form.team2_id),
        winner_team_id: form.winner_team_id ? parseInt(form.winner_team_id) : null,
      }
      if (modal.mode === 'create') {
        await matchesAPI.create(payload)
        toast('Match scheduled!', 'success')
      } else {
        await matchesAPI.update(modal.data.match_id, payload)
        toast('Match updated!', 'success')
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
      await matchesAPI.delete(confirm.id)
      toast('Match deleted.', 'success')
      setConfirm({ open: false, id: null })
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete', 'error')
    } finally { setDeleting(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Matches <span>Management</span></h1>
          <p className="page-subtitle">{matches.length} fixtures · {filtered.length} shown</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Schedule Match</button>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search team or venue..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterTournament} onChange={e => setFilterTournament(e.target.value)}>
          <option value="">All Tournaments</option>
          {tournaments.map(t => <option key={t.tournament_id} value={t.tournament_id}>{t.tournament_name}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-overlay"><div className="spinner" style={{ width: 28, height: 28 }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">⚡</div><h3>No matches found</h3></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Match</th>
                  <th>Tournament</th>
                  <th>Venue</th>
                  <th>Date</th>
                  <th>Winner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.match_id}>
                    <td>
                      <span style={{ fontWeight: 600 }}>{m.team1_name}</span>
                      <span style={{ color: 'var(--text-dim)', margin: '0 0.5rem', fontSize: '0.78rem' }}>VS</span>
                      <span style={{ fontWeight: 600 }}>{m.team2_name}</span>
                    </td>
                    <td><span className="badge badge-gold">{m.tournament_name}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{m.venue_name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                      {m.match_date ? new Date(m.match_date).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {m.winner_name
                        ? <span className="badge badge-green">🏆 {m.winner_name}</span>
                        : <span className="badge badge-muted">TBD</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>✏ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ open: true, id: m.match_id })}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={() => setModal(m => ({ ...m, open: false }))} title={modal.mode === 'create' ? 'Schedule New Match' : 'Edit Match'} maxWidth="600px">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tournament *</label>
            <select className={`form-select ${errors.tournament_id ? 'error' : ''}`} value={form.tournament_id} onChange={e => setForm(f => ({ ...f, tournament_id: e.target.value }))}>
              <option value="">Select tournament</option>
              {tournaments.map(t => <option key={t.tournament_id} value={t.tournament_id}>{t.tournament_name}</option>)}
            </select>
            {errors.tournament_id && <p className="form-error">{errors.tournament_id}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Venue *</label>
            <select className={`form-select ${errors.venue_id ? 'error' : ''}`} value={form.venue_id} onChange={e => setForm(f => ({ ...f, venue_id: e.target.value }))}>
              <option value="">Select venue</option>
              {VENUES.map(v => <option key={v.venue_id} value={v.venue_id}>{v.venue_name}</option>)}
            </select>
            {errors.venue_id && <p className="form-error">{errors.venue_id}</p>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Team 1 *</label>
            <select className={`form-select ${errors.team1_id ? 'error' : ''}`} value={form.team1_id} onChange={e => setForm(f => ({ ...f, team1_id: e.target.value }))}>
              <option value="">Select team</option>
              {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
            </select>
            {errors.team1_id && <p className="form-error">{errors.team1_id}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Team 2 *</label>
            <select className={`form-select ${errors.team2_id ? 'error' : ''}`} value={form.team2_id} onChange={e => setForm(f => ({ ...f, team2_id: e.target.value }))}>
              <option value="">Select team</option>
              {teams.filter(t => String(t.team_id) !== String(form.team1_id)).map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
            </select>
            {errors.team2_id && <p className="form-error">{errors.team2_id}</p>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Match Date *</label>
            <input
              className={`form-input ${errors.match_date ? 'error' : ''}`}
              type="date"
              value={form.match_date}
              onChange={e => setForm(f => ({ ...f, match_date: e.target.value }))}
            />
            {errors.match_date && <p className="form-error">{errors.match_date}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Winner (optional)</label>
            <select className="form-select" value={form.winner_team_id} onChange={e => setForm(f => ({ ...f, winner_team_id: e.target.value }))}>
              <option value="">TBD / Not played</option>
              {form.team1_id && teams.find(t => String(t.team_id) === String(form.team1_id)) && (
                <option value={form.team1_id}>{teams.find(t => String(t.team_id) === String(form.team1_id))?.team_name}</option>
              )}
              {form.team2_id && teams.find(t => String(t.team_id) === String(form.team2_id)) && (
                <option value={form.team2_id}>{teams.find(t => String(t.team_id) === String(form.team2_id))?.team_name}</option>
              )}
            </select>
          </div>
        </div>

        {/* ── Start & End Time with validation ── */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Time</label>
            <input
              className={`form-input ${errors.start_time ? 'error' : ''}`}
              type="datetime-local"
              value={form.start_time}
              onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
            />
            {errors.start_time && <p className="form-error">{errors.start_time}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">End Time</label>
            <input
              className={`form-input ${errors.end_time ? 'error' : ''}`}
              type="datetime-local"
              value={form.end_time}
              onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
            />
            {errors.end_time && <p className="form-error">{errors.end_time}</p>}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setModal(m => ({ ...m, open: false }))}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving...</> : modal.mode === 'create' ? '+ Schedule Match' : '✓ Update Match'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open: false, id: null })} onConfirm={handleDelete} title="Delete Match" message="Are you sure you want to delete this match fixture?" loading={deleting} />
    </div>
  )
}