import { getPortfolio } from "@/lib/market";

export default function PortfolioPage() {
  const portfolio = getPortfolio("trader-1");

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Portfolio</h1>
      <p className="text-sm text-zinc-600">
        Paper trading only. Rebel Tokens are virtual and cannot be withdrawn.
      </p>
      <p className="text-sm">
        User {portfolio.profile.username} | wallet {portfolio.wallet.balanceTokens.toFixed(2)} | net worth{" "}
        {portfolio.netWorth.toFixed(2)}
      </p>

      <section className="rounded-lg border border-zinc-200 p-4">
        <h2 className="font-semibold">Positions</h2>
        {portfolio.positions.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">No positions yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {portfolio.positions.map((item) => (
              <li key={item.contractId}>
                {item.contractTitle} | YES {item.yesShares.toFixed(2)} | NO {item.noShares.toFixed(2)} | mark{" "}
                {item.markToMarketValue.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
