import Link from "next/link";
import { notFound } from "next/navigation";

import { getContractById } from "@/lib/market";

import { TradeForm } from "./trade-form";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = getContractById(id);
  if (!record) {
    notFound();
  }

  const { contract, student, recentTrades } = record;

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-6">
      <Link className="text-sm underline" href="/contracts">
        Back to contracts
      </Link>

      <h1 className="text-2xl font-bold">{contract.title}</h1>
      <p className="text-sm text-zinc-600">{contract.description}</p>
      <p className="text-sm">
        p_yes {(contract.pYes * 100).toFixed(2)}% | pools YES {contract.yesPool.toFixed(2)} / NO{" "}
        {contract.noPool.toFixed(2)} | status {contract.status}
      </p>
      {student ? (
        <p className="text-sm text-zinc-700">
          Student: {student.name} ({student.major}, {student.standing})
        </p>
      ) : null}

      <TradeForm contractId={contract.id} />

      <section className="rounded-lg border border-zinc-200 p-4">
        <h2 className="font-semibold">Recent Trades</h2>
        {recentTrades.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600">No trades yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {recentTrades.map((trade) => (
              <li key={trade.id}>
                {trade.side.toUpperCase()} {trade.action} {trade.tokensSpent.toFixed(2)} tokens | fee{" "}
                {trade.fee.toFixed(2)} | {new Date(trade.createdAt).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
