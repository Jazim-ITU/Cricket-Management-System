import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { statisticsAPI, matchesAPI } from '../../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--pitch-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.6rem 0.9rem' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.25rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'var(--gold)', fontSize: '0.88rem', fontWeight: 600 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

const PIE_COLORS = ['#c9a84c', '#2ecc71', '#a8d8b0', '#e74c3c', '#7a9c82', '#e8c97a']

export default function AnalystDashboard() {
  const [batsmen, setBatsmen] = useState([])
  const [bowlers, setBowlers] = useState([])
  const [teamPerf, setTeamPerf] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([statisticsAPI.getTopBatsmen(8), statisticsAPI.getTopBowlers(8), statisticsAPI.getTeamPerformance()])
      .then(([b, w, t]) => { setBatsmen(b.data.data || []); setBowlers(w.data.data || []); setTeamPerf(t.data.data || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /><p>Loading analytics...</p></div>

  const runsPieData = batsmen.slice(0, 6).map(b => ({ name: b.player_name?.split(' ').pop(), value: parseInt(b.total_runs) || 0 }))
  const teamWinData = teamPerf.slice(0, 6).map(t => ({ name: t.team_name?.split(' ')[0], wins: parseInt(t.total_wins) || 0 }))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analyst <span>Dashboard</span></h1>
          <p className="page-subtitle">Read-only performance analytics and reporting</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon">🏏</div>
          <div className="stat-label">Top Run Scorer</div>
          <div className="stat-value" style={{ fontSize: '1.1rem' }}>{batsmen[0]?.player_name || '—'}</div>
          <div className="stat-sub">{batsmen[0]?.total_runs || 0} runs</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-label">Top Wicket Taker</div>
          <div className="stat-value" style={{ fontSize: '1.1rem' }}>{bowlers[0]?.player_name || '—'}</div>
          <div className="stat-sub">{bowlers[0]?.total_wickets || 0} wickets</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-label">Most Wins</div>
          <div className="stat-value" style={{ fontSize: '1.1rem' }}>{teamPerf[0]?.team_name?.split(' ')[0] || '—'}</div>
          <div className="stat-sub">{teamPerf[0]?.total_wins || 0} wins</div>
        </div>
      </div>

      <div className="dash-grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Runs Distribution</span></div>
          <div className="chart-wrap" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={runsPieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {runsPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Team Wins</span></div>
          <div className="chart-wrap" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamWinData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="wins" fill="var(--green-acc)" radius={[4,4,0,0]} name="Wins" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Deep Dive Reports</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {[
            { to: '/analyst/batsmen',     label: 'Batsmen Analysis',    icon: '🏏', desc: 'Runs, strike rates, top performers' },
            { to: '/analyst/bowlers',     label: 'Bowlers Analysis',    icon: '🎯', desc: 'Wickets, economy, best figures' },
            { to: '/analyst/teams',       label: 'Team Performance',    icon: '📈', desc: 'Win/loss ratios, points tables' },
            { to: '/analyst/tournaments', label: 'Tournament Standings',icon: '🏆', desc: 'Points tables and NRR comparisons' },
          ].map(a => (
            <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', padding: '1rem' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{a.icon}</div>
                <div style={{ fontWeight: 600, marginBottom: '0.2rem', fontSize: '0.92rem' }}>{a.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}