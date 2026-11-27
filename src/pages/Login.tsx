import { supabase } from '../lib/supabase'

export function Login() {
  const signIn = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

  return (
    <main className="center">
      <h1>📔 Tagebuch</h1>
      <p>Deine Stimmung, jeden Tag.</p>
      <button className="primary" onClick={signIn}>Mit Google anmelden</button>
    </main>
  )
}
