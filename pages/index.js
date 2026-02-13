import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getSession();
    setUser(data.session?.user ?? null);
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  }

  async function loginWithEmail() {
    if (!email) return alert("Enter email first");
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    alert("Check your email 📩");
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <div className="container">
      <div className="stars"></div>

      <div className="card">
        <h1 className="title">SIRA AI</h1>

        {!user ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />

            <button onClick={loginWithEmail} className="btn gold">
              Continue with Email
            </button>

            <button onClick={loginWithGoogle} className="btn dark">
              Continue with Google
            </button>
          </>
        ) : (
          <>
            <p className="logged">
              ✅ Logged in as <strong>{user.email}</strong>
            </p>
            <button onClick={logout} className="btn gold">
              Logout
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        .container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: radial-gradient(circle at center, #111 0%, #000 100%);
          overflow: hidden;
          position: relative;
          font-family: sans-serif;
        }

        .stars {
          position: absolute;
          width: 200%;
          height: 200%;
          background: transparent
            url("https://www.transparenttextures.com/patterns/stardust.png")
            repeat;
          animation: moveStars 60s linear infinite;
          opacity: 0.2;
        }

        @keyframes moveStars {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-1000px);
          }
        }

        .card {
          position: relative;
          z-index: 2;
          background: rgba(20, 20, 20, 0.9);
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          width: 320px;
          backdrop-filter: blur(10px);
          box-shadow: 0 0 40px rgba(255, 200, 0, 0.3);
        }

        .title {
          color: gold;
          font-size: 32px;
          margin-bottom: 25px;
          letter-spacing: 3px;
          animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from {
            text-shadow: 0 0 10px gold;
          }
          to {
            text-shadow: 0 0 25px orange;
          }
        }

        .input {
          width: 100%;
          padding: 12px;
          border-radius: 25px;
          border: none;
          margin-bottom: 15px;
          text-align: center;
          outline: none;
        }

        .btn {
          width: 100%;
          padding: 12px;
          border-radius: 25px;
          border: none;
          margin-bottom: 10px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.3s;
        }

        .gold {
          background: gold;
          color: black;
        }

        .gold:hover {
          background: orange;
        }

        .dark {
          background: #222;
          color: white;
        }

        .dark:hover {
          background: #333;
        }

        .logged {
          color: white;
          margin-bottom: 15px;
        }
      `}</style>
    </div>
  );
}
