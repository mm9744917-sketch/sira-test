import { createClient } from '@supabase/supabase-js'
import { useState } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const signUp = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
    })

    if (error) {
      setMessage("Error: " + error.message)
    } else {
      setMessage("Check your email for login link 🚀")
    }
  }

  return (
    <div style={{textAlign:"center", marginTop:"100px"}}>
      <h1>SIRA AI Login</h1>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        style={{padding:"10px", width:"250px"}}
      />
      <br /><br />
      <button onClick={signUp} style={{padding:"10px 20px"}}>
        Login
      </button>
      <p>{message}</p>
    </div>
  )
}
