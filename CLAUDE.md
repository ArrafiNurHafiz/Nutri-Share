# NutriShare

Platform donasi makanan dengan fitur TOPSIS, reviews, notifications, dan admin dashboard.

## Tech Stack
- **Backend**: Node.js, Express, TypeScript
- **Frontend**: TailwindCSS (via CDN), vanilla JS
- **Testing**: Playwright E2E
- **Data**: In-memory DB

## Commands
- `npm run dev` — Start dev server
- `npm test` — Run Playwright E2E tests
- `npx playwright test --ui` — UI mode

## Project Structure
- `server/` — Express routes, db, middleware
- `public/` — Static files (HTML, CSS, JS, images)
- `tests/` — Playwright E2E tests

## Development Workflows

### Ponytail Mode (Always On)
Before writing code, check in order: YAGNI → stdlib → native platform → existing dependency → one line → minimum code. No abstractions yang tidak diminta. Mark intentional simplifications dengan `ponytail:` comment.

### Frontend Workflow
1. **Research** — Web search, 21st.dev inspiration, grep-vercel, context7, figma
2. **Design** — Color palette, font pairing, layout, write spec
3. **Plan** — Breakdown task, tulis plan
4. **Implement** — setup → design token → layout → components → animasi → polish
5. **Quality** — visual audit, accessibility, performance, browser inspect, E2E test
6. **Finish** — Bersihin AI tone, simpen memory

### Backend Workflow
1. **Research** — Context7/grep-vercel, brainstorming, PRD/API contract
2. **Architecture** — Tech stack, schema, API design, ADR
3. **Plan** — Task breakdown per layer
4. **Implement** — env → security middleware → typed errors → logging → health → database → validation → integration tests → business logic → caching → pagination → queue → API docs
5. **Quality** — Performance, contract testing, dependency audit, security, docker, CI/CD
6. **Production** — Runbook, SLI/SLO, incident response, feature flags, backup
7. **Finish** — stop-slop, memory-protocol

### Code Quality Checklist (before marking done)
1. Bersihin AI tone dari docs/comments
2. Run tests
3. Simpen key decisions ke memory
4. Confirm no leftover debug code or TODOs

## Important Patterns
- Profile records: donor uses `user_id`, recipient uses `user_id_alt`
- Auth uses query param `?role=donor|recipient`
- In-memory DB (db.ts)
- Donation lifecycle: create → TOPSIS → claim → admin approve → complete
