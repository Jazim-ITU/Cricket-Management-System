import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { teamsAPI, matchesAPI, offersAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function ManagerDashboard() {
  const { user } = useAuth()
  const [team, setTeam] = useState(null)
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [sentOffers, setSentOffers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [mRes, oRes] = await Promise.all([
          matchesAPI.getAll(),
          offersAPI.getSent(),
        ])
        setSentOffers(oRes.data.data || [])

        if (user?.team_id) {
          const [tRes, pRes] = await Promise.all([
            teamsAPI.getById(user.team_id),
            teamsAPI.getPlayers(user.team_id),
          ])
          setTeam(tRes.data.data)
          setPlayers(pRes.data.data || [])

          // Only matches involving manager's team
          const allMatches = mRes.data.data || []
          const teamMatches = allMatches
            .filter(m => m.team1_id === user.team_id || m.team2_id === user.team_id)
            .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))
          setMatches(teamMatches.slice(0, 5))
        }
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [user])

  if (loading) return (
    <div className="loading-overlay">
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )

  const pendingOffers = sentOffers.filter(o => o.status === 'pending')
  const acceptedOffers = sentOffers.filter(o => o.status === 'accepted')
  const isFull = team && players.length >= team.max_players

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, <span>{user?.username}</span></h1>
          <p className="page-subtitle">
            {team ? `Managing ${team.team_name}` : 'Team Manager Dashboard'}
          </p>
        </div>
      </div>

      {/* No team assigned warning */}
      {!user?.team_id && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠</span> You are not assigned to any team. Contact an Administrator.
        </div>
      )}

      {/* Stats */}
      {team && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon">🧢</div>
            <div className="stat-label">Squad Size</div>
            <div className="stat-value">{players.length}</div>
            <div className="stat-sub">of {team.max_players} max players</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-label">Team Matches</div>
            <div className="stat-value">{matches.length}</div>
            <div className="stat-sub">Recent fixtures</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📨</div>
            <div className="stat-label">Pending Offers</div>
            <div className="stat-value">{pendingOffers.length}</div>
            <div className="stat-sub">{acceptedOffers.length} accepted</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏟</div>
            <div className="stat-label">Team</div>
            <div className="stat-value" style={{ fontSize: '1rem', marginTop: '0.25rem' }}>{team.team_name?.split(' ')[0]}</div>
            <div className="stat-sub">{team.city}</div>
          </div>
        </div>
      )}

      {isFull && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠</span> Your team is at maximum capacity ({team.max_players} players). Cannot send new offers.
        </div>
      )}

      <div className="dash-grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header"><span className="card-title">Quick Actions</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { label: 'My Team Info',        to: '/manager/team',         icon: '🏟' },
              { label: 'Browse & Offer Players', to: '/manager/players',   icon: '📨' },
              { label: 'Manage Coaches',       to: '/manager/coaches',      icon: '📋' },
              { label: 'Transfer Player',      to: '/manager/transactions', icon: '↔' },
            ].map(a => (
              <Link key={a.label} to={a.to} className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
                <span>{a.icon}</span> {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Access Level */}
        <div className="card">
          <div className="card-header"><span className="card-title">Your Access Level</span></div>
          <div style={{ fontSize: '0.88rem', lineHeight: 1.9 }}>
            {[
              { allowed: true,  text: 'View your team info only' },
              { allowed: true,  text: 'Browse all players and send offers' },
              { allowed: true,  text: 'Manage coaches for your team' },
              { allowed: true,  text: 'Transfer players (ACID transaction)' },
              { allowed: false, text: 'View other teams\' details' },
              { allowed: false, text: 'Modify tournaments or matches' },
              { allowed: false, text: 'Manage user accounts' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: item.allowed ? 'var(--green-acc)' : 'var(--red-acc)', fontWeight: 700 }}>
                  {item.allowed ? '✓' : '✕'}
                </span>
                <span style={{ color: item.allowed ? 'var(--text)' : 'var(--text-dim)' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Team Matches */}
      {matches.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Matches — {team?.team_name}</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Match</th><th>Tournament</th><th>Date</th><th>Result</th></tr>
              </thead>
              <tbody>
                {matches.map(m => {
                  const won = m.winner_team_id === user?.team_id
                  const lost = m.winner_team_id && m.winner_team_id !== user?.team_id
                  return (
                    <tr key={m.match_id}>
                      <td>
                        <span style={{ color: m.team1_id === user?.team_id ? 'var(--gold)' : 'var(--text)' }}>
                          <strong>{m.team1_name}</strong>
                        </span>
                        <span style={{ color: 'var(--text-dim)', margin: '0 0.4rem', fontSize: '0.78rem' }}>vs</span>
                        <span style={{ color: m.team2_id === user?.team_id ? 'var(--gold)' : 'var(--text)' }}>
                          <strong>{m.team2_name}</strong>
                        </span>
                      </td>
                      <td><span className="badge badge-gold">{m.tournament_name}</span></td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                        {m.match_date ? new Date(m.match_date).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        {m.winner_team_id
                          ? won
                            ? <span className="badge badge-green">🏆 Won</span>
                            : <span className="badge badge-red">Lost</span>
                          : <span className="badge badge-muted">TBD</span>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}