import { useState, useEffect } from 'react'
import { matchesAPI, offersAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { useToast } from '../../components/Toast'

export default function PlayerDashboard() {
  const { user } = useAuth()
  const [offers, setOffers] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(null)
  const toast = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const [oRes, mRes] = await Promise.all([
        offersAPI.getMyOffers(),
        matchesAPI.getAll(),
      ])
      setOffers(oRes.data.data || [])
      // Filter matches for player's current team, sorted ascending
      const allMatches = mRes.data.data || []
      const teamMatches = allMatches
        .filter(m => m.team1_id === user?.team_id || m.team2_id === user?.team_id)
        .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
      setMatches(teamMatches.slice(0, 5))
    } catch {}
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleRespond = async (offer_id, action) => {
    setResponding(offer_id)
    try {
      await offersAPI.respond(offer_id, action)
      toast(action === 'accept' ? '✓ Offer accepted! You have joined the new team.' : 'Offer rejected.', action === 'accept' ? 'success' : 'info')
      load()
      // Reload page to update team info in token
      if (action === 'accept') {
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to respond', 'error')
    } finally { setResponding(null) }
  }

  const pendingOffers = offers.filter(o => o.status === 'pending')

  if (loading) return <div className="loading-overlay"><div className="spinner" style={{ width: 28, height: 28 }} /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, <span>{user?.username}</span></h1>
          <p className="page-subtitle">Player Portal — view your stats, matches, and team offers</p>
        </div>
      </div>

      {/* Pending Offers Alert */}
      {pendingOffers.length > 0 && (
        <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
          <span>📨</span>
          <span>You have <strong>{pendingOffers.length} pending offer{pendingOffers.length > 1 ? 's' : ''}</strong> from team managers. Check below to accept or reject.</span>
        </div>
      )}

      {/* Offers Inbox */}
      {offers.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <span className="card-title">📨 Team Offers</span>
            <span className="badge badge-gold">{pendingOffers.length} pending</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {offers.map(o => (
              <div key={o.offer_id} style={{
                background: 'var(--pitch-mid)',
                border: `1px solid ${o.status === 'pending' ? 'var(--gold-dim)' : 'var(--border)'}`,
                borderRadius: 8, padding: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>
                      Offer from <span style={{ color: 'var(--gold)' }}>{o.to_team_name}</span>
                    </div>
                    {o.message && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontStyle: 'italic' }}>
                        "{o.message}"
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {o.status === 'pending' ? (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleRespond(o.offer_id, 'accept')}
                          disabled={responding === o.offer_id}
                        >
                          {responding === o.offer_id ? <span className="spinner" /> : '✓ Accept'}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRespond(o.offer_id, 'reject')}
                          disabled={responding === o.offer_id}
                        >
                          ✕ Reject
                        </button>
                      </>
                    ) : (
                      <span className={`badge ${o.status === 'accepted' ? 'badge-green' : 'badge-red'}`}>
                        {o.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Access Cards */}
      <div className="dash-grid-2" style={{ marginBottom: '1.5rem' }}>
        <Link to="/player/stats" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>My Statistics</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>View your personal batting, bowling, and fielding stats</p>
            <div className="btn btn-ghost btn-sm" style={{ marginTop: '1rem', display: 'inline-flex' }}>View Stats →</div>
          </div>
        </Link>
        <Link to="/player/matches" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚡</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '0.25rem' }}>My Matches</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>See your team's upcoming matches sorted by date</p>
            <div className="btn btn-ghost btn-sm" style={{ marginTop: '1rem', display: 'inline-flex' }}>View Schedule →</div>
          </div>
        </Link>
      </div>

      {/* Upcoming Team Matches */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Upcoming Matches</span>
          <Link to="/player/matches" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        {matches.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">⚡</div><p>No upcoming matches for your team</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Match</th><th>Tournament</th><th>Venue</th><th>Date</th><th>Result</th></tr></thead>
              <tbody>
                {matches.map(m => (
                  <tr key={m.match_id}>
                    <td><strong>{m.team1_name}</strong> <span style={{ color: 'var(--text-dim)' }}>vs</span> <strong>{m.team2_name}</strong></td>
                    <td><span className="badge badge-gold">{m.tournament_name}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{m.venue_name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{m.match_date ? new Date(m.match_date).toLocaleDateString() : '—'}</td>
                    <td>{m.winner_name ? <span className="badge badge-green">🏆 {m.winner_name}</span> : <span className="badge badge-muted">Upcoming</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}