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
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener?.subscription?.unsubscribe?.()
  }, [])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  const signInWithEmail = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://sira-test-4c9w.vercel.app'
      }
    })
    if (error) setMessage(error.message)
    else setMessage('Check your email for login link 🚀')
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  if (user) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>SIRA AI</h1>
        <p style={styles.text}>Logged in as: {user.email}</p>
        <button style={styles.buttonGold} onClick={logout}>Logout</button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>SIRA AI</h1>

      <button style={styles.buttonGoogle} onClick={signInWithGoogle}>
        Continue with Google
      </button>

      <div style={{ marginTop: '25px' }}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <br /><br />
        <button style={styles.buttonGold} onClick={signInWithEmail}>
          Continue with Email
        </button>
      </div>

      <p style={styles.message}>{message}</p>
    </div>
  )
}

const styles = {
  container: {
    height: '100vh',
    backgroundColor: '#000',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'system-ui'
  },
  title: {
    fontSize: '40px',
    marginBottom: '40px',
    color: '#D4AF37',
    letterSpacing: '2px'
  },
  input: {
    padding: '12px',
    width: '260px',
    borderRadius: '8px',
    border: '1px solid #D4AF37',
    backgroundColor: '#111',
    color: '#fff'
  },
  buttonGold: {
    padding: '12px 25px',
    backgroundColor: '#D4AF37',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  buttonGoogle: {
    padding: '12px 25px',
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  text: {
    marginBottom: '20px'
  },
  message: {
    marginTop: '20px',
    color: '#D4AF37'
  }
}
