import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);

  const tiltRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    // session
    (async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Touch/mouse tilt (fallback)
  useEffect(() => {
    const el = tiltRef.current;
    if (!el) return;

    const onMove = (clientX, clientY) => {
      const r = el.getBoundingClientRect();
      const px = (clientX - (r.left + r.width / 2)) / (r.width / 2);
      const py = (clientY - (r.top + r.height / 2)) / (r.height / 2);
      const rotY = px * 6;
      const rotX = -py * 6;
      el.style.setProperty("--rx", `${rotX}deg`);
      el.style.setProperty("--ry", `${rotY}deg`);
      if (glowRef.current) {
        glowRef.current.style.setProperty("--gx", `${(px + 1) * 50}%`);
        glowRef.current.style.setProperty("--gy", `${(py + 1) * 50}%`);
      }
    };

    const mouseMove = (e) => onMove(e.clientX, e.clientY);
    const touchMove = (e) => {
      if (!e.touches?.[0]) return;
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    window.addEventListener("mousemove", mouseMove, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("touchmove", touchMove);
    };
  }, []);

  // Device motion tilt (phone rotate)
  useEffect(() => {
    if (!motionEnabled) return;

    const el = tiltRef.current;
    if (!el) return;

    const handler = (e) => {
      // gamma: left-right, beta: front-back
      const g = Math.max(-30, Math.min(30, e.gamma ?? 0));
      const b = Math.max(-30, Math.min(30, e.beta ?? 0));
      const rotY = (g / 30) * 7;
      const rotX = -(b / 30) * 7;
      el.style.setProperty("--rx", `${rotX}deg`);
      el.style.setProperty("--ry", `${rotY}deg`);

      if (glowRef.current) {
        const gx = ((g + 30) / 60) * 100;
        const gy = ((b + 30) / 60) * 100;
        glowRef.current.style.setProperty("--gx", `${gx}%`);
        glowRef.current.style.setProperty("--gy", `${gy}%`);
      }
    };

    window.addEventListener("deviceorientation", handler, true);
    return () => window.removeEventListener("deviceorientation", handler, true);
  }, [motionEnabled]);

  async function enableMotion() {
    // iOS needs permission sometimes
    try {
      const DeviceOrientationEventAny = DeviceOrientationEvent;
      if (DeviceOrientationEventAny?.requestPermission) {
        const res = await DeviceOrientationEventAny.requestPermission();
        if (res !== "granted") {
          alert("لازم تسمح بحركة الجهاز (Motion) من المتصفح");
          return;
        }
      }
      setMotionEnabled(true);
    } catch {
      // If not supported or blocked
      alert("المتصفح ما سمح/ما بدعم Motion بهالجهاز");
    }
  }

  async function loginWithGoogle() {
    try {
      setBusy(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // stay on same origin after login
          redirectTo: window.location.origin,
        },
      });
      if (error) alert(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function loginWithEmail() {
    if (!email) return alert("اكتب الإيميل أولاً");
    try {
      setBusy(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) alert(error.message);
      else alert("تفقد إيميلك 📩");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    try {
      setBusy(true);
      await supabase.auth.signOut();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      {/* star layers */}
      <div className="stars s1" />
      <div className="stars s2" />
      <div className="stars s3" />

      {/* glow pointer */}
      <div className="glow" ref={glowRef} />

      {/* top-left logo */}
      <div className="brandMark" aria-hidden="true">
        <div className="markCore" />
        <div className="markShard a" />
        <div className="markShard b" />
        <div className="markShard c" />
      </div>

      <div className="card" ref={tiltRef}>
        <div className="titleRow">
          <div className="typingWrap">
            <h1 className="typing" aria-label="SIRA AI">
              SIRA AI
            </h1>
          </div>
          <div className="subGlow">AI Login Portal</div>
        </div>

        {!user ? (
          <>
            <input
              className="field"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
            />

            <button className="btn gold" onClick={loginWithEmail} disabled={busy}>
              Continue with Email
            </button>

            <button className="btn dark" onClick={loginWithGoogle} disabled={busy}>
              Continue with Google
            </button>

            <button
              className={`btn ghost ${motionEnabled ? "on" : ""}`}
              onClick={enableMotion}
              disabled={busy || motionEnabled}
              title="لتحريك الكرت مع حركة الجهاز"
            >
              {motionEnabled ? "Motion Enabled ✅" : "Enable Motion (Phone Tilt)"}
            </button>

            <div className="hint">
              Tip: على iPhone ممكن يطلب إذن “Motion”.
            </div>
          </>
        ) : (
          <>
            <p className="logged">
              ✅ Logged in as <strong>{user.email}</strong>
            </p>
            <button className="btn gold" onClick={logout} disabled={busy}>
              Logout
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        :global(html, body) {
          height: 100%;
          margin: 0;
        }

        .wrap {
          min-height: 100vh;
          display: grid;
          place-items: center;
          overflow: hidden;
          position: relative;
          background:
            radial-gradient(1200px 800px at 50% 30%, rgba(255, 200, 0, 0.12), transparent 60%),
            radial-gradient(900px 600px at 20% 80%, rgba(120, 190, 255, 0.10), transparent 55%),
            #050607;
          color: #fff;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          padding: 24px;
          touch-action: manipulation;
        }

        /* ⭐⭐⭐ multi-layer stars stronger */
        .stars {
          position: absolute;
          inset: -20%;
          background-repeat: repeat;
          pointer-events: none;
          opacity: 0.55;
          filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.06));
        }
        .s1 {
          background-image:
            radial-gradient(1px 1px at 10px 20px, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 60px 90px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 120px 40px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 200px 160px, rgba(255,255,255,0.75), transparent);
          background-size: 260px 260px;
          animation: drift1 70s linear infinite;
          opacity: 0.35;
        }
        .s2 {
          background-image:
            radial-gradient(2px 2px at 30px 50px, rgba(255,255,255,0.95), transparent),
            radial-gradient(1px 1px at 170px 120px, rgba(255,255,255,0.85), transparent),
            radial-gradient(1px 1px at 90px 200px, rgba(255,255,255,0.8), transparent);
          background-size: 320px 320px;
          animation: drift2 90s linear infinite;
          opacity: 0.25;
        }
        .s3 {
          background-image:
            radial-gradient(1px 1px at 15px 15px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 240px 80px, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 140px 220px, rgba(255,255,255,0.65), transparent);
          background-size: 420px 420px;
          animation: drift3 120s linear infinite;
          opacity: 0.18;
        }

        @keyframes drift1 { to { transform: translateY(-300px); } }
        @keyframes drift2 { to { transform: translateY(-520px); } }
        @keyframes drift3 { to { transform: translateY(-760px); } }

        /* moving glow following pointer */
        .glow {
          --gx: 50%;
          --gy: 40%;
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            600px 400px at var(--gx) var(--gy),
            rgba(255, 200, 0, 0.16),
            transparent 60%
          );
          mix-blend-mode: screen;
          opacity: 0.9;
        }

        /* ✅ 3D-ish geometric logo top-left */
        .brandMark {
          position: absolute;
          top: 16px;
          left: 16px;
          width: 54px;
          height: 54px;
          transform-style: preserve-3d;
          animation: floatMark 4.8s ease-in-out infinite;
          filter: drop-shadow(0 12px 26px rgba(255, 200, 0, 0.18));
          z-index: 3;
        }
        @keyframes floatMark {
          0%, 100% { transform: translateY(0) rotateZ(0deg); }
          50% { transform: translateY(-6px) rotateZ(6deg); }
        }
        .markCore {
          position: absolute;
          inset: 10px;
          border-radius: 14px;
          background:
            linear-gradient(135deg, rgba(255, 200, 0, 0.95), rgba(255, 120, 0, 0.55));
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.14);
          transform: rotateX(16deg) rotateY(-22deg);
        }
        .markShard {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(30,30,30,0.3), rgba(255,255,255,0.05));
          border: 1px solid rgba(255,255,255,0.10);
          transform-style: preserve-3d;
          animation: shardSpin 3.4s linear infinite;
        }
        .markShard.a { transform: rotateX(64deg) rotateY(10deg); opacity: 0.55; }
        .markShard.b { transform: rotateX(10deg) rotateY(64deg); opacity: 0.45; animation-duration: 4.2s; }
        .markShard.c { transform: rotateX(35deg) rotateY(35deg); opacity: 0.35; animation-duration: 5.2s; }
        @keyframes shardSpin { to { transform: rotateX(360deg) rotateY(360deg); } }

        /* ✅ card tilt vars */
        .card {
          --rx: 0deg;
          --ry: 0deg;
          width: 360px;
          max-width: 92vw;
          padding: 28px;
          border-radius: 24px;
          background: rgba(15, 16, 18, 0.78);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            0 18px 70px rgba(0, 0, 0, 0.65),
            0 0 0 1px rgba(255, 200, 0, 0.10),
            0 0 55px rgba(255, 200, 0, 0.18);
          transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry));
          transition: transform 120ms ease;
          z-index: 2;
        }

        /* touch feedback */
        .card:active {
          transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry)) scale(0.99);
        }

        .titleRow {
          margin-bottom: 18px;
        }

        /* Typing effect */
        .typingWrap {
          display: inline-block;
        }
        .typing {
          margin: 0;
          font-size: 40px;
          letter-spacing: 6px;
          color: rgba(255, 210, 60, 0.98);
          text-shadow:
            0 0 18px rgba(255, 200, 0, 0.35),
            0 0 42px rgba(255, 160, 0, 0.22);
          position: relative;
          overflow: hidden;
          white-space: nowrap;
          width: 0;
          border-right: 3px solid rgba(255, 210, 60, 0.95);
          animation:
            typing 1.35s steps(7, end) forwards,
            caret 0.75s step-end infinite,
            shimmer 2.8s ease-in-out infinite;
        }

        @keyframes typing { to { width: 7.2ch; } }
        @keyframes caret { 50% { border-color: transparent; } }
        @keyframes shimmer {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.15); }
        }

        .subGlow {
          margin-top: 8px;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.62);
        }

        /* ✅ Same size for input + buttons */
        .field, .btn {
          width: 100%;
          height: 50px;
          border-radius: 30px;
          border: none;
          outline: none;
          box-sizing: border-box;
        }

        .field {
          padding: 0 18px;
          text-align: center;
          font-size: 15px;
          background: rgba(255,255,255,0.95);
          color: #111;
          margin-top: 10px;
          margin-bottom: 14px;
        }

        .btn {
          margin-bottom: 12px;
          font-weight: 800;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: transform 0.18s ease, filter 0.18s ease, background 0.18s ease;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .btn:active { transform: scale(0.98); }

        .gold {
          background: linear-gradient(180deg, #ffd54a, #ffb300);
          color: #161616;
          box-shadow: 0 10px 30px rgba(255, 180, 0, 0.22);
        }
        .gold:hover { filter: brightness(1.05); transform: translateY(-1px); }

        .dark {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.92);
          border: 1px solid rgba(255,255,255,0.10);
        }
        .dark:hover { filter: brightness(1.08); transform: translateY(-1px); }

        .ghost {
          background: transparent;
          color: rgba(255,255,255,0.72);
          border: 1px dashed rgba(255,255,255,0.22);
        }
        .ghost.on {
          border-style: solid;
          border-color: rgba(100, 255, 180, 0.35);
          color: rgba(160, 255, 210, 0.9);
        }

        .hint {
          margin-top: 6px;
          font-size: 12px;
          color: rgba(255,255,255,0.55);
        }

        .logged {
          margin: 6px 0 18px;
          color: rgba(255,255,255,0.9);
        }

        /* small screens */
        @media (max-width: 380px) {
          .typing { font-size: 34px; letter-spacing: 5px; }
          .card { padding: 22px; }
        }

        /* reduce motion accessibility */
        @media (prefers-reduced-motion: reduce) {
          .stars, .brandMark, .typing { animation: none !important; }
          .card { transition: none; }
        }
      `}</style>
    </div>
  );
}
