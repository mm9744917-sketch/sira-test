import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkUser()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession()
    setUser(data.session?.user ?? null)
  }

  const signInWithGoogle = async () => {
    setMessage('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    })
    if (error) setMessage('Error: ' + error.message)
  }

  const signInWithEmail = async () => {
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // مهم: يرجعك على موقعك بعد الضغط على رابط الإيميل
        emailRedirectTo: 'https://sira-test-4c9w.vercel.app'
      }
    })
    if (error) setMessage('Error: ' + error.message)
    else setMessage('✅ Check your email for the login link')
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  // ✅ إذا مسجل دخول
  if (user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h1>SIRA AI Dashboard</h1>
        <p>✅ Logged in as: {user.email}</p>
        <button onClick={logout} style={{ padding: '10px 20px' }}>
          Logout
        </button>
      </div>
    )
  }

  // ✅ إذا مش مسجل دخول
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>SIRA AI Login</h1>

      <button onClick={signInWithGoogle} style={{ padding: '10px 20px' }}>
        Login with Google
      </button>

      <div style={{ marginTop: '25px' }}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px', width: '260px' }}
        />
        <br /><br />
        <button onClick={signInWithEmail} style={{ padding: '10px 20px' }}>
          Login with Email
        </button>
      </div>

      <p style={{ marginTop: '15px' }}>{message}</p>
    </div>
  )
}
