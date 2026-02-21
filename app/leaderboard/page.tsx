"use client";

import { useState, useEffect } from "react";

type PerformanceTier = "top" | "average" | "underdog";

interface StudentStreak {
  id: string;
  name: string;
  major: string;
  standing: string;
  performance_tier: PerformanceTier;
  streak: number;
  peakStreak: number;
  previous_gpa: number;
}

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

function gpaColor(gpa: number) {
  if (gpa >= 3.7) return "#2d8a4e";
  if (gpa >= 3.0) return "#c85a00";
  return "#E31837";
}

function standingColor(standing: string) {
  const s = standing.toLowerCase();
  if (s === "senior")    return "#A03123";
  if (s === "junior")    return "#c85a00";
  if (s === "sophomore") return "#2d8a4e";
  return "#6A737B";
}



function StudentRow({ student, rank }: { student: StudentStreak; rank: number }) {
  const [hov, setHov] = useState(false);
  const tier  = tierBadge(student.performance_tier);
  const color = streakColor(student.streak);
  const gpa   = student.previous_gpa ?? 0;

  return (
    <div
      className="lb-row"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: hov ? "#fafafa" : "#fff", transition: "background .15s" }}
    >
      {/* Rank */}
      <div style={{ fontFamily: "Georgia,serif", fontWeight: 900, textAlign: "center", color: rank <= 3 ? "#E31837" : "#9FA1A4" }}>
        <span className="lb-full" style={{ fontSize: 16 }}>
          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
        </span>
        <span className="lb-compact" style={{ fontSize: 13 }}>#{rank}</span>
      </div>

      {/* Name + major */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: tier.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 14, fontFamily: "Georgia,serif" }}>
          {student.name[0]}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: hov ? "#B10202" : "#000", transition: "color .2s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {student.name}
          </div>
          <div className="lb-full" style={{ fontSize: 11, color: "#9FA1A4" }}>{student.major}</div>
        </div>
      </div>

      {/* Standing */}
      <div className="lb-col-standing">
        <div className="lb-full">
          <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 99, background: standingColor(student.standing), color: "#fff", display: "inline-block" }}>
            {student.standing}
          </span>
        </div>
        <div className="lb-compact" style={{ fontSize: 11, fontWeight: 700, color: standingColor(student.standing) }}>
          {student.standing.slice(0, 2).toUpperCase()}
        </div>
      </div>

      {/* Streak */}
      <div style={{ textAlign: "center" }}>
        <div className="lb-full">
          <div style={{ fontFamily: "Georgia,serif", fontWeight: 900, fontSize: 18, color, lineHeight: 1, whiteSpace: "nowrap" }}>
            {student.streak >= 7 ? "🔥🔥🔥" : student.streak >= 4 ? "🔥🔥" : student.streak >= 1 ? "🔥" : "❄️"} {student.streak}
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 1, marginTop: 2 }}>{streakLabel(student.streak)}</div>
        </div>
        <div className="lb-compact" style={{ fontFamily: "Georgia,serif", fontWeight: 900, fontSize: 15, color, whiteSpace: "nowrap" }}>{student.streak}</div>
      </div>

      {/* Previous GPA */}
      <div className="lb-col-gpa">
        <div className="lb-full">
          <div style={{ fontFamily: "Georgia,serif", fontWeight: 900, fontSize: 20, color: gpaColor(gpa), lineHeight: 1 }}>
            {gpa > 0 ? gpa.toFixed(2) : "—"}
          </div>
          <div style={{ fontSize: 9, color: "#9FA1A4", marginTop: 2, textTransform: "uppercase", letterSpacing: 1 }}></div>
        </div>
        <div className="lb-compact" style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 13, color: gpaColor(gpa) }}>
          {gpa > 0 ? gpa.toFixed(1) : "—"}
        </div>
      </div>

      {/* Peak streak */}
      <div className="lb-col-peak" style={{ textAlign: "right" }}>
        <div className="lb-full">
          <div style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 14, color: "#000" }}>{student.peakStreak} 🔥</div>
        </div>
        <div className="lb-compact" style={{ fontFamily: "Georgia,serif", fontWeight: 700, fontSize: 13 }}>{student.peakStreak}</div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="lb-row" style={{ background: "#fff" }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ height: 16, borderRadius: 8, background: "#f0f0f0", animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const [students, setStudents] = useState<StudentStreak[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard/students")
      .then((r) => r.json())
      .then((json) => {
        if (!json.ok) throw new Error(json.error ?? "Failed to load leaderboard");
        setStudents(json.data);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const topStreak = students[0];
  const onFire    = students.filter((s) => s.streak >= 1).length;
  const avgGpa    = students.length
    ? (students.reduce((sum, s) => sum + (s.previous_gpa ?? 0), 0) / students.length).toFixed(2)
    : "—";

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>

      {/* Hero */}
      <div style={{ background: "#1e1e1e", borderBottom: "4px solid #E31837", padding: "28px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: "#E31837", fontSize: 11, textTransform: "uppercase", letterSpacing: 3, marginBottom: 6, fontWeight: 700 }}>Student Performance</p>
            <h1 style={{ color: "#fff", fontSize: "clamp(22px,5vw,32px)", fontWeight: 900, fontFamily: "Georgia,serif", margin: 0, lineHeight: 1.1 }}>Hot Streak Leaderboard</h1>
            <p style={{ color: "#9FA1A4", fontSize: 13, marginTop: 6, marginBottom: 0 }}>Top 10 students ranked by consecutive successful contract outcomes</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#E31837", fontSize: "clamp(20px,4vw,26px)", fontWeight: 900 }}>
                {loading ? "…" : `${topStreak?.streak ?? 0} 🔥`}
              </div>
              <div style={{ color: "#9FA1A4", fontSize: 11 }}>Longest Active Streak</div>
            </div>

          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 0" }}>
        <style>{`
          @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }

          .lb-stats { grid-template-columns: repeat(4,1fr); }
          @media (max-width:700px) { .lb-stats { grid-template-columns: repeat(2,1fr); } }
          @media (max-width:380px) { .lb-stats { grid-template-columns: 1fr; } }

          .lb-thead, .lb-row {
            display: grid;
            grid-template-columns: 48px 1fr 120px 140px 100px 80px;
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

          .lb-full    { display: block; }
          .lb-compact { display: none;  }

          @media (max-width: 700px) {
            .lb-thead, .lb-row {
              grid-template-columns: 36px 1fr 70px 60px 60px 52px;
              gap: 6px; padding: 10px 12px;
            }
            .lb-full    { display: none;  }
            .lb-compact { display: block; }
          }
          @media (max-width: 480px) {
            .lb-thead, .lb-row { grid-template-columns: 32px 1fr 60px 60px; }
            .lb-col-gpa, .lb-col-peak { display: none; }
          }
        `}</style>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.06)", marginBottom: 24 }}>
          <div className="lb-thead">
            <span>Rank</span>
            <span>Student</span>
            <span className="lb-col-standing">Standing</span>
            <span style={{ textAlign: "center" }}>Streak</span>
            <span className="lb-col-gpa">Prev GPA</span>
            <span className="lb-col-peak" style={{ textAlign: "right" }}>Peak</span>
          </div>

          {error ? (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "#E31837", fontSize: 13 }}>⚠️ {error}</div>
          ) : loading ? (
            [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
          ) : students.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "#9FA1A4", fontSize: 13 }}>No student data available yet.</div>
          ) : (
            students.map((s, i) => <StudentRow key={s.id} student={s} rank={i + 1} />)
          )}
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
            ⚠️ <strong>Paper Trading Only.</strong> Rebel Tokens are virtual currency with no monetary value. For educational and demonstration purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}