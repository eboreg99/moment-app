import { supabase } from '../lib/supabase'
import { Logo } from '../components/Logo'

export function Login() {
  const signIn = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
    })

  return (
    <main className="center">
      <Logo size={96} />
      <h1>Tagebuch</h1>
      <p>Deine Stimmung, jeden Tag.</p>
      <button className="primary" onClick={signIn}>Mit Google anmelden</button>
    </main>
  )
}
