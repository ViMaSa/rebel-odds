import Link from "next/link";

import { listContracts } from "@/lib/market";

export default function ContractsPage() {
  const contracts = listContracts();

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Contracts</h1>
      <p className="text-sm text-zinc-600">
        Paper trading only. Rebel Tokens are virtual and have no cash value.
      </p>

      <div className="space-y-3">
        {contracts.map((contract) => (
          <article key={contract.id} className="rounded-lg border border-zinc-200 p-4">
            <h2 className="font-semibold">{contract.title}</h2>
            <p className="mt-1 text-sm text-zinc-600">
              p_yes {(contract.pYes * 100).toFixed(2)}% | end {new Date(contract.endDate).toLocaleDateString()}{" "}
              | status {contract.status}
            </p>
            <Link className="mt-3 inline-block text-sm font-medium underline" href={`/contracts/${contract.id}`}>
              View contract
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
