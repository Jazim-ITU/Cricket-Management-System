import { useState, useEffect, useMemo } from 'react'
import { coachesAPI, teamsAPI } from '../../services/api'
import { Modal, ConfirmDialog } from '../../components/Modal'
import { useToast } from '../../components/Toast'

const EMPTY = { first_name: '', last_name: '', specialization: '', experience_years: '', team_id: '' }

export default function AdminCoaches() {
  const [coaches, setCoaches] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
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
      const [cRes, tRes] = await Promise.all([coachesAPI.getAll(), teamsAPI.getAll()])
      setCoaches(cRes.data.data || [])
      setTeams(tRes.data.data || [])
    } catch { toast('Failed to load data', 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => coaches.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    c.team_name?.toLowerCase().includes(search.toLowerCase())
  ), [coaches, search])

  const openCreate = () => { setForm(EMPTY); setErrors({}); setModal({ open: true, mode: 'create', data: null }) }
  const openEdit = (c) => {
    setForm({ first_name: c.first_name, last_name: c.last_name, specialization: c.specialization || '', experience_years: c.experience_years || '', team_id: c.team_id || '' })
    setErrors({})
    setModal({ open: true, mode: 'edit', data: c })
  }

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'First name required'
    if (!form.last_name.trim())  e.last_name  = 'Last name required'
    if (form.experience_years && isNaN(form.experience_years)) e.experience_years = 'Must be a number'
    return e
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      const payload = { ...form, experience_years: form.experience_years ? parseInt(form.experience_years) : null, team_id: form.team_id ? parseInt(form.team_id) : null }
      if (modal.mode === 'create') {
        await coachesAPI.create(payload)
        toast('Coach created!', 'success')
      } else {
        await coachesAPI.update(modal.data.coach_id, payload)
        toast('Coach updated!', 'success')
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
      await coachesAPI.delete(confirm.id)
      toast('Coach deleted.', 'success')
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
          <h1 className="page-title">Coaches <span>Management</span></h1>
          <p className="page-subtitle">{coaches.length} coaches in the system</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Coach</button>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search coach or team..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-overlay"><div className="spinner" style={{ width: 28, height: 28 }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📋</div><h3>No coaches found</h3></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Team</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.coach_id}>
                    <td><strong>{c.first_name} {c.last_name}</strong></td>
                    <td><span className="badge badge-sky">{c.specialization || '—'}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{c.experience_years != null ? `${c.experience_years} yrs` : '—'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{c.team_name || <span style={{ color: 'var(--text-dim)' }}>Unassigned</span>}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>✏ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ open: true, id: c.coach_id })}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={() => setModal(m => ({ ...m, open: false }))} title={modal.mode === 'create' ? 'Add New Coach' : 'Edit Coach'}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input className={`form-input ${errors.first_name ? 'error' : ''}`} value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="First name" />
            {errors.first_name && <p className="form-error">{errors.first_name}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input className={`form-input ${errors.last_name ? 'error' : ''}`} value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="Last name" />
            {errors.last_name && <p className="form-error">{errors.last_name}</p>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Specialization</label>
            <input className="form-input" value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} placeholder="e.g. Head Coach" />
          </div>
          <div className="form-group">
            <label className="form-label">Experience (years)</label>
            <input className={`form-input ${errors.experience_years ? 'error' : ''}`} type="number" min="0" value={form.experience_years} onChange={e => setForm(f => ({ ...f, experience_years: e.target.value }))} placeholder="0" />
            {errors.experience_years && <p className="form-error">{errors.experience_years}</p>}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Assigned Team</label>
          <select className="form-select" value={form.team_id} onChange={e => setForm(f => ({ ...f, team_id: e.target.value }))}>
            <option value="">— Unassigned —</option>
            {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setModal(m => ({ ...m, open: false }))}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving...</> : modal.mode === 'create' ? '+ Create Coach' : '✓ Update Coach'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open: false, id: null })} onConfirm={handleDelete} title="Delete Coach" message="Are you sure you want to delete this coach?" loading={deleting} />
    </div>
  )
}