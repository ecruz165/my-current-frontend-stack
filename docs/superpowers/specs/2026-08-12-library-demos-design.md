# Library Demos — Design

**Date:** 2026-08-12
**Status:** Approved (2026-08-12)
**Parent spec:** `2026-08-12-hello-world-stack-design.md` — this spec restores its founding rule ("every listed library is installed, configured, and *used*") for the dependencies staged on 2026-08-12.

## Overview

Four composed demo pages under a new `/demos` section, plus an animated index. Libraries collaborate the way real apps use them rather than sitting in isolated sandboxes: the editor round-trips through markdown, the markdown renderer streams from a mocked endpoint, the flow canvas documents this repo's own architecture, and the form shares one Zod schema between client validation and the mocked server.

## Goals

- Every staged library is visibly exercised: tiptap (core, react, starter-kit, extension-link, extension-underline, extensions, pm, suggestion), tiptap-markdown, marked, react-markdown, remark-gfm, remark-breaks, shiki, streamdown, mermaid, @xyflow/react, react-hook-form, react-resizable-panels, motion, @dnd-kit (already demoed via row reordering), @tanstack/react-query-devtools.
- The demos section itself demos new Router surface: a nested layout route with its own sub-navigation.
- MSW stays the single mock backend: new handlers join the existing shared module and all four consumers (dev, Vitest, Storybook, Playwright) inherit them.
- Zod stays the single source of type truth: the invite form derives its schema from `UserSchema` and the mocked server re-validates with the same schema.

## New Dependency

- `@hookform/resolvers` — the only addition; bridges react-hook-form to Zod. Everything else is already installed.
- shadcn CLI adds (vendor layer, not npm deps): `input`, `label`.

## Structure

```
src/
├── routes/
│   ├── demos/
│   │   ├── route.tsx        # SECTION TEMPLATE: sub-nav + <Outlet/> (first nested layout)
│   │   ├── index.tsx        # PAGE: animated demo cards (motion)
│   │   ├── editor.tsx       # PAGE: rich text editor demo
│   │   ├── markdown.tsx     # PAGE: markdown pipeline demo
│   │   ├── flow.tsx         # PAGE: architecture flow canvas
│   │   └── form.tsx         # PAGE: invite-user form demo
├── components/organisms/
│   ├── RichTextEditor.tsx   # + .stories.tsx + .test.tsx
│   ├── MarkdownView.tsx     # + .stories.tsx + .test.tsx
│   ├── StackFlow.tsx        # + .stories.tsx + .test.tsx
│   └── InviteUserForm.tsx   # + .stories.tsx + .test.tsx
├── schemas/user.ts          # + InviteUserSchema = UserSchema.omit({ id: true })
└── mocks/handlers.ts        # + GET /api/stream, POST /api/invites
```

- `AppHeader` gains one link: `Demos` → `/demos` (non-exact active matching so it stays lit on child routes).
- Demo-page-specific glue (toolbar buttons, mention picker list, panel wiring, sample documents, flow node data) lives inside the organism or route file that uses it — single-use code does not get its own atomic-level home.

## Demo Pages

### `/demos` — index (motion)

A responsive grid of shadcn Cards, one per demo (title, one-line description, link). `motion/react` provides a staggered entrance animation and a hover lift. Animation stays in navigation chrome — data pages don't animate.

### `/demos/editor` — tiptap suite

`RichTextEditor` organism:

- Extensions: StarterKit, Underline, Link, `Placeholder` (from `@tiptap/extensions`), and a Mention extension driven by `@tiptap/suggestion`: typing `@` opens a picker of the 10 fixture users (same fixture module the table uses). `@tiptap/pm` underpins all of it as the ProseMirror runtime.
- Toolbar: shadcn ghost Buttons for bold / italic / underline / link / undo, with pressed state reflecting the current selection.
- `tiptap-markdown` serializes the document on every change; the page shows the markdown source and, beside it, an HTML preview rendered from that source with `marked` — an editor → markdown → HTML round trip on one screen. The `marked` preview renders through `dangerouslySetInnerHTML` on editor-local content only (no remote input reaches it).

