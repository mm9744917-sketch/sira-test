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
        <p style={{ marginBottom: 20 }}>Logged in as: {user.email}</p>
        <button style={styles.goldButton} onClick={logout}>Logout</button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div className="stars"></div>

      <h1 style={styles.title} className="typing">SIRA AI</h1>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />

      <button style={styles.goldButton} onClick={signInWithEmail}>
        Continue with Email
      </button>

      <button style={styles.googleButton} onClick={signInWithGoogle}>
        Continue with Google
      </button>

      <p style={{ marginTop: 20, color: '#D4AF37' }}>{message}</p>

      <style jsx>{`
        .stars {
          position: fixed;
          width: 100%;
          height: 100%;
          background: transparent;
          background-image: radial-gradient(white 1px, transparent 1px);
          background-size: 40px 40px;
          animation: moveStars 60s linear infinite;
          opacity: 0.15;
          z-index: 0;
        }

        @keyframes moveStars {
          from { transform: translateY(0); }
          to { transform: translateY(-1000px); }
        }

        .typing {
          overflow: hidden;
          border-right: .15em solid #D4AF37;
          white-space: nowrap;
          animation: typing 2.5s steps(20, end), blink .8s infinite;
        }

        @keyframes typing {
          from { width: 0 }
          to { width: 8ch }
        }

        @keyframes blink {
          50% { border-color: transparent }
        }
      `}</style>
    </div>
  )
}

const styles = {
  container: {
    height: '100vh',
    backgroundColor: '#000',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'system-ui',
    color: '#fff',
    position: 'relative'
  },
  title: {
    fontSize: '42px',
    color: '#D4AF37',
    marginBottom: '40px',
    letterSpacing: '3px'
  },
  input: {
    padding: '14px',
    width: '280px',
    borderRadius: '30px',
    border: '1px solid #D4AF37',
    backgroundColor: '#111',
    color: '#fff',
    marginBottom: '15px',
    textAlign: 'center'
  },
  goldButton: {
    padding: '14px 30px',
    borderRadius: '30px',
    border: 'none',
    backgroundColor: '#D4AF37',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '12px',
    width: '280px'
  },
  googleButton: {
    padding: '14px 30px',
    borderRadius: '30px',
    border: '1px solid #D4AF37',
    backgroundColor: '#111',
    color: '#D4AF37',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '280px'
  }
}
