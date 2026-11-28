import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { isConfigured } from './lib/supabase'
import { useSession } from './lib/useSession'
import { EntryEditor } from './pages/EntryEditor'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Stats } from './pages/Stats'
import { Logo } from './components/Logo'

export default function App() {
  const { session, loading } = useSession()

  if (!isConfigured) {
    return (
      <main className="center">
        <h1 className="brand"><Logo /> Tagebuch</h1>
        <p>Supabase ist noch nicht konfiguriert. Bitte <code>.env</code> anhand von <code>.env.example</code> anlegen.</p>
      </main>
    )
  }
  if (loading) return <main className="center">Lädt…</main>
  if (!session) return <Login />

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home session={session} />} />
        <Route path="/entry/:date" element={<EntryEditor />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
