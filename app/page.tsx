"use client";

import { useState } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────
type PerformanceTier = "top" | "average" | "underdog";
type ContractType = "gpa" | "course" | "credits";

interface Student {
  name: string;
  major: string;
  standing: string;
  performance_tier: PerformanceTier;
}

interface Contract {
  id: string;
  title: string;
  student: Student;
  yes_pool: number;
  no_pool: number;
  type: ContractType;
  status: string;
  end_date: string;
  volume: number;
}

interface TierBadge {
  bg: string;
  label: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const mockContracts: Contract[] = [
  {
    id: "1",
    title: "Will Alex finish with GPA ≥ 3.5?",
    student: { name: "Alex Rivera", major: "Computer Science", standing: "Junior", performance_tier: "top" },
    yes_pool: 7200, no_pool: 2800, type: "gpa", status: "active", end_date: "2025-05-10", volume: 10000,
  },
  {
    id: "2",
    title: "Will Jordan pass CS326?",
    student: { name: "Jordan Kim", major: "Software Engineering", standing: "Sophomore", performance_tier: "average" },
    yes_pool: 4100, no_pool: 5900, type: "course", status: "active", end_date: "2025-05-14", volume: 10000,
  },
  {
    id: "3",
    title: "Will Sam complete 15 credits this semester?",
    student: { name: "Sam Okafor", major: "Business", standing: "Freshman", performance_tier: "underdog" },
    yes_pool: 3300, no_pool: 6700, type: "credits", status: "active", end_date: "2025-05-08", volume: 10000,
  },
  {
    id: "4",
    title: "Will Maya maintain Dean's List status?",
    student: { name: "Maya Patel", major: "Biology", standing: "Senior", performance_tier: "top" },
    yes_pool: 8500, no_pool: 1500, type: "gpa", status: "active", end_date: "2025-05-12", volume: 10000,
  },
  {
    id: "5",
    title: "Will Chris pass MATH201?",
    student: { name: "Chris Nguyen", major: "Physics", standing: "Junior", performance_tier: "underdog" },
    yes_pool: 2900, no_pool: 7100, type: "course", status: "active", end_date: "2025-05-15", volume: 10000,
  },
  {
    id: "6",
    title: "Will Priya earn honors in ECON301?",
    student: { name: "Priya Singh", major: "Economics", standing: "Senior", performance_tier: "top" },
    yes_pool: 6600, no_pool: 3400, type: "course", status: "active", end_date: "2025-05-11", volume: 10000,
  },
];

const mockUser = { username: "trader_hawk", balance: 9250, rank: 4 };

// ── Helpers ────────────────────────────────────────────────────────────────
function yesPrice(yesPool: number, noPool: number): number {
  return yesPool / (yesPool + noPool);
}

function daysLeft(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function tierBadge(tier: PerformanceTier): TierBadge {
  if (tier === "top")      return { bg: "#A03123", label: "Top Scholar" };
  if (tier === "underdog") return { bg: "#6A737B", label: "Underdog" };
  return                          { bg: "#666666", label: "Average" };
}

function typeIcon(contractType: ContractType): string {
  if (contractType === "gpa")    return "📊";
  if (contractType === "course") return "📚";
  return "🎓";
}

// ── NavBar ─────────────────────────────────────────────────────────────────
// function NavBar({ balance, rank }: { balance: number; rank: number }) {
//   const [open, setOpen] = useState(false);
//   const links = ["Dashboard", "Portfolio", "Leaderboard", "About", "FAQ"];

//   const routes: Record<string, string> = {
//     Dashboard:   "/",
//     Portfolio:   "/portfolio",
//     Leaderboard: "/leaderboard",
//     About:       "/about",
//     FAQ:         "/faq",
//   };

//   return (
//     <nav style={{ background: "#1e1e1e", borderBottom: "4px solid #E31837", position: "sticky", top: 0, zIndex: 50 }}>
//       <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
//         {/* Logo */}
//         <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
//           <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E31837", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 18, fontFamily: "Georgia,serif", flexShrink: 0 }}>R</div>
//           <div>
//             <div style={{ color: "#E31837", fontWeight: 900, fontSize: 16, fontFamily: "Georgia,serif", letterSpacing: 1, lineHeight: 1 }}>REBEL ODDS</div>
//             <div style={{ color: "#9FA1A4", fontSize: 9, letterSpacing: 3, textTransform: "uppercase" }}>Prediction Markets</div>
//           </div>
//         </div>

//         {/* Desktop links */}
//         <div style={{ display: "flex", alignItems: "center", gap: 24 }} className="ro-desktop-nav">
//           {links.map((l) => (
//             <Link key={l} href={routes[l]}
//               style={{ color: l === "Dashboard" ? "#E31837" : "#9FA1A4", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
//               onMouseEnter={(e) => { if (l !== "Dashboard") (e.currentTarget as HTMLElement).style.color = "#fff"; }}
//               onMouseLeave={(e) => { if (l !== "Dashboard") (e.currentTarget as HTMLElement).style.color = "#9FA1A4"; }}>
//               {l}
//             </Link>
//           ))}
//           <div style={{ height: 32, width: 1, background: "#333" }} />
//           <div style={{ textAlign: "right" }}>
//             <div style={{ color: "#E31837", fontWeight: 700, fontSize: 13 }}>{balance.toLocaleString()} RT</div>
//             <div style={{ color: "#9FA1A4", fontSize: 10 }}>Rank #{rank}</div>
//           </div>
//           <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a0000", border: "2px solid #E31837", display: "flex", alignItems: "center", justifyContent: "center", color: "#E31837", fontSize: 12, fontWeight: 700 }}>
//             {mockUser.username[0].toUpperCase()}
//           </div>
//         </div>

//         {/* Hamburger */}
//         <button onClick={() => setOpen((o) => !o)} className="ro-hamburger"
//           style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8, flexDirection: "column", gap: 5 }}>
//           <span style={{ display: "block", width: 22, height: 2, background: open ? "#E31837" : "#fff", transition: "all .2s", transform: open ? "rotate(45deg) translate(5px,5px)" : "none" }} />
//           <span style={{ display: "block", width: 22, height: 2, background: "#fff", opacity: open ? 0 : 1, transition: "opacity .2s" }} />
//           <span style={{ display: "block", width: 22, height: 2, background: open ? "#E31837" : "#fff", transition: "all .2s", transform: open ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
//         </button>
//       </div>

//       {/* Mobile dropdown */}
//       {open && (
//         <div style={{ background: "#161616", borderTop: "1px solid #222", padding: "12px 20px 16px" }}>
//           {links.map((l) => (
//             <Link key={l} href={routes[l]} onClick={() => setOpen(false)}
//               style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 0", color: l === "Dashboard" ? "#E31837" : "#9FA1A4", textDecoration: "none", borderBottom: "1px solid #1a1a1a", fontSize: 14, fontWeight: 600 }}>
//               {l}
//             </Link>
//           ))}
//           <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//             <div>
//               <div style={{ color: "#E31837", fontWeight: 700, fontSize: 14 }}>{balance.toLocaleString()} RT</div>
//               <div style={{ color: "#9FA1A4", fontSize: 11 }}>Rank #{rank}</div>
//             </div>
//             <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1a0000", border: "2px solid #E31837", display: "flex", alignItems: "center", justifyContent: "center", color: "#E31837", fontSize: 13, fontWeight: 700 }}>
//               {mockUser.username[0].toUpperCase()}
//             </div>
//           </div>
//         </div>
//       )}

//       <style>{`
//         @media (max-width: 860px) { .ro-desktop-nav { gap: 14px !important; } }
//         @media (max-width: 720px) {
//           .ro-desktop-nav { display: none !important; }
//           .ro-hamburger   { display: flex !important; }
//         }
//       `}</style>
//     </nav>
//   );
// }

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

// ── ProbBar ────────────────────────────────────────────────────────────────
function ProbBar({ yesPool, noPool }: { yesPool: number; noPool: number }) {
  const pct = (yesPrice(yesPool, noPool) * 100).toFixed(1);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
        <span style={{ color: "#2d8a4e" }}>{pct}% YES</span>
        <span style={{ color: "#E31837" }}>{(100 - parseFloat(pct)).toFixed(1)}% NO</span>
      </div>
      <div style={{ height: 7, borderRadius: 99, background: "#f0d0d0", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#2d8a4e,#4caf72)", borderRadius: 99, transition: "width .7s ease" }} />
      </div>
    </div>
  );
}

// ── ContractCard ───────────────────────────────────────────────────────────
function ContractCard({ contract, onClick }: { contract: Contract; onClick: (c: Contract) => void }) {
  const tier = tierBadge(contract.student.performance_tier);
  const days = daysLeft(contract.end_date);
  const [hov, setHov] = useState(false);

  return (
    <button onClick={() => onClick(contract)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff", border: `1.5px solid ${hov ? "#E31837" : "#e0e0e0"}`, borderRadius: 14,
        padding: 18, textAlign: "left", cursor: "pointer", width: "100%",
        display: "flex", flexDirection: "column", gap: 10,
        boxShadow: hov ? "0 6px 20px rgba(227,24,55,.12)" : "0 1px 4px rgba(0,0,0,.05)",
        transform: hov ? "translateY(-2px)" : "none", transition: "all .2s",
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>{typeIcon(contract.type)}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: tier.bg, color: "#fff" }}>{tier.label}</span>
        </div>
        {days > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: days <= 3 ? "#E31837" : "#f0f0f0", color: days <= 3 ? "#fff" : "#666666", whiteSpace: "nowrap" }}>
            {days}d left
          </span>
        )}
      </div>

