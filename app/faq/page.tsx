"use client";

import { useState } from "react";

// ── FAQ Item ────────────────────────────────────────────────────────────────
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        background: "#fff",
        borderRadius: 12,
        border: `1.5px solid ${open ? "#E31837" : "#e8e8e8"}`,
        overflow: "hidden",
        cursor: "pointer",
        transition: "border-color .2s, box-shadow .2s",
        boxShadow: open ? "0 4px 20px rgba(227,24,55,.08)" : "0 1px 4px rgba(0,0,0,.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px" }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
          background: open ? "#E31837" : "#f0f0f0",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 900, color: open ? "#fff" : "#9FA1A4",
          transition: "all .2s", fontFamily: "Georgia,serif",
        }}>
          {index + 1}
        </div>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: open ? "#E31837" : "#111", transition: "color .2s", lineHeight: 1.4 }}>
          {q}
        </div>
        <div style={{
          fontSize: 18, color: open ? "#E31837" : "#ccc", transition: "all .3s",
          transform: open ? "rotate(45deg)" : "none", flexShrink: 0,
        }}>
          +
        </div>
      </div>
      {open && (
        <div style={{ padding: "0 24px 20px 68px", borderTop: "1px solid #f5f5f5" }}>
          <p style={{ fontSize: 13, color: "#555", lineHeight: 1.8, margin: "16px 0 0" }}>{a}</p>
        </div>
      )}
    </div>
  );
}

// ── Category ────────────────────────────────────────────────────────────────
function FAQCategory({ title, icon, faqs }: { title: string; icon: string; faqs: { q: string; a: string }[] }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <h2 style={{ fontSize: 18, fontWeight: 900, fontFamily: "Georgia,serif", color: "#111", margin: 0 }}>{title}</h2>
        <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {faqs.map((faq, i) => (
          <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
        ))}
      </div>
    </div>
  );
}

