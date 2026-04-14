import { useState, useEffect } from 'react'
import { teamsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function ManagerTeam() {
  const { user } = useAuth()
  const [team, setTeam] = useState(null)
  const [players, setPlayers] = useState([])
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.team_id) { setLoading(false); return }
    const load = async () => {
      try {
        const [tRes, pRes, sRes] = await Promise.all([
          teamsAPI.getById(user.team_id),
          teamsAPI.getPlayers(user.team_id),
          teamsAPI.getStats(user.team_id),
        ])
        setTeam(tRes.data.data)
        setPlayers(pRes.data.data || [])
        setStats(sRes.data.data || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [user])

  if (loading) return (
    <div className="loading-overlay">
      <div className="spinner" style={{ width: 28, height: 28 }} />
    </div>
  )

  // Manager not linked to any team
  if (!user?.team_id) return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My <span>Team</span></h1>
        </div>
      </div>
      <div className="alert alert-error">
        <span>⚠</span>
        <span>You are not assigned to any team. Please contact an Administrator to assign you to a team.</span>
      </div>
    </div>
  )

  const roleBadge = (r) => ({
    Batsman: 'badge-gold',
    Bowler: 'badge-green',
    'All-Rounder': 'badge-sky',
    Wicketkeeper: 'badge-muted'
  }[r] || 'badge-muted')

  const capacityPercent = team ? Math.round((players.length / team.max_players) * 100) : 0
  const isFull = team && players.length >= team.max_players

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My <span>Team</span></h1>
          <p className="page-subtitle">You are the manager of {team?.team_name}</p>
        </div>
      </div>

      {/* Team Info Card */}
      {team && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <span className="card-title">🏟 {team.team_name}</span>
            <span className="badge badge-gold">{team.city}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'City', value: team.city || '—' },
              { label: 'Founded', value: team.founded_year || '—' },
              { label: 'Players', value: `${players.length} / ${team.max_players}` },
              { label: 'Max Coaches', value: team.max_coaches },
            ].map(s => (
              <div key={s.label} style={{
                textAlign: 'center', padding: '0.85rem',
                background: 'var(--pitch-mid)', borderRadius: 8
              }}>
                <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--gold)' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Capacity Bar */}
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontFamily: 'var(--font-mono)' }}>
              <span>Squad Capacity</span>
              <span>{players.length}/{team.max_players} ({capacityPercent}%)</span>
            </div>
            <div style={{ height: 6, background: 'var(--pitch-line)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${capacityPercent}%`,
                background: isFull ? 'var(--red-acc)' : capacityPercent > 80 ? 'var(--gold)' : 'var(--green-acc)',
                borderRadius: 3,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {isFull && (
            <div className="alert alert-error" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
              <span>⚠</span> Team is at maximum capacity ({team.max_players} players). You cannot send offers until a player leaves.
            </div>
          )}
        </div>
      )}

      {/* Squad List */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <span className="card-title">Squad ({players.length})</span>
        </div>
        {players.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧢</div>
            <h3>No players yet</h3>
            <p>Go to Players section to send offers and recruit players</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Nationality</th>
                  <th>Batting</th>
                  <th>Bowling</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => (
                  <tr key={p.player_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.82rem' }}>{i + 1}</td>
                    <td><strong>{p.first_name} {p.last_name}</strong></td>
                    <td><span className={`badge ${roleBadge(p.role)}`}>{p.role}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.nationality || '—'}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.batting_style || '—'}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.bowling_style || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tournament Performance */}
      {stats.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Tournament Performance</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tournament</th>
                  <th>Played</th>
                  <th>Won</th>
                  <th>Lost</th>
                  <th>Points</th>
                  <th>NRR</th>
                </tr>
              </thead>
              <tbody>
                {stats.map(s => (
                  <tr key={s.team_stat_id}>
                    <td><strong>{s.tournament_name}</strong></td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{s.matches_played}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--green-acc)', fontWeight: 700 }}>{s.matches_won}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--red-acc)' }}>{s.matches_lost}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)', fontWeight: 700 }}>{s.points}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {s.net_runrate != null ? parseFloat(s.net_runrate).toFixed(2) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📈</div>
            <h3>No tournament data yet</h3>
            <p>Tournament statistics will appear here once matches are recorded</p>
          </div>
        </div>
      )}
    </div>
  )
}