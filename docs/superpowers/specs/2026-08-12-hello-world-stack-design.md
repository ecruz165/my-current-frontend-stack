# Hello World Frontend Stack — Design

**Date:** 2026-08-12
**Status:** Approved

## Overview

A greenfield "hello world" template demonstrating a modern React frontend stack. Not a bare skeleton: every library visibly earns its place through a small working demo (a sortable users table fed by mocked network requests). The repo doubles as a reference architecture for future projects.

## Goals

- Every listed library is installed, configured, and *used* by the demo.
- Atomic design organizes everything: components, Storybook hierarchy, and the router's mapping to templates/pages.
- One set of MSW mock handlers serves four consumers: browser dev, Vitest, Storybook, and Playwright e2e.
- Zod validates at the network boundary so all downstream code handles trusted, typed data.

## Stack

Latest stable release of each at scaffold time; majors listed are the compatibility contract.

| Concern | Choice |
|---|---|
| Runtime / PM | Node 24, npm |
| UI | React 19 |
| Language | TypeScript 5.x, strict mode |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 (CSS-first config via `@tailwindcss/vite`; no `tailwind.config.js`) |
| Components | shadcn/ui CLI (React 19 + Tailwind v4 compatible); Radix UI arrives as its dependencies |
| Routing | TanStack Router v1, file-based via Vite plugin |
| Server state | TanStack Query v5 |
| Tables | TanStack Table v8 |
| Validation | Zod v4 |
| Lint/format | Biome 2 (sole linter and formatter; no ESLint/Prettier) |
| API mocking | MSW 2 |
| Unit/component tests | Vitest + React Testing Library (jsdom) |
| Component workshop | Storybook 9 (Vite builder) + MSW addon |
| E2E | Playwright (`@playwright/test`) |

## Project Structure

```
├── e2e/                         # Playwright specs
├── docs/superpowers/specs/      # design docs (this file)
├── public/                      # static assets incl. MSW worker script
└── src/
    ├── components/
    │   ├── ui/                  # shadcn-generated vendor layer (button, card, table, badge…)
    │   ├── atoms/               # smallest handwritten units: StatusBadge, Spinner
    │   ├── molecules/           # small compositions: SortableColumnHeader
    │   └── organisms/           # self-contained sections: AppHeader, UsersTable
    ├── routes/                  # TanStack Router file-based routes
    │   ├── __root.tsx           # TEMPLATE: app shell (AppHeader + <Outlet/>)
    │   ├── index.tsx            # PAGE: hello landing page
    │   └── users.tsx            # PAGE: users table demo
    ├── lib/                     # cn() util, queryClient, api client functions
    ├── schemas/                 # Zod schemas (User) — single source of type truth
    ├── mocks/                   # MSW handlers + browser/server setup + fixtures
    └── main.tsx
```

### Atomic design mapping

- **`components/ui/`** is a *subatomic vendor layer*: shadcn CLI output, treated as generated code. `npx shadcn add` keeps working with default aliases; no config fights.
- **Atoms / molecules / organisms** are handwritten and compose the ui layer. Each component folder holds the component, its story, and — where the testing section defines one — its test, side by side (`UsersTable.tsx`, `UsersTable.stories.tsx`, `UsersTable.test.tsx`).
- **Templates and pages get no `components/` folders** — TanStack Router's file-based routes *are* those levels. `__root.tsx` is the template (layout + `<Outlet/>` slot); route files are pages.
- **Storybook sidebar mirrors the taxonomy:** `UI/`, `Atoms/`, `Molecules/`, `Organisms/` via story titles.

## Demo Behavior

Two pages under a shared shell; `AppHeader` (organism) navigates between them with Router `<Link>` active-state styling.

- **`/`** — hello landing page: shadcn Card + Button proving Tailwind/Radix/shadcn render.
- **`/users`** — sortable users table, the spine of the demo:

```
users.tsx (page) → useQuery(['users']) → fetchUsers() → fetch('/api/users')
                                                          ↓ MSW intercepts
   UsersTable (organism) ← User[] (typed) ← UserSchema.array().parse(json)
        ↓
   useReactTable + shadcn <Table> primitives, client-side sortable columns
```

- MSW serves `/api/users` from a fixture (~10 users) with ~500ms artificial delay so the pending state is visible.
- `User` schema: `id`, `name`, `email`, `status` (Zod enum: `active | invited | suspended`). `type User = z.infer<typeof UserSchema>`.
- `StatusBadge` (atom) maps the status enum to shadcn Badge variants.
- `SortableColumnHeader` (molecule) is the clickable column header with sort-direction indicator.

## Error Handling

- The `queryFn` Zod-parses the response; malformed payloads **throw**, becoming a Query error — no silent bad renders.
- Query state → UI mapping: pending → `Spinner` atom; error → inline error message with the failure reason; success → table.
- Network-level failures surface through the same Query error path.

## Tooling

- **Biome 2** is the only linter/formatter. The Vite template's ESLint remnants are removed. `routeTree.gen.ts` is excluded from Biome.
- **Router Vite plugin** generates `src/routeTree.gen.ts` (committed to git).
- **TypeScript** strict mode; `@/` path alias → `src/`.
- **npm scripts:** `dev`, `build`, `test`, `test:e2e`, `lint`, `format`, `check`, `storybook`, `build-storybook`.

## Testing

- **Vitest + RTL (jsdom):** setup file starts MSW's Node server reusing the shared handlers. Proof-of-pattern tests: (1) `UsersTable` renders fetched rows — integration through Query + MSW + Zod; (2) `UserSchema` rejects malformed data.
- **Storybook 9:** stories for every atom/molecule/organism, plus representative ui-layer stories (Button, Badge) living beside the generated files (re-running `shadcn add` overwrites the component file, never the story). `UsersTable` story fetches through the MSW addon.
- **Playwright e2e (`e2e/`):** config auto-launches the dev server (`webServer`); MSW's service worker is active in the browser, so e2e needs no separate mocks. One smoke spec: load `/`, see hello card, navigate to `/users`, assert rows render and a column sorts on click.

## Out of Scope

- Real backend or API integration (MSW is the data source by design).
- Pagination, filtering, row selection in the table (sorting only — smallest feature that shows Table state).
- Feature-first folder restructuring (documented as the evolution path if the app grows).
- CI configuration, deployment, authentication.
