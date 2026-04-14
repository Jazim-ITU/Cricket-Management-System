import { useState, useEffect, useMemo } from 'react'
import { statisticsAPI, tournamentsAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--pitch-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.6rem 0.9rem' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color || 'var(--gold)', fontSize: '0.88rem', fontWeight: 600 }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed?.(1) ?? p.value : p.value}</p>)}
    </div>
  )
}

export function AnalystBatsmen() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState(20)

  useEffect(() => {
    statisticsAPI.getTopBatsmen(limit).then(r => setData(r.data.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [limit])

  const filtered = useMemo(() => data.filter(b =>
    !search || b.player_name?.toLowerCase().includes(search.toLowerCase()) || b.nationality?.toLowerCase().includes(search.toLowerCase())
  ), [data, search])

  const chartData = filtered.slice(0, 10).map(b => ({ name: b.player_name?.split(' ').pop(), runs: parseInt(b.total_runs) || 0 }))

  if (loading) return <div className="loading-overlay"><div className="spinner" style={{ width: 28, height: 28 }} /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Batsmen <span>Analysis</span></h1>
          <p className="page-subtitle">Top run scorers and batting performance</p>
        </div>
        <select className="filter-select" value={limit} onChange={e => setLimit(parseInt(e.target.value))}>
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={30}>Top 30</option>
        </select>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><span className="card-title">Runs Scored (Top 10)</span></div>
        <div className="chart-wrap" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="runs" fill="var(--gold)" radius={[4,4,0,0]} name="Runs" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search player or nationality..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Rank</th><th>Player</th><th>Nationality</th><th>Team</th><th>Matches</th><th>Total Runs</th><th>Avg SR</th></tr></thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.player_id}>
                  <td><span className={`badge ${i === 0 ? 'badge-gold' : i < 3 ? 'badge-sky' : 'badge-muted'}`}>#{i+1}</span></td>
                  <td><strong>{b.player_name}</strong></td>
                  <td style={{ color: 'var(--text-muted)' }}>{b.nationality}</td>
                  <td style={{ fontSize: '0.83rem' }}>{b.team_name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{b.matches_played}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold)', fontSize: '1rem' }}>{b.total_runs}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{b.avg_strike_rate ? parseFloat(b.avg_strike_rate).toFixed(1) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function AnalystBowlers() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    statisticsAPI.getTopBowlers(30).then(r => setData(r.data.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => data.filter(b =>
    !search || b.player_name?.toLowerCase().includes(search.toLowerCase())
  ), [data, search])

  const chartData = filtered.slice(0, 10).map(b => ({ name: b.player_name?.split(' ').pop(), wickets: parseInt(b.total_wickets) || 0 }))

  if (loading) return <div className="loading-overlay"><div className="spinner" style={{ width: 28, height: 28 }} /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bowlers <span>Analysis</span></h1>
          <p className="page-subtitle">Top wicket takers and bowling performance</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><span className="card-title">Wickets Taken (Top 10)</span></div>
        <div className="chart-wrap" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="wickets" fill="var(--green-acc)" radius={[4,4,0,0]} name="Wickets" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search bowler..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Rank</th><th>Player</th><th>Nationality</th><th>Team</th><th>Matches</th><th>Wickets</th><th>Avg Economy</th></tr></thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.player_id}>
                  <td><span className={`badge ${i === 0 ? 'badge-green' : i < 3 ? 'badge-sky' : 'badge-muted'}`}>#{i+1}</span></td>
                  <td><strong>{b.player_name}</strong></td>
                  <td style={{ color: 'var(--text-muted)' }}>{b.nationality}</td>
                  <td style={{ fontSize: '0.83rem' }}>{b.team_name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{b.matches_played}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--green-acc)', fontSize: '1rem' }}>{b.total_wickets}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{b.avg_economy ? parseFloat(b.avg_economy).toFixed(2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function AnalystTeams() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statisticsAPI.getTeamPerformance().then(r => setData(r.data.data || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const sorted = [...data].sort((a, b) => (b.total_wins || 0) - (a.total_wins || 0))
  const chartData = sorted.slice(0, 8).map(t => ({ name: t.team_name?.split(' ')[0], wins: parseInt(t.total_wins) || 0, losses: parseInt(t.total_losses) || 0 }))

  if (loading) return <div className="loading-overlay"><div className="spinner" style={{ width: 28, height: 28 }} /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Team <span>Performance</span></h1>
          <p className="page-subtitle">Aggregated win/loss records across all tournaments</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header"><span className="card-title">Wins vs Losses</span></div>
        <div className="chart-wrap" style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="wins" fill="var(--green-acc)" radius={[4,4,0,0]} name="Wins" />
              <Bar dataKey="losses" fill="var(--red-acc)" radius={[4,4,0,0]} name="Losses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Rank</th><th>Team</th><th>Matches</th><th>W</th><th>L</th><th>Points</th><th>NRR</th></tr></thead>
            <tbody>
              {sorted.map((t, i) => (
                <tr key={t.team_id}>
                  <td><span className={`badge ${i === 0 ? 'badge-gold' : i < 3 ? 'badge-green' : 'badge-muted'}`}>#{i+1}</span></td>
                  <td><strong>{t.team_name}</strong></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{t.total_matches || 0}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--green-acc)', fontWeight: 700 }}>{t.total_wins || 0}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--red-acc)' }}>{t.total_losses || 0}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)', fontWeight: 700 }}>{t.total_points || 0}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{t.avg_nrr != null ? parseFloat(t.avg_nrr).toFixed(2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function AnalystTournaments() {
  const [tournaments, setTournaments] = useState([])
  const [selected, setSelected] = useState(null)
  const [standings, setStandings] = useState([])
  const [matchList, setMatchList] = useState([])
  const [loading, setLoading] = useState(true)
  const [standingsLoading, setStandingsLoading] = useState(false)

  useEffect(() => {
    tournamentsAPI.getAll()
      .then(r => { setTournaments(r.data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const selectTournament = async (t) => {
    setSelected(t)
    setStandingsLoading(true)
    try {
      const [sRes, mRes] = await Promise.all([
        tournamentsAPI.getStandings(t.tournament_id),
        tournamentsAPI.getMatches(t.tournament_id)
      ])
      setStandings(sRes.data.data || [])
      setMatchList(mRes.data.data || [])
    } catch {}
    finally { setStandingsLoading(false) }
  }

  const formatBadge = { T20: 'badge-green', ODI: 'badge-gold', Test: 'badge-sky' }

  if (loading) return <div className="loading-overlay"><div className="spinner" style={{ width: 28, height: 28 }} /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tournament <span>Standings</span></h1>
          <p className="page-subtitle">Points tables and fixtures by tournament</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {tournaments.map(t => (
          <button
            key={t.tournament_id}
            style={{
              cursor: 'pointer', textAlign: 'left',
              border: selected?.tournament_id === t.tournament_id ? '1px solid var(--gold)' : '1px solid var(--border)',
              background: selected?.tournament_id === t.tournament_id ? 'rgba(201,168,76,0.08)' : 'var(--pitch-card)',
              borderRadius: 'var(--radius)', padding: '1.5rem'
            }}
            onClick={() => selectTournament(t)}
          >
            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{t.tournament_name}</div>
            <span className={`badge ${formatBadge[t.format] || 'badge-muted'}`}>{t.format}</span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              {t.start_date ? new Date(t.start_date).toLocaleDateString() : '—'}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <>
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>{selected.tournament_name} — Standings</h2>
          </div>
          {standingsLoading ? (
            <div className="loading-overlay"><div className="spinner" style={{ width: 24, height: 24 }} /></div>
          ) : (
            <div className="dash-grid-2">
              <div className="card">
                <div className="card-header"><span className="card-title">Points Table</span></div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>Pts</th><th>NRR</th></tr></thead>
                    <tbody>
                      {standings.map((s, i) => (
                        <tr key={s.team_stat_id || i}>
                          <td><span className={`badge ${i === 0 ? 'badge-gold' : i < 3 ? 'badge-green' : 'badge-muted'}`}>#{i+1}</span></td>
                          <td><strong>{s.team_name}</strong></td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{s.matches_played}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--green-acc)', fontWeight: 700 }}>{s.matches_won}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--red-acc)' }}>{s.matches_lost}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)', fontWeight: 700 }}>{s.points}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.net_runrate != null ? parseFloat(s.net_runrate).toFixed(2) : '—'}</td>
                        </tr>
                      ))}
                      {standings.length === 0 && <tr><td colSpan={7}><div className="empty-state" style={{ padding: '1rem' }}><p>No standings data</p></div></td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title">Fixtures ({matchList.length})</span></div>
                <div className="table-wrap" style={{ maxHeight: 300, overflowY: 'auto' }}>
                  <table>
                    <thead><tr><th>Match</th><th>Date</th><th>Winner</th></tr></thead>
                    <tbody>
                      {matchList.map(m => (
                        <tr key={m.match_id}>
                          <td style={{ fontSize: '0.82rem' }}><strong>{m.team1_name}</strong> vs <strong>{m.team2_name}</strong></td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{m.match_date ? new Date(m.match_date).toLocaleDateString() : '—'}</td>
                          <td>{m.winner_name ? <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>{m.winner_name}</span> : <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>TBD</span>}</td>
                        </tr>
                      ))}
                      {matchList.length === 0 && <tr><td colSpan={3}><div className="empty-state" style={{ padding: '0.75rem' }}><p>No fixtures</p></div></td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!selected && (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <h3>Select a tournament</h3>
          <p>Click any tournament above to view its standings and fixtures</p>
        </div>
      )}
    </div>
  )
}