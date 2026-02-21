// app/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#1e1e1e", borderTop: "4px solid #E31837", padding: "32px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Brand */}
        <div>
          <div style={{ color: "#E31837", fontWeight: 900, fontSize: 16, fontFamily: "Georgia,serif", letterSpacing: 1 }}>REBEL ODDS</div>
          <div style={{ color: "#9FA1A4", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginTop: 2 }}>Prediction Markets</div>
          <p style={{ color: "#9FA1A4", fontSize: 11, marginTop: 10, maxWidth: 220 }}>
            A paper-trading academic futures exchange. Virtual tokens only — no real money involved.
          </p>
        </div>
        {/* Nav links */}
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Platform</div>
            {["Dashboard", "Portfolio", "Leaderboard"].map(l => (
              <Link key={l} href={l === "Dashboard" ? "/" : `/${l.toLowerCase()}`}
                style={{ display: "block", color: "#9FA1A4", fontSize: 12, textDecoration: "none", marginBottom: 6 }}>
                {l}
              </Link>
            ))}
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Info</div>
            {["About", "FAQ"].map(l => (
              <Link key={l} href={`/${l.toLowerCase()}`}
                style={{ display: "block", color: "#9FA1A4", fontSize: 12, textDecoration: "none", marginBottom: 6 }}>
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "20px auto 0", paddingTop: 16, borderTop: "1px solid #333", textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "#9FA1A4", margin: 0 }}>
          ⚠️ <strong style={{ color: "#9FA1A4" }}>Paper Trading Only.</strong> Rebel Tokens have no monetary value. For demo purposes only.
        </p>
      </div>
    </footer>
  );
}