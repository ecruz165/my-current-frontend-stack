# Hello World Frontend Stack — Design

**Date:** 2026-08-12
**Status:** Approved (amended 2026-08-12, approved: light/dark theming; version refresh — Vite 8, Storybook 10, shadcn CLI v4 with Base UI primitives)

## Overview

A greenfield "hello world" template demonstrating a modern React frontend stack. Not a bare skeleton: every library visibly earns its place through a small working demo (a sortable users table fed by mocked network requests). The repo doubles as a reference architecture for future projects.

## Goals

- Every listed library is installed, configured, and *used* by the demo.
- Atomic design organizes everything: components, Storybook hierarchy, and the router's mapping to templates/pages.
- One set of MSW mock handlers serves four consumers: browser dev, Vitest, Storybook, and Playwright e2e.
- Zod validates at the network boundary so all downstream code handles trusted, typed data.
- Light and dark themes ship by default: shadcn CSS variables, class-driven Tailwind dark variant, a header toggle persisted per user, system preference as the default.

## Stack

Latest stable release of each at scaffold time; majors listed are the compatibility contract.

| Concern | Choice |
|---|---|
| Runtime / PM | Node 24, npm |
| UI | React 19 |
| Language | TypeScript (latest stable), strict mode |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (CSS-first config via `@tailwindcss/vite`; no `tailwind.config.js`) |
| Components | shadcn/ui CLI v4; Base UI primitives arrive as its dependencies (no Radix) |
| Routing | TanStack Router v1, file-based via Vite plugin |
| Server state | TanStack Query v5 |
| Tables | TanStack Table v8 |
| Validation | Zod v4 |
| Lint/format | Biome 2 (sole linter and formatter; no ESLint/Prettier) |
| API mocking | MSW 2 |
| Unit/component tests | Vitest + React Testing Library (jsdom) |
| Component workshop | Storybook 10 (Vite builder) + MSW addon v3 |
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
    │   ├── molecules/           # small compositions: SortableColumnHeader, ThemeToggle
    │   └── organisms/           # self-contained sections: AppHeader, UsersTable
    ├── routes/                  # TanStack Router file-based routes
    │   ├── __root.tsx           # TEMPLATE: app shell (AppHeader + <Outlet/>)
    │   ├── index.tsx            # PAGE: hello landing page
    │   └── users.tsx            # PAGE: users table demo
    ├── lib/                     # cn() util, queryClient, api client, theme provider
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

Two pages under a shared shell; `AppHeader` (organism) navigates between them with Router `<Link>` active-state styling and hosts the theme toggle (right-aligned).

- **`/`** — hello landing page: shadcn Card + Button proving Tailwind/Base UI/shadcn render.
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

## Theming

Class-driven light/dark so the user can override the OS, following the canonical shadcn + Base UI patterns:

- shadcn's generated CSS variables define both palettes (`:root` = light, `.dark` = dark); Tailwind v4's `@custom-variant dark` binds `dark:` utilities to the class. Components consume semantic tokens only (`bg-background`, `text-foreground`, …), so no component needs per-theme changes.
- The `dark` class lives on `<html>`, never a nested wrapper — Base UI floating pieces (menus, dialogs, tooltips) render in portals attached outside the app root, and only a documentElement-level class reaches them.
- `color-scheme: light` / `color-scheme: dark` is set per theme in CSS so native controls and scrollbars match.
- `ThemeProvider` (`src/lib/theme.tsx`): `light | dark | system` persisted in `localStorage` (key `ui-theme`), default `system` (resolved via `prefers-color-scheme`), applies the class.
- `ThemeToggle` (molecule): Sun/Moon icon button in `AppHeader` that flips the resolved theme.
- Storybook: a light/dark toolbar toggles the same class on the preview's `<html>`, so every story renders in both themes.
- Out of scope (YAGNI): no-FOUC inline `<head>` script (SPA renders after JS anyway), live reaction to OS theme changes while open, additional named themes — though `Theme` being a string union leaves that door open.

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

- **Vitest + RTL (jsdom):** setup file starts MSW's Node server reusing the shared handlers. Proof-of-pattern tests: (1) `UsersTable` renders fetched rows — integration through Query + MSW + Zod; (2) `UserSchema` rejects malformed data; (3) `ThemeProvider`/`ThemeToggle` apply and persist the `dark` class on `<html>` (jsdom lacks `matchMedia`, so the test setup stubs it).
- **Storybook 10:** stories for every atom/molecule/organism, plus representative ui-layer stories (Button, Badge) living beside the generated files (re-running `shadcn add` overwrites the component file, never the story). `UsersTable` story fetches through the MSW addon; a theme toolbar renders any story in light or dark.
- **Playwright e2e (`e2e/`):** config auto-launches the dev server (`webServer`); MSW's service worker is active in the browser, so e2e needs no separate mocks. One smoke spec: load `/`, see hello card, navigate to `/users`, assert rows render, a column sorts on click, and the theme toggle flips `<html>` into dark mode.

## Out of Scope

- Real backend or API integration (MSW is the data source by design).
- Pagination, filtering, row selection in the table (sorting only — smallest feature that shows Table state).
- Feature-first folder restructuring (documented as the evolution path if the app grows).
- CI configuration, deployment, authentication.
