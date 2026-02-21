import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { adminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rebel Odds",
  description: "Backend starter for Rebel Odds",
};

async function getNavbarData() {
  try {
    const user = await getSessionUser();
    if (!user) return { balance: 0, rank: 0 };

    // Fetch wallet
    const { data: wallet } = await adminClient
      .from("wallets")
      .select("balance_tokens")
      .eq("user_id", user.id)
      .maybeSingle();

    const balance = wallet?.balance_tokens ?? 0;

    // Fetch leaderboard rank
    const { data: leaderboard } = await adminClient
      .from("wallets")
      .select("user_id,balance_tokens")
      .order("balance_tokens", { ascending: false });

    let rank = 0;
    if (leaderboard) {
      rank =
        leaderboard.findIndex((w) => w.user_id === user.id) + 1;
    }

    return { balance, rank };
  } catch {
    return { balance: 0, rank: 0 };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { balance, rank } = await getNavbarData();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased"
        style={{
          margin: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <NavBar balance={balance} rank={rank} />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}