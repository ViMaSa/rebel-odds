"use client";

import { useState, useEffect, useRef } from "react";

// ── Animated Counter ────────────────────────────────────────────────────────
function Counter({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const steps = 60;
        const increment = end / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, duration / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ value, suffix, prefix, label, sub, accent }: {
  value: number; suffix?: string; prefix?: string;
  label: string; sub: string; accent: string;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", border: "1px solid #e8e8e8", boxShadow: "0 2px 12px rgba(0,0,0,.06)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: accent }} />
      <div style={{ fontSize: 36, fontWeight: 900, fontFamily: "Georgia,serif", color: accent, lineHeight: 1, marginBottom: 6 }}>
        <Counter end={value} suffix={suffix} prefix={prefix} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 11, color: "#9FA1A4", lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}

// ── Timeline Item ────────────────────────────────────────────────────────────
function TimelineItem({ year, title, body, last }: { year: string; title: string; body: string; last?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#E31837", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 10, fontFamily: "Georgia,serif", letterSpacing: 0.5, textAlign: "center", lineHeight: 1.2 }}>{year}</div>
        {!last && <div style={{ width: 2, flex: 1, background: "#f0f0f0", marginTop: 8 }} />}
      </div>
      <div style={{ paddingBottom: last ? 0 : 32 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#111", marginBottom: 6, fontFamily: "Georgia,serif" }}>{title}</div>
        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.7 }}>{body}</div>
      </div>
    </div>
  );
}

// ── Team Card ────────────────────────────────────────────────────────────────
function TeamCard({ name, role, color }: { name: string; role: string; color: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "24px 20px", textAlign: "center", border: "1px solid #e8e8e8", boxShadow: "0 2px 8px rgba(0,0,0,.05)" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 22, fontFamily: "Georgia,serif", margin: "0 auto 14px" }}>
        {name[0]}
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#111", marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 11, color: "#9FA1A4", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5 }}>{role}</div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: "85vh", minHeight: 520, overflow: "hidden" }}>
        {/* Las Vegas image via Unsplash */}
        <img
          src="https://images.unsplash.com/photo-1605833556294-ea5c2a74369a?w=1600&q=80"
          alt="Las Vegas skyline at night"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        {/* Gradient overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.3) 0%, rgba(0,0,0,.7) 60%, rgba(0,0,0,.92) 100%)" }} />

        {/* Hero text */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", padding: "0 20px 64px", textAlign: "center", maxWidth: 860, margin: "0 auto", left: 0, right: 0 }}>
          <div style={{ fontSize: 11, color: "#E31837", textTransform: "uppercase", letterSpacing: 4, fontWeight: 700, marginBottom: 16 }}>Las Vegas, Nevada</div>
          <h1 style={{ color: "#fff", fontSize: "clamp(32px,6vw,58px)", fontWeight: 900, fontFamily: "Georgia,serif", lineHeight: 1.1, margin: "0 0 20px" }}>
            Built in the City of Second Chances
          </h1>
          <p style={{ color: "rgba(255,255,255,.75)", fontSize: "clamp(14px,2vw,18px)", lineHeight: 1.7, maxWidth: 640, margin: 0 }}>
            Rebel Odds was born from a simple belief: if students had real skin in the game, they&apos;d take their academic futures more seriously — and so would the people betting on them.
          </p>
        </div>

        {/* Red bottom accent */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "#E31837" }} />
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{ background: "#1e1e1e", padding: "48px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 10, color: "#E31837", textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, marginBottom: 8 }}>The Problem We&apos;re Solving</div>
            <h2 style={{ color: "#fff", fontSize: "clamp(20px,3vw,28px)", fontWeight: 900, fontFamily: "Georgia,serif", margin: 0 }}>Las Vegas Education by the Numbers</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <StatCard value={81} suffix="%" label="CCSD Graduation Rate" sub="Class of 2024 — nearly 1 in 5 students doesn't graduate on time" accent="#E31837" />
            <StatCard value={30} suffix="%" label="Math Proficiency" sub="Less than 1 in 3 CCSD students are proficient in math (grades 3–8)" accent="#c85a00" />
            <StatCard value={39} suffix="%" label="ELA Proficiency" sub="Only 39% of Clark County students are proficient in English Language Arts" accent="#9FA1A4" />
            <StatCard value={479578} label="Students Statewide" sub="CCSD alone serves 63.5% of all Nevada students — the 5th largest district in the US" accent="#2d8a4e" />
            <StatCard value={33} suffix="%" label="Chronic Absenteeism" sub="Nearly 1 in 3 CCSD students miss 10% or more of school days each year" accent="#E31837" />
            <StatCard value={97} suffix="%" label="CTE Graduation Rate" sub="Career & Technical Education students graduate at dramatically higher rates" accent="#2d8a4e" />
          </div>
        </div>
      </div>

      {/* ── ORIGIN STORY ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
          <div>
            <div style={{ fontSize: 10, color: "#E31837", textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, marginBottom: 16 }}>Our Origin</div>
            <h2 style={{ fontSize: "clamp(24px,4vw,36px)", fontWeight: 900, fontFamily: "Georgia,serif", color: "#111", lineHeight: 1.2, margin: "0 0 24px" }}>
              What if the market could motivate students?
            </h2>
            <p style={{ fontSize: 14, color: "#444", lineHeight: 1.8, marginBottom: 16 }}>
              It started with a conversation in a UNLV dorm room. Four students — all from Las Vegas, all products of Clark County schools — were talking about why their friends back home had dropped out. The answer kept coming back to the same thing: <strong>nobody was paying attention.</strong>
            </p>
            <p style={{ fontSize: 14, color: "#444", lineHeight: 1.8, marginBottom: 16 }}>
              Las Vegas is a city built on odds. Everyone here understands a bet. So the question became: what if we gamified academic accountability? What if traders could buy contracts on whether a student would pass their classes, maintain their GPA, or complete their semester credits — and students knew people were watching, rooting, and investing?
            </p>
            <p style={{ fontSize: 14, color: "#444", lineHeight: 1.8, marginBottom: 16 }}>
              Prediction markets have a remarkable track record of aggregating information and forecasting outcomes more accurately than individual experts. We wanted to bring that same mechanism to education — creating a social contract between students and their community that goes beyond grades on a report card.
            </p>
            <p style={{ fontSize: 14, color: "#444", lineHeight: 1.8 }}>
              Rebel Odds is named after the UNLV Runnin&apos; Rebels — a team that represents the scrappy, underdog spirit of a city that built itself out of desert sand. That&apos;s the same spirit we see in Las Vegas students every day. We&apos;re just building the market to prove it.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Pull quote */}
            <div style={{ background: "#1e1e1e", borderRadius: 16, padding: "32px 28px", position: "relative" }}>
              <div style={{ position: "absolute", top: 20, left: 28, fontSize: 48, color: "#E31837", fontFamily: "Georgia,serif", lineHeight: 1, opacity: 0.6 }}>&ldquo;</div>
              <p style={{ fontSize: 16, color: "#fff", lineHeight: 1.7, fontFamily: "Georgia,serif", fontStyle: "italic", margin: "24px 0 16px" }}>
                Less than one-third of Clark County students in grades three through eight are proficient in math. Fewer than 1 in 5 eleventh graders demonstrated college readiness on the ACT.
              </p>
              <div style={{ fontSize: 10, color: "#9FA1A4", textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>Las Vegas Review-Journal, 2024</div>
            </div>
            {/* Secondary stat box */}
            <div style={{ background: "#E31837", borderRadius: 16, padding: "28px", color: "#fff" }}>
              <div style={{ fontSize: 42, fontWeight: 900, fontFamily: "Georgia,serif", lineHeight: 1, marginBottom: 8 }}>5th</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Largest School District in the US</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.75)", lineHeight: 1.6 }}>
                CCSD serves over 300,000 students across Clark County. The scale of the challenge — and the opportunity — is enormous.
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #e8e8e8" }}>
              <div style={{ fontSize: 11, color: "#9FA1A4", textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>Why It Matters</div>
              {[
                "29% of CCSD students are transient — not enrolled for the full year",
                "7,000+ incidents of violence recorded in 2023–24",
                "English language learners have only 11% math proficiency",
                "CTE students graduate at 97.5% — proof engagement works",
              ].map((item) => (
                <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#E31837", marginTop: 5, flexShrink: 0 }} />
                  <div style={{ fontSize: 12, color: "#444", lineHeight: 1.5 }}>{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS MISSION ── */}
      <div style={{ background: "#1e1e1e", padding: "72px 20px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#E31837", textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, marginBottom: 16 }}>Our Mission</div>
          <h2 style={{ color: "#fff", fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, fontFamily: "Georgia,serif", lineHeight: 1.2, margin: "0 0 24px" }}>
            Transparency creates accountability. Accountability creates outcomes.
          </h2>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: 15, lineHeight: 1.8, marginBottom: 48 }}>
            When a trader buys a YES contract on a student passing their class, something shifts. The student knows someone believes in them. The community has a stake in the outcome. The market price becomes a real-time signal of confidence — more honest than a teacher&apos;s note, more immediate than a report card.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, textAlign: "left" }}>
            {[
              { icon: "📊", title: "Price Discovery", body: "Market prices aggregate the collective wisdom of everyone watching a student — peers, mentors, family — into a single, honest probability." },
              { icon: "🎓", title: "Student Agency", body: "When students see traders betting on them, they internalize accountability in a way that grades alone never achieve." },
              { icon: "🔁", title: "Feedback Loops", body: "Real-time odds give students and advisors early warning signals — a falling YES price is a call to action, not a post-mortem." },
              { icon: "🏙️", title: "Community Stakes", body: "Las Vegas is a city of bettors. We&apos;re channeling that culture toward the thing that matters most: the next generation." },
            ].map(({ icon, title, body }) => (
              <div key={title} style={{ background: "rgba(255,255,255,.05)", borderRadius: 14, padding: "24px 20px", border: "1px solid rgba(255,255,255,.08)" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", lineHeight: 1.7 }}>{body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TIMELINE ── */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "72px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 10, color: "#E31837", textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, marginBottom: 16 }}>How We Got Here</div>
          <h2 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 900, fontFamily: "Georgia,serif", color: "#111", margin: 0 }}>The Rebel Odds Story</h2>
        </div>
        <TimelineItem year="2022" title="The Idea" body="Four UNLV students, frustrated by Las Vegas's education statistics, ask a simple question: could prediction markets change how students relate to their own academic futures? A napkin sketch becomes a thesis." />
        <TimelineItem year="2023" title="Research & Validation" body="The team dives into CCSD data. They find staggering gaps: 30% math proficiency, 33% chronic absenteeism, an 18.5% dropout rate. They also discover that CTE students — who have tangible, career-linked goals — graduate at 97.5%. The insight: engagement + stakes = outcomes." />
        <TimelineItem year="2024" title="Building the MVP" body="Armed with a Supabase backend, a Next.js frontend, and an AMM-based pricing engine, the team builds the first version of Rebel Odds. Mock contracts, paper tokens, real market mechanics. The hackathon clock starts ticking." />
        <TimelineItem year="2025" title="Launch" body="Rebel Odds goes live as a paper-trading platform. No real money. Real accountability. The first markets open on six students — Top Scholars, Averages, and Underdogs alike. Vegas is watching." last />
      </div>

      {/* ── TEAM ── */}
      <div style={{ background: "#fff", borderTop: "1px solid #e8e8e8", padding: "72px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 10, color: "#E31837", textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, marginBottom: 16 }}>The Builders</div>
            <h2 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 900, fontFamily: "Georgia,serif", color: "#111", margin: 0 }}>Team Rebel Odds</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
            <TeamCard name="Alex Chen" role="Frontend / UI" color="#E31837" />
            <TeamCard name="Jordan Rivera" role="Backend / API" color="#1e1e1e" />
            <TeamCard name="Sam Okafor" role="Trading Engine / AMM" color="#2d8a4e" />
            <TeamCard name="Maya Torres" role="Auth / Database" color="#A03123" />
          </div>
          <p style={{ textAlign: "center", fontSize: 12, color: "#9FA1A4", marginTop: 32, maxWidth: 500, margin: "32px auto 0" }}>
            All four are UNLV students — products of the Las Vegas community — building the tool they wish existed when they were in high school.
          </p>
        </div>
      </div>

      {/* ── DISCLAIMER ── */}
      <div style={{ background: "#f5f5f5", borderTop: "1px solid #e8e8e8", padding: "32px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "#9FA1A4", maxWidth: 500, margin: "0 auto" }}>
          ⚠️ <strong>Paper Trading Only.</strong> Rebel Tokens are virtual currency with no monetary value. Rebel Odds is an educational demonstration platform. No real money is involved.
        </p>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .ro-about-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </div>
  );
}