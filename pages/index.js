import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // جلب الجلسة الحالية
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    // مراقبة تغيّر الحالة
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setMessage("Error: " + error.message);
  };

  const signInWithEmailLink = async () => {
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) setMessage("Error: " + error.message);
    else setMessage("Check your email for the login link 🚀");
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div style={{ textAlign: "center", marginTop: 90 }}>
      <h1>SIRA AI Login</h1>

      {session ? (
        <>
          <p>✅ Logged in as: <b>{session.user.email}</b></p>
          <button onClick={logout} style={{ padding: "10px 20px" }}>Logout</button>
        </>
      ) : (
        <>
          <button onClick={signInWithGoogle} style={{ padding: "10px 20px", marginBottom: 20 }}>
            Login with Google
          </button>

          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: "10px", width: "250px" }}
            />
            <br /><br />
            <button onClick={signInWithEmailLink} style={{ padding: "10px 20px" }}>
              Login via Email Link
            </button>
          </div>

          <p style={{ marginTop: 20 }}>{message}</p>
        </>
      )}
    </div>
  );
}
