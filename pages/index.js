// /pages/index.js
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const cardRef = useRef(null);

  // نجوم بسيطة (بدون canvas / بدون permissions)
  const starLayers = useMemo(() => {
    // 3 طبقات نجوم بكثافات مختلفة
    return [
      { size: 1, opacity: 0.35, duration: 26, density: 130 },
      { size: 1.6, opacity: 0.25, duration: 40, density: 90 },
      { size: 2.2, opacity: 0.18, duration: 60, density: 55 },
    ];
  }, []);

  useEffect(() => {
    let mounted = true;

    // جلب المستخدم الحالي + متابعة التغييرات
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const s = data?.session;
      setUserEmail(s?.user?.email || "");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || "");
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // حركة لطيفة بالماوس/اللمس (بدون جيروسكوب)
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    let raf = 0;
    const state = { x: 0, y: 0, tx: 0, ty: 0 };

    const animate = () => {
      // smoothing
      state.x += (state.tx - state.x) * 0.08;
      state.y += (state.ty - state.y) * 0.08;

      el.style.transform = `translate3d(${state.x}px, ${state.y}px, 0)`;
      raf = requestAnimationFrame(animate);
    };

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const p = e.touches?.[0] ? e.touches[0] : e;
      const dx = (p.clientX - cx) / 18;
      const dy = (p.clientY - cy) / 18;

      // clamp
      state.tx = Math.max(-14, Math.min(14, dx));
      state.ty = Math.max(-14, Math.min(14, dy));
    };

    const onLeave = () => {
      state.tx = 0;
      state.ty = 0;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onLeave, { passive: true });
    window.addEventListener("mouseleave", onLeave, { passive: true });

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onLeave);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const popSound = () => {
    // "انفجار" لطيف بدون ملفات وبدون صلاحيات
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(220, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.09);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.16);
      setTimeout(() => ctx.close(), 260);
    } catch (_) {}
  };

  const ripple = (e) => {
    const btn = e.currentTarget;
    const r = document.createElement("span");
    r.className = "ripple";
    const rect = btn.getBoundingClientRect();
    const p = e.touches?.[0] ? e.touches[0] : e;
    const x = p.clientX - rect.left;
    const y = p.clientY - rect.top;
    r.style.left = `${x}px`;
    r.style.top = `${y}px`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 650);
  };

  const signInEmail = async (e) => {
    e?.preventDefault?.();
    if (!email.trim()) return setMsg("اكتب الإيميل أولاً");
    setLoading(true);
    setMsg("");
    popSound();

    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() });
    setLoading(false);

    if (error) setMsg("Error: " + error.message);
    else setMsg("تم إرسال رابط تسجيل الدخول على الإيميل ✅");
  };

  const signInGoogle = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setMsg("");
    popSound();

    // مهم: لازم يكون عندك /pages/auth/callback.js شغال
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    setLoading(false);
    if (error) setMsg("Error: " + error.message);
  };

  const logout = async () => {
    popSound();
    await supabase.auth.signOut();
  };

  return (
    <div className="wrap">
      <div className="stars">
        {starLayers.map((l, i) => (
          <div
            key={i}
            className="starLayer"
            style={{
              ["--dotSize"]: `${l.size}px`,
              ["--dotOpacity"]: l.opacity,
              ["--dur"]: `${l.duration}s`,
              ["--density"]: l.density,
            }}
          />
        ))}
      </div>

      <div className="topLogo" aria-hidden="true">
        <div className="geoLogo" />
        <div className="geoGlow" />
      </div>

      <div className="card" ref={cardRef}>
        <div className="titleRow">
          <h1 className="typeTitle" aria-label="SIRA AI">
            <span>SIRA AI</span>
          </h1>
        </div>

        {userEmail ? (
          <div className="logged">
            <div className="okRow">
              <span className="ok">✅</span>
              <div className="txt">
                Logged in as: <b>{userEmail}</b>
              </div>
            </div>
            <button className="btn btnDark" onClick={logout} onPointerDown={ripple}>
              Logout
            </button>
          </div>
        ) : (
          <form onSubmit={signInEmail} className="form">
            <input
              className="input"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
            />

            <button
              className="btn btnGold"
              type="submit"
              disabled={loading}
              onPointerDown={ripple}
            >
              {loading ? "Loading..." : "Continue with Email"}
            </button>

            <button
              className="btn btnDark"
              type="button"
              disabled={loading}
              onClick={signInGoogle}
              onPointerDown={ripple}
            >
              <span className="gMark" aria-hidden="true">G</span>
              Continue with Google
            </button>

            {msg ? <p className="msg">{msg}</p> : null}
          </form>
        )}
      </div>

      <style jsx global>{`
        html, body {
          padding: 0;
          margin: 0;
          height: 100%;
          background: #070708;
          overflow-x: hidden; /* يمنع زحزحة يمين/يسار */
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }
        * { box-sizing: border-box; }
      `}</style>

      <style jsx>{`
        .wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px 16px;
          position: relative;
          isolation: isolate;
        }

        /* خلفية النجوم */
        .stars {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .starLayer {
          position: absolute;
          inset: -30%;
          opacity: var(--dotOpacity);
          background-image:
            radial-gradient(rgba(255, 232, 150, 0.8) 1px, transparent 1px);
          background-size: calc(100% / var(--density)) calc(100% / var(--density));
          filter: drop-shadow(0 0 10px rgba(255, 200, 70, 0.12));
          animation: drift var(--dur) linear infinite;
          transform: translate3d(0,0,0);
        }
        .starLayer::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(rgba(255,255,255,0.65) var(--dotSize), transparent calc(var(--dotSize) + 0.2px));
          background-size: calc(100% / var(--density)) calc(100% / var(--density));
          opacity: 0.18;
          animation: twinkle 3.8s ease-in-out infinite;
        }

        @keyframes drift {
          0% { transform: translate3d(0,0,0); }
          100% { transform: translate3d(-6%, 8%, 0); }
        }
        @keyframes twinkle {
          0%,100% { opacity: 0.12; }
          50% { opacity: 0.35; }
        }

        /* شعار هندسي "نااار" بدون مكتبات */
        .topLogo {
          position: absolute;
          top: 18px;
          left: 18px;
          width: 54px;
          height: 54px;
          z-index: 2;
        }
        .geoLogo {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          background:
            linear-gradient(135deg, rgba(255, 214, 76, 0.95), rgba(255, 140, 50, 0.75)),
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), transparent 55%);
          box-shadow:
            0 18px 42px rgba(0,0,0,0.55),
            0 0 34px rgba(255, 180, 60, 0.24);
          position: relative;
          transform-style: preserve-3d;
          animation: floatLogo 4.2s ease-in-out infinite;
          overflow: hidden;
        }
        .geoLogo::before, .geoLogo::after {
          content: "";
          position: absolute;
          inset: 10px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.18);
          background:
            conic-gradient(from 210deg,
              rgba(0,0,0,0.0),
              rgba(0,0,0,0.25),
              rgba(255,255,255,0.12),
              rgba(0,0,0,0.0)
            );
          filter: blur(0.2px);
          mix-blend-mode: overlay;
        }
        .geoLogo::after {
          inset: 16px;
          border-radius: 10px;
          opacity: 0.65;
        }
        .geoGlow {
          position: absolute;
          inset: -10px;
          border-radius: 18px;
          background: radial-gradient(circle, rgba(255, 200, 90, 0.22), transparent 60%);
          filter: blur(8px);
          animation: glowPulse 2.7s ease-in-out infinite;
        }

        @keyframes floatLogo {
          0%,100% { transform: translate3d(0,0,0) rotate(0deg); }
          50% { transform: translate3d(0,-6px,0) rotate(2deg); }
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.06); }
        }

        /* الكارد */
        .card {
          width: min(420px, 92vw);
          background: rgba(18, 18, 20, 0.85);
          border: 1px solid rgba(255, 210, 90, 0.14);
          border-radius: 22px;
          padding: 26px 18px 18px;
          box-shadow:
            0 30px 80px rgba(0,0,0,0.55),
            0 0 0 1px rgba(255, 220, 120, 0.06) inset;
          backdrop-filter: blur(10px);
          z-index: 1;
          will-change: transform;
        }

        /* العنوان بتأثير كتابة */
        .titleRow {
          display: flex;
          justify-content: center;
          margin-bottom: 18px;
        }
        .typeTitle {
          margin: 0;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #ffd34a;
          text-shadow: 0 0 26px rgba(255, 210, 80, 0.24);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
        }
        .typeTitle span {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid rgba(255, 210, 80, 0.9);
          width: 0;
          animation: typing 1.25s steps(12, end) forwards, caret 0.75s step-end infinite;
        }
        @keyframes typing { to { width: 9.2ch; } }
        @keyframes caret {
          0%, 100% { border-color: transparent; }
          50% { border-color: rgba(255, 210, 80, 0.9); }
        }

        .form {
          display: grid;
          gap: 12px;
        }

        /* نفس المقاس للجميع */
        .input, .btn {
          width: 100%;
          height: 52px;
          border-radius: 999px;
        }

        .input {
          border: 1px solid rgba(255, 255, 255, 0.12);
          outline: none;
          padding: 0 18px;
          font-size: 15px;
          color: #f3f3f3;
          background: rgba(255,255,255,0.06);
        }
        .input::placeholder { color: rgba(255,255,255,0.45); }
        .input:focus {
          border-color: rgba(255, 210, 80, 0.45);
          box-shadow: 0 0 0 4px rgba(255, 210, 80, 0.12);
        }

        .btn {
          position: relative;
          overflow: hidden;
          border: none;
          font-weight: 700;
          letter-spacing: 0.02em;
          cursor: pointer;
          transform: translateZ(0);
          transition: transform 140ms ease, filter 140ms ease;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .btn:active { transform: scale(0.98); }

        .btnGold {
          background: linear-gradient(135deg, #ffd34a, #ffb400);
          color: #111;
          box-shadow: 0 18px 40px rgba(255, 180, 30, 0.18);
        }

        .btnDark {
          background: rgba(255,255,255,0.08);
          color: #f1f1f1;
          border: 1px solid rgba(255, 210, 80, 0.12);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .gMark {
          display: inline-grid;
          place-items: center;
          width: 24px;
          height: 24px;
          border-radius: 7px;
          margin-right: 10px;
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.12);
          font-weight: 900;
          color: #fff;
        }

        /* Ripple انفجار ناعم */
        .ripple {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 999px;
          transform: translate(-50%, -50%);
          left: 50%;
          top: 50%;
          pointer-events: none;
          background: radial-gradient(circle, rgba(255,255,255,0.55), rgba(255,255,255,0.0) 60%);
          animation: ripple 650ms ease-out forwards;
          filter: blur(0.2px);
        }
        @keyframes ripple {
          0% { opacity: 0.65; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(18); }
        }

        .msg {
          margin: 6px 0 0;
          text-align: center;
          color: rgba(255,255,255,0.85);
          font-size: 13px;
          opacity: 0.9;
        }

        .logged {
          display: grid;
          gap: 14px;
        }
        .okRow {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.9);
        }
        .ok { font-size: 18px; }

        /* تحسين للموبايل */
        @media (max-width: 420px) {
          .card { padding: 22px 14px 16px; }
          .typeTitle { font-size: 28px; }
        }
      `}</style>
    </div>
  );
}
