import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/** ---------- i18n ---------- */
const LANGS = [
  { key: "ar", name: "العربية", flag: "🇸🇾", dir: "rtl" },
  { key: "en", name: "English", flag: "🇬🇧", dir: "ltr" },
  { key: "zh", name: "中文", flag: "🇨🇳", dir: "ltr" },
  { key: "de", name: "Deutsch", flag: "🇩🇪", dir: "ltr" },
];

const T = {
  ar: {
    title: "SIRA AI",
    subtitle: "بوابة تسجيل دخول",
    emailPh: "اكتب بريدك الإلكتروني",
    emailBtn: "متابعة عبر البريد",
    googleBtn: "متابعة عبر Google",
    tip: "اكتب الإيميل ثم اضغط Email أو Google",
    logged: "تم تسجيل الدخول كـ",
    logout: "تسجيل الخروج",
    enterEmailFirst: "اكتب الإيميل أولاً",
    checkEmail: "تفقد إيميلك 📩",
  },
  en: {
    title: "SIRA AI",
    subtitle: "AI LOGIN PORTAL",
    emailPh: "Enter your email",
    emailBtn: "Continue with Email",
    googleBtn: "Continue with Google",
    tip: "Type your email then choose Email or Google",
    logged: "Logged in as",
    logout: "Logout",
    enterEmailFirst: "Enter your email first",
    checkEmail: "Check your inbox 📩",
  },
  zh: {
    title: "SIRA AI",
    subtitle: "AI 登录入口",
    emailPh: "请输入邮箱",
    emailBtn: "使用邮箱继续",
    googleBtn: "使用 Google 继续",
    tip: "输入邮箱后，选择邮箱或 Google 登录",
    logged: "已登录：",
    logout: "退出登录",
    enterEmailFirst: "请先输入邮箱",
    checkEmail: "请查看邮箱 📩",
  },
  de: {
    title: "SIRA AI",
    subtitle: "AI LOGIN PORTAL",
    emailPh: "E-Mail eingeben",
    emailBtn: "Mit E-Mail fortfahren",
    googleBtn: "Mit Google fortfahren",
    tip: "E-Mail eingeben und dann Email oder Google wählen",
    logged: "Angemeldet als",
    logout: "Abmelden",
    enterEmailFirst: "Bitte zuerst die E-Mail eingeben",
    checkEmail: "Bitte E-Mail prüfen 📩",
  },
};

function GoogleGIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" style={{ display: "block" }}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.695 32.657 29.195 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.99 6.053 29.749 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.656 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.99 6.053 29.749 4 24 4 16.318 4 9.656 8.338 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.091 0 9.817-1.95 13.348-5.126l-6.164-5.216C29.195 36 26.74 37 24 37c-5.174 0-9.563-3.314-11.174-7.93l-6.522 5.025C9.61 39.556 16.271 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.723 2.047-2.014 3.77-3.72 4.958l.003-.002 6.164 5.216C36.4 39.5 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  // language
  const [lang, setLang] = useState("ar");
  const [openLang, setOpenLang] = useState(false);
  const langBtnRef = useRef(null);
  const langMenuRef = useRef(null);

  const tiltRef = useRef(null);
  const glowRef = useRef(null);

  const L = T[lang] || T.en;
  const currentLang = LANGS.find((x) => x.key === lang) || LANGS[0];

  // apply dir/lang to document
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dir = currentLang.dir;
    document.documentElement.lang = lang;
  }, [lang, currentLang.dir]);

  // ✅ IMPORTANT: handle OAuth "code" and convert it to a session once
  useEffect(() => {
    const run = async () => {
      if (typeof window === "undefined") return;

      // إذا رجع من Google ومعه code بالـ URL
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        // بدّل code ل session
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        // نظّف الرابط (حتى ما يضل يرجعك لنفس الحالة)
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        window.history.replaceState({}, "", url.pathname || "/");

        if (error) {
          console.log("exchangeCodeForSession error:", error.message);
        }
      }

      // بعدها هات السيشن الطبيعي
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    run();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      // كمان تنظيف احتياطي إذا في query params
      if (typeof window !== "undefined") {
        const u = new URL(window.location.href);
        if (u.searchParams.get("code") || u.searchParams.get("state")) {
          u.searchParams.delete("code");
          u.searchParams.delete("state");
          window.history.replaceState({}, "", u.pathname || "/");
        }
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Touch/mouse tilt (NO iPhone permission)
  useEffect(() => {
    const el = tiltRef.current;
    if (!el) return;

    const onMove = (clientX, clientY) => {
      const r = el.getBoundingClientRect();
      const px = (clientX - (r.left + r.width / 2)) / (r.width / 2);
      const py = (clientY - (r.top + r.height / 2)) / (r.height / 2);

      const clamp = (v) => Math.max(-1, Math.min(1, v));
      const x = clamp(px);
      const y = clamp(py);

      el.style.setProperty("--rx", `${-y * 6}deg`);
      el.style.setProperty("--ry", `${x * 6}deg`);

      if (glowRef.current) {
        glowRef.current.style.setProperty("--gx", `${(x + 1) * 50}%`);
        glowRef.current.style.setProperty("--gy", `${(y + 1) * 50}%`);
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

  // close language menu on outside click
  useEffect(() => {
    if (!openLang) return;

    const onDown = (e) => {
      const b = langBtnRef.current;
      const m = langMenuRef.current;
      if (b && b.contains(e.target)) return;
      if (m && m.contains(e.target)) return;
      setOpenLang(false);
    };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown, { passive: true });
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown);
    };
  }, [openLang]);

  const softVibrate = () => {
    try {
      if (navigator.vibrate) navigator.vibrate([25, 40, 25]);
    } catch {}
  };

  async function loginWithGoogle() {
    softVibrate();
    try {
      setBusy(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // ✅ IMPORTANT: لازم / بالآخر
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) alert(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function loginWithEmail() {
    softVibrate();
    if (!email) return alert(L.enterEmailFirst);
    try {
      setBusy(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // ✅ IMPORTANT: لازم / بالآخر
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) alert(error.message);
      else alert(L.checkEmail);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    softVibrate();
    try {
      setBusy(true);
      await supabase.auth.signOut();
      // تنظيف بسيط بعد الخروج
      if (typeof window !== "undefined") window.history.replaceState({}, "", "/");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      {/* stars */}
      <div className="stars s1" />
      <div className="stars s2" />
      <div className="stars s3" />

      {/* glow */}
      <div className="glow" ref={glowRef} />

      {/* Language menu (top-right) */}
      <div className="langBox" dir="ltr">
        <button
          ref={langBtnRef}
          className="langBtn"
          onClick={() => setOpenLang((v) => !v)}
          type="button"
          aria-haspopup="menu"
          aria-expanded={openLang}
        >
          <span className="flag wave" aria-hidden="true">
            {currentLang.flag}
          </span>
          <span className="langName">{currentLang.name}</span>
          <span className="chev" aria-hidden="true">
            ▾
          </span>
        </button>

        {openLang && (
          <div ref={langMenuRef} className="langMenu" role="menu">
            {LANGS.map((x) => (
              <button
                key={x.key}
                className={`langItem ${x.key === lang ? "active" : ""}`}
                onClick={() => {
                  setLang(x.key);
                  setOpenLang(false);
                }}
                type="button"
                role="menuitem"
              >
                <span className="flag wave" aria-hidden="true">
                  {x.flag}
                </span>
                <span className="langName">{x.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* top-left logo */}
      <div className="brandMark" aria-hidden="true">
        <div className="markCore" />
        <div className="markShard a" />
        <div className="markShard b" />
        <div className="markShard c" />
      </div>

      {/* Center wrapper */}
      <div className="center">
        <div className="card" ref={tiltRef}>
          <div className="titleRow">
            <div className="typingWrap">
              <h1 className="typing" aria-label={L.title}>
                {L.title}
              </h1>
            </div>
            <div className="subGlow">{L.subtitle}</div>
          </div>

          {!user ? (
            <>
              <input
                className="field"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={L.emailPh}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
              />

              <button className="btn gold" onClick={loginWithEmail} disabled={busy}>
                {L.emailBtn}
              </button>

              <button className="btn dark google" onClick={loginWithGoogle} disabled={busy}>
                <span className="gIcon" aria-hidden="true">
                  <GoogleGIcon />
                </span>
                <span className="gText">{L.googleBtn}</span>
              </button>

              <div className="hint">{L.tip}</div>
            </>
          ) : (
            <>
              <p className="logged">
                ✅ {L.logged} <strong>{user.email}</strong>
              </p>
              <button className="btn gold" onClick={logout} disabled={busy}>
                {L.logout}
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        :global(*) { box-sizing: border-box; }

        :global(html, body) {
          height: 100%;
          margin: 0;
          overflow-x: hidden;
          overscroll-behavior: none;
        }

        .wrap {
          position: relative;
          min-height: 100dvh;
          width: 100%;
          overflow: hidden;
          background:
            radial-gradient(1200px 800px at 50% 30%, rgba(255, 200, 0, 0.12), transparent 60%),
            radial-gradient(900px 600px at 20% 80%, rgba(120, 190, 255, 0.10), transparent 55%),
            #050607;
          color: #fff;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          padding: 24px;
          touch-action: manipulation;
        }

        .center {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 2;
          pointer-events: none;
        }
        .card { pointer-events: auto; }

        /* stars (bigger) */
        .stars {
          position: absolute;
          inset: -20%;
          background-repeat: repeat;
          pointer-events: none;
          filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.06));
        }
        .s1 {
          background-image:
            radial-gradient(2px 2px at 10px 20px, rgba(255,255,255,0.9), transparent),
            radial-gradient(2px 2px at 60px 90px, rgba(255,255,255,0.8), transparent),
            radial-gradient(2px 2px at 120px 40px, rgba(255,255,255,0.7), transparent),
            radial-gradient(2px 2px at 200px 160px, rgba(255,255,255,0.75), transparent);
          background-size: 260px 260px;
          animation: drift1 70s linear infinite;
          opacity: 0.45;
        }
        .s2 {
          background-image:
            radial-gradient(3px 3px at 30px 50px, rgba(255,255,255,0.95), transparent),
            radial-gradient(2px 2px at 170px 120px, rgba(255,255,255,0.85), transparent),
            radial-gradient(2px 2px at 90px 200px, rgba(255,255,255,0.8), transparent);
          background-size: 320px 320px;
          animation: drift2 90s linear infinite;
          opacity: 0.26;
        }
        .s3 {
          background-image:
            radial-gradient(2px 2px at 15px 15px, rgba(255,255,255,0.7), transparent),
            radial-gradient(2px 2px at 240px 80px, rgba(255,255,255,0.7), transparent),
            radial-gradient(2px 2px at 140px 220px, rgba(255,255,255,0.65), transparent);
          background-size: 420px 420px;
          animation: drift3 120s linear infinite;
          opacity: 0.18;
        }
        @keyframes drift1 { to { transform: translateY(-300px); } }
        @keyframes drift2 { to { transform: translateY(-520px); } }
        @keyframes drift3 { to { transform: translateY(-760px); } }

        .glow {
          --gx: 50%;
          --gy: 40%;
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(600px 400px at var(--gx) var(--gy), rgba(255, 200, 0, 0.16), transparent 60%);
          mix-blend-mode: screen;
          opacity: 0.9;
        }

        .langBox { position: absolute; top: 14px; right: 14px; z-index: 5; }
        .langBtn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(15,16,18,0.62);
          backdrop-filter: blur(10px);
          color: rgba(255,255,255,0.92);
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          box-shadow: 0 14px 34px rgba(0,0,0,0.35);
        }
        .langBtn:active { transform: scale(0.98); }
        .langName { font-weight: 700; font-size: 13px; letter-spacing: 0.2px; }
        .chev { opacity: 0.8; font-size: 12px; }

        .langMenu {
          margin-top: 10px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(12,13,15,0.78);
          backdrop-filter: blur(12px);
          overflow: hidden;
          box-shadow: 0 18px 60px rgba(0,0,0,0.55);
          min-width: 190px;
        }
        .langItem {
          width: 100%;
          display: flex; align-items: center; gap: 10px;
          padding: 12px 12px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.90);
          cursor: pointer;
          text-align: left;
        }
        .langItem:hover { background: rgba(255,255,255,0.06); }
        .langItem.active { background: rgba(255, 200, 0, 0.10); }

        .flag { font-size: 18px; display: inline-block; transform-origin: 20% 50%; }
        .wave { animation: wave 1.8s ease-in-out infinite; }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(6deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-6deg); }
        }

        .brandMark {
          position: absolute; top: 16px; left: 16px;
          width: 54px; height: 54px;
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
          position: absolute; inset: 10px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(255, 200, 0, 0.95), rgba(255, 120, 0, 0.55));
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.14);
          transform: rotateX(16deg) rotateY(-22deg);
        }
        .markShard {
          position: absolute; inset: 0;
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

        .card {
          --rx: 0deg; --ry: 0deg;
          width: 360px; max-width: 92vw;
          padding: 28px;
          border-radius: 24px;
          background: rgba(15, 16, 18, 0.78);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 18px 70px rgba(0, 0, 0, 0.65),
            0 0 0 1px rgba(255, 200, 0, 0.10),
            0 0 55px rgba(255, 200, 0, 0.18);
          transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry));
          transition: transform 120ms ease;
        }
        .card:active {
          transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry)) scale(0.99);
        }

        .titleRow { margin-bottom: 18px; }
        .typingWrap { display: inline-block; }

        .typing {
          margin: 0;
          font-size: 40px;
          letter-spacing: 6px;
          color: rgba(255, 210, 60, 0.98);
          text-shadow: 0 0 18px rgba(255, 200, 0, 0.35), 0 0 42px rgba(255, 160, 0, 0.22);
          overflow: hidden;
          white-space: nowrap;
          width: 0;
          border-right: 3px solid rgba(255, 210, 60, 0.95);
          animation: typing 1.35s steps(7, end) forwards, caret 0.75s step-end infinite, shimmer 2.8s ease-in-out infinite;
        }
        @keyframes typing { to { width: 7.2ch; } }
        @keyframes caret { 50% { border-color: transparent; } }
        @keyframes shimmer { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.15); } }

        .subGlow {
          margin-top: 8px;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.62);
        }

        .field, .btn {
          width: 100%;
          height: 50px;
          border-radius: 30px;
          border: none;
          outline: none;
        }

        .field {
          padding: 0 18px;
          direction: ltr;
          text-align: left;
          font-size: 16px;
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

        .google {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .gIcon {
          width: 18px; height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.35));
        }
        .gText { line-height: 1; }

        .hint { margin-top: 6px; font-size: 12px; color: rgba(255,255,255,0.55); }

        .logged { margin: 6px 0 18px; color: rgba(255,255,255,0.9); }

        @media (max-width: 380px) {
          .typing { font-size: 34px; letter-spacing: 5px; }
          .card { padding: 22px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .stars, .brandMark, .typing, .wave { animation: none !important; }
          .card { transition: none; }
        }
      `}</style>
    </div>
  );
}
