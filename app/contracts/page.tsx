import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ContractsPage() {
  const supabase = await createClient();

  const { data: contracts, error } = await supabase
    .from("contracts")
    .select(`
      *,
      students(*),
      professors(*)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <p className="text-red-500">Failed to load contracts: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Contracts</h1>
      <p className="text-sm text-zinc-600">
        Paper trading only. Rebel Tokens are virtual and have no cash value.
      </p>

      {contracts.length === 0 ? (
        <p className="text-sm text-zinc-500">No active contracts available.</p>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <article key={contract.id} className="rounded-lg border border-zinc-200 p-4">
              <h2 className="font-semibold">{contract.title}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {contract.students?.name} · {contract.students?.major} · {contract.students?.standing}
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                p_yes{" "}
                {(
                  (contract.yes_token_pool + contract.seed_tokens) /
                  (contract.yes_token_pool + contract.no_token_pool + contract.seed_tokens * 2) *
                  100
                ).toFixed(2)}
                % | end{" "}
                {contract.end_date
                  ? new Date(contract.end_date).toLocaleDateString()
                  : "TBD"}{" "}
                | status {contract.status}
              </p>
              {contract.professors && (
                <p className="mt-1 text-xs text-zinc-400">
                  Prof. {contract.professors.name} · Rating {contract.professors.overall_rating ?? "N/A"}/5
                </p>
              )}
              <Link
                className="mt-3 inline-block text-sm font-medium underline"
                href={`/contracts/${contract.id}`}
              >
                View contract
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}