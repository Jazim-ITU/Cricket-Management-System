import { useState, useEffect } from 'react'
import { transactionsAPI, playersAPI, teamsAPI, coachesAPI } from '../../services/api'

export default function AdminTransactions() {
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(true)

  // Transfer Player state
  const [transferForm, setTransferForm] = useState({ player_id: '', new_team_id: '' })
  const [transferring, setTransferring] = useState(false)
  const [transferResult, setTransferResult] = useState(null)

  // Assign Coach state
  const [coachForm, setCoachForm] = useState({ coach_id: '', team_id: '' })
  const [assigning, setAssigning] = useState(false)
  const [coachResult, setCoachResult] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [pRes, tRes, cRes] = await Promise.all([playersAPI.getAll(), teamsAPI.getAll(), coachesAPI.getAll()])
        setPlayers(pRes.data.data || [])
        setTeams(tRes.data.data || [])
        setCoaches(cRes.data.data || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleTransfer = async (e) => {
    e.preventDefault()
    if (!transferForm.player_id || !transferForm.new_team_id) return
    setTransferring(true)
    setTransferResult(null)
    try {
      const res = await transactionsAPI.transferPlayer({
        player_id: parseInt(transferForm.player_id),
        new_team_id: parseInt(transferForm.new_team_id),
      })
      setTransferResult({ success: true, message: res.data.message, data: res.data.data })
      // Refresh players list
      const pRes = await playersAPI.getAll()
      setPlayers(pRes.data.data || [])
    } catch (err) {
      setTransferResult({
        success: false,
        message: err.response?.data?.message || 'Transfer failed — transaction rolled back.',
      })
    } finally { setTransferring(false) }
  }

  const handleAssignCoach = async (e) => {
    e.preventDefault()
    if (!coachForm.coach_id || !coachForm.team_id) return
    setAssigning(true)
    setCoachResult(null)
    try {
      const res = await transactionsAPI.assignCoach({
        coach_id: parseInt(coachForm.coach_id),
        team_id: parseInt(coachForm.team_id),
      })
      setCoachResult({ success: true, message: res.data.message, data: res.data.data })
      // Refresh coaches list
      const cRes = await coachesAPI.getAll()
      setCoaches(cRes.data.data || [])
    } catch (err) {
      setCoachResult({
        success: false,
        message: err.response?.data?.message || 'Assignment failed — transaction rolled back.',
      })
    } finally { setAssigning(false) }
  }

  const selectedPlayer = players.find(p => String(p.player_id) === transferForm.player_id)
  const selectedCoach  = coaches.find(c => String(c.coach_id) === coachForm.coach_id)
  const unassignedCoaches = coaches.filter(c => !c.team_id)

  if (loading) return <div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">ACID <span>Transactions</span></h1>
          <p className="page-subtitle">Atomic operations with full rollback protection</p>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
        <span>⚙</span>
        <span>All operations below execute as <strong>BEGIN → COMMIT</strong> transactions. Any validation failure triggers an automatic <strong>ROLLBACK</strong> — no partial data is written.</span>
      </div>

      <div className="dash-grid-2">
        {/* ── Transfer Player ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">↔ Player Transfer</span>
            <span className="badge badge-sky">ACID Transaction</span>
          </div>

          <div style={{ marginBottom: '1rem', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Verifies player exists → checks target team exists → validates team capacity ≤ 15 → updates <code style={{ background: 'var(--pitch-mid)', padding: '1px 5px', borderRadius: 4, fontSize: '0.8rem' }}>player.team_id</code> → COMMIT or ROLLBACK
          </div>

          <form onSubmit={handleTransfer} noValidate>
            <div className="form-group">
              <label className="form-label">Select Player</label>
              <select
                className="form-select"
                value={transferForm.player_id}
                onChange={e => { setTransferForm(f => ({ ...f, player_id: e.target.value })); setTransferResult(null) }}
                required
              >
                <option value="">— Choose player —</option>
                {players.map(p => (
                  <option key={p.player_id} value={p.player_id}>
                    {p.first_name} {p.last_name} ({p.team_name || 'Unassigned'})
                  </option>
                ))}
              </select>
            </div>

            {selectedPlayer && (
              <div style={{ background: 'var(--pitch-mid)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem', marginBottom: '0.75rem', fontSize: '0.84rem' }}>
                <strong>{selectedPlayer.first_name} {selectedPlayer.last_name}</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({selectedPlayer.role})</span>
                <br />
                <span style={{ color: 'var(--text-muted)' }}>Current team: </span>
                <span style={{ color: 'var(--gold)' }}>{selectedPlayer.team_name || 'Unassigned'}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Transfer To Team</label>
              <select
                className="form-select"
                value={transferForm.new_team_id}
                onChange={e => { setTransferForm(f => ({ ...f, new_team_id: e.target.value })); setTransferResult(null) }}
                required
              >
                <option value="">— Choose target team —</option>
                {teams
                  .filter(t => !selectedPlayer || t.team_id !== selectedPlayer.team_id)
                  .map(t => (
                    <option key={t.team_id} value={t.team_id}>{t.team_name}</option>
                  ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={transferring || !transferForm.player_id || !transferForm.new_team_id}
            >
              {transferring
                ? <><span className="spinner" /> Executing Transaction...</>
                : '⚡ Execute Transfer'}
            </button>
          </form>

          {transferResult && (
            <div className={`txn-result ${transferResult.success ? 'success' : 'error'}`} style={{ marginTop: '1rem' }}>
              <div className="txn-icon">{transferResult.success ? '✓' : '✕'}</div>
              <h3>{transferResult.success ? 'COMMITTED' : 'ROLLED BACK'}</h3>
              <p>{transferResult.message}</p>
              {transferResult.success && transferResult.data && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'left', background: 'var(--pitch-mid)', borderRadius: 6, padding: '0.6rem' }}>
                  <div>Player ID: {transferResult.data.player_id}</div>
                  <div>Previous Team ID: {transferResult.data.previous_team_id}</div>
                  <div>New Team: {transferResult.data.new_team_name}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Assign Coach ── */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📋 Coach Assignment</span>
            <span className="badge badge-sky">ACID Transaction</span>
          </div>

          <div style={{ marginBottom: '1rem', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Verifies coach exists → checks coach not already assigned → verifies target team exists → updates <code style={{ background: 'var(--pitch-mid)', padding: '1px 5px', borderRadius: 4, fontSize: '0.8rem' }}>coach.team_id</code> → COMMIT or ROLLBACK
          </div>

          <form onSubmit={handleAssignCoach} noValidate>
            <div className="form-group">
              <label className="form-label">Select Coach</label>
              <select
                className="form-select"
                value={coachForm.coach_id}
                onChange={e => { setCoachForm(f => ({ ...f, coach_id: e.target.value })); setCoachResult(null) }}
                required
              >
                <option value="">— Choose coach —</option>
                {coaches.map(c => (
                  <option key={c.coach_id} value={c.coach_id}>
                    {c.first_name} {c.last_name} {c.team_id ? `(assigned: ${c.team_name})` : '(available)'}
                  </option>
                ))}
              </select>
            </div>

            {selectedCoach && (
              <div style={{ background: 'var(--pitch-mid)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.75rem', marginBottom: '0.75rem', fontSize: '0.84rem' }}>
                <strong>{selectedCoach.first_name} {selectedCoach.last_name}</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({selectedCoach.specialization})</span>
                <br />
                <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                {selectedCoach.team_id
                  ? <span style={{ color: 'var(--red-acc)' }}>Already assigned to {selectedCoach.team_name} — will ROLLBACK</span>
                  : <span style={{ color: 'var(--green-acc)' }}>Available for assignment</span>
                }
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Assign To Team</label>
              <select
                className="form-select"
                value={coachForm.team_id}
                onChange={e => { setCoachForm(f => ({ ...f, team_id: e.target.value })); setCoachResult(null) }}
                required
              >
                <option value="">— Choose team —</option>
                {teams.map(t => (
                  <option key={t.team_id} value={t.team_id}>{t.team_name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={assigning || !coachForm.coach_id || !coachForm.team_id}
            >
              {assigning
                ? <><span className="spinner" /> Executing Transaction...</>
                : '⚡ Execute Assignment'}
            </button>
          </form>

          {coachResult && (
            <div className={`txn-result ${coachResult.success ? 'success' : 'error'}`} style={{ marginTop: '1rem' }}>
              <div className="txn-icon">{coachResult.success ? '✓' : '✕'}</div>
              <h3>{coachResult.success ? 'COMMITTED' : 'ROLLED BACK'}</h3>
              <p>{coachResult.message}</p>
              {coachResult.success && coachResult.data && (
                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'left', background: 'var(--pitch-mid)', borderRadius: 6, padding: '0.6rem' }}>
                  <div>Coach ID: {coachResult.data.coach_id}</div>
                  <div>Team: {coachResult.data.team_name}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Log Legend */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header"><span className="card-title">Transaction Rollback Conditions</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { label: 'Player Transfer Rollback Triggers', items: ['Player ID does not exist', 'Target team does not exist', 'Player already in target team', 'Team has reached 15-player capacity'] },
            { label: 'Coach Assignment Rollback Triggers', items: ['Coach ID does not exist', 'Target team does not exist', 'Coach already assigned to a team', 'DB trigger: duplicate team coach'] },
          ].map(section => (
            <div key={section.label}>
              <p style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{section.label}</p>
              {section.items.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--red-acc)', fontWeight: 700 }}>✕</span> {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}