      <div>
        <div style={{ fontWeight: 800, fontSize: 13, color: hov ? "#B10202" : "#000", lineHeight: 1.35, fontFamily: "Georgia,serif", transition: "color .2s" }}>{contract.title}</div>
        <div style={{ fontSize: 11, color: "#9FA1A4", marginTop: 2 }}>{contract.student.major} · {contract.student.standing}</div>
      </div>

      <ProbBar yesPool={contract.yes_pool} noPool={contract.no_pool} />

      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #f0f0f0" }}>
        <span style={{ fontSize: 10, color: "#9FA1A4" }}>Vol: {(contract.volume / 1000).toFixed(1)}K RT</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#E31837", opacity: hov ? 1 : 0, transition: "opacity .2s" }}>Trade →</span>
      </div>
    </button>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
function Modal({ contract, onClose }: { contract: Contract; onClose: () => void }) {
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  const tier     = tierBadge(contract.student.performance_tier);
  const price    = yesPrice(contract.yes_pool, contract.no_pool);
  const curPrice = side === "yes" ? price : 1 - price;
  const estShares = amount ? (parseFloat(amount) / curPrice).toFixed(2) : "—";
  const fee       = amount ? (parseFloat(amount) * 0.005).toFixed(2) : "—";
  const canTrade  = amount !== "" && parseFloat(amount) > 0;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,.75)", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,.3)", maxWidth: 440, width: "100%", border: "2px solid #E31837", overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ background: "#1e1e1e", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: "#E31837", fontSize: 10, textTransform: "uppercase", letterSpacing: 3, marginBottom: 6, fontWeight: 700 }}>Contract Detail</div>
            <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 15, lineHeight: 1.3, fontFamily: "Georgia,serif", margin: 0 }}>{contract.title}</h2>
          </div>
          <button onClick={onClose} style={{ color: "#666", background: "none", border: "none", fontSize: 24, cursor: "pointer", lineHeight: 1, marginLeft: 12, flexShrink: 0 }}>×</button>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Student */}
          <div style={{ background: tier.bg, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 15, flexShrink: 0 }}>
              {contract.student.name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{contract.student.name}</div>
              <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11 }}>{contract.student.major} · {contract.student.standing}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(255,255,255,.2)", color: "#fff", whiteSpace: "nowrap" }}>{tier.label}</span>
          </div>

          {/* Pools */}
          <div>
            <ProbBar yesPool={contract.yes_pool} noPool={contract.no_pool} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9FA1A4", marginTop: 6 }}>
              <span>YES Pool: {contract.yes_pool.toLocaleString()} RT</span>
              <span>NO Pool: {contract.no_pool.toLocaleString()} RT</span>
            </div>
          </div>

          {/* Trade */}
          <div>
            <div style={{ display: "flex", borderRadius: 12, overflow: "hidden", border: "1.5px solid #e0e0e0", marginBottom: 12 }}>
              <button onClick={() => setSide("yes")} style={{ flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", background: side === "yes" ? "#2d8a4e" : "#fff", color: side === "yes" ? "#fff" : "#666", transition: "all .2s" }}>Buy YES</button>
              <button onClick={() => setSide("no")}  style={{ flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", background: side === "no"  ? "#E31837" : "#fff", color: side === "no"  ? "#fff" : "#666", transition: "all .2s" }}>Buy NO</button>
            </div>
            <div style={{ position: "relative", marginBottom: 10 }}>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Token amount..."
                style={{ width: "100%", border: "1.5px solid #e0e0e0", borderRadius: 12, padding: "12px 48px 12px 16px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#222" }}
                onFocus={(e) => (e.target.style.borderColor = "#E31837")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")} />
              <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#9FA1A4", fontWeight: 700 }}>RT</span>
            </div>
            <style>{`.ro-token-input::placeholder { color: #666; }`}</style>
            <div style={{ background: "#f8f8f8", borderRadius: 12, padding: "12px 14px", fontSize: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {([["Price per share", `${(curPrice * 100).toFixed(1)}%`], ["Est. shares", estShares], ["Fee (0.5%)", `${fee} RT`]] as [string, string][]).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9FA1A4" }}>{k}</span>
                  <span style={{ fontWeight: 700, color: "#000" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <button disabled={!canTrade}
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, fontWeight: 900, fontSize: 14, border: "none", cursor: canTrade ? "pointer" : "not-allowed", opacity: canTrade ? 1 : 0.4, background: side === "yes" ? "#2d8a4e" : "#E31837", color: "#fff", fontFamily: "Georgia,serif", transition: "opacity .2s" }}>
            {side === "yes" ? "Buy YES Shares" : "Buy NO Shares"}
          </button>

          <p style={{ textAlign: "center", fontSize: 10, color: "#9FA1A4", margin: 0 }}>⚠️ Paper trading only · Rebel Tokens have no cash value</p>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [sort, setSort] = useState("trending");
  const [selected, setSelected] = useState<Contract | null>(null);
  const [search, setSearch] = useState("");

  const sorted = [...mockContracts]
    .filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.student.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "trending") return (b.yes_pool + b.no_pool) - (a.yes_pool + a.no_pool);
      if (sort === "newest")   return a.id.localeCompare(b.id);
      return 0;
    });

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
      {/* <NavBar balance={mockUser.balance} rank={mockUser.rank} /> */}

      {/* Hero */}
      <div style={{ background: "#1e1e1e", borderBottom: "4px solid #E31837", padding: "28px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: "#E31837", fontSize: 11, textTransform: "uppercase", letterSpacing: 3, marginBottom: 6, fontWeight: 700 }}>Welcome back, {mockUser.username}</p>
            <h1 style={{ color: "#fff", fontSize: "clamp(22px,5vw,32px)", fontWeight: 900, fontFamily: "Georgia,serif", margin: 0, lineHeight: 1.1 }}>Today&apos;s Markets</h1>
            <p style={{ color: "#9FA1A4", fontSize: 13, marginTop: 6, marginBottom: 0 }}>Trade YES/NO contracts on student academic outcomes</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#E31837", fontSize: "clamp(20px,4vw,26px)", fontWeight: 900 }}>{mockUser.balance.toLocaleString()}</div>
              <div style={{ color: "#9FA1A4", fontSize: 11 }}>Rebel Tokens</div>
            </div>
            <div style={{ height: 40, width: 1, background: "#333" }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#fff", fontSize: "clamp(20px,4vw,26px)", fontWeight: 900 }}>#{mockUser.rank}</div>
              <div style={{ color: "#9FA1A4", fontSize: 11 }}>Leaderboard</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        <style>{`
          .ro-stats-grid { grid-template-columns: repeat(4, 1fr); }
          @media (max-width: 700px) { .ro-stats-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 380px) { .ro-stats-grid { grid-template-columns: 1fr; } }
          .ro-filters { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 20px; }
          .ro-sort-btns { display: flex; gap: 8px; }
          .ro-search { border: 1.5px solid #ddd; background: #fff; border-radius: 9px; padding: 9px 16px; font-size: 13px; outline: none; width: 200px; box-sizing: border-box; font-family: inherit; color: #222; }
          .ro-search::placeholder { color: #666; }
          .ro-search:focus { border-color: #E31837; }
          @media (max-width: 480px) {
            .ro-filters { flex-direction: column; align-items: stretch; }
            .ro-sort-btns { flex-direction: column; width: 100%; }
            .ro-sort-btns button { width: 100%; text-align: center; }
            .ro-search { width: 100%; text-align: center; }
          }
        `}</style>

        {/* Stats */}
        <div className="ro-stats-grid" style={{ display: "grid", gap: 12, marginTop: -20, marginBottom: 24 }}>
          <StatCard label="Active Markets" value="6" sub="Open for trading" />
          <StatCard label="Your Balance" value="9,250 RT" sub="Available tokens" accent="#2d8a4e" />
          <StatCard label="Positions" value="3" sub="Open contracts" />
          <StatCard label="Your Rank" value="#4" sub="Global leaderboard" accent="#B10202" />
        </div>

        {/* Filters */}
        <div className="ro-filters">
          <div className="ro-sort-btns">
            {(["trending", "newest"] as const).map((key) => {
              const labels: Record<string, string> = { trending: "🔥 Trending", newest: "🆕 Newest" };
              return (
                <button key={key} onClick={() => setSort(key)}
                  style={{ padding: "9px 18px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .2s", background: sort === key ? "#E31837" : "#fff", color: sort === key ? "#fff" : "#666666", border: `1.5px solid ${sort === key ? "#E31837" : "#ddd"}` }}>
                  {labels[key]}
                </button>
              );
            })}
          </div>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contracts or students..." className="ro-search" />
        </div>

        {/* Grid */}
        {sorted.length === 0
          ? <div style={{ textAlign: "center", padding: "60px 0", color: "#9FA1A4" }}>No contracts match your search.</div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16, paddingBottom: 48 }}>
              {sorted.map((c) => <ContractCard key={c.id} contract={c} onClick={setSelected} />)}
            </div>
        }

        <div style={{ textAlign: "center", paddingBottom: 32 }}>
          <p style={{ fontSize: 10, color: "#9FA1A4", maxWidth: 400, margin: "0 auto" }}>
            ⚠️ <strong>Paper Trading Only.</strong> Rebel Tokens are virtual currency with no monetary value. No real money is involved. For educational and demonstration purposes only.
          </p>
        </div>
      </div>

      {selected && <Modal contract={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}