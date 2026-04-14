import { useState, useEffect, useMemo } from 'react'
import { teamsAPI } from '../../services/api'
import { Modal, ConfirmDialog } from '../../components/Modal'
import { useToast } from '../../components/Toast'

const EMPTY = { team_name: '', city: '', founded_year: '' }

export default function AdminTeams() {
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
      const res = await teamsAPI.getAll()
      setTeams(res.data.data || [])
    } catch { toast('Failed to load teams', 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() =>
    teams.filter(t =>
      t.team_name?.toLowerCase().includes(search.toLowerCase()) ||
      t.city?.toLowerCase().includes(search.toLowerCase())
    ), [teams, search])

  const openCreate = () => { setForm(EMPTY); setErrors({}); setModal({ open: true, mode: 'create', data: null }) }
  const openEdit = (t) => { setForm({ team_name: t.team_name, city: t.city || '', founded_year: t.founded_year || '' }); setErrors({}); setModal({ open: true, mode: 'edit', data: t }) }
  const openDelete = (id) => setConfirm({ open: true, id })

  const validate = () => {
    const e = {}
    if (!form.team_name.trim()) e.team_name = 'Team name is required'
    if (form.founded_year && (isNaN(form.founded_year) || form.founded_year < 1800 || form.founded_year > 2030)) {
      e.founded_year = 'Invalid year'
    }
    return e
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      if (modal.mode === 'create') {
        await teamsAPI.create(form)
        toast('Team created successfully!', 'success')
      } else {
        await teamsAPI.update(modal.data.team_id, form)
        toast('Team updated successfully!', 'success')
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
      await teamsAPI.delete(confirm.id)
      toast('Team deleted.', 'success')
      setConfirm({ open: false, id: null })
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete team', 'error')
    } finally { setDeleting(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Teams <span>Management</span></h1>
          <p className="page-subtitle">{teams.length} teams registered in the system</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Team</button>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search by name or city..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-overlay"><div className="spinner" style={{ width: 28, height: 28 }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏟</div>
            <h3>No teams found</h3>
            <p>{search ? 'Try a different search' : 'Add your first team'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team Name</th>
                  <th>City</th>
                  <th>Founded</th>
                  <th>Max Players</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.team_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{t.team_id}</td>
                    <td><strong>{t.team_name}</strong></td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.city || '—'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{t.founded_year || '—'}</td>
                    <td><span className="badge badge-gold">{t.max_players}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>✏ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => openDelete(t.team_id)}>✕ Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal(m => ({ ...m, open: false }))}
        title={modal.mode === 'create' ? 'Add New Team' : 'Edit Team'}
      >
        <div className="form-group">
          <label className="form-label">Team Name *</label>
          <input
            className={`form-input ${errors.team_name ? 'error' : ''}`}
            placeholder="e.g. India National Team"
            value={form.team_name}
            onChange={e => setForm(f => ({ ...f, team_name: e.target.value }))}
          />
          {errors.team_name && <p className="form-error">{errors.team_name}</p>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">City</label>
            <input className="form-input" placeholder="e.g. Mumbai" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Founded Year</label>
            <input className={`form-input ${errors.founded_year ? 'error' : ''}`} type="number" placeholder="e.g. 2008" value={form.founded_year} onChange={e => setForm(f => ({ ...f, founded_year: e.target.value }))} />
            {errors.founded_year && <p className="form-error">{errors.founded_year}</p>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setModal(m => ({ ...m, open: false }))}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving...</> : modal.mode === 'create' ? '+ Create Team' : '✓ Update Team'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Team"
        message="Are you sure you want to delete this team? This will affect all associated players and matches."
        loading={deleting}
      />
    </div>
  )
}