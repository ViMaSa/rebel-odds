"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────
type PerformanceTier = "top" | "average" | "underdog";

interface Position {
  id: string;
  yes_shares: number;
  no_shares: number;
  status: string;
  realized_pnl: number | null;
  contracts: {
    id: string;
    title: string;
    status: string;
    yes_token_pool: number;
    no_token_pool: number;
    seed_tokens: number;
    outcome: boolean | null;
    students: {
      name: string;
      major: string;
      standing: string;
      performance_tier: PerformanceTier;
    };
  };
}

interface Wallet {
  balance_tokens: number;
}

interface PortfolioData {
  wallet: Wallet;
  positions: Position[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
function yesPrice(yesPool: number, noPool: number, seed: number): number {
  return (yesPool + seed) / (yesPool + noPool + seed * 2);
}

function calcPosition(p: Position) {
  const yp       = yesPrice(p.contracts.yes_token_pool, p.contracts.no_token_pool, p.contracts.seed_tokens);
  const np       = 1 - yp;
  const estTotal = (p.yes_shares * yp) + (p.no_shares * np);
  return { yp, np, estTotal };
}

function tierBadge(tier: PerformanceTier) {
  if (tier === "top")      return { bg: "#A03123", label: "Top Scholar", short: "Top" };
  if (tier === "underdog") return { bg: "#6A737B", label: "Underdog",    short: "Und" };
  return                          { bg: "#666666", label: "Average",     short: "Avg" };
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
  const { yp, estTotal } = calcPosition(p);
  const tier      = tierBadge(p.contracts.students.performance_tier);
  const heldYes   = p.yes_shares > 0;
  const shares    = heldYes ? p.yes_shares : p.no_shares;
  const isResolved = p.contracts.status === "resolved";
  const outcome    = p.contracts.outcome; // true = YES won, false = NO won
  const isWon      = isResolved && outcome !== null
    ? (outcome === true ? heldYes : !heldYes)
    : false;

  return (
    <>
      <tr onClick={() => setExpanded(e => !e)} style={{ cursor: "pointer" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = muted ? "#f5f5f5" : "#fef8f8"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
        <td style={{ padding: "14px 12px", borderBottom: "1px solid #f0f0f0", minWidth: 180 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: muted ? "#ccc" : "#E31837", marginTop: 5, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: muted ? "#888" : "#111", fontFamily: "Georgia,serif", lineHeight: 1.3 }}>{p.contracts.title}</div>
              <div style={{ fontSize: 10, color: muted ? "#bbb" : "#9FA1A4", marginTop: 2 }}>{p.contracts.students.name} · {p.contracts.students.major}</div>
            </div>
          </div>
        </td>
        <td style={{ padding: "14px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "center" }}>
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: muted ? "#e8e8e8" : tier.bg, color: muted ? "#888" : "#fff", display: "inline-block" }}>
            <span className="ro-tier-full">{tier.label}</span>
            <span className="ro-tier-short" style={{ display: "none" }}>{tier.short}</span>
          </span>
        </td>
        <td className="ro-col-hide" style={{ padding: "14px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
          {p.yes_shares > 0
            ? <span style={{ fontSize: 13, fontWeight: 800, color: muted ? "#aaa" : "#2d8a4e" }}>{p.yes_shares}</span>
            : <span style={{ fontSize: 12, color: "#ddd" }}>—</span>}
        </td>
        <td className="ro-col-hide" style={{ padding: "14px 28px 14px 28px", borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
          {p.no_shares > 0
            ? <span style={{ fontSize: 13, fontWeight: 800, color: muted ? "#aaa" : "#E31837" }}>{p.no_shares}</span>
            : <span style={{ fontSize: 12, color: "#ddd" }}>—</span>}
        </td>
        <td className="ro-col-hide" style={{ padding: "14px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: muted ? "#888" : "#111" }}>{estTotal.toFixed(0)} RT</span>
        </td>
        <td className="ro-col-hide" style={{ padding: "14px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "right" }}>
          {isResolved ? (
            <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 99, background: isWon ? "#e6f4ec" : "#fdecea", color: isWon ? "#2d8a4e" : "#B10202" }}>
              {isWon ? "✓ WON" : "✗ LOST"}
            </span>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#f0f0f0", color: "#666" }}>Active</span>
          )}
        </td>
        <td style={{ padding: "14px 12px", borderBottom: "1px solid #f0f0f0", textAlign: "center", color: "#ccc", fontSize: 10 }}>
          {expanded ? "▲" : "▼"}
        </td>
      </tr>

      {expanded && (
        <tr style={{ background: muted ? "#f9f9f9" : "#fffafa" }}>
          <td colSpan={7} style={{ padding: "0 16px 16px 16px", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>

              {isResolved && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: isWon ? "#e6f4ec" : "#fdecea", border: `1px solid ${isWon ? "#b6dfca" : "#f5b8b2"}` }}>
                  <div style={{ fontSize: 18, width: 32, height: 32, borderRadius: "50%", background: isWon ? "#2d8a4e" : "#B10202", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
                    {isWon ? "✓" : "✗"}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: isWon ? "#2d8a4e" : "#B10202" }}>
                      {isWon ? "Position Won" : "Position Lost"}
                    </div>
                    <div style={{ fontSize: 10, color: "#666", marginTop: 1 }}>
                      Resolved <strong style={{ color: outcome ? "#2d8a4e" : "#B10202" }}>{outcome ? "YES" : "NO"}</strong>
                      {" · "}You bet <strong style={{ color: heldYes ? "#2d8a4e" : "#B10202" }}>{heldYes ? "YES" : "NO"}</strong>
                      {" · "}{isWon ? "Payout credited to wallet" : "Shares forfeited"}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
                <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 9, color: "#9FA1A4", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, fontWeight: 700 }}>Market Price</div>
                  <ProbBar yp={yp} muted={muted} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#9FA1A4", marginTop: 6 }}>
                    <span>YES pool: {p.contracts.yes_token_pool.toLocaleString()} RT</span>
                    <span>NO pool: {p.contracts.no_token_pool.toLocaleString()} RT</span>
                  </div>
                </div>

                <div style={{ background: heldYes ? "#f0faf4" : "#fff5f5", borderRadius: 10, padding: "12px 14px", border: `1px solid ${heldYes ? "#b6dfca" : "#f5b8b2"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 10px", borderRadius: 99, background: heldYes ? "#2d8a4e" : "#B10202", color: "#fff" }}>
                      BET {heldYes ? "YES" : "NO"}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <MiniStat label="Shares"    value={shares.toString()} />
                    <MiniStat label="Est. Value" value={`${estTotal.toFixed(0)} RT`} color={heldYes ? "#2d8a4e" : "#E31837"} />
                    {p.realized_pnl !== null && (
                      <MiniStat label="Realized PnL" value={`${p.realized_pnl >= 0 ? "+" : ""}${p.realized_pnl.toFixed(0)} RT`} color={p.realized_pnl >= 0 ? "#2d8a4e" : "#E31837"} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Portfolio Page ─────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const [data, setData]       = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<"current" | "previous">("current");

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const res  = await fetch("/api/portfolio");
        const json = await res.json();
        if (json.ok) setData(json.data);
      } catch (e) {
        console.error("Failed to load portfolio:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f4f4f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#9FA1A4" }}>Loading portfolio...</p>
    </div>
  );

  if (!data) return (
    <div style={{ minHeight: "100vh", background: "#f4f4f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#E31837" }}>Failed to load portfolio.</p>
    </div>
  );

  const { wallet, positions } = data;

  const openPositions     = positions.filter(p => p.contracts.status === "active");
  const resolvedPositions = positions.filter(p => p.contracts.status === "resolved");
  const displayPositions  = tab === "current" ? openPositions : resolvedPositions;

  const totalEstVal = openPositions.reduce((sum, p) => sum + calcPosition(p).estTotal, 0);
  const netWorth    = wallet.balance_tokens + totalEstVal;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f4", fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
      <style>{`
        .ro-layout { display: grid; grid-template-columns: 260px 1fr; gap: 20px; max-width: 1100px; margin: 24px auto; padding: 0 20px 48px; }
        @media (max-width: 860px) { .ro-layout { grid-template-columns: 1fr; } }
        .ro-table-wrap { overflow-x: auto; }
        .ro-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .ro-table th { font-size: 9px; font-weight: 700; color: #9FA1A4; text-transform: uppercase; letter-spacing: 2px; padding: 10px 12px; text-align: right; border-bottom: 2px solid #eee; white-space: nowrap; background: #fafafa; }
        .ro-table th:first-child { text-align: left; width: 30%; }
        .ro-table th:nth-child(2) { text-align: center; width: 11%; }
        .ro-table th:nth-child(3) { width: 9%; }
        .ro-table th:nth-child(4) { width: 12%; }
        .ro-table th:nth-child(5) { width: 13%; }
        .ro-table th:nth-child(6) { width: 14%; }
        .ro-table th:nth-child(7) { width: 5%; }
        @media (max-width: 600px) {
          .ro-col-hide { display: none; }
          .ro-tier-full { display: none; }
          .ro-tier-short { display: inline !important; }
        }
      `}</style>

      {/* Hero */}
      <div style={{ background: "#1e1e1e", borderBottom: "4px solid #E31837", padding: "24px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: "#E31837", fontSize: 10, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, margin: 0 }}>Rebel Odds</p>
            <h1 style={{ color: "#fff", fontSize: "clamp(20px,4vw,28px)", fontWeight: 900, fontFamily: "Georgia,serif", margin: "4px 0 0" }}>My Portfolio</h1>
          </div>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {[
              { label: "Net Worth",      value: `${netWorth.toFixed(0)} RT`,      color: "#E31837" },
              { label: "Position Value", value: `${totalEstVal.toFixed(0)} RT`,   color: "#4caf72" },
              { label: "Open Positions", value: openPositions.length.toString(),  color: "#fff" },
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
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e8e8", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
            <div style={{ background: "#1e1e1e", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E31837", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 16, fontFamily: "Georgia,serif" }}>T</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Trader</div>
                <div style={{ color: "#9FA1A4", fontSize: 10 }}>Active Account</div>
              </div>
            </div>
            <div style={{ padding: "4px 16px 12px" }}>
              {[
                { label: "Token Balance",  value: `${wallet.balance_tokens.toLocaleString()} RT`, bold: true,  color: "#000" },
                { label: "Position Value", value: `${totalEstVal.toFixed(0)} RT`,                  bold: false, color: "#2d8a4e" },
                { label: "Net Worth",      value: `${netWorth.toFixed(0)} RT`,                     bold: true,  color: "#E31837" },
              ].map(({ label, value, bold, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <span style={{ fontSize: 11, color: "#9FA1A4" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: bold ? 800 : 600, color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8e8e8", padding: 16, boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
            <div style={{ fontSize: 10, color: "#9FA1A4", textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>Quick Stats</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Open",     value: openPositions.length.toString(),     color: undefined },
                { label: "Resolved", value: resolvedPositions.length.toString(), color: undefined },
                { label: "Won",      value: resolvedPositions.filter(p => {
                  const outcome = p.contracts.outcome;
                  const heldYes = p.yes_shares > 0;
                  return outcome !== null && (outcome === true ? heldYes : !heldYes);
                }).length.toString(), color: "#2d8a4e" },
                { label: "Lost", value: resolvedPositions.filter(p => {
                  const outcome = p.contracts.outcome;
                  const heldYes = p.yes_shares > 0;
                  return outcome !== null && (outcome === true ? !heldYes : heldYes);
                }).length.toString(), color: "#E31837" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: "#f8f8f8", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 9, color: "#9FA1A4", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: color ?? "#111", fontFamily: "Georgia,serif", lineHeight: 1.2 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <Link href="/" style={{ display: "block", padding: "12px 16px", background: "#E31837", color: "#fff", borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
            ← Back to Markets
          </Link>
        </div>

        {/* Main panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ display: "flex", background: "#fff", borderRadius: "12px 12px 0 0", borderBottom: "2px solid #e0e0e0", overflow: "hidden" }}>
            {(["current", "previous"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex: 1, padding: "14px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", background: tab === t ? "#fff" : "#f8f8f8", border: "none", color: tab === t ? "#E31837" : "#9FA1A4", borderBottom: tab === t ? "2px solid #E31837" : "2px solid transparent", marginBottom: -2, transition: "all .2s" }}>
                {t === "current" ? `Open Positions (${openPositions.length})` : `Resolved (${resolvedPositions.length})`}
              </button>
            ))}
          </div>

          <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", border: "1px solid #e8e8e8", borderTop: "none", boxShadow: "0 1px 4px rgba(0,0,0,.05)", overflow: "hidden" }}>
            {displayPositions.length === 0 ? (
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
                      <th className="ro-col-hide">YES Shares</th>
                      <th className="ro-col-hide">NO Shares</th>
                      <th className="ro-col-hide">Est. Value</th>
                      <th className="ro-col-hide">Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayPositions.map((p) => <PositionRow key={p.id} p={p} muted={tab === "previous"} />)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}