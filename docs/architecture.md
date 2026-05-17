# DoubleMark Site — Architecture (Phase 1)

## Stack
- **UI**: React 19 + TypeScript + Vite SPA.
- **Routing**: `react-router-dom`.
- **State**: React context for auth session; domain logic in `src/lib/*`.
- **Persistence**: Supabase Auth and Postgres tables for profiles, subscriptions, payments, and devices.
- **Tests**: Vitest (unit) + Testing Library (key UI flows).

## Boundaries
| Layer | Responsibility |
|-------|----------------|
| `src/content/*` | Copy, pricing plans, legal placeholders |
| `src/lib/*` | Auth, subscriptions, payments, admin stats, validation, cookies consent |
| `src/components/*` | Layout, cookie banner, forms, guards |
| `src/pages/*` | Route-level screens |

## Data Entities
- **Profile**: id, email, companyName, inn, phone, role, createdAt.
- **Session**: managed by Supabase Auth.
- **Payment**: id, userId, subscriptionId, planId, amount, status, provider, createdAt.
- **Subscription**: userId, planId, status, currentPeriodEnd, trialEndsAt, devicesLimit.
- **Device**: userId, deviceId, deviceName, platform, lastSeenAt.

## Flows
### Auth
Register → validate → Supabase Auth sign-up → profile trigger → redirect to `/account`.

### Payment (sandbox)
Select plan → checkout → sandbox RPC creates payment and updates subscription. Production should replace this with a provider webhook.

### Download
`hasActiveSubscription(userId)` checks active or trialing subscription → show Windows build link.

## Future Backend
Replace sandbox checkout with YooKassa/CloudPayments webhooks and add signed desktop/mobile license checks.

## Deployment Target
Static build (`npm run build`) on any static host; environment via `import.meta.env` when backend is added.
