# GolfKind — Golf Performance, Charity & Prize Draw Platform

A subscription-driven web app that combines Stableford golf score tracking,
charitable giving, and a monthly draw-based reward engine, built so that
platform features (score entry, draw participation) are only unlocked for
active subscribers, enforced consistently across the dashboard.

## Live Links

- **App**: [golf-kind-lyart.vercel.app](https://golf-kind-lyart.vercel.app/)
- **Repo**: [github.com/swaraj1917/GolfKind](https://github.com/swaraj1917/GolfKind)

---

## Stack

| Layer    | Choice                               |
|----------|--------------------------------------|
| Frontend | React + TypeScript (Vite)            |
| Styling  | Tailwind CSS                         |
| Routing  | React Router                         |
| Backend  | Supabase (Postgres, Auth, Storage)   |
| Payments | Stripe-style test/demo checkout flow |
| Hosting  | Vercel                               |

---

## Database Schema

```text
profiles (id, full_name, email, role[subscriber|admin], charity_id, charity_percentage)
 ├─< subscriptions (user_id, plan_type[monthly|yearly], status, amount,
 │                  charity_amount, prize_pool_amount,
 │                  current_period_start, current_period_end)
 ├─< scores (user_id, score, played_at)
 ├─< draw_entries (user_id, draw_id, entry numbers)
 └─< winners (user_id, draw_id, match_count, prize_amount,
              verification_status, payment_status)

charities (id, name, description, image, website, upcoming_event,
           featured, active)
 └─< profiles (charity_id → charities)

draws (id, draw_month, type[random|algorithmic], status[draft|simulated|published],
       winning_numbers, jackpot_rollover)
 ├─< draw_entries (draw_id → draws)
 ├─< prizes (draw_id → draws, tier breakdown)
 └─< winners (draw_id → draws)

winner_proofs (winner_id, file_path, uploaded_at)
```

`scores` enforces a rolling-5 pattern at the application layer: only the
latest 5 entries per user are retained, one per date, with the oldest
automatically dropped when a new score is added.

---

## Architectural Decisions

### Why Supabase directly from the client, instead of a separate Express API

The app talks to Postgres straight through the Supabase client library rather
than through a custom backend. Supabase's Row Level Security policies act as
the authorization boundary at the database layer itself, so access rules
(a user can only read/write their own scores, only admins can manage
charities) are enforced once, at the data layer, instead of being
duplicated in a hand-written API that would otherwise become the single
point of failure for authorization.

### Why subscription status is computed, not just stored

Rather than trusting a static `status` flag alone, active-subscriber checks
combine `status === 'active'` with a live comparison against
`current_period_end`. That way a subscription that has technically lapsed
but hasn't been swept by a background job yet still gets correctly treated
as inactive everywhere in the UI — score entry, draw entry, and the
dashboard summary all read from the same computed value, so there's no
place where the check can silently drift out of sync.

### Why the draw engine supports two distinct generation modes

The prize draw can run in `random` mode (standard lottery-style number
generation) or `algorithmic` mode (weighted by each subscriber's recent
score frequency). Keeping both as first-class, admin-selectable modes
— rather than hardcoding one — means the platform's fairness model isn't
locked in at launch; an admin can simulate either approach against the
current subscriber pool before publishing a draw.

### Why payments run through a demo/test checkout rather than live Stripe

The assignment scope explicitly allows a simulated transaction rather than
a live payment processor, since the goal is to demonstrate the subscription
lifecycle (activation, plan selection, cancellation) rather than to move
real money. The checkout flow mirrors what a real Stripe Checkout redirect
would look like, so swapping in live keys later is a drop-in change rather
than a redesign.

---

## Known Limitations

- **Schema managed directly in Supabase** rather than as version-controlled
  migration files in the repo — the schema itself is complete and working,
  it just isn't yet exported as tracked `.sql` files.
- **No automated tests.** Testing so far has been manual, focused on
  verifying the subscription-gating logic and draw/prize calculations by
  hand across subscribed and non-subscribed accounts.
- **Admin dashboard and homepage are large single components** rather than
  split into smaller files — a reasonable next refactor for long-term
  maintainability, though it doesn't affect current functionality.
- **No pagination** on charity, winner, or user lists — fine at the current
  scale, would need cursor-based pagination at a larger subscriber count.
- **Payments are simulated**, not live — see the architectural note above.

---

## Deployment Note

The frontend is deployed on Vercel as a static Vite build. There's no
separate backend service — Supabase handles authentication, the database,
and file storage (for winner proof uploads) directly, so there's no
long-running server process to host separately. Draw publishing and
simulation are triggered on demand from the Admin dashboard rather than
running on a scheduled job, since draws happen on a monthly admin-controlled
cadence rather than continuously.
