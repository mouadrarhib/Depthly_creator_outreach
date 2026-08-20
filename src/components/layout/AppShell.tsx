import { LogOut, Menu, Search, Sparkles, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../auth/AuthProvider'
import { Button } from '../ui/Button'
import { DepthlyLogo } from '../ui/DepthlyLogo'

const pageCopy: Record<string, [string, string]> = {
  '/discovery': ['Creator discovery', "Find YouTube creators who match Depthly's audience."],
  '/shortlist': ['Shortlist', 'Review the creators worth spending outreach time on.'],
}

function Navigation({ close }: { close?: () => void }) {
  return (
    <>
      <DepthlyLogo />
      <nav className="sidebar-nav" aria-label="Main navigation">
        <NavLink to="/discovery" onClick={close}><Search size={16} /> Discovery</NavLink>
        <NavLink to="/shortlist" onClick={close}><Sparkles size={16} /> Shortlist</NavLink>
      </nav>
      <div className="sidebar-foot"><span className="status-dot" /> Internal workspace</div>
    </>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { session } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [title, description] = pageCopy[location.pathname] ?? pageCopy['/discovery']

  return (
    <div className="app-shell">
      <aside className="sidebar"><Navigation /></aside>
      {menuOpen && <div className="mobile-nav-backdrop" onClick={() => setMenuOpen(false)}>
        <aside className="mobile-nav" onClick={(event) => event.stopPropagation()}>
          <button className="mobile-nav-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={18} /></button>
          <Navigation close={() => setMenuOpen(false)} />
        </aside>
      </div>}
      <div className="app-column">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}><Menu size={19} /></button>
          <div className="topbar-copy"><h1>{title}</h1><p>{description}</p></div>
          <div className="topbar-account">
            <div><span>{session?.user.email}</span><small>Authenticated</small></div>
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()} aria-label="Sign out"><LogOut size={15} /></Button>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}
