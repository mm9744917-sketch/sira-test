export default function Home() {
  return (
    <div style={styles.page}>
      <div style={styles.nav}>
        <div style={styles.brand}>
          <div style={styles.logo} />
          <div>
            <div style={styles.brandTitle}>
              SIRA <span style={{ color: "#D4AF37" }}>AI</span>
            </div>
            <div style={styles.brandSub}>Build websites & web apps from text</div>
          </div>
        </div>
        <a style={styles.btnGhost} href="#start">Dashboard</a>
      </div>

      <div style={styles.hero}>
        <h1 style={styles.h1}>
          Build your Website & App with <span style={{ color: "#D4AF37" }}>AI</span>
        </h1>
        <p style={styles.p}>
          اكتب فكرتك، وخلي المنصة تولّد لك مشروع احترافي مع رابط معاينة ونشر.
        </p>

        <div style={styles.row}>
          <a id="start" style={styles.btnGold} href="#plans">Start Now</a>
          <a style={styles.btnGhost} href="#plans">View Plans</a>
        </div>

        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>AI Builder</div>
            <div style={styles.cardText}>توليد مواقع وتطبيقات ويب من وصف واحد.</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Preview + Deploy</div>
            <div style={styles.cardText}>معاينة مباشرة + نشر تلقائي على رابط.</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Credits System</div>
            <div style={styles.cardText}>ادفع بالعملات على البناء والتعديلات.</div>
          </div>
        </div>

        <div id="plans" style={styles.footer}>
          © {new Date().getFullYear()} SIRA AI — Prototype on Vercel
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "Arial, sans-serif" },
  nav: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "18px 22px", borderBottom: "1px solid rgba(255,255,255,.08)",
    position: "sticky", top: 0, background: "rgba(0,0,0,.6)", backdropFilter: "blur(10px)"
  },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  logo: { width: 36, height: 36, borderRadius: 12, border: "1px solid rgba(212,175,55,.4)", background: "rgba(212,175,55,.1)" },
  brandTitle: { fontWeight: 700, letterSpacing: 0.5 },
  brandSub: { fontSize: 12, opacity: 0.6, marginTop: 2 },

  hero: { maxWidth: 980, margin: "0 auto", padding: "60px 22px 30px" },
  h1: { fontSize: 42, margin: 0, lineHeight: 1.1 },
  p: { maxWidth: 680, marginTop: 14, opacity: 0.72, lineHeight: 1.7 },

  row: { display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" },
  btnGold: {
    background: "#D4AF37", color: "#000", padding: "12px 18px", borderRadius: 14,
    textDecoration: "none", fontWeight: 700
  },
  btnGhost: {
    border: "1px solid rgba(255,255,255,.14)", color: "#fff", padding: "12px 18px",
    borderRadius: 14, textDecoration: "none", background: "rgba(255,255,255,.03)"
  },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 34 },
  card: { border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)", borderRadius: 18, padding: 18 },
  cardTitle: { color: "#D4AF37", fontWeight: 700 },
  cardText: { marginTop: 8, opacity: 0.72, lineHeight: 1.6 },

  footer: { marginTop: 44, borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 18, opacity: 0.5, fontSize: 12 }
};
