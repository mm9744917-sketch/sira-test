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
    subtitle: "لوحة التحكم",
    welcome: "مرحباً!",
    loggedAs: "تم تسجيل الدخول كـ",
    logout: "تسجيل الخروج",
    backHome: "العودة لتسجيل الدخول",
    cardsTitle: "مشاريعك",
    card1: "مشروع جديد قريباً",
    card2: "إدارة الدومين",
    card3: "نظام العملات",
    note: "هذه لوحة تحكم تجريبية — بكرا منكمّل ونبنيها بشكل احترافي.",
  },
  en: {
    title: "SIRA AI",
    subtitle: "Dashboard",
    welcome: "Welcome!",
    loggedAs: "Logged in as",
    logout: "Logout",
    backHome: "Back to Login",
    cardsTitle: "Your Projects",
    card1: "New project (soon)",
    card2: "Domain management",
    card3: "Coins system",
    note: "This is a starter dashboard — we’ll expand it next.",
  },
  zh: {
    title: "SIRA AI",
    subtitle: "控制面板",
    welcome: "欢迎！",
    loggedAs: "已登录：",
    logout: "退出登录",
    backHome: "返回登录页",
    cardsTitle: "你的项目",
    card1: "新项目（即将上线）",
    card2: "域名管理",
    card3: "金币系统",
    note: "这是一个初始面板 — 我们接下来继续完善。",
  },
  de: {
    title: "SIRA AI",
    subtitle: "Dashboard",
    welcome: "Willkommen!",
    loggedAs: "Angemeldet als",
    logout: "Abmelden",
    backHome: "Zurück zum Login",
    cardsTitle: "Deine Projekte",
    card1: "Neues Projekt (bald)",
    card2: "Domain Verwaltung",
    card3: "Coins System",
    note: "Dies ist ein Start-Dashboard — wir bauen es als Nächstes aus.",
  },
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(false);

  // language (persist)
  const [lang, setLang] = useState("ar");
  const [openLang, setOpenLang] = useState(false);
  const langBtnRef = useRef(null);
  const langMenuRef = useRef(null);

  const tiltRef = useRef(null);
  const glowRef = useRef(null);

  const currentLang = LANGS.find((x) => x.key === lang) || LANGS[0];
  const L = T[lang] || T.en;

  // load saved language once
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("sira_lang");
    if (saved && LANGS.some((x) => x.key === saved)) setLang(saved);
  }, []);

  // apply dir/lang + save
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dir = currentLang.dir;
    document.documentElement.lang = lang;
    if (typeof window !== "undefined") window.localStorage.setItem("sira_lang", lang);
  }, [lang, currentLang.dir]);

  // protect dashboard: if no session => go to login
  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user ?? null;
      setUser(u);
      if (!u) window.location.replace("/");
    };

    run();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (!u) window.location.replace("/");
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // tilt (touch/mouse)
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

  // close language menu
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

  async function logout() {
    softVibrate();
    try {
      setBusy(true);
      await supabase.auth.signOut();
      window.location.replace("/");
    } finally {
      setBusy(false);
    }
  }

  function goHome() {
    softVibrate();
    window.location.href = "/";
  }

  return (
    <div className="wrap">
      {/* stars */}
      <div className="stars s1" />
      <div className="stars s2" />
      <div className="stars s3" />
      <div className="glow" ref={glowRef} />

      {/* language */}
      <div className="langBox" dir="ltr">
        <button
          ref={langBtnRef}
          className="langBtn"
          onClick={() => setOpenLang((v) => !v)}
          type="button"
        >
          <span className="flag wave">{currentLang.flag}</span>
          <span className="langName">{currentLang.name}</span>
          <span className="chev">▾</span>
        </button>

        {openLang && (
          <div ref={langMenuRef} className="langMenu">
            {LANGS.map((x) => (
              <button
                key={x.key}
                className={`langItem ${x.key === lang ? "active" : ""}`}
                onClick={() => {
                  setLang(x.key);
                  setOpenLang(false);
                }}
                type="button"
              >
                <span className="flag wave">{x.flag}</span>
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

      {/* center */}
      <div className="center">
        <div className="card" ref={tiltRef}>
          <div className="header">
            <div className="titleBlock">
              <h1 className="title">{L.title}</h1>
              <div className="sub">{L.subtitle}</div>
            </div>

            <div className="actions">
              <button className="btn ghost" onClick={goHome} disabled={busy} type="button">
                {L.backHome}
              </button>
              <button className="btn gold" onClick={logout} disabled={busy} type="button">
                {L.logout}
              </button>
            </div>
          </div>

          <div className="info">
            <div className="welcome">{L.welcome}</div>
            <div className="emailLine">
              ✅ {L.loggedAs}{" "}
              <span className="email">{user?.email || ""}</span>
            </div>
          </div>

          <div className="sectionTitle">{L.cardsTitle}</div>

          <div className="grid">
            <div className="panel">
              <div className="panelTitle">{L.card1}</div>
              <div className="panelText">{L.note}</div>
            </div>

            <div className="panel">
              <div className="panelTitle">{L.card2}</div>
              <div className="panelText">—</div>
            </div>

            <div className="panel">
              <div className="panelTitle">{L.card3}</div>
              <div className="panelText">—</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        :global(*) { box-sizing: border-box; }
        :global(html, body) { height: 100%; margin: 0; overflow-x: hidden; background: #050607; }

        .wrap {
          position: relative;
          min-height: 100dvh;
          width: 100%;
          overflow: hidden;
          padding: 24px;
          color: #fff;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
          background:
            radial-gradient(1200px 800px at 50% 30%, rgba(255, 200, 0, 0.12), transparent 60%),
            radial-gradient(900px 600px at 20% 80%, rgba(120, 190, 255, 0.10), transparent 55%),
            #050607;
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

        /* stars */
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

        /* language */
        .langBox { position: absolute; top: 14px; right: 14px; z-index: 5; }
        .langBtn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(15,16,18,0.62);
          backdrop-filter: blur(10px);
          color: rgba(255,255,255,0.92);
          cursor: pointer;
          box-shadow: 0 14px 34px rgba(0,0,0,0.35);
          -webkit-tap-highlight-color: transparent;
        }
        .langBtn:active { transform: scale(0.98); }
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
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 12px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.90);
          cursor: pointer;
          text-align: left;
        }
        .langItem.active { background: rgba(255, 200, 0, 0.10); }
        .flag { font-size: 18px; display: inline-block; transform-origin: 20% 50%; }
        .wave { animation: wave 1.8s ease-in-out infinite; }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(6deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-6deg); }
        }

        /* logo */
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
          background: linear-gradient(135deg, rgba(255, 200, 0, 0.95), rgba(255, 120, 0, 0.55));
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

        /* card */
        .card {
          --rx: 0deg;
          --ry: 0deg;
          width: 760px;
          max-width: 92vw;
          padding: 26px;
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
        }

        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .title { margin: 0; font-size: 34px; letter-spacing: 5px; color: rgba(255,210,60,0.98);
          text-shadow: 0 0 18px rgba(255,200,0,0.35), 0 0 42px rgba(255,160,0,0.22);
        }
        .sub { margin-top: 6px; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.62); }

        .actions { display: flex; gap: 10px; flex-wrap: wrap; }

        .btn {
          height: 46px;
          padding: 0 16px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-weight: 800;
          letter-spacing: 0.2px;
          -webkit-tap-highlight-color: transparent;
        }
        .btn:active { transform: scale(0.98); }

        .gold {
          background: linear-gradient(180deg, #ffd54a, #ffb300);
          color: #161616;
          box-shadow: 0 10px 30px rgba(255, 180, 0, 0.22);
        }
        .ghost {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.92);
          border: 1px solid rgba(255,255,255,0.10);
        }

        .info {
          margin-bottom: 18px;
          padding: 14px 14px;
          border-radius: 18px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .welcome { font-weight: 900; margin-bottom: 8px; }
        .emailLine { color: rgba(255,255,255,0.90); }
        .email {
          display: inline-block;
          max-width: 100%;
          direction: ltr;
          unicode-bidi: plaintext;
          overflow-wrap: anywhere;
          font-weight: 900;
        }

        .sectionTitle {
          margin: 10px 0 12px;
          font-weight: 900;
          color: rgba(255,255,255,0.92);
          letter-spacing: 0.2px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .panel {
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          min-height: 92px;
        }
        .panelTitle { font-weight: 900; margin-bottom: 8px; }
        .panelText { color: rgba(255,255,255,0.70); font-size: 13px; line-height: 1.35; }

        @media (max-width: 820px) {
          .grid { grid-template-columns: 1fr; }
          .card { width: 420px; }
          .title { font-size: 30px; letter-spacing: 4px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .stars, .brandMark, .wave { animation: none !important; }
          .card { transition: none; }
        }
      `}</style>
    </div>
  );
}
