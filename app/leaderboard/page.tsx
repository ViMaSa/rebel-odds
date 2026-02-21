import { getLeaderboard } from "@/lib/market";

export default function LeaderboardPage() {
  const rows = getLeaderboard();

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <p className="text-sm text-zinc-600">Paper trading only. Rebel Tokens have no real-world value.</p>

      <section className="rounded-lg border border-zinc-200 p-4">
        <ol className="space-y-2 text-sm">
          {rows.map((row, index) => (
            <li key={row.userId}>
              #{index + 1} {row.username} | net worth {row.netWorth.toFixed(2)} | wallet{" "}
              {row.walletBalance.toFixed(2)}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
