"use client";

import { useState } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────
type PerformanceTier = "top" | "average" | "underdog";

interface StudentStreak {
  id: string;
  name: string;
  major: string;
  standing: string;
  performance_tier: PerformanceTier;
  streak: number;
  recentResults: boolean[];
  totalResolved: number;
  winRate: number;
  peakStreak: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const mockStudents: StudentStreak[] = [
  { id:"1", name:"Maya Patel",   major:"Biology",              standing:"Senior",    performance_tier:"top",      streak:8, recentResults:[true,true,true,true,true],   totalResolved:12, winRate:0.92, peakStreak:8 },
  { id:"2", name:"Alex Rivera",  major:"Computer Science",     standing:"Junior",    performance_tier:"top",      streak:5, recentResults:[true,true,true,true,true],   totalResolved:9,  winRate:0.78, peakStreak:6 },
  { id:"3", name:"Priya Singh",  major:"Economics",            standing:"Senior",    performance_tier:"top",      streak:4, recentResults:[true,true,true,true,false],  totalResolved:11, winRate:0.82, peakStreak:5 },
  { id:"4", name:"Jordan Kim",   major:"Software Engineering", standing:"Sophomore", performance_tier:"average",  streak:3, recentResults:[true,true,true,false,false], totalResolved:8,  winRate:0.63, peakStreak:3 },
  { id:"5", name:"Sam Okafor",   major:"Business",             standing:"Freshman",  performance_tier:"underdog", streak:2, recentResults:[true,true,false,true,false],  totalResolved:6,  winRate:0.50, peakStreak:2 },
  { id:"6", name:"Chris Nguyen", major:"Physics",              standing:"Junior",    performance_tier:"underdog", streak:0, recentResults:[false,false,true,false,true], totalResolved:7,  winRate:0.43, peakStreak:2 },
];

const mockUser = { username: "trader_hawk", balance: 9250, rank: 4 };

// ── Helpers ────────────────────────────────────────────────────────────────
function tierBadge(tier: PerformanceTier) {
  if (tier === "top")      return { bg: "#A03123" };
  if (tier === "underdog") return { bg: "#6A737B" };
  return                          { bg: "#666666" };
}

function streakColor(streak: number) {
  if (streak >= 7) return "#E31837";
  if (streak >= 4) return "#c85a00";
  if (streak >= 1) return "#2d8a4e";
  return "#9FA1A4";
}

function streakLabel(streak: number) {
  if (streak >= 7) return "LEGENDARY";
  if (streak >= 4) return "ON FIRE";
  if (streak >= 1) return "HOT STREAK";
  return "COLD";
}

// ── NavBar ─────────────────────────────────────────────────────────────────
function NavBar({ balance, rank }: { balance: number; rank: number }) {
  const [open, setOpen] = useState(false);
  const links = ["Dashboard", "Portfolio", "Leaderboard", "About", "FAQ"];
  const routes: Record<string, string> = {
    Dashboard: "/", Portfolio: "/portfolio", Leaderboard: "/leaderboard", About: "/about", FAQ: "/faq",
  };
  return (
    <nav style={{ background: "#1e1e1e", borderBottom: "4px solid #E31837", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E31837", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 18, fontFamily: "Georgia,serif" }}>R</div>
          <div>
            <div style={{ color: "#E31837", fontWeight: 900, fontSize: 16, fontFamily: "Georgia,serif", letterSpacing: 1, lineHeight: 1 }}>REBEL ODDS</div>
            <div style={{ color: "#9FA1A4", fontSize: 9, letterSpacing: 3, textTransform: "uppercase" }}>Prediction Markets</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }} className="ro-desktop-nav">
          {links.map((l) => (
            <Link key={l} href={routes[l]}
              style={{ color: l === "Leaderboard" ? "#E31837" : "#9FA1A4", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
              onMouseEnter={(e) => { if (l !== "Leaderboard") (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={(e) => { if (l !== "Leaderboard") (e.currentTarget as HTMLElement).style.color = "#9FA1A4"; }}>
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
              style={{ display: "block", padding: "10px 0", color: l === "Leaderboard" ? "#E31837" : "#9FA1A4", textDecoration: "none", borderBottom: "1px solid #1a1a1a", fontSize: 14, fontWeight: 600 }}>
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

// ── StatCard ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", minWidth: 0 }}>
      <div style={{ fontSize: 10, color: "#9FA1A4", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: accent ?? "#000", fontFamily: "Georgia,serif", lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#9FA1A4", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

// ── Result Dots ────────────────────────────────────────────────────────────
function ResultDots({ results }: { results: boolean[] }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {results.map((r, i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: r ? "#2d8a4e" : "#E31837", opacity: 0.3 + (i / results.length) * 0.7 }} />
      ))}
    </div>
  );
}

// ── Student Row ────────────────────────────────────────────────────────────
function StudentRow({ student, rank }: { student: StudentStreak; rank: number }) {
  const [hov, setHov] = useState(false);
  const tier = tierBadge(student.performance_tier);
  const color = streakColor(student.streak);
  const winPct = (student.winRate * 100).toFixed(0) + "%";
  const winColor = student.winRate >= 0.7 ? "#2d8a4e" : student.winRate >= 0.5 ? "#c85a00" : "#E31837";

  return (
    <div className="lb-row"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: hov ? "#fafafa" : "#fff", transition: "background .15s" }}
    >
      {/* Rank */}
      <div style={{ fontFamily: "Georgia,serif", fontWeight: 900, textAlign: "center", color: rank <= 3 ? "#E31837" : "#9FA1A4" }}>
        {/* Full: medal emoji for top 3 */}
        <span className="lb-full" style={{ fontSize: 16 }}>
          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
        </span>
        {/* Compact: always just the number */}
        <span className="lb-compact" style={{ fontSize: 13 }}>#{rank}</span>
      </div>

      {/* Student name + meta */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: tier.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 14, fontFamily: "Georgia,serif" }}>
          {student.name[0]}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: hov ? "#B10202" : "#000", transition: "color .2s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {student.name}
          </div>
          {/* Full: show major + standing */}
          <div className="lb-full" style={{ fontSize: 11, color: "#9FA1A4" }}>{student.major} · {student.standing}</div>
          {/* Compact: just standing */}
          <div className="lb-compact" style={{ fontSize: 10, color: "#9FA1A4" }}>{student.standing}</div>
        </div>
      </div>

      {/* Win rate */}
      <div className="lb-col-winrate">
        <div className="lb-full">
          <div style={{ fontWeight: 700, fontSize: 13, color: winColor }}>{winPct}</div>
          <div style={{ height: 4, borderRadius: 99, background: "#f0f0f0", marginTop: 4 }}>
            <div style={{ height: "100%", width: `${student.winRate * 100}%`, borderRadius: 99, background: winColor }} />
          </div>
          <div style={{ fontSize: 9, color: "#9FA1A4", marginTop: 2 }}>{student.totalResolved} resolved</div>
        </div>
        <div className="lb-compact" style={{ fontWeight: 700, fontSize: 13, color: winColor }}>{winPct}</div>
      </div>

      {/* Streak */}
      <div style={{ textAlign: "center" }}>
        <div className="lb-full">
          {/* whiteSpace nowrap keeps 🔥🔥🔥 8 on one line */}
          <div style={{ fontFamily: "Georgia,serif", fontWeight: 900, fontSize: 18, color, lineHeight: 1, whiteSpace: "nowrap" }}>
            {student.streak >= 7 ? "🔥🔥🔥" : student.streak >= 4 ? "🔥🔥" : student.streak >= 1 ? "🔥" : "❄️"} {student.streak}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 1, marginTop: 2 }}>{streakLabel(student.streak)}</div>
        </div>
        <div className="lb-compact" style={{ fontFamily: "Georgia,serif", fontWeight: 900, fontSize: 15, color, whiteSpace: "nowrap" }}>{student.streak}</div>
      </div>

      {/* Last 5 */}
      <div className="lb-col-last5">
        <div className="lb-full">
          <div style={{ fontSize: 9, color: "#9FA1A4", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Last 5</div>
          <ResultDots results={student.recentResults} />
        </div>
        <div className="lb-compact"><ResultDots results={student.recentResults} /></div>
      </div>

      {/* Peak */}
      <div className="lb-col-peak" style={{ textAlign: "right" }}>
        <div className="lb-full">
          <div style={{ fontSize: 10, color: "#9FA1A4" }}>Peak</div>
          <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 14, color: "#000" }}>{student.peakStreak} 🔥</div>
        </div>
        <div className="lb-compact" style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 13, color: "#000" }}>{student.peakStreak}</div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const ranked = [...mockStudents].sort((a, b) =>
    b.streak !== a.streak ? b.streak - a.streak : b.winRate - a.winRate
  );
  const topStreak = ranked[0];
  const onFire = ranked.filter((s) => s.streak >= 1).length;
  const avgWinRate = mockStudents.reduce((s, r) => s + r.winRate, 0) / mockStudents.length;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
      <NavBar balance={mockUser.balance} rank={mockUser.rank} />

      {/* Hero */}
      <div style={{ background: "#1e1e1e", borderBottom: "4px solid #E31837", padding: "28px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: "#E31837", fontSize: 11, textTransform: "uppercase", letterSpacing: 3, marginBottom: 6, fontWeight: 700 }}>Student Performance</p>
            <h1 style={{ color: "#fff", fontSize: "clamp(22px,5vw,32px)", fontWeight: 900, fontFamily: "Georgia,serif", margin: 0, lineHeight: 1.1 }}>Hot Streak Leaderboard</h1>
            <p style={{ color: "#9FA1A4", fontSize: 13, marginTop: 6, marginBottom: 0 }}>Students ranked by consecutive successful contract outcomes</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#E31837", fontSize: "clamp(20px,4vw,26px)", fontWeight: 900 }}>{topStreak?.streak ?? 0} 🔥</div>
              <div style={{ color: "#9FA1A4", fontSize: 11 }}>Longest Active Streak</div>
            </div>
            <div style={{ height: 40, width: 1, background: "#333" }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#fff", fontSize: "clamp(20px,4vw,26px)", fontWeight: 900 }}>{onFire}</div>
              <div style={{ color: "#9FA1A4", fontSize: 11 }}>Students On Fire</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        <style>{`
          /* Stat grid */
          .lb-stats { grid-template-columns: repeat(4,1fr); }
          @media (max-width:700px) { .lb-stats { grid-template-columns: repeat(2,1fr); } }
          @media (max-width:380px) { .lb-stats { grid-template-columns: 1fr; } }

          /* Table — 6 cols */
          .lb-thead, .lb-row {
            display: grid;
            grid-template-columns: 48px 1fr 120px 140px 120px 80px;
            gap: 8px;
            padding: 12px 20px;
          }
          .lb-thead {
            font-size: 10px; font-weight: 700; letter-spacing: 2px;
            text-transform: uppercase; color: #9FA1A4;
            border-bottom: 1px solid #e0e0e0; background: #fafafa;
          }
          .lb-row { border-bottom: 1px solid #f0f0f0; align-items: center; }
          .lb-row:last-child { border-bottom: none; }

          /* Full vs compact content visibility */
          .lb-full    { display: block; }
          .lb-compact { display: none;  }

          /* ≤ 700px: switch to compact content — numbers only, no bar, no sub-labels */
          @media (max-width: 700px) {
            .lb-thead, .lb-row {
              grid-template-columns: 36px 1fr 70px 60px 60px 52px;
              gap: 6px;
              padding: 10px 12px;
            }
            .lb-full    { display: none;  }
            .lb-compact { display: block; }
          }

          /* ≤ 480px: drop last5 + peak, keep winrate + streak → 4-col */
          @media (max-width: 480px) {
            .lb-thead, .lb-row { grid-template-columns: 32px 1fr 56px 60px; }
            .lb-col-last5, .lb-col-peak { display: none; }
          }
        `}</style>

        {/* Stat cards */}
        <div className="lb-stats" style={{ display: "grid", gap: 12, marginTop: -20, marginBottom: 24 }}>
          <StatCard label="Top Streak"     value={`${topStreak?.streak ?? 0} 🔥`}        sub={topStreak?.name ?? "—"}  accent="#E31837" />
          <StatCard label="On Hot Streak"  value={`${onFire}`}                             sub="Currently active"        accent="#c85a00" />
          <StatCard label="Avg Win Rate"   value={`${(avgWinRate * 100).toFixed(0)}%`}     sub="Across all students" />
          <StatCard label="Total Students" value={`${mockStudents.length}`}                sub="Tracked this semester" />
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.06)", marginBottom: 24 }}>
          <div className="lb-thead">
            <span>Rank</span>
            <span>Student</span>
            <span className="lb-col-winrate">Win Rate</span>
            <span style={{ textAlign: "center" }}>Streak</span>
            <span className="lb-col-last5">Last 5</span>
            <span className="lb-col-peak" style={{ textAlign: "right" }}>Peak</span>
          </div>
          {ranked.map((s, i) => <StudentRow key={s.id} student={s} rank={i + 1} />)}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20, justifyContent: "center" }}>
          {[
            { color: "#E31837", label: "🔥🔥🔥 Legendary (7+)" },
            { color: "#c85a00", label: "🔥🔥 On Fire (4–6)" },
            { color: "#2d8a4e", label: "🔥 Hot Streak (1–3)" },
            { color: "#9FA1A4", label: "❄️ Cold (0)" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
              {label}
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", paddingBottom: 32 }}>
          <p style={{ fontSize: 10, color: "#9FA1A4", maxWidth: 400, margin: "0 auto" }}>
            ⚠️ <strong>Paper Trading Only.</strong> Rebel Tokens are virtual currency with no monetary value. No real money is involved. For educational and demonstration purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}