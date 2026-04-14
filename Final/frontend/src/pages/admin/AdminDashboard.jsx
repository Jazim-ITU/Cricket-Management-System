import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { teamsAPI, playersAPI, matchesAPI, tournamentsAPI, coachesAPI } from '../../services/api'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--pitch-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.6rem 0.9rem' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.25rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: '0.88rem', fontWeight: 600 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ teams: 0, players: 0, matches: 0, tournaments: 0, coaches: 0 })
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [teams, players, matchList, tournaments, coaches] = await Promise.all([
          teamsAPI.getAll(), playersAPI.getAll(), matchesAPI.getAll(),
          tournamentsAPI.getAll(), coachesAPI.getAll()
        ])
        setCounts({
          teams: teams.data.data?.length || 0,
          players: players.data.data?.length || 0,
          matches: matchList.data.data?.length || 0,
          tournaments: tournaments.data.data?.length || 0,
          coaches: coaches.data.data?.length || 0,
        })
        setMatches((matchList.data.data || []).slice(0, 5))
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  // Chart data from tournaments
  const tournamentsData = [
    { name: 'ICC WC', matches: 5 },
    { name: 'IPL 2024', matches: 4 },
    { name: 'PSL 2024', matches: 4 },
    { name: 'BBL 2024', matches: 4 },
    { name: 'Asia Cup', matches: 3 },
  ]

  if (loading) return (
    <div className="loading-overlay">
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <p>Loading dashboard...</p>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin <span>Dashboard</span></h1>
          <p className="page-subtitle">Full system overview — all entities and operations</p>
        </div>
        <Link to="/admin/users" className="btn btn-primary">+ New User</Link>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        {[
          { label: 'Total Teams', value: counts.teams, icon: '🏟', sub: 'Active franchises', link: '/admin/teams' },
          { label: 'Players', value: counts.players, icon: '🧢', sub: 'Registered players', link: '/admin/players' },
          { label: 'Matches', value: counts.matches, icon: '⚡', sub: 'All fixtures', link: '/admin/matches' },
          { label: 'Tournaments', value: counts.tournaments, icon: '🏆', sub: 'Active tournaments', link: '/admin/tournaments' },
          { label: 'Coaches', value: counts.coaches, icon: '📋', sub: 'Team coaches', link: '/admin/coaches' },
        ].map(s => (
          <Link key={s.label} to={s.link} style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="dash-grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Matches per Tournament</span>
          </div>
          <div className="chart-wrap" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tournamentsData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="matches" fill="var(--gold)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Quick Actions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { label: 'Add New Team',        to: '/admin/teams',        icon: '🏟' },
              { label: 'Register Player',     to: '/admin/players',      icon: '🧢' },
              { label: 'Schedule Match',      to: '/admin/matches',      icon: '⚡' },
              { label: 'Transfer Player',     to: '/admin/transactions', icon: '↔' },
              { label: 'Assign Coach',        to: '/admin/transactions', icon: '📋' },
              { label: 'View Statistics',     to: '/admin/statistics',   icon: '📊' },
            ].map(a => (
              <Link key={a.label} to={a.to} className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
                <span>{a.icon}</span> {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Matches</span>
          <Link to="/admin/matches" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        {matches.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚡</div>
            <p>No matches found</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Teams</th>
                  <th>Tournament</th>
                  <th>Venue</th>
                  <th>Date</th>
                  <th>Winner</th>
                </tr>
              </thead>
              <tbody>
                {matches.map(m => (
                  <tr key={m.match_id}>
                    <td>
                      <strong>{m.team1_name}</strong>
                      <span style={{ color: 'var(--text-muted)', margin: '0 0.4rem' }}>vs</span>
                      <strong>{m.team2_name}</strong>
                    </td>
                    <td><span className="badge badge-gold">{m.tournament_name}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{m.venue_name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                      {new Date(m.match_date).toLocaleDateString()}
                    </td>
                    <td>
                      {m.winner_name
                        ? <span className="badge badge-green">{m.winner_name}</span>
                        : <span className="badge badge-muted">TBD</span>
                      }
                    </td>
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