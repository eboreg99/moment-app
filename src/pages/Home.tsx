import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function Home({ session }: { session: Session }) {
  const name = session.user.user_metadata?.full_name ?? session.user.email
  return (
    <main>
      <header className="bar">
        <h1>📔 Tagebuch</h1>
        <button onClick={() => supabase.auth.signOut()}>Abmelden</button>
      </header>
      <p>Hallo {name}! Hier entstehen in Schritt 2 der heutige Eintrag, die Rückblicke und die History.</p>
    </main>
  )
}
