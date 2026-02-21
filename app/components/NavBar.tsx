"use client";

import { useState } from "react";
import Link from "next/link";

const mockUser = { username: "trader_hawk" };

export default function NavBar({ balance, rank }: { balance: number; rank: number }) {
  const [open, setOpen] = useState(false);
  const links = ["Dashboard", "Portfolio", "Leaderboard", "About", "FAQ"];
  const routes: Record<string, string> = {
    Dashboard: "/",
    Portfolio: "/portfolio",
    Leaderboard: "/leaderboard",
    About: "/about",
    FAQ: "/faq",
  };

  return (
    <nav style={{ background: "#1e1e1e", borderBottom: "4px solid #E31837", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E31837", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 18, fontFamily: "Georgia,serif", flexShrink: 0 }}>R</div>
          <div>
            <div style={{ color: "#E31837", fontWeight: 900, fontSize: 16, fontFamily: "Georgia,serif", letterSpacing: 1, lineHeight: 1 }}>REBEL ODDS</div>
            <div style={{ color: "#9FA1A4", fontSize: 9, letterSpacing: 3, textTransform: "uppercase" }}>Prediction Markets</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }} className="ro-desktop-nav">
          {links.map((l) => (
            <Link key={l} href={routes[l]}
              style={{ color: "#9FA1A4", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#9FA1A4"; }}>
              {l}
            </Link>
          ))}
          <div style={{ height: 32, width: 1, background: "#333" }} />
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#E31837", fontWeight: 700, fontSize: 13 }}>{balance.toLocaleString()} RT</div>
            <div style={{ color: "#9FA1A4", fontSize: 10 }}></div>
          </div>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a0000", border: "2px solid #E31837", display: "flex", alignItems: "center", justifyContent: "center", color: "#E31837", fontSize: 12, fontWeight: 700 }}>
            {mockUser.username[0].toUpperCase()}
          </div>
        </div>

        <button onClick={() => setOpen((o) => !o)} className="ro-hamburger"
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8, flexDirection: "column", gap: 5 }}>
          <span style={{ display: "block", width: 22, height: 2, background: open ? "#E31837" : "#fff", transition: "all .2s", transform: open ? "rotate(45deg) translate(5px,5px)" : "none" }} />
          <span style={{ display: "block", width: 22, height: 2, background: "#fff", opacity: open ? 0 : 1, transition: "opacity .2s" }} />
          <span style={{ display: "block", width: 22, height: 2, background: open ? "#E31837" : "#fff", transition: "all .2s", transform: open ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
        </button>
      </div>

      {open && (
        <div style={{ background: "#161616", borderTop: "1px solid #222", padding: "12px 20px 16px" }}>
          {links.map((l) => (
            <Link key={l} href={routes[l]} onClick={() => setOpen(false)}
              style={{ display: "block", padding: "10px 0", color: "#9FA1A4", textDecoration: "none", borderBottom: "1px solid #1a1a1a", fontSize: 14, fontWeight: 600 }}>
              {l}
            </Link>
          ))}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#E31837", fontWeight: 700, fontSize: 14 }}>{balance.toLocaleString()} RT</div>
              <div style={{ color: "#9FA1A4", fontSize: 11 }}>Rank #{rank}</div>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1a0000", border: "2px solid #E31837", display: "flex", alignItems: "center", justifyContent: "center", color: "#E31837", fontSize: 13, fontWeight: 700 }}>
              {mockUser.username[0].toUpperCase()}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) { .ro-desktop-nav { gap: 14px !important; } }
        @media (max-width: 720px) { .ro-desktop-nav { display: none !important; } .ro-hamburger { display: flex !important; } }
      `}</style>
    </nav>
  );
}