"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Side = "yes" | "no";

interface TradeFormProps {
  contractId: string;
}

export function TradeForm({ contractId }: TradeFormProps) {
  const [side, setSide] = useState<Side>("yes");
  const [amountTokens, setAmountTokens] = useState("100");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId,
          side,
          action: "buy",
          amountTokens: Number(amountTokens),
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Trade failed.");
      }
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Trade failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-zinc-200 p-4">
      <h2 className="font-semibold">Trade</h2>
      <p className="text-xs text-zinc-600">
        Fee is applied on each trade. Paper trading only, no real money.
      </p>

      <label className="block text-sm">
        Side
        <select
          className="mt-1 w-full rounded border border-zinc-300 p-2"
          value={side}
          onChange={(event) => setSide(event.target.value as Side)}
        >
          <option value="yes">Buy YES</option>
          <option value="no">Buy NO</option>
        </select>
      </label>

      <label className="block text-sm">
        Amount Tokens
        <input
          className="mt-1 w-full rounded border border-zinc-300 p-2"
          type="number"
          min="1"
          step="0.01"
          value={amountTokens}
          onChange={(event) => setAmountTokens(event.target.value)}
        />
      </label>

      <button
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        type="submit"
        disabled={pending}
      >
        {pending ? "Submitting..." : "Submit Buy Order"}
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
