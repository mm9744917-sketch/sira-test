import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user ?? null;

      if (!mounted) return;

      setUser(u);
      setBusy(false);

      // ✅ إذا ما في تسجيل دخول → رجعه لصفحة login
      if (!u) router.replace("/");
    };

    run();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);

      // ✅ إذا صار logout → رجعه لصفحة login
      if (!u) router.replace("/");
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  async function logout() {
    try {
      setBusy(true);
      await supabase.auth.signOut();
      router.replace("/");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.title}>SIRA AI</h1>

        {busy ? (
          <p style={styles.text}>Loading...</p>
        ) : (
          <>
            <p style={styles.text}>
              ✅ Logged in as <b>{user?.email}</b>
            </p>
            <button style={styles.btn} onClick={logout} disabled={busy}>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#050607",
    color: "white",
    padding: 24,
  },
  card: {
    width: 420,
    maxWidth: "92vw",
    borderRadius: 18,
    padding: 26,
    background: "rgba(15,16,18,0.78)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 18px 70px rgba(0,0,0,0.65)",
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontSize: 32,
    letterSpacing: 3,
    color: "rgba(255, 210, 60, 0.98)",
  },
  text: {
    marginTop: 14,
    opacity: 0.9,
  },
  btn: {
    marginTop: 18,
    width: "100%",
    height: 48,
    borderRadius: 28,
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    background: "linear-gradient(180deg, #ffd54a, #ffb300)",
    color: "#161616",
  },
};
