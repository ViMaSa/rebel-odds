"use client";

import { getPortfolio } from "@/lib/market";

import { useState } from "react";
import Link from "next/link";


// ── Types ──────────────────────────────────────────────────────────────────
type PerformanceTier = "top" | "average" | "underdog";
type ContractType = "gpa" | "course" | "credits";

interface Position {
  id: string;
  title: string;
  student: { name: string; major: string; standing: string; performance_tier: PerformanceTier };
  type: ContractType;
  yes_shares: number;
  no_shares: number;
  yes_pool: number;
  no_pool: number;
  end_date: string;
  yes_entry_price: number;
  no_entry_price: number;
  status: "active" | "resolved";
  outcome?: "yes" | "no";
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const mockUser = { username: "trader_hawk", balance: 9250, rank: 4 };

const currentPositions: Position[] = [
  {
    id: "1",
    title: "Will Alex finish with GPA \u2265 3.5?",
    student: { name: "Alex Rivera", major: "Computer Science", standing: "Junior", performance_tier: "top" },
    type: "gpa", yes_shares: 120, no_shares: 0,
    yes_pool: 7200, no_pool: 2800, end_date: "2025-05-10",
    yes_entry_price: 0.58, no_entry_price: 0, status: "active",
  },
  {
    id: "2",
    title: "Will Jordan pass CS326?",
    student: { name: "Jordan Kim", major: "Software Engineering", standing: "Sophomore", performance_tier: "average" },
    type: "course", yes_shares: 0, no_shares: 80,
    yes_pool: 4100, no_pool: 5900, end_date: "2025-05-14",
    yes_entry_price: 0, no_entry_price: 0.52, status: "active",
  },
  {
    id: "3",
    title: "Will Sam complete 15 credits this semester?",
    student: { name: "Sam Okafor", major: "Business", standing: "Freshman", performance_tier: "underdog" },
    type: "credits", yes_shares: 50, no_shares: 200,
    yes_pool: 3300, no_pool: 6700, end_date: "2025-05-08",
    yes_entry_price: 0.35, no_entry_price: 0.60, status: "active",
  },
];

const previousPositions: Position[] = [
  {
    id: "4",
    title: "Will Maya maintain Dean\u2019s List status?",
    student: { name: "Maya Patel", major: "Biology", standing: "Senior", performance_tier: "top" },
    type: "gpa", yes_shares: 150, no_shares: 0,
    yes_pool: 9000, no_pool: 1000, end_date: "2025-04-20",
    yes_entry_price: 0.72, no_entry_price: 0, status: "resolved", outcome: "yes",
  },
  {
    id: "5",
    title: "Will Chris pass MATH201?",
    student: { name: "Chris Nguyen", major: "Physics", standing: "Junior", performance_tier: "underdog" },
    type: "course", yes_shares: 90, no_shares: 0,
    yes_pool: 2000, no_pool: 8000, end_date: "2025-04-15",
    yes_entry_price: 0.45, no_entry_price: 0, status: "resolved", outcome: "no",
  },
  {
    id: "6",
    title: "Will Priya earn honors in ECON301?",
    student: { name: "Priya Singh", major: "Economics", standing: "Senior", performance_tier: "top" },
    type: "course", yes_shares: 60, no_shares: 30,
    yes_pool: 8500, no_pool: 1500, end_date: "2025-04-10",
    yes_entry_price: 0.55, no_entry_price: 0.40, status: "resolved", outcome: "yes",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function yesPrice(yp: number, np: number) { return yp / (yp + np); }

function calcPosition(p: Position) {
  const yp        = yesPrice(p.yes_pool, p.no_pool);
  const np        = 1 - yp;
  const yesEstVal = p.yes_shares * yp;
  const noEstVal  = p.no_shares * np;
  const estTotal  = yesEstVal + noEstVal;
  const totalCost = p.yes_shares * p.yes_entry_price + p.no_shares * p.no_entry_price;
  const pnl       = estTotal - totalCost;
  const pnlPct    = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  return { yesEstVal, noEstVal, estTotal, pnl, pnlPct, yp, np };
}

function tierBadge(tier: PerformanceTier) {
  if (tier === "top")      return { bg: "#A03123", label: "Top Scholar" };
  if (tier === "underdog") return { bg: "#6A737B", label: "Underdog" };
  return                          { bg: "#666666", label: "Average" };
}

const totalEstVal = currentPositions.reduce((acc, p) => acc + calcPosition(p).estTotal, 0);
const totalPnL    = currentPositions.reduce((acc, p) => acc + calcPosition(p).pnl, 0);
const totalSpent  = currentPositions.reduce((acc, p) => acc + p.yes_shares * p.yes_entry_price + p.no_shares * p.no_entry_price, 0);
const netWorth    = mockUser.balance + totalEstVal;

// ── NavBar ─────────────────────────────────────────────────────────────────
function NavBar({ balance, rank }: { balance: number; rank: number }) {
  const [open, setOpen] = useState(false);
  const links = ["Dashboard", "Portfolio", "Leaderboard", "About", "FAQ"];
  const routes: Record<string, string> = {
    Dashboard: "/", Portfolio: "/portfolio",
    Leaderboard: "/leaderboard", About: "/about", FAQ: "/faq",
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
              style={{ color: l === "Portfolio" ? "#E31837" : "#9FA1A4", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
              onMouseEnter={(e) => { if (l !== "Portfolio") (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { if (l !== "Portfolio") (e.currentTarget as HTMLElement).style.color = "#9FA1A4"; }}>
              {l}
            </Link>
          ))}
          <div style={{ height: 32, width: 1, background: "#333" }} />
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#E31837", fontWeight: 700, fontSize: 13 }}>{balance.toLocaleString()} RT</div>
            <div style={{ color: "#9FA1A4", fontSize: 10 }}>Rank #{rank}</div>
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
              style={{ display: "block", padding: "10px 0", color: l === "Portfolio" ? "#E31837" : "#9FA1A4", textDecoration: "none", borderBottom: "1px solid #1a1a1a", fontSize: 14, fontWeight: 600 }}>
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

// ── ProbBar ────────────────────────────────────────────────────────────────
function ProbBar({ yp, muted }: { yp: number; muted?: boolean }) {
  const pct = (yp * 100).toFixed(1);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 700, marginBottom: 3 }}>
        <span style={{ color: muted ? "#aaa" : "#2d8a4e" }}>{pct}% YES</span>
        <span style={{ color: muted ? "#bbb" : "#E31837" }}>{(100 - parseFloat(pct)).toFixed(1)}% NO</span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: muted ? "#eee" : "#f0d0d0", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: muted ? "#ccc" : "linear-gradient(90deg,#2d8a4e,#4caf72)", borderRadius: 99 }} />
      </div>
    </div>
  );
}

// ── MiniStat ───────────────────────────────────────────────────────────────
function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 8, color: "#9FA1A4", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 800, color: color ?? "#111", marginTop: 1 }}>{value}</div>
    </div>
  );
}