### `/demos/markdown` — rendering pipeline (resizable-panels, react-markdown, shiki, mermaid, streamdown)

`react-resizable-panels` horizontal split with a draggable divider:

- **Left panel:** a plain textarea seeded with a sample document exercising GFM (table, task list, strikethrough), a TypeScript code fence, and a ` ```mermaid ` fence. Fully editable; the right panel re-renders live.
- **Right panel:** `MarkdownView` organism — `react-markdown` + `remark-gfm` + `remark-breaks`; code fences render through a `CodeBlock` component that highlights with **shiki** (theme follows the app's light/dark class); ` ```mermaid ` fences render through **mermaid** into inline SVG.
- **Stream toggle:** a "Stream it" button switches the right panel to **streamdown**, replaying the document from `GET /api/stream` — an MSW handler that emits the same sample document as a chunked `ReadableStream` with small delays, mimicking an AI response.

### `/demos/flow` — @xyflow/react

`StackFlow` organism: an interactive canvas whose nodes and edges describe this repo's architecture (main.tsx providers → router → template → pages → organisms → api client → MSW). Nodes are draggable; `MiniMap`, `Controls`, and `Background` included. Node/edge data is a static module beside the organism — the repo documents itself.

### `/demos/form` — react-hook-form + Zod + Query mutation

`InviteUserForm` organism:

- `InviteUserSchema = UserSchema.omit({ id: true })` (name, email, status) — exported from `src/schemas/user.ts`.
- react-hook-form with `zodResolver(InviteUserSchema)`; shadcn `input`/`label`, native select for status; inline field errors from Zod messages.
- Submit runs a TanStack Query `useMutation` (first mutation in the repo) POSTing to `POST /api/invites`. The MSW handler re-validates the body with the same `InviteUserSchema` — returns `201` with a created `User` (id assigned server-side) or `400` with the Zod issues. Client and mock server share one schema: the spec's "single source of type truth" extended to writes.
- UI states: submitting (disabled button), success (inline confirmation showing the created user), server-rejection (inline error). No optimistic updates, no cache invalidation — the users list intentionally stays fixture-driven.

## Devtools

`@tanstack/react-query-devtools` mounts in `main.tsx` behind the same dev-only gate as the MSW worker (lazy `import()` guarded by `import.meta.env.DEV`); production bundles exclude it.

## MSW Additions

Both handlers join the existing `src/mocks/handlers.ts` array (one module, four consumers):

- `GET /api/stream` — chunked text stream of the sample markdown document with ~50 ms inter-chunk delay.
- `POST /api/invites` — parses the JSON body with `InviteUserSchema`; `201` + created `User` on success, `400` + `{ issues }` on failure.

## Testing

- **Vitest + RTL:** one proof-of-pattern test file per organism: `InviteUserForm` (invalid submit shows field errors; valid submit reaches MSW and renders the created user), `MarkdownView` (renders a GFM table; code fence gains shiki markup), `RichTextEditor` (typed bold text serializes to `**bold**` markdown), `StackFlow` (renders the architecture nodes). jsdom gains a `ResizeObserver` stub in `src/test/setup.ts` (xyflow requires it), joining the existing `matchMedia` and `localStorage` stubs.
- **Storybook:** a story per new organism under `Organisms/`; `MarkdownView` and `InviteUserForm` stories exercise MSW where they fetch/post. The demos index and route files, being pages, get no stories (unchanged rule).
- **Playwright:** one `e2e/demos.spec.ts` walking the index into each page with one real interaction apiece: type in the editor and see the preview update, edit markdown source and see the render change, drag a flow node, submit the form invalid (see an error) then valid (see the confirmation).

## Out of Scope

- Persisting anything (documents, node positions, invites) — MSW remains stateless by design.
- Collaborative editing, editor file/image uploads, full slash-command menus (mentions only).
- Custom xyflow node editing UI or auto-layout.
- Real AI/streaming backends.
- Animating data-bearing pages (motion stays on the index).
