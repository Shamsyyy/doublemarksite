# DoubleMark Site — Architecture

## Stack
- **UI**: React 19 + TypeScript + Vite SPA.
- **Routing**: `react-router-dom`.
- **State**: React context for auth session; domain logic in `src/lib/*`.
- **Persistence**: PostgreSQL on the Timeweb VPS. Site talks to `https://api.doublemark.ru`.
- **Tests**: Vitest (unit) + Testing Library (key UI flows).

## Boundaries
| Layer | Responsibility |
|---------|----------------|
| `src/config/legal.ts` | Operator fields, consent versions |
| `src/content/*` | Copy, pricing plans, offer text |
| `src/lib/*` | Auth, subscriptions, payments, admin, validation, cookie consent |
| `src/components/*` | Layout, cookie banner, forms, guards |
| `src/pages/*` | Route-level screens |

Supabase is not used by the site.
