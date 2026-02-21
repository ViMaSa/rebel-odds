# Rebel Odds Codex Context

Date: February 2026
Scope: Backend-first hackathon MVP in a single Next.js app.

## Product

Rebel Odds is a paper-trading academic prediction market where users trade YES/NO contracts with virtual Rebel Tokens.

## Constraints

- No real-money flows (no deposits, withdrawals, or cash-out).
- AMM-only pricing with YES/NO pools.
- Small token fee on each trade.

## Core Rules

- Contract threshold uses `>=` for YES.
- `p_yes = yes_pool / (yes_pool + no_pool)`.
- Starting balance: `10,000` tokens for each trader.
- Seed liquidity defaults near `YES 5000 / NO 5000`.

## Required Roles

- Trader: browse contracts, trade, portfolio, leaderboard.
- Admin: create contracts and resolve outcomes.

## Required Endpoints

- `GET /api/contracts`
- `GET /api/contracts/:id`
- `POST /api/contracts`
- `POST /api/trade`
- `GET /api/portfolio`
- `GET /api/leaderboard`
- `POST /api/contracts/:id/resolve`

## Resolution Rule

- Winning share payout: `1 token`.
- Losing share payout: `0`.

## UI Scope

- `/contracts`
- `/contracts/[id]`
- `/portfolio`
- `/leaderboard`

All UI surfaces must include a clear paper-trading disclaimer.
