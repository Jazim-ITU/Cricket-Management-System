import { useState, useEffect, useMemo } from 'react'
import { playersAPI, teamsAPI, offersAPI } from '../../services/api'
import { useToast } from '../../components/Toast'
import { useAuth } from '../../context/AuthContext'
import { Modal } from '../../components/Modal'

const ROLES = ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper']

export default function ManagerPlayers() {
  const { user } = useAuth()
  const [players, setPlayers] = useState([])
  const [myTeamPlayers, setMyTeamPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [sentOffers, setSentOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'myteam' | 'offers'
  const [offerModal, setOfferModal] = useState({ open: false, player: null })
  const [offerMessage, setOfferMessage] = useState('')
  const [sending, setSending] = useState(false)
  const toast = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const [pRes, tRes, oRes] = await Promise.all([
        playersAPI.getAll(),
        teamsAPI.getAll(),
        offersAPI.getSent(),
      ])
      const allPlayers = pRes.data.data || []
      setPlayers(allPlayers)
      setMyTeamPlayers(allPlayers.filter(p => p.team_id === user?.team_id))
      setTeams(tRes.data.data || [])
      setSentOffers(oRes.data.data || [])
    } catch { toast('Failed to load data', 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const source = activeTab === 'myteam' ? myTeamPlayers : players
    return source.filter(p => {
      const q = search.toLowerCase()
      return (!q || `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) || p.nationality?.toLowerCase().includes(q)) &&
             (!filterRole || p.role === filterRole)
    })
  }, [players, myTeamPlayers, search, filterRole, activeTab])

  const myTeam = teams.find(t => t.team_id === user?.team_id)
  const myTeamCapacity = myTeamPlayers.length
  const maxCapacity = myTeam?.max_players || 15

  const isAlreadyOffered = (player_id) => {
    return sentOffers.some(o => o.player_id === player_id && o.status === 'pending')
  }

  const handleSendOffer = async () => {
    if (!offerModal.player) return
    setSending(true)
    try {
      await offersAPI.send({ player_id: offerModal.player.player_id, message: offerMessage })
      toast(`Offer sent to ${offerModal.player.first_name} ${offerModal.player.last_name}!`, 'success')
      setOfferModal({ open: false, player: null })
      setOfferMessage('')
      load()
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to send offer', 'error')
    } finally { setSending(false) }
  }

  const roleBadge = (r) => ({ Batsman: 'badge-gold', Bowler: 'badge-green', 'All-Rounder': 'badge-sky', Wicketkeeper: 'badge-muted' }[r] || 'badge-muted')
  const statusBadge = (s) => ({ pending: 'badge-gold', accepted: 'badge-green', rejected: 'badge-red' }[s] || 'badge-muted')

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Players <span>Management</span></h1>
          <p className="page-subtitle">
            My Team: {myTeamCapacity}/{maxCapacity} players
            {myTeamCapacity >= maxCapacity && <span style={{ color: 'var(--red-acc)', marginLeft: '0.5rem' }}>⚠ FULL</span>}
          </p>
        </div>
      </div>

      {myTeamCapacity >= maxCapacity && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          <span>⚠</span> Your team is at maximum capacity ({maxCapacity} players). You cannot offer spots to new players until someone leaves.
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[
          { key: 'all', label: `🌐 All Players (${players.length})` },
          { key: 'myteam', label: `🏟 My Team (${myTeamPlayers.length})` },
          { key: 'offers', label: `📨 Sent Offers (${sentOffers.length})` },
        ].map(t => (
          <button key={t.key} className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab !== 'offers' && (
        <div className="filter-bar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input className="search-input" placeholder="Search player..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      )}

      {/* All Players / My Team Tab */}
      {activeTab !== 'offers' && (
        <div className="card">
          {loading ? <div className="loading-overlay"><div className="spinner" style={{ width: 28, height: 28 }} /></div>
            : filtered.length === 0 ? <div className="empty-state"><div className="empty-icon">🧢</div><h3>No players found</h3></div>
            : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Nationality</th>
                      <th>Current Team</th>
                      {activeTab === 'all' && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => {
                      const inMyTeam = p.team_id === user?.team_id
                      const offered = isAlreadyOffered(p.player_id)
                      return (
                        <tr key={p.player_id}>
                          <td><strong>{p.first_name} {p.last_name}</strong></td>
                          <td><span className={`badge ${roleBadge(p.role)}`}>{p.role}</span></td>
                          <td style={{ color: 'var(--text-muted)' }}>{p.nationality || '—'}</td>
                          <td style={{ fontSize: '0.82rem' }}>
                            {inMyTeam
                              ? <span className="badge badge-green">My Team</span>
                              : p.team_name || <span style={{ color: 'var(--text-dim)' }}>Unassigned</span>
                            }
                          </td>
                          {activeTab === 'all' && (
                            <td>
                              {inMyTeam ? (
                                <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Already in team</span>
                              ) : offered ? (
                                <span className="badge badge-gold">Offer Pending</span>
                              ) : myTeamCapacity >= maxCapacity ? (
                                <span style={{ color: 'var(--red-acc)', fontSize: '0.8rem' }}>Team Full</span>
                              ) : (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => { setOfferModal({ open: true, player: p }); setOfferMessage('') }}
                                >
                                  📨 Send Offer
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      )}

      {/* Sent Offers Tab */}
      {activeTab === 'offers' && (
        <div className="card">
          {sentOffers.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📨</div><h3>No offers sent yet</h3><p>Browse all players and send offers to recruit them</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Player</th><th>Offering From</th><th>Status</th><th>Message</th><th>Date</th></tr></thead>
                <tbody>
                  {sentOffers.map(o => (
                    <tr key={o.offer_id}>
                      <td><strong>{o.player_name}</strong><br /><small>{o.role}</small></td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{o.from_team_name || 'Unassigned'}</td>
                      <td><span className={`badge ${statusBadge(o.status)}`}>{o.status}</span></td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{o.message || '—'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Send Offer Modal */}
      <Modal isOpen={offerModal.open} onClose={() => setOfferModal({ open: false, player: null })} title="Send Player Offer" maxWidth="480px">
        {offerModal.player && (
          <>
            <div style={{ background: 'var(--pitch-mid)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.85rem', marginBottom: '1rem' }}>
              <strong>{offerModal.player.first_name} {offerModal.player.last_name}</strong>
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>({offerModal.player.role})</span>
              <br />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Currently at: {offerModal.player.team_name || 'Unassigned'} · {offerModal.player.nationality}
              </span>
            </div>
            <div className="form-group">
              <label className="form-label">Message to Player (optional)</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="e.g. We would love to have you on our team for the upcoming season..."
                value={offerMessage}
                onChange={e => setOfferMessage(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div className="alert alert-info">
              <span>ℹ</span>
              <span>This will send an offer to the player. They can accept or reject it from their dashboard. If accepted, they will automatically join your team.</span>
            </div>
          </>
        )}
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setOfferModal({ open: false, player: null })}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSendOffer} disabled={sending}>
            {sending ? <><span className="spinner" /> Sending...</> : '📨 Send Offer'}
          </button>
        </div>
      </Modal>
    </div>
  )
}