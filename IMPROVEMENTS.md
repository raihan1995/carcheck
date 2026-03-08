# Carcheck – Improvements (Functionality & Security)

Suggested improvements for the UK Car Check app. No code changes have been made; this document is for planning and prioritisation.

---

## Security improvements

- **Rate limiting** – Add rate limiting (per IP or per API key) on `/api/check` to prevent abuse and protect DVLA/MOT API quotas. Currently there is no limit, so the endpoint can be hammered.

- **CORS** – Explicitly set CORS for `/api/check` if it is consumed by other origins; otherwise restrict to same-origin to reduce cross-site misuse.

- **Security headers** – Add CSP, `X-Frame-Options`, and `X-Content-Type-Options` via `next.config.ts` or middleware. Default Next.js behaviour may not set these.

- **Request body size** – Enforce a maximum body size for POST `/api/check` to avoid large payloads and potential DoS.

- **API authentication** – Consider an API key or other auth for programmatic access so the check endpoint is not fully public and unrestricted.

- **Secrets handling** – Keep env-based secrets (already in place); ensure API keys are never logged and document rotation if you rotate keys.

- **Input validation** – Registration is already normalised and length 2–8 is checked. Optionally add a stricter UK VRN pattern and consider a request ID for correlation in logs.

- **Error information** – `API_CHECK_DEBUG` can expose stack traces. Keep it off in production and document that in deployment notes.

- **Dependency hygiene** – Run `npm audit` regularly and keep dependencies updated; document this in contributing or ops docs.

---

## Functionality improvements

- **Error handling (UI)** – Add root or route-level `error.tsx` (and optional `global-error.tsx`) so failures are handled with a consistent, recoverable UX instead of only in-page error state.

- **Loading / caching** – Vehicle page fetches on the client with no cache. Consider ISR or caching headers for GET `/api/check`, or document caching strategy for repeated lookups.

- **Home form validation** – Mirror server validation on the client: normalise and validate length 2–8 before submit so users see clearer, immediate errors (e.g. “Invalid UK registration format”).

- **Duplicate types** – `VehicleData`, `MotTestItem`, and related types exist in both the API route and the vehicle page. Share them (e.g. from the API route or a shared `types` module) to avoid drift and bugs.

- **Accessibility** – Improve skip links, focus order, and ARIA for loading/error states; ensure form errors are announced to screen readers.

- **SEO** – Add `robots.txt` / sitemap if the app is public; consider dynamic metadata on the vehicle page (e.g. title including registration) for better sharing and search.

- **Offline / PWA** – Optional: document or add a service worker or PWA support for repeat visits and offline awareness.

- **Demo mode** – Demo mode (when `DVLA_API_KEY` is missing) already shows a banner; document this behaviour here and in README so deployers know what to expect.

- **MOT failure handling** – MOT errors are logged and `motHistory` can be null. Optionally show “MOT data unavailable” more explicitly on the vehicle page instead of a generic “MOT info failed to retrieve”.

- **Mobile UX** – Layout is responsive; consider a sticky CTA or back button on long vehicle result pages for easier navigation on small screens.

---

## Quick reference – already in place

| Practice | Where |
|----------|--------|
| Secrets in env, not in repo | `.env` in `.gitignore`, `.env.example` as template |
| Registration validation | Normalise + length 2–8 in `app/api/check/route.ts` (GET and POST) |
| Debug off by default | `API_CHECK_DEBUG` / `DEBUG` not set; stack only in responses when set |
| API keys server-side only | `DVLA_API_KEY`, `MOT_*` used only in API route, never sent to client |
| Basic error handling | 400/404/503 from API; vehicle page shows error state and “Check another vehicle” |
