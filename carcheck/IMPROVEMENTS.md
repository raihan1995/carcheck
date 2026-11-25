# RevVeal improvements and delivery roadmap

Reviewed against the application on **25 November 2026**. Package version **0.1.0**, UI revamp **5.1**. This replaces the older planning document from the outer repository folder; its completed items are recorded below rather than remaining open tasks.

This is a documentation review, not a record of newly implemented features. [README.md](./README.md) covers setup and resolved package versions; [docs/DESIGN.md](./docs/DESIGN.md) records the current UI; [CHANGELOG.md](./CHANGELOG.md) preserves the history.

## Highest-priority remaining work

| Priority | Work | Current evidence and practical next step |
| --- | --- | --- |
| P1 | Deliver paid checks and checkout | [Pricing](./app/pricing/page.tsx) disables checkout; [owned reports](./app/report/[id]/page.tsx) read existing snapshots. Connect paid providers, server-verified payment completion, idempotent report creation and failure/retry handling before enabling purchases. |
| P1 | Complete business and contact content | [Information pages](./app/[slug]/page.tsx) contain explicit placeholders. Confirm the business/VAT details, support/security contacts and reviewed privacy/terms/retention content; configure the public support address. |
| P1 | Make quotas shared and bounded | [The limiter](./lib/rate-limit.ts) already allows 30 requests per IP key per minute, but uses an in-process Map and does not remove unused expired keys. Use a bounded shared store and verify how the host supplies trusted client-IP headers before relying on the quota across instances. |
| P1 | Bound and validate lookup inputs | [The API](./app/api/check/route.ts) checks registration length after normalising it, but has no application-level POST body-size cap or strict JSON content-type/schema validation. Add explicit raw input/body limits and regression tests while preserving legitimate registration formats. Align client/server normalisation. |
| P1 | Harden auth callback origins and diagnostics | [The callback](./app/auth/callback/route.ts) derives its origin from forwarded headers. Constrain these at the trusted proxy boundary or validate against an allowed app origin. Keep `API_CHECK_DEBUG` and `DEBUG=1` off in production; review logging/redaction and credential-rotation procedures. |
| P1 | Scope stored garage data to accounts | [The garage](./lib/browser-garage.ts) uses one local-storage key for the browser. Decide account ownership and migration rules before adding server sync; cover shared-browser sign-out/account-switch behaviour. |

## Next improvements

| Priority | Work | Current evidence and practical next step |
| --- | --- | --- |
| P2 | Reduce provider latency and improve observability | [Lookups](./app/api/check/route.ts) have individual timeouts and return partial data, but fetch a new MOT token for each check and perform provider work sequentially. Add measured timings/request IDs, token reuse with expiry handling and a tested provider-failure strategy. Define any vehicle-data cache policy before replacing `no-store`. |
| P2 | Add a tested content security policy | [Headers](./next.config.ts) already include frame protection, MIME sniffing protection, referrer policy and permissions policy. CSP is still absent. Introduce a policy compatible with Next scripts, Supabase and optional analytics, then verify all affected flows. |
| P2 | Expand automated integration coverage | [Existing tests](./tests/vehicle-access.test.cjs) cover catalogue access for GET/POST, and the other suites cover summaries, hero selection and tax calculations. Add provider timeout/malformed-response, rate-limit, oversized-body, callback-origin, report ownership/RLS and account-switch cases. Browser QA currently uses samples or fixtures rather than a persistent end-to-end suite. |
| P2 | Deliver monitoring and report exports | [Logbook/tax alerts](./app/components/dashboard/Watchlist.tsx) are placeholders. Calendar downloads exist; scheduled notifications, automated V5C/tax monitoring and generated/emailed report PDFs do not. Define delivery preferences, scheduling, retries and report ownership before connecting them. |
| P2 | Maintain dated tax and comparison data | [Tax rates](./lib/vehicle-tax.ts) and [competitor prices](./app/components/PriceComparison.tsx) are manually maintained reference snapshots. Set a review process and refresh their dates, sources and boundary tests when values change. The legacy March 2006 high-emissions tax cutoff remains unavailable without a registration day. |
| P2 | Decide public search discovery | Public content routes exist, while vehicle results, owned reports and draft legal pages deliberately opt out of indexing. There is no `app/robots.ts` or `app/sitemap.ts`; add deliberate public-page discovery without exposing personal/report routes. |
| Optional | Improve long-report navigation and offline states | Responsive layouts, reduced motion and retry/empty states exist. Validate whether section navigation, a compact search action or offline/PWA support would help users before adding them. |
| Optional | Define a separate programmatic API product | The free lookup endpoint is intentionally public. If third-party API access is offered later, define credentials, quotas and origin policy separately. CORS alone would not authenticate callers or protect provider costs. |

## Already implemented

| Earlier planning item | Current implementation |
| --- | --- |
| Add basic rate limiting | Both lookup methods share the process-local limiter and return `429`/`Retry-After`; distributed enforcement remains above. |
| Add baseline security headers | Configured in [next.config.ts](./next.config.ts). CSP remains a separate task. |
| Share duplicate vehicle types | [lib/vehicle-types.ts](./lib/vehicle-types.ts) is used by the API, sample and results components. |
| Improve registration form validation | [RegistrationSearch](./app/components/RegistrationSearch.tsx) validates alphanumeric registrations before navigation, labels fields/errors and performs one results lookup. The API also validates normalised length. |
| Add recoverable error/loading states | [app/error.tsx](./app/error.tsx), [app/loading.tsx](./app/loading.tsx), [app/not-found.tsx](./app/not-found.tsx) and the results component provide fallback/retry states. |
| Make MOT failures explicit | Nullable MOT history produces an unavailable state instead of zero issues or an invented pass result. Optional MOT/catalogue failures preserve the DVLA record. |
| Add request deadlines | DVLA: 8 seconds; MOT token and MOT history: 6 seconds each. There is no single overall request deadline. |
| Improve accessibility | Skip link, labelled forms, visible focus, native disclosures, status/empty states, semantic tables and reduced-motion controls are present. Continue checking new UI and real account flows. |
| Protect account data and catalogue fields | [proxy.ts](./proxy.ts) guards dashboards; report reads check ownership; [schema.sql](./supabase/schema.sql) defines RLS; verified API users alone receive catalogue candidates. |
| Keep provider credentials on the server | DVLA/MOT secrets are read in the server route. Public Supabase configuration is separate; environment files are ignored except the example template. |
| Separate sample and failed live checks | Only explicit `SAMPLE` lookups use illustrative data. Missing DVLA configuration returns `503`, with no silent demo substitution. |
| Correct framework session entry point | The app uses [proxy.ts](./proxy.ts). The remaining `lib/supabase/middleware.ts` name belongs to a helper, not the deprecated Next entry convention. |
| Record dependency versions | [README.md](./README.md) now records the app version, UI generation, Node range and every top-level locked package version. |

## Verification and review boundaries

Use `npm test` for the current regression suites and `npm run build` for production/TypeScript validation. Browser checks should use `/vehicle/SAMPLE`, `/report/SAMPLE`, `/preview/dashboard` or controlled response fixtures; do not use live vehicle-provider credits just to verify layout.

Real OAuth/email delivery, remote database policies, payment/provider integrations and notification delivery require separate configured-service checks. Static code and mocked-response tests do not verify their production configuration. Review this roadmap when those integrations ship and move completed work into the table above.
