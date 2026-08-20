import { useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { DepthlyLogo } from '../components/ui/DepthlyLogo'

export function LoginPage() {
  const { session } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  if (session) return <Navigate to="/discovery" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: `${window.location.origin}/discovery` },
    })
    setLoading(false)
    if (signInError) setError(signInError.message)
    else setSent(true)
  }

  return (
    <main className="login-page">
      <section className="login-intro">
        <DepthlyLogo className="login-brand" />
        <div className="login-thesis">
          <p className="eyebrow">Internal acquisition workspace</p>
          <h1>Find the creators<br />worth contacting.</h1>
          <p>Search YouTube, inspect recent performance, and turn strong audience fit into a focused outreach list.</p>
        </div>
        <div className="login-signal" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      </section>
      <section className="login-panel">
        <div className="login-form-wrap">
          {sent ? <div className="login-confirmation"><CheckCircle2 /><h2>Check your inbox</h2><p>We sent a secure sign-in link to <strong>{email}</strong>.</p><Button onClick={() => setSent(false)}>Use another email</Button></div> : <>
            <p className="eyebrow">Workspace access</p>
            <h2>Sign in to continue</h2>
            <p className="form-help">Use an email invited to the Depthly workspace.</p>
            {!isSupabaseConfigured && <div className="config-warning">Add the Supabase values from <code>.env.example</code> before signing in.</div>}
            <form onSubmit={submit}>
              <label htmlFor="email">Work email</label>
              <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@depthly.com" required />
              {error && <p className="form-error" role="alert">{error}</p>}
              <Button type="submit" variant="primary" disabled={loading || !isSupabaseConfigured}>{loading ? 'Sending link…' : <>Send magic link <ArrowRight size={15} /></>}</Button>
            </form>
          </>}
        </div>
      </section>
    </main>
  )
}
