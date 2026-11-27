import { isConfigured } from './lib/supabase'
import { useSession } from './lib/useSession'
import { Home } from './pages/Home'
import { Login } from './pages/Login'

export default function App() {
  const { session, loading } = useSession()

  if (!isConfigured) {
    return (
      <main className="center">
        <h1>📔 Tagebuch</h1>
        <p>Supabase ist noch nicht konfiguriert. Bitte <code>.env</code> anhand von <code>.env.example</code> anlegen.</p>
      </main>
    )
  }
  if (loading) return <main className="center">Lädt…</main>
  return session ? <Home session={session} /> : <Login />
}
