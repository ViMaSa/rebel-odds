# Rebel Odds (Hackathon MVP)

Backend-first paper-trading academic prediction market built in a single Next.js app.

## Important Disclaimer

Rebel Tokens are virtual. This app has no real-money deposits, withdrawals, or cash value.

## Run

```bash
pnpm install
pnpm dev
```

## Demo Routes

- `/contracts`
- `/contracts/[id]`
- `/portfolio`
- `/leaderboard`

## API Routes

- `GET /api/contracts`
- `GET /api/contracts/:id`
- `POST /api/contracts` (admin)
- `POST /api/trade`
- `GET /api/portfolio`
- `GET /api/leaderboard`
- `POST /api/contracts/:id/resolve` (admin)

## Demo Auth Headers

Current auth is a hackathon shim (not Supabase yet). Use headers to emulate users:

- Trader: `x-user-id: trader-1`, `x-user-role: trader`
- Admin: `x-user-id: admin-1`, `x-user-role: admin`

Without headers, requests default to `trader-1`.

## Notes

- Trade/resolve behavior is centralized in `lib/market.ts`.
- Mutations use a process-local atomic queue for MVP consistency.
- Runtime API routes still use in-memory state; next step is moving `lib/market.ts` to Supabase queries/transactions.
