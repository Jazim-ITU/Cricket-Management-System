// Manager can only transfer players (not assign coaches — that's admin only)
import { useState, useEffect } from 'react'
import { transactionsAPI, playersAPI, teamsAPI } from '../../services/api'

export default function ManagerTransactions() {
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [transferForm, setTransferForm] = useState({ player_id: '', new_team_id: '' })
  const [transferring, setTransferring] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, tRes] = await Promise.all([playersAPI.getAll(), teamsAPI.getAll()])
        setPlayers(pRes.data.data || [])
        setTeams(tRes.data.data || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleTransfer = async (e) => {
    e.preventDefault()
    if (!transferForm.player_id || !transferForm.new_team_id) return
    setTransferring(true)
    setResult(null)
    try {
      const res = await transactionsAPI.transferPlayer({
        player_id: parseInt(transferForm.player_id),
        new_team_id: parseInt(transferForm.new_team_id),
      })
      setResult({ success: true, message: res.data.message, data: res.data.data })
      const pRes = await playersAPI.getAll()
      setPlayers(pRes.data.data || [])
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Transaction rolled back.' })
    } finally { setTransferring(false) }
  }

  const selected = players.find(p => String(p.player_id) === transferForm.player_id)

  if (loading) return <div className="loading-overlay"><div className="spinner" style={{ width: 28, height: 28 }} /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Player <span>Transfer</span></h1>
          <p className="page-subtitle">Execute an ACID-safe player transfer transaction</p>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        <span>⚙</span>
        <span>This operation uses a <strong>database transaction</strong>. If the team is at capacity (15 players) or any validation fails, the transfer is automatically <strong>ROLLED BACK</strong>.</span>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-header">
          <span className="card-title">↔ Transfer Player</span>
          <span className="badge badge-sky">ACID Transaction</span>
        </div>
        <form onSubmit={handleTransfer} noValidate>
          <div className="form-group">
            <label className="form-label">Select Player</label>
            <select className="form-select" value={transferForm.player_id} onChange={e => { setTransferForm(f => ({ ...f, player_id: e.target.value })); setResult(null) }} required>
              <option value="">— Choose player —</option>
              {players.map(p => <option key={p.player_id} value={p.player_id}>{p.first_name} {p.last_name} ({p.team_name || 'Unassigned'})</option>)}
            </select>
          </div>
          {selected && (
            <div style={{ background: 'var(--pitch-mid)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem', marginBottom: '0.75rem', fontSize: '0.84rem' }}>
              <strong>{selected.first_name} {selected.last_name}</strong> · {selected.role}<br />
              <span style={{ color: 'var(--text-muted)' }}>Current: </span><span style={{ color: 'var(--gold)' }}>{selected.team_name || 'Unassigned'}</span>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Transfer To Team</label>
            <select className="form-select" value={transferForm.new_team_id} onChange={e => { setTransferForm(f => ({ ...f, new_team_id: e.target.value })); setResult(null) }} required>
              <option value="">— Choose target team —</option>
              {teams.filter(t => !selected || t.team_id !== selected.team_id).map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={transferring || !transferForm.player_id || !transferForm.new_team_id}>
            {transferring ? <><span className="spinner" /> Executing...</> : '⚡ Execute Transfer'}
          </button>
        </form>
        {result && (
          <div className={`txn-result ${result.success ? 'success' : 'error'}`} style={{ marginTop: '1rem' }}>
            <div className="txn-icon">{result.success ? '✓' : '✕'}</div>
            <h3>{result.success ? 'COMMITTED' : 'ROLLED BACK'}</h3>
            <p>{result.message}</p>
            {result.success && result.data && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'left', background: 'var(--pitch-mid)', borderRadius: 6, padding: '0.6rem' }}>
                <div>New Team: {result.data.new_team_name}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}