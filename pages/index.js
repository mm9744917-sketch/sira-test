import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    checkUser()

    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession()
    setUser(data.session?.user ?? null)
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google'
    })
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  if (user) {
    return (
      <div style={{textAlign:"center", marginTop:"100px"}}>
        <h1>SIRA AI Dashboard</h1>
        <p>✅ Logged in as: {user.email}</p>
        <button onClick={logout} style={{padding:"10px 20px"}}>
          Logout
        </button>
      </div>
    )
  }

  return (
    <div style={{textAlign:"center", marginTop:"100px"}}>
      <h1>SIRA AI Login</h1>
      <button onClick={signInWithGoogle} style={{padding:"10px 20px"}}>
        Login with Google
      </button>
    </div>
  )
}
