import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://sira-test-4c9w.vercel.app'
      }
    })
  }

  return (
    <div style={{textAlign:"center", marginTop:"100px"}}>
      <h1>SIRA AI Login</h1>
      <button onClick={loginWithGoogle} style={{padding:"10px 20px"}}>
        Login with Google
      </button>
    </div>
  )
}