// ── FAQ Data ────────────────────────────────────────────────────────────────
const categories = [
  {
    title: "Getting Started",
    icon: "🚀",
    faqs: [
      {
        q: "What is Rebel Odds?",
        a: "Rebel Odds is a paper-trading prediction market platform built at UNLV, focused on academic outcomes. Traders use virtual Rebel Tokens (RT) to buy YES or NO contracts on whether specific students will meet academic milestones — like maintaining a GPA, passing a course, or completing their semester credits. Everything is simulated; no real money is involved.",
      },
      {
        q: "How do I create an account?",
        a: "Click 'Sign Up' on any page and enter your UNLV email and a password. Once verified, you'll receive a starting balance of 10,000 Rebel Tokens — no purchase necessary. Your account is immediately ready to trade.",
      },
      {
        q: "What are Rebel Tokens (RT)?",
        a: "Rebel Tokens are Rebel Odds' virtual currency. They have absolutely no monetary value and cannot be exchanged for real money. Think of them as chips in a simulation — they let you participate in markets, track performance, and climb the leaderboard, but they exist solely within the platform.",
      },
      {
        q: "Do I need any trading experience to use Rebel Odds?",
        a: "Not at all. Rebel Odds is designed to be intuitive for anyone who understands a basic YES/NO question. Each contract page shows the current probability, pool sizes, and estimated share price. You pick a side, enter how many tokens you want to spend, and confirm. The platform handles all the math.",
      },
    ],
  },
  {
    title: "Trading & Markets",
    icon: "📈",
    faqs: [
      {
        q: "How are contract prices determined?",
        a: "Rebel Odds uses an Automated Market Maker (AMM) with a constant-product formula. The price of a YES share is calculated as: p_yes = yes_pool / (yes_pool + no_pool). When more traders buy YES, the YES price rises and the NO price falls accordingly. This mirrors how real prediction markets work — prices reflect collective belief about an outcome.",
      },
      {
        q: "What types of contracts are available?",
        a: "Currently, Rebel Odds supports three contract types: GPA contracts (will a student maintain a specific GPA threshold?), Course contracts (will a student pass a specific course?), and Credit contracts (will a student complete a target number of credits in the semester?). More contract types are planned for future semesters.",
      },
      {
        q: "What is the trading fee?",
        a: "Rebel Odds charges a 0.5% fee on every trade. This fee is deducted from your token amount before shares are calculated. So if you trade 100 RT, 0.5 RT goes to the fee and 99.5 RT determines your shares. This is displayed in the trade summary before you confirm.",
      },
      {
        q: "When do contracts resolve?",
        a: "Contracts resolve at the end of the relevant academic period — typically at semester's end, after final grades are posted. The resolution date is listed on each contract card. Once resolved, winning shares are paid out to your wallet and losing shares are forfeited.",
      },
      {
        q: "Can I sell my shares before a contract resolves?",
        a: "Selling is on the roadmap but not yet available in the current MVP. Right now, once you buy shares you hold them until the contract resolves. This is intentional for the first version — it keeps traders invested in the outcome rather than trading momentum.",
      },
    ],
  },
  {
    title: "Students & Contracts",
    icon: "🎓",
    faqs: [
      {
        q: "How are students added to the platform?",
        a: "Students must opt in to be listed on Rebel Odds. They create a student profile, agree to the platform's terms, and select which academic milestones they want to make public. Only opted-in students appear as tradeable contracts. No student's academic data is published without their explicit consent.",
      },
      {
        q: "What do the performance tiers mean?",
        a: "Each student is assigned a performance tier based on their historical academic record: Top Scholar (strong track record, high expectations), Average (typical academic performance), or Underdog (facing more challenges, but with higher potential upside for traders who believe in them). Tiers affect the starting market odds and how the community perceives risk.",
      },
      {
        q: "How is student data verified?",
        a: "In the current MVP, student data and contract outcomes are manually verified by platform administrators working with the academic records office. In future versions, we plan to integrate directly with the university's grade reporting system to automate resolution — faster, tamper-proof, and real-time.",
      },
      {
        q: "Can students see who is trading their contracts?",
        a: "No. Trader identities are anonymous to students. Students can see the aggregate market data — current YES/NO probabilities, pool sizes, and volume — but not which specific users have taken positions on their contracts. This protects trader privacy while still giving students the motivational signal that people are engaged.",
      },
    ],
  },
  {
    title: "Leaderboard & Rankings",
    icon: "🏆",
    faqs: [
      {
        q: "How is the trader leaderboard calculated?",
        a: "Trader rank is based on overall portfolio net worth — your token balance plus the current estimated value of all open positions. This updates in real time as market prices move. Traders who pick outcomes well (and early) rise fastest, while those who take the field against strong consensus take higher risk for higher reward.",
      },
      {
        q: "What is the student streak leaderboard?",
        a: "The student streak leaderboard tracks consecutive successful academic outcomes for each student — how many contracts in a row resolved in their favor. A student who passes five straight courses has a 5-streak. Streaks reset to zero on any failed outcome. This gives traders a momentum signal: a student on a 7-streak is worth watching.",
      },
      {
        q: "Are there rewards for topping the leaderboard?",
        a: "In the current paper-trading version, the leaderboard is purely for bragging rights and community recognition. Future versions may introduce recognition badges, priority access to new markets, or other non-monetary perks. Rebel Tokens themselves will never be redeemable for cash or prizes.",
      },
    ],
  },
  {
    title: "Privacy & Safety",
    icon: "🔒",
    faqs: [
      {
        q: "Is my personal data safe?",
        a: "Rebel Odds stores user data securely using Supabase with row-level security policies. Passwords are hashed and never stored in plain text. We do not sell or share personal information with third parties. For the hackathon MVP, all data is contained within our development environment.",
      },
      {
        q: "Is this gambling?",
        a: "No. Rebel Odds is a paper-trading platform with zero monetary value. Rebel Tokens cannot be purchased, withdrawn, or exchanged for real currency. There is no entry fee, no prize pool, and no financial gain or loss possible. The platform is purely educational — designed to teach market mechanics, accountability, and academic engagement.",
      },
      {
        q: "What happens if a contract outcome is disputed?",
        a: "Disputes are handled by the Rebel Odds admin team. If a student or trader believes a contract was resolved incorrectly, they can submit a dispute within 72 hours of resolution. Admins review the official academic records and issue a corrected resolution if warranted. All traders receive notification of any resolution change.",
      },
    ],
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function FAQPage() {
  const [search, setSearch] = useState("");

  const filtered = search.trim() === "" ? categories : categories.map(cat => ({
    ...cat,
    faqs: cat.faqs.filter(f =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.faqs.length > 0);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>

      {/* Hero */}
      <div style={{ background: "#1e1e1e", borderBottom: "4px solid #E31837", padding: "48px 20px 56px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#E31837", textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, marginBottom: 12 }}>Help Center</div>
          <h1 style={{ color: "#fff", fontSize: "clamp(28px,5vw,44px)", fontWeight: 900, fontFamily: "Georgia,serif", margin: "0 0 16px", lineHeight: 1.1 }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: "#9FA1A4", fontSize: 15, margin: "0 0 32px", lineHeight: 1.6 }}>
            Everything you need to know about Rebel Odds, prediction markets, and paper trading.
          </p>
          {/* Search */}
          <div style={{ position: "relative", maxWidth: 480, margin: "0 auto" }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#9FA1A4" }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search questions..."
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "14px 20px 14px 44px",
                background: "#fff", border: "2px solid transparent",
                borderRadius: 12, fontSize: 14, outline: "none",
                fontFamily: "inherit", color: "#222", transition: "border .2s",
              }}
              onFocus={e => (e.target.style.borderColor = "#E31837")}
              onBlur={e => (e.target.style.borderColor = "transparent")}
            />
            {search && (
              <button onClick={() => setSearch("")}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9FA1A4", fontSize: 18, lineHeight: 1 }}>
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "16px 20px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {categories.map(cat => (
            <a key={cat.title} href={`#${cat.title}`}
              style={{ fontSize: 11, fontWeight: 700, padding: "6px 14px", borderRadius: 99, background: "#f5f5f5", color: "#555", textDecoration: "none", transition: "all .15s", border: "1px solid #e8e8e8" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#E31837"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f5f5f5"; (e.currentTarget as HTMLElement).style.color = "#555"; }}>
              {cat.icon} {cat.title}
            </a>
          ))}
        </div>
      </div>

      {/* FAQ content */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 20px 64px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9FA1A4" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 14 }}>No questions match &ldquo;{search}&rdquo;</p>
            <button onClick={() => setSearch("")}
              style={{ marginTop: 12, padding: "9px 20px", background: "#E31837", color: "#fff", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Clear search
            </button>
          </div>
        ) : (
          filtered.map(cat => (
            <div key={cat.title} id={cat.title}>
              <FAQCategory title={cat.title} icon={cat.icon} faqs={cat.faqs} />
            </div>
          ))
        )}

        {/* Still have questions */}
        <div style={{ background: "#1e1e1e", borderRadius: 16, padding: "36px 32px", textAlign: "center", marginTop: 16 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>💬</div>
          <h3 style={{ color: "#fff", fontWeight: 900, fontFamily: "Georgia,serif", fontSize: 20, margin: "0 0 10px" }}>Still have questions?</h3>
          <p style={{ color: "#9FA1A4", fontSize: 13, margin: "0 0 20px", lineHeight: 1.6 }}>
            Can&apos;t find what you&apos;re looking for? The Rebel Odds team is happy to help.
          </p>
          <a href="mailto:support@rebelodds.xyz"
            style={{ display: "inline-block", padding: "12px 28px", background: "#E31837", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Contact Support
          </a>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ background: "#f5f5f5", borderTop: "1px solid #e8e8e8", padding: "24px 20px", textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "#9FA1A4", maxWidth: 500, margin: "0 auto" }}>
          ⚠️ <strong>Paper Trading Only.</strong> Rebel Tokens are virtual currency with no monetary value. For educational and demonstration purposes only.
        </p>
      </div>
    </div>
  );
}