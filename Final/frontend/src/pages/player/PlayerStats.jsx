import { useState, useEffect } from 'react'
import { playersAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function PlayerStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState([])
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.player_id) { setLoading(false); return }
    const load = async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          playersAPI.getById(user.player_id),
          playersAPI.getStats(user.player_id),
        ])
        setPlayer(pRes.data.data)
        setStats(sRes.data.data || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [user])

  if (loading) return <div className="loading-overlay"><div className="spinner" style={{ width: 28, height: 28 }} /></div>

  if (!user?.player_id) return (
    <div>
      <div className="page-header"><div><h1 className="page-title">My <span>Statistics</span></h1></div></div>
      <div className="alert alert-error"><span>⚠</span> No player profile linked to your account. Contact an Administrator.</div>
    </div>
  )

  const totalRuns = stats.reduce((sum, s) => sum + (s.runs_scored || 0), 0)
  const totalWickets = stats.reduce((sum, s) => sum + (s.wickets_taken || 0), 0)
  const totalCatches = stats.reduce((sum, s) => sum + (s.catches || 0), 0)
  const avgStrikeRate = stats.length > 0
    ? (stats.reduce((sum, s) => sum + (parseFloat(s.strike_rate) || 0), 0) / stats.length).toFixed(2)
    : '—'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My <span>Statistics</span></h1>
          <p className="page-subtitle">
            {player ? `${player.first_name} ${player.last_name} · ${player.role} · ${player.nationality}` : ''}
          </p>
        </div>
      </div>

      {/* Player Info */}
      {player && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold-dim), var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
              🧢
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', lineHeight: 1 }}>{player.first_name} {player.last_name}</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                <span className="badge badge-gold">{player.role}</span>
                <span className="badge badge-muted">{player.nationality}</span>
                <span className="badge badge-sky">{player.team_name || 'Unassigned'}</span>
                {player.batting_style && <span className="badge badge-muted">{player.batting_style}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Career Summary */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon">🏏</div>
          <div className="stat-label">Total Runs</div>
          <div className="stat-value">{totalRuns}</div>
          <div className="stat-sub">Across {stats.length} matches</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-label">Wickets</div>
          <div className="stat-value">{totalWickets}</div>
          <div className="stat-sub">Total wickets taken</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧤</div>
          <div className="stat-label">Catches</div>
          <div className="stat-value">{totalCatches}</div>
          <div className="stat-sub">Total catches</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-label">Avg Strike Rate</div>
          <div className="stat-value" style={{ fontSize: '1.6rem' }}>{avgStrikeRate}</div>
          <div className="stat-sub">Batting strike rate</div>
        </div>
      </div>

      {/* Match-by-match stats */}
      <div className="card">
        <div className="card-header"><span className="card-title">Match Performance History</span></div>
        {stats.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📊</div><h3>No statistics yet</h3><p>Stats will appear here once matches are recorded</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Team (Played For)</th>
                  <th>vs Team</th>
                  <th>Status</th>
                  <th>Runs</th>
                  <th>SR</th>
                  <th>Wickets</th>
                  <th>Economy</th>
                  <th>Catches</th>
                </tr>
              </thead>
              <tbody>
                {stats.map(s => {
                  const playedForTeam = s.team1 || '—'
                  const vsTeam = s.team2 || '—'
                  const won = s.winner_team_id && s.winner_team_id === player?.team_id
                  const lost = s.winner_team_id && s.winner_team_id !== player?.team_id
                  return (
                    <tr key={s.stat_id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                        {s.match_date ? new Date(s.match_date).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}><strong>{playedForTeam}</strong></td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{vsTeam}</td>
                      <td>
                        {s.winner_team_id
                          ? won
                            ? <span className="badge badge-green">Won</span>
                            : <span className="badge badge-red">Lost</span>
                          : <span className="badge badge-muted">N/A</span>
                        }
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold)' }}>{s.runs_scored || 0}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{s.strike_rate ? parseFloat(s.strike_rate).toFixed(1) : '—'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--green-acc)', fontWeight: 700 }}>{s.wickets_taken || 0}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{s.economy ? parseFloat(s.economy).toFixed(2) : '—'}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{s.catches || 0}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}