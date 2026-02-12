import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const loginWithEmail = async () => {
    setMessage("");

    if (!email || !email.includes("@")) {
      setMessage("اكتب إيميل صحيح");
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("✅ Check your email for the login link");
    }
  };

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "100px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>SIRA AI Login</h1>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: "12px",
          width: "280px",
          borderRadius: "8px",
          border: "1px solid #ddd",
        }}
      />

      <div style={{ height: "16px" }} />

      <button
        onClick={loginWithEmail}
        style={{
          padding: "10px 22px",
          borderRadius: "10px",
          border: "1px solid #ddd",
          cursor: "pointer",
        }}
      >
        Login
      </button>

      <p style={{ marginTop: "20px" }}>{message}</p>
    </div>
  );
}
