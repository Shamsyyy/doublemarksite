# DubliMarkSite — Architecture (Phase 1)

## Stack
- **UI**: React 19 + TypeScript + Vite SPA.
- **Routing**: `react-router-dom`.
- **State**: React context for auth session; domain logic in `src/lib/*`.
- **Persistence (MVP)**: `localStorage` for users, entitlements, payments; `sessionStorage` for session token.
- **Tests**: Vitest (unit) + Testing Library (key UI flows).

## Boundaries
| Layer | Responsibility |
|-------|----------------|
| `src/content/*` | Copy, pricing plans, legal placeholders |
| `src/lib/*` | Auth, payments, licenses, validation, cookies consent |
| `src/components/*` | Layout, cookie banner, forms, guards |
| `src/pages/*` | Route-level screens |

## Data Entities
- **User**: id, email, passwordHash, companyName, inn, phone, createdAt.
- **Session**: token, userId, expiresAt.
- **Payment**: id, userId, planId, amount, status, provider, createdAt.
- **Entitlement**: userId, planId, status, validUntil.

## Flows
### Auth
Register → validate → store user → create session → redirect to `/account`.

### Payment (sandbox)
Select plan → checkout → `createCheckout` → user confirms → `processWebhook` → grant entitlement.

### Download
`canDownload(userId)` checks active entitlement → show Windows build link + setup docs.

## Future Backend (Not MVP)
Replace `localStorage` with API + Postgres; real email, YooKassa/CloudPayments webhooks, signed desktop license keys.

## Deployment Target
Static build (`npm run build`) on any static host; environment via `import.meta.env` when backend is added.
