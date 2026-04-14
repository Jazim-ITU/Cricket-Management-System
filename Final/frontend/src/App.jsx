import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Shared Layout
import AppLayout from './components/AppLayout'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminTeams from './pages/admin/AdminTeams'
import AdminPlayers from './pages/admin/AdminPlayers'
import AdminCoaches from './pages/admin/AdminCoaches'
import AdminTournaments from './pages/admin/AdminTournaments'
import AdminMatches from './pages/admin/AdminMatches'
import AdminStatistics from './pages/admin/AdminStatistics'
import AdminTransactions from './pages/admin/AdminTransactions'
import AdminUsers from './pages/admin/AdminUsers'

// Team Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard'
import ManagerTeam from './pages/manager/ManagerTeam'
import ManagerPlayers from './pages/manager/ManagerPlayers'
import ManagerCoaches from './pages/manager/ManagerCoaches'


// Player Pages
import PlayerDashboard from './pages/player/PlayerDashboard'
import PlayerStats from './pages/player/PlayerStats'
import PlayerMatches from './pages/player/PlayerMatches'

// Analyst Pages
import AnalystDashboard from './pages/analyst/AnalystDashboard'
import AnalystBatsmen from './pages/analyst/AnalystBatsmen'
import AnalystBowlers from './pages/analyst/AnalystBowlers'
import AnalystTeams from './pages/analyst/AnalystTeams'
import AnalystTournaments from './pages/analyst/AnalystTournaments'

// ─── Guards ───────────────────────────────────────────────────────────────────
const RequireAuth = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

const RequireRole = ({ children, roles }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to={getRolePath(user.role)} replace />
  return children
}

const getRolePath = (role) => {
  if (role === 'Administrator') return '/admin'
  if (role === 'Team Manager')  return '/manager'
  if (role === 'Player')        return '/player'
  if (role === 'Analyst')       return '/analyst'
  return '/login'
}

// Redirect logged-in users from / or /login to their dashboard
const HomeRedirect = () => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={getRolePath(user.role)} replace />
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/"         element={<HomeRedirect />} />

        {/* ── Admin ──────────────────────────────────────────────────────────── */}
        <Route path="/admin" element={
          <RequireRole roles={['Administrator']}>
            <AppLayout role="Administrator" />
          </RequireRole>
        }>
          <Route index             element={<AdminDashboard />} />
          <Route path="teams"      element={<AdminTeams />} />
          <Route path="players"    element={<AdminPlayers />} />
          <Route path="coaches"    element={<AdminCoaches />} />
          <Route path="tournaments"element={<AdminTournaments />} />
          <Route path="matches"    element={<AdminMatches />} />
          <Route path="statistics" element={<AdminStatistics />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="users"      element={<AdminUsers />} />
        </Route>

        {/* ── Team Manager ───────────────────────────────────────────────────── */}
        <Route path="/manager" element={
          <RequireRole roles={['Team Manager']}>
            <AppLayout role="Team Manager" />
          </RequireRole>
        }>
          <Route index               element={<ManagerDashboard />} />
          <Route path="team"         element={<ManagerTeam />} />
          <Route path="players"      element={<ManagerPlayers />} />
          <Route path="coaches"      element={<ManagerCoaches />} />
          
        </Route>

        {/* ── Player ─────────────────────────────────────────────────────────── */}
        <Route path="/player" element={
          <RequireRole roles={['Player']}>
            <AppLayout role="Player" />
          </RequireRole>
        }>
          <Route index         element={<PlayerDashboard />} />
          <Route path="stats"  element={<PlayerStats />} />
          <Route path="matches"element={<PlayerMatches />} />
        </Route>

        {/* ── Analyst ────────────────────────────────────────────────────────── */}
        <Route path="/analyst" element={
          <RequireRole roles={['Analyst']}>
            <AppLayout role="Analyst" />
          </RequireRole>
        }>
          <Route index               element={<AnalystDashboard />} />
          <Route path="batsmen"      element={<AnalystBatsmen />} />
          <Route path="bowlers"      element={<AnalystBowlers />} />
          <Route path="teams"        element={<AnalystTeams />} />
          <Route path="tournaments"  element={<AnalystTournaments />} />
        </Route>

        {/* Register - admin only via UI but route accessible */}
        <Route path="/register" element={
          <RequireRole roles={['Administrator']}>
            <AppLayout role="Administrator" />
          </RequireRole>
        }>
          <Route index element={<RegisterPage />} />
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </ToastProvider>
  )
}