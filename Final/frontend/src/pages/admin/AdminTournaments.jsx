import { useState, useEffect, useMemo } from 'react'
import { tournamentsAPI } from '../../services/api'
import { Modal, ConfirmDialog } from '../../components/Modal'
import { useToast } from '../../components/Toast'

const FORMATS = ['T20', 'ODI', 'Test']
const EMPTY = { tournament_name: '', format: 'T20', start_date: '', end_date: '' }

const formatBadge = { T20: 'badge-green', ODI: 'badge-gold', Test: 'badge-sky' }

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterFormat, setFilterFormat] = useState('')
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
      const res = await tournamentsAPI.getAll()
      setTournaments(res.data.data || [])
    } catch { toast('Failed to load tournaments', 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => tournaments.filter(t => {
    const matchQ = !search || t.tournament_name?.toLowerCase().includes(search.toLowerCase())
    const matchF = !filterFormat || t.format === filterFormat
    return matchQ && matchF
  }), [tournaments, search, filterFormat])

  const openCreate = () => { setForm(EMPTY); setErrors({}); setModal({ open: true, mode: 'create', data: null }) }
  const openEdit = (t) => {
    setForm({ tournament_name: t.tournament_name, format: t.format, start_date: t.start_date?.slice(0, 10) || '', end_date: t.end_date?.slice(0, 10) || '' })
    setErrors({})
    setModal({ open: true, mode: 'edit', data: t })
  }

  const validate = () => {
    const e = {}
    if (!form.tournament_name.trim()) e.tournament_name = 'Name is required'
    if (!form.format)                 e.format = 'Format is required'
    if (form.start_date && form.end_date && form.end_date < form.start_date) e.end_date = 'End date must be after start date'
    return e
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    try {
      if (modal.mode === 'create') {
        await tournamentsAPI.create(form)
        toast('Tournament created!', 'success')
      } else {
        await tournamentsAPI.update(modal.data.tournament_id, form)
        toast('Tournament updated!', 'success')
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
      await tournamentsAPI.delete(confirm.id)
      toast('Tournament deleted.', 'success')
      setConfirm({ open: false, id: null })
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to delete', 'error')
    } finally { setDeleting(false) }
  }

  const getDuration = (start, end) => {
    if (!start || !end) return '—'
    const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24))
    return `${days} days`
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tournaments <span>Management</span></h1>
          <p className="page-subtitle">{tournaments.length} tournaments · {filtered.length} shown</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Tournament</button>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search tournament..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterFormat} onChange={e => setFilterFormat(e.target.value)}>
          <option value="">All Formats</option>
          {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-overlay"><div className="spinner" style={{ width: 28, height: 28 }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">🏆</div><h3>No tournaments found</h3></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tournament</th>
                  <th>Format</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.tournament_id}>
                    <td><strong>{t.tournament_name}</strong></td>
                    <td><span className={`badge ${formatBadge[t.format] || 'badge-muted'}`}>{t.format}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{t.start_date ? new Date(t.start_date).toLocaleDateString() : '—'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{t.end_date ? new Date(t.end_date).toLocaleDateString() : '—'}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{getDuration(t.start_date, t.end_date)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>✏ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ open: true, id: t.tournament_id })}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={() => setModal(m => ({ ...m, open: false }))} title={modal.mode === 'create' ? 'New Tournament' : 'Edit Tournament'}>
        <div className="form-group">
          <label className="form-label">Tournament Name *</label>
          <input className={`form-input ${errors.tournament_name ? 'error' : ''}`} value={form.tournament_name} onChange={e => setForm(f => ({ ...f, tournament_name: e.target.value }))} placeholder="e.g. ICC World Cup 2025" />
          {errors.tournament_name && <p className="form-error">{errors.tournament_name}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">Format *</label>
          <select className={`form-select ${errors.format ? 'error' : ''}`} value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}>
            {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input className="form-input" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input className={`form-input ${errors.end_date ? 'error' : ''}`} type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            {errors.end_date && <p className="form-error">{errors.end_date}</p>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setModal(m => ({ ...m, open: false }))}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving...</> : modal.mode === 'create' ? '+ Create' : '✓ Update'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open: false, id: null })} onConfirm={handleDelete} title="Delete Tournament" message="Deleting this tournament will also remove associated matches and standings." loading={deleting} />
    </div>
  )
}