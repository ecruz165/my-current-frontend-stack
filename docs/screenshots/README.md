# Screenshots

Captured from the running app (Vite dev server + MSW mock backend), light theme.

## Users table

The sortable users table: MSW-fed rows, dnd-kit drag handles, `StatusBadge` variants.

![Users page](users-page.png)

## Demos

The `/demos` section — every staged library exercised by a composed page.

### Overview

Motion-animated index cards; the palm-tree button (bottom right) is the dev-only TanStack Query devtools toggle.

![Demos index](demos-index.png)

### Rich text editor

tiptap → tiptap-markdown → `marked` round trip: bolded editor text, its markdown serialization, and the HTML preview.

![Editor demo](demos-editor.png)

### Markdown pipeline

react-resizable-panels split: editable source beside the rendered output — GFM table, task list, shiki-highlighted TypeScript, and a mermaid flowchart. "Stream it" replays the document through streamdown from `GET /api/stream`.

![Markdown demo](demos-markdown.png)

### Architecture flow

The repo's own architecture as a draggable xyflow canvas.

![Flow demo](demos-flow.png)

### Invite a user

react-hook-form + Zod with a completed submission — the confirmation id was assigned by the MSW handler after re-validating with the same `InviteUserSchema` the client used.

![Form demo](demos-form.png)
