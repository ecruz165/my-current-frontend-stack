# hello-stack

A reference architecture for a modern React frontend, built greenfield on 2026-08-12. Not a bare skeleton: **every library in the stack is installed, configured, and visibly exercised by a working demo** — a sortable, drag-reorderable users table fed by mocked network requests, plus a demos section where the rest of the stack earns its place.

![Users page](docs/screenshots/users-page.png)

## The stack

| Concern | Choice |
| --- | --- |
| Runtime / PM | Node ≥ 24, npm |
| UI | React 19 |
| Language | TypeScript (strict mode) |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 (CSS-first via `@tailwindcss/vite`; no `tailwind.config.js`) |
| Components | shadcn/ui CLI v4 — Base UI primitives (no Radix) |
| Routing | TanStack Router v1, file-based, nested layouts, code-split |
| Server state | TanStack Query v5 (+ devtools, dev-only) |
| Tables | TanStack Table v9 (feature-composed via `tableFeatures`) |
| Drag & drop | dnd-kit (`core`, `sortable`, `utilities`) |
| Validation | Zod v4 — single source of type truth, validated at the network boundary |
| Forms | react-hook-form + `@hookform/resolvers` (Zod) |
| Rich text | tiptap 3 (starter-kit, link, underline, extensions, suggestion) + tiptap-markdown |
| Markdown | react-markdown + remark-gfm/breaks, shiki, mermaid, marked, streamdown |
| Flow diagrams | @xyflow/react |
| Layout / motion | react-resizable-panels, motion |
| Lint/format | Biome 2 (sole linter and formatter — no ESLint/Prettier) |
| API mocking | MSW 2 — one handlers module, four consumers |
| Unit/component tests | Vitest 4 + React Testing Library (jsdom) |
| Component workshop | Storybook 10 (Vite builder) + msw-storybook-addon v3 |
| E2E | Playwright |

## What the demo shows

- **`/`** — hello card proving Tailwind + Base UI/shadcn render, with light/dark theming (system default, persisted toggle in the header).
- **`/users`** — the spine of the demo: `useQuery` → `fetchUsers` → MSW-intercepted `fetch`, Zod-parsed at the boundary so malformed payloads become Query errors instead of bad renders. Client-side sortable columns (TanStack Table) and drag-reorderable rows (dnd-kit) — drag handles disable while a sort is active, because manual order is only meaningful unsorted.
- **`/demos`** — a nested layout route with one composed page per library group:

| Page | Libraries at work |
| --- | --- |
| [Overview](docs/screenshots/demos-index.png) | motion (staggered cards), Query devtools toggle |
| [Rich text editor](docs/screenshots/demos-editor.png) | tiptap + @-mentions via suggestion → tiptap-markdown → marked HTML preview |
| [Markdown pipeline](docs/screenshots/demos-markdown.png) | resizable-panels split; react-markdown + GFM, shiki highlighting, mermaid diagrams; streamdown streaming from a chunked MSW endpoint |
| [Architecture flow](docs/screenshots/demos-flow.png) | xyflow canvas of this repo's own architecture |
| [Invite a user](docs/screenshots/demos-form.png) | react-hook-form + Zod resolver; `useMutation` POST re-validated by the mock server with the same schema |

![Markdown pipeline](docs/screenshots/demos-markdown.png)

The full gallery lives in [`docs/screenshots/`](docs/screenshots/README.md).

## Getting started

```bash
npm install
npm run dev        # app at http://localhost:5173 (MSW serves the API)
npm run storybook  # component workshop at http://localhost:6006
```

| Script | What it does |
| --- | --- |
| `dev` / `build` / `preview` | Vite dev server / production build (`tsc -b` first) / preview |
| `test` | Vitest unit + integration tests (jsdom, MSW Node server) |
| `test:e2e` | Playwright suite (auto-launches the dev server) |
| `lint` / `format` / `check` | Biome — lint only / write formatting / full check |
| `storybook` / `build-storybook` | Storybook dev server / static build |

## Architecture notes

- **Atomic design** organizes everything: `src/components/ui/` is the shadcn vendor layer (generated, lint-exempt); handwritten `atoms/`, `molecules/`, `organisms/` each keep component, story, and test side by side. Templates and pages have no component folders — TanStack Router's file-based routes *are* those levels (`__root.tsx` is the app template, `routes/demos/route.tsx` a section template).
- **One MSW handlers module, four consumers**: the browser worker in dev, Vitest's Node server, the Storybook addon, and Playwright (which rides the dev server's worker — e2e needs no separate mocks).
- **Zod as the single source of type truth**: `UserSchema` types the table, `InviteUserSchema` derives from it and validates the invite form on the client *and* in the mock server handler.
- **Theming** is class-driven: shadcn's CSS variables define both palettes; the `dark` class lives on `<html>` only, so Base UI portal content stays themed; `ThemeProvider` persists `light | dark | system` and Storybook mirrors it with a toolbar.
- Design docs and step-by-step implementation plans live in [`docs/superpowers/`](docs/superpowers/) — the spec for this repo is [`2026-08-12-hello-world-stack-design.md`](docs/superpowers/specs/2026-08-12-hello-world-stack-design.md) and the demos amendment is [`2026-08-12-library-demos-design.md`](docs/superpowers/specs/2026-08-12-library-demos-design.md).

## Testing

- **Vitest + RTL** (28 tests): proof-of-pattern per concern — schema rejection, handler contracts, Zod-at-the-boundary fetch client, theme apply/persist, table integration through Query + MSW, form validation and mutation, markdown rendering, editor serialization, flow rendering. jsdom gaps (`matchMedia`, `localStorage` under Node ≥ 22, `ResizeObserver`) are stubbed in `src/test/setup.ts`.
- **Storybook** (12 stories): every handwritten atom/molecule/organism plus representative vendor-layer stories, MSW-backed where they fetch, light/dark via the theme toolbar.
- **Playwright** (3 specs): smoke (hello → users → sort → dark mode), drag reordering (including the disabled-under-sort rule), and a demos walk-through touching each page.
