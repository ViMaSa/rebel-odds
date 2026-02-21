import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Rebel Odds MVP</h1>
      <p className="text-sm text-zinc-600">
        Paper trading academic prediction market. Rebel Tokens are virtual only.
      </p>

      <section className="rounded-lg border border-zinc-200 p-4">
        <h2 className="text-lg font-semibold">Demo Pages</h2>
        <ul className="mt-2 space-y-2 text-sm">
          <li>
            <Link className="underline" href="/contracts">
              /contracts
            </Link>
          </li>
          <li>
            <Link className="underline" href="/portfolio">
              /portfolio
            </Link>
          </li>
          <li>
            <Link className="underline" href="/leaderboard">
              /leaderboard
            </Link>
          </li>
        </ul>
      </section>

      <section className="rounded-lg border border-zinc-200 p-4">
        <h2 className="text-lg font-semibold">Core API Routes</h2>
        <ul className="mt-2 space-y-2 text-sm">
          <li>
            <code>GET /api/contracts</code>
          </li>
          <li>
            <code>GET /api/contracts/:id</code>
          </li>
          <li>
            <code>POST /api/trade</code>
          </li>
          <li>
            <code>GET /api/portfolio</code>
          </li>
          <li>
            <code>GET /api/leaderboard</code>
          </li>
        </ul>
      </section>
    </main>
  );
}
