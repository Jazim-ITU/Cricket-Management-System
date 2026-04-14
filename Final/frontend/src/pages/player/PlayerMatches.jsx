import { useState, useEffect, useMemo } from 'react'
import { matchesAPI, tournamentsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function PlayerMatches() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTournament, setFilterTournament] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, tRes] = await Promise.all([matchesAPI.getAll(), tournamentsAPI.getAll()])
        const allMatches = mRes.data.data || []
        // Filter to only player's team matches, sorted ascending by date
        const teamMatches = allMatches
          .filter(m => !user?.team_id || m.team1_id === user.team_id || m.team2_id === user.team_id)
          .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
        setMatches(teamMatches)
        setTournaments(tRes.data.data || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [user])

  const filtered = useMemo(() => matches.filter(m =>
    !filterTournament || String(m.tournament_id) === filterTournament
  ), [matches, filterTournament])

  // Split into upcoming and past
  const today = new Date()
  const upcoming = filtered.filter(m => new Date(m.match_date) >= today)
  const past = filtered.filter(m => new Date(m.match_date) < today)

  if (loading) return <div className="loading-overlay"><div className="spinner" style={{ width: 28, height: 28 }} /></div>

  const MatchRow = ({ m }) => {
    const isMyTeam1 = m.team1_id === user?.team_id
    const won = m.winner_team_id === user?.team_id
    const lost = m.winner_team_id && m.winner_team_id !== user?.team_id
    return (
      <tr key={m.match_id}>
        <td>
          <span style={{ color: isMyTeam1 ? 'var(--gold)' : 'var(--text-muted)', fontWeight: isMyTeam1 ? 700 : 400 }}>{m.team1_name}</span>
          <span style={{ color: 'var(--text-dim)', margin: '0 0.4rem', fontSize: '0.78rem' }}>vs</span>
          <span style={{ color: !isMyTeam1 ? 'var(--gold)' : 'var(--text-muted)', fontWeight: !isMyTeam1 ? 700 : 400 }}>{m.team2_name}</span>
        </td>
        <td><span className="badge badge-gold">{m.tournament_name}</span></td>
        <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{m.venue_name}</td>
        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{m.match_date ? new Date(m.match_date).toLocaleDateString() : '—'}</td>
        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {m.start_time ? new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
        </td>
        <td>
          {m.winner_team_id
            ? won
              ? <span className="badge badge-green">🏆 Won</span>
              : <span className="badge badge-red">Lost</span>
            : <span className="badge badge-muted">Upcoming</span>
          }
        </td>
      </tr>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My <span>Match Schedule</span></h1>
          <p className="page-subtitle">{filtered.length} matches · sorted by date (ascending)</p>
        </div>
      </div>

      <div className="filter-bar">
        <select className="filter-select" value={filterTournament} onChange={e => setFilterTournament(e.target.value)}>
          <option value="">All Tournaments</option>
          {tournaments.map(t => <option key={t.tournament_id} value={t.tournament_id}>{t.tournament_name}</option>)}
        </select>
      </div>

      {/* Upcoming Matches */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <span className="card-title">⚡ Upcoming ({upcoming.length})</span>
        </div>
        {upcoming.length === 0 ? (
          <div className="empty-state"><div className="empty-icon">📅</div><p>No upcoming matches</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Match</th><th>Tournament</th><th>Venue</th><th>Date</th><th>Start Time</th><th>Status</th></tr></thead>
              <tbody>{upcoming.map(m => <MatchRow key={m.match_id} m={m} />)}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Past Matches */}
      {past.length > 0 && (
        <div className="card">
          <div className="card-header"><span className="card-title">📋 Past Matches ({past.length})</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Match</th><th>Tournament</th><th>Venue</th><th>Date</th><th>Start Time</th><th>Result</th></tr></thead>
              <tbody>{past.map(m => <MatchRow key={m.match_id} m={m} />)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}