// ── Position Row ───────────────────────────────────────────────────────────
function PositionRow({ p, muted }: { p: Position; muted?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const { yesEstVal, noEstVal, estTotal, pnl, pnlPct, yp, np } = calcPosition(p);
  const tier  = tierBadge(p.student.performance_tier);
  const isWon = p.outcome ? (p.outcome === "yes" ? p.yes_shares > 0 : p.no_shares > 0) : false;

  return (
    <>
      <tr onClick={() => setExpanded(e => !e)} style={{ cursor: "pointer", transition: "background .15s" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = muted ? "#f5f5f5" : "#fef8f8"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
        <td style={{ padding: "14px 12px", borderBottom: "1px solid #f0f0f0", minWidth: 180 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: muted ? "#ccc" : "#E31837", marginTop: 5, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: muted ? "#888" : "#111", fontFamily: "Georgia,serif", lineHeight: 1.3 }}>{p.title}</div>
              <div style={{ fontSize: 10, color: muted ? "#bbb" : "#9FA1A4", marginTop: 2 }}>{p.student.name} · {p.student.major}</div>
            </div>
          </div>
        </td>
        <td style={{ padding: "14px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "center" }}>
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: muted ? "#e8e8e8" : tier.bg, color: muted ? "#888" : "#fff", whiteSpace: "nowrap" }}>
            {tier.label}
          </span>
        </td>
        <td style={{ padding: "14px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
          {p.yes_shares > 0
            ? <span style={{ fontSize: 13, fontWeight: 800, color: muted ? "#aaa" : "#2d8a4e" }}>{p.yes_shares}</span>
            : <span style={{ fontSize: 12, color: "#ddd" }}>—</span>}
        </td>
        <td style={{ padding: "14px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
          {p.no_shares > 0
            ? <span style={{ fontSize: 13, fontWeight: 800, color: muted ? "#aaa" : "#E31837" }}>{p.no_shares}</span>
            : <span style={{ fontSize: 12, color: "#ddd" }}>—</span>}
        </td>
        <td style={{ padding: "14px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: muted ? "#888" : "#111" }}>{estTotal.toFixed(0)} RT</span>
        </td>
        <td style={{ padding: "14px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
          {muted && p.outcome ? (
            <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 99, background: isWon ? "#e6f4ec" : "#fdecea", color: isWon ? "#2d8a4e" : "#B10202" }}>
              {isWon ? "\u2713 WON" : "\u2717 LOST"}
            </span>
          ) : (
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: pnl >= 0 ? "#2d8a4e" : "#E31837" }}>
                {pnl >= 0 ? "+" : ""}{pnl.toFixed(0)} RT
              </div>
              <div style={{ fontSize: 9, color: "#9FA1A4" }}>{pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%</div>
            </div>
          )}
        </td>
        <td style={{ padding: "14px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "center", color: "#ccc", fontSize: 10 }}>
          {expanded ? "\u25b2" : "\u25bc"}
        </td>
      </tr>

      {expanded && (
        <tr style={{ background: muted ? "#f9f9f9" : "#fffafa" }}>
          <td colSpan={7} style={{ padding: "0 20px 16px 28px", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 12 }}>

              {/* Market Price card */}
              <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, color: "#9FA1A4", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>Market Price</div>
                <ProbBar yp={yp} muted={muted} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#9FA1A4", marginTop: 6 }}>
                  <span>YES: {p.yes_pool.toLocaleString()} RT</span>
                  <span>NO: {p.no_pool.toLocaleString()} RT</span>
                </div>
              </div>

              {/* YES Position card — Entry/Now removed, just Shares / Cost / Value / PnL */}
              {p.yes_shares > 0 && (
                <div style={{ background: "#f0faf4", border: "1px solid #b6dfca", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 9, color: "#2d8a4e", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>YES Position</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <MiniStat label="Shares" value={p.yes_shares.toString()} />
                    <MiniStat label="Cost" value={`${(p.yes_shares * p.yes_entry_price).toFixed(0)} RT`} />
                    <MiniStat label="Value" value={`${yesEstVal.toFixed(0)} RT`} color="#2d8a4e" />
                    <MiniStat
                      label="PnL"
                      value={`${(yesEstVal - p.yes_shares * p.yes_entry_price) >= 0 ? "+" : ""}${(yesEstVal - p.yes_shares * p.yes_entry_price).toFixed(0)} RT`}
                      color={(yesEstVal - p.yes_shares * p.yes_entry_price) >= 0 ? "#2d8a4e" : "#E31837"}
                    />
                  </div>
                </div>
              )}

              {/* NO Position card — Entry/Now removed, just Shares / Cost / Value / PnL */}
              {p.no_shares > 0 && (
                <div style={{ background: "#fff5f5", border: "1px solid #f5b8b2", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 9, color: "#B10202", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>NO Position</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <MiniStat label="Shares" value={p.no_shares.toString()} />
                    <MiniStat label="Cost" value={`${(p.no_shares * p.no_entry_price).toFixed(0)} RT`} />
                    <MiniStat label="Value" value={`${noEstVal.toFixed(0)} RT`} color="#E31837" />
                    <MiniStat
                      label="PnL"
                      value={`${(noEstVal - p.no_shares * p.no_entry_price) >= 0 ? "+" : ""}${(noEstVal - p.no_shares * p.no_entry_price).toFixed(0)} RT`}
                      color={(noEstVal - p.no_shares * p.no_entry_price) >= 0 ? "#2d8a4e" : "#E31837"}
                    />
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Portfolio Page ─────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const portfolio = getPortfolio("trader-1");
  const [tab, setTab] = useState<"current" | "previous">("current");
  const positions = tab === "current" ? currentPositions : previousPositions;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f4", fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
      <NavBar balance={mockUser.balance} rank={mockUser.rank} />

      <style>{`
        .ro-layout { display: grid; grid-template-columns: 260px 1fr; gap: 20px; max-width: 1100px; margin: 24px auto; padding: 0 20px 48px; }
        @media (max-width: 860px) { .ro-layout { grid-template-columns: 1fr; } }
        .ro-table-wrap { overflow-x: auto; }
        .ro-table { width: 100%; border-collapse: collapse; }
        .ro-table th { font-size: 9px; font-weight: 700; color: #9FA1A4; text-transform: uppercase; letter-spacing: 2px; padding: 10px 12px; text-align: right; border-bottom: 2px solid #eee; white-space: nowrap; background: #fafafa; }
        .ro-table th:first-child { text-align: left; }
        .ro-table th:nth-child(2) { text-align: center; }
      `}</style>

      {/* Hero */}
      <div style={{ background: "#1e1e1e", borderBottom: "4px solid #E31837", padding: "24px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: "#E31837", fontSize: 10, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, margin: 0 }}>{mockUser.username}</p>
            <h1 style={{ color: "#fff", fontSize: "clamp(20px,4vw,28px)", fontWeight: 900, fontFamily: "Georgia,serif", margin: "4px 0 0", lineHeight: 1.1 }}>My Portfolio</h1>
          </div>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {[
              { label: "Net Worth",  value: `${netWorth.toFixed(0)} RT`,                                            color: "#E31837" },
              { label: "Total PnL",  value: `${totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(0)} RT`,               color: totalPnL >= 0 ? "#4caf72" : "#ff6b6b" },
              { label: "Positions",  value: currentPositions.length.toString(),                                      color: "#fff" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: "#9FA1A4", textTransform: "uppercase", letterSpacing: 2 }}>{label}</div>
                <div style={{ fontSize: "clamp(18px,3vw,24px)", fontWeight: 900, color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ro-layout">

        {/* ── SIDEBAR ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Account card */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e8e8", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
            <div style={{ background: "#1e1e1e", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E31837", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 16, fontFamily: "Georgia,serif", flexShrink: 0 }}>
                {mockUser.username[0].toUpperCase()}
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{mockUser.username}</div>
                <div style={{ color: "#9FA1A4", fontSize: 10 }}>Rank #{mockUser.rank}</div>
              </div>
            </div>
            <div style={{ padding: "4px 16px 12px" }}>
              {[
                { label: "Token Balance",   value: `${mockUser.balance.toLocaleString()} RT`, bold: true,  color: "#000" },
                { label: "Position Value",  value: `${totalEstVal.toFixed(0)} RT`,             bold: false, color: "#2d8a4e" },
                { label: "Total Invested",  value: `${totalSpent.toFixed(0)} RT`,              bold: false, color: "#666" },
                { label: "Unrealized PnL",  value: `${totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(0)} RT`, bold: true, color: totalPnL >= 0 ? "#2d8a4e" : "#E31837" },
                { label: "Net Worth",       value: `${netWorth.toFixed(0)} RT`,               bold: true,  color: "#E31837" },
              ].map(({ label, value, bold, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <span style={{ fontSize: 11, color: "#9FA1A4" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: bold ? 800 : 600, color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance bars */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e8e8", padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
            <div style={{ fontSize: 10, color: "#9FA1A4", textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>Performance</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {currentPositions.map(p => {
                const { pnl, estTotal } = calcPosition(p);
                const pct = totalEstVal > 0 ? Math.min(100, (estTotal / totalEstVal) * 100) : 0;
                return (
                  <div key={p.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 10, color: "#555", fontWeight: 600, maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.student.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: pnl >= 0 ? "#2d8a4e" : "#E31837" }}>{pnl >= 0 ? "+" : ""}{pnl.toFixed(0)} RT</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 99, background: "#f0f0f0", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pnl >= 0 ? "#2d8a4e" : "#E31837", borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e8e8", padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
            <div style={{ fontSize: 10, color: "#9FA1A4", textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>Quick Stats</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Open",     value: currentPositions.length.toString(),  color: undefined },
                { label: "Resolved", value: previousPositions.length.toString(), color: undefined },
                { label: "Won",      value: previousPositions.filter(p => p.outcome ? (p.outcome === "yes" ? p.yes_shares > 0 : p.no_shares > 0) : false).length.toString(), color: "#2d8a4e" },
                { label: "Lost",     value: previousPositions.filter(p => p.outcome ? (p.outcome === "yes" ? p.no_shares > p.yes_shares : p.yes_shares > p.no_shares) : false).length.toString(), color: "#E31837" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: "#f8f8f8", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 9, color: "#9FA1A4", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: color ?? "#111", fontFamily: "Georgia,serif", lineHeight: 1.2 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN PANEL ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: "#fff", borderRadius: "12px 12px 0 0", borderBottom: "2px solid #e0e0e0", overflow: "hidden" }}>
            {(["current", "previous"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex: 1, padding: "14px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", background: tab === t ? "#fff" : "#f8f8f8", border: "none", color: tab === t ? "#E31837" : "#9FA1A4", borderBottom: tab === t ? "2px solid #E31837" : "2px solid transparent", marginBottom: -2, transition: "all .2s" }}>
                {t === "current" ? `Open Positions (${currentPositions.length})` : `Resolved (${previousPositions.length})`}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", border: "1px solid #e8e8e8", borderTop: "none", boxShadow: "0 1px 4px rgba(0,0,0,.05)", overflow: "hidden" }}>
            {positions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#9FA1A4" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
                <p style={{ fontSize: 13 }}>No positions yet.</p>
                <Link href="/" style={{ display: "inline-block", marginTop: 8, padding: "9px 20px", background: "#E31837", color: "#fff", borderRadius: 9, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>Browse Markets</Link>
              </div>
            ) : (
              <div className="ro-table-wrap">
                <table className="ro-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left" }}>Contract</th>
                      <th style={{ textAlign: "center" }}>Tier</th>
                      <th>YES Shares</th>
                      <th>NO Shares</th>
                      <th>Est. Value</th>
                      <th>{tab === "current" ? "PnL" : "Outcome"}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((p) => <PositionRow key={p.id} p={p} muted={tab === "previous"} />)}
                  </tbody>
                </table>

                {tab === "current" && (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 32, padding: "12px 16px", background: "#fafafa", borderTop: "2px solid #eee", flexWrap: "wrap" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 9, color: "#9FA1A4", textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>Total Est. Value</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: "#111" }}>{totalEstVal.toFixed(0)} RT</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 9, color: "#9FA1A4", textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>Total PnL</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: totalPnL >= 0 ? "#2d8a4e" : "#E31837" }}>
                        {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(0)} RT
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <p style={{ textAlign: "center", fontSize: 10, color: "#9FA1A4", marginTop: 16 }}>
            ⚠️ <strong>Paper Trading Only.</strong> Rebel Tokens have no monetary value.
          </p>
        </div>
      </div>
    </div>
  );
}