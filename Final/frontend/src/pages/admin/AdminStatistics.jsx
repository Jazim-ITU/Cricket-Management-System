import { useState, useEffect } from 'react'
import { statisticsAPI, playersAPI, matchesAPI } from '../../services/api'
import { Modal } from '../../components/Modal'
import { useToast } from '../../components/Toast'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--pitch-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.6rem 0.9rem' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.25rem' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'var(--gold)', fontSize: '0.88rem', fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function AdminStatistics() {
  const [batsmen, setBatsmen] = useState([])
  const [bowlers, setBowlers] = useState([])
  const [teamPerf, setTeamPerf] = useState([])
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('batsmen')
  const [recordModal, setRecordModal] = useState(false)
  const [statForm, setStatForm] = useState({ player_id: '', match_id: '', runs_scored: '', wickets_taken: '', catches: '', strike_rate: '', economy: '' })
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [bRes, wRes, tRes, pRes, mRes] = await Promise.all([
          statisticsAPI.getTopBatsmen(10),
          statisticsAPI.getTopBowlers(10),
          statisticsAPI.getTeamPerformance(),
          playersAPI.getAll(),
          matchesAPI.getAll(),
        ])
        setBatsmen(bRes.data.data || [])
        setBowlers(wRes.data.data || [])
        setTeamPerf(tRes.data.data || [])
        setPlayers(pRes.data.data || [])
        setMatches(mRes.data.data || [])
      } catch { toast('Failed to load statistics', 'error') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const handleRecordStat = async () => {
    if (!statForm.player_id || !statForm.match_id) {
      toast('Player and match are required', 'error'); return
    }
    setSaving(true)
    try {
      await statisticsAPI.recordStat({
        player_id: parseInt(statForm.player_id),
        match_id: parseInt(statForm.match_id),
        runs_scored: parseInt(statForm.runs_scored) || 0,
        wickets_taken: parseInt(statForm.wickets_taken) || 0,
        catches: parseInt(statForm.catches) || 0,
        strike_rate: parseFloat(statForm.strike_rate) || 0,
        economy: parseFloat(statForm.economy) || 0,
      })
      toast('Stat recorded successfully!', 'success')
      setRecordModal(false)
      setStatForm({ player_id: '', match_id: '', runs_scored: '', wickets_taken: '', catches: '', strike_rate: '', economy: '' })
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to record stat', 'error')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /><p>Loading analytics...</p></div>

  const batsmenChartData = batsmen.slice(0, 8).map(b => ({
    name: b.player_name?.split(' ').pop() || b.player_name,
    runs: parseInt(b.total_runs) || 0,
    matches: parseInt(b.matches_played) || 0,
  }))

  const bowlersChartData = bowlers.slice(0, 8).map(b => ({
    name: b.player_name?.split(' ').pop() || b.player_name,
    wickets: parseInt(b.total_wickets) || 0,
    economy: parseFloat(b.avg_economy || 0).toFixed(2),
  }))

  const teamChartData = teamPerf.slice(0, 8).map(t => ({
    name: t.team_name?.split(' ')[0] || t.team_name,
    wins: parseInt(t.total_wins) || 0,
    losses: parseInt(t.total_losses) || 0,
    points: parseInt(t.total_points) || 0,
  }))

  const tabs = [
    { key: 'batsmen', label: '🏏 Top Batsmen' },
    { key: 'bowlers', label: '🎯 Top Bowlers' },
    { key: 'teams',   label: '📈 Team Performance' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics <span>Dashboard</span></h1>
          <p className="page-subtitle">Performance statistics and visualizations</p>
        </div>
        <button className="btn btn-primary" onClick={() => setRecordModal(true)}>+ Record Stat</button>
      </div>

      {/* Summary stat cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon">🏏</div>
          <div className="stat-label">Top Run Scorer</div>
          <div className="stat-value" style={{ fontSize: '1.2rem' }}>{batsmen[0]?.player_name?.split(' ').pop() || '—'}</div>
          <div className="stat-sub">{batsmen[0]?.total_runs || 0} runs</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-label">Top Wicket Taker</div>
          <div className="stat-value" style={{ fontSize: '1.2rem' }}>{bowlers[0]?.player_name?.split(' ').pop() || '—'}</div>
          <div className="stat-sub">{bowlers[0]?.total_wickets || 0} wickets</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-label">Best Team</div>
          <div className="stat-value" style={{ fontSize: '1.2rem' }}>{teamPerf[0]?.team_name?.split(' ')[0] || '—'}</div>
          <div className="stat-sub">{teamPerf[0]?.total_wins || 0} wins</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-label">Matches Tracked</div>
          <div className="stat-value">{matches.length}</div>
          <div className="stat-sub">Total fixtures</div>
        </div>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Charts + Tables */}
      {activeTab === 'batsmen' && (
        <div className="dash-grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">Runs Scored</span></div>
            <div className="chart-wrap" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batsmenChartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="runs" fill="var(--gold)" radius={[4,4,0,0]} name="Runs" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Top Batsmen</span></div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Rank</th><th>Player</th><th>Team</th><th>Runs</th><th>SR</th></tr>
                </thead>
                <tbody>
                  {batsmen.slice(0, 8).map((b, i) => (
                    <tr key={b.player_id}>
                      <td><span className="badge badge-gold">#{i + 1}</span></td>
                      <td><strong>{b.player_name}</strong><br /><small>{b.nationality}</small></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.team_name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{b.total_runs}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {b.avg_strike_rate ? parseFloat(b.avg_strike_rate).toFixed(1) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bowlers' && (
        <div className="dash-grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">Wickets Taken</span></div>
            <div className="chart-wrap" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bowlersChartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="wickets" fill="var(--green-acc)" radius={[4,4,0,0]} name="Wickets" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Top Bowlers</span></div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Rank</th><th>Player</th><th>Team</th><th>Wkts</th><th>Eco</th></tr>
                </thead>
                <tbody>
                  {bowlers.slice(0, 8).map((b, i) => (
                    <tr key={b.player_id}>
                      <td><span className="badge badge-green">#{i + 1}</span></td>
                      <td><strong>{b.player_name}</strong><br /><small>{b.nationality}</small></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.team_name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{b.total_wickets}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {b.avg_economy ? parseFloat(b.avg_economy).toFixed(2) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'teams' && (
        <div className="dash-grid-2">
          <div className="card">
            <div className="card-header"><span className="card-title">Wins vs Losses</span></div>
            <div className="chart-wrap" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamChartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="wins"   fill="var(--green-acc)" radius={[4,4,0,0]} name="Wins" />
                  <Bar dataKey="losses" fill="var(--red-acc)"   radius={[4,4,0,0]} name="Losses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Team Standings</span></div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Rank</th><th>Team</th><th>W</th><th>L</th><th>Pts</th></tr>
                </thead>
                <tbody>
                  {teamPerf.sort((a, b) => (b.total_wins || 0) - (a.total_wins || 0)).slice(0, 8).map((t, i) => (
                    <tr key={t.team_id}>
                      <td><span className={`badge ${i === 0 ? 'badge-gold' : i < 3 ? 'badge-green' : 'badge-muted'}`}>#{i + 1}</span></td>
                      <td><strong>{t.team_name}</strong></td>
                      <td style={{ color: 'var(--green-acc)', fontWeight: 700 }}>{t.total_wins || 0}</td>
                      <td style={{ color: 'var(--red-acc)' }}>{t.total_losses || 0}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--gold)' }}>{t.total_points || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Record Stat Modal */}
      <Modal isOpen={recordModal} onClose={() => setRecordModal(false)} title="Record Player Stat" maxWidth="560px">
        <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
          <span>ℹ</span> Records a player's performance for a specific match
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Player *</label>
            <select className="form-select" value={statForm.player_id} onChange={e => setStatForm(f => ({ ...f, player_id: e.target.value }))}>
              <option value="">Select player</option>
              {players.map(p => <option key={p.player_id} value={p.player_id}>{p.first_name} {p.last_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Match *</label>
            <select className="form-select" value={statForm.match_id} onChange={e => setStatForm(f => ({ ...f, match_id: e.target.value }))}>
              <option value="">Select match</option>
              {matches.map(m => <option key={m.match_id} value={m.match_id}>{m.team1_name} vs {m.team2_name} ({m.match_date?.slice(0,10)})</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Runs Scored</label>
            <input className="form-input" type="number" min="0" value={statForm.runs_scored} onChange={e => setStatForm(f => ({ ...f, runs_scored: e.target.value }))} placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Strike Rate</label>
            <input className="form-input" type="number" step="0.01" min="0" value={statForm.strike_rate} onChange={e => setStatForm(f => ({ ...f, strike_rate: e.target.value }))} placeholder="0.00" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Wickets Taken</label>
            <input className="form-input" type="number" min="0" value={statForm.wickets_taken} onChange={e => setStatForm(f => ({ ...f, wickets_taken: e.target.value }))} placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Economy Rate</label>
            <input className="form-input" type="number" step="0.01" min="0" value={statForm.economy} onChange={e => setStatForm(f => ({ ...f, economy: e.target.value }))} placeholder="0.00" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Catches</label>
          <input className="form-input" type="number" min="0" value={statForm.catches} onChange={e => setStatForm(f => ({ ...f, catches: e.target.value }))} placeholder="0" />
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setRecordModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleRecordStat} disabled={saving}>
            {saving ? <><span className="spinner" /> Recording...</> : '+ Record Stat'}
          </button>
        </div>
      </Modal>
    </div>
  )
}