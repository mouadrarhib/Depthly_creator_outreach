import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { useAuth } from './auth/AuthProvider'

const DiscoveryPage = lazy(() => import('./pages/DiscoveryPage').then((module) => ({ default: module.DiscoveryPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const ShortlistPage = lazy(() => import('./pages/ShortlistPage').then((module) => ({ default: module.ShortlistPage })))

function AppLoading() {
  return <div className="app-loading"><span /></div>
}

function ProtectedLayout() {
  const { session, loading } = useAuth()
  if (loading) return <AppLoading />
  if (!session) return <Navigate to="/login" replace />
  return <AppShell><Outlet /></AppShell>
}

export default function App() {
  return <Suspense fallback={<AppLoading />}><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedLayout />}>
      <Route path="/discovery" element={<DiscoveryPage />} />
      <Route path="/shortlist" element={<ShortlistPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/discovery" replace />} />
  </Routes></Suspense>
}
