# Library Demos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/demos` section — animated index plus four composed pages (editor, markdown, flow, form) — so every staged library is visibly exercised, restoring the parent spec's "every library earns its place" rule.

**Architecture:** A nested layout route (`src/routes/demos/route.tsx`, the app's first) hosts an index and four pages. Four new organisms carry the substance (`RichTextEditor`, `MarkdownView`, `StackFlow`, `InviteUserForm`), each with a test and a story. Two new MSW handlers (`GET /api/stream`, `POST /api/invites`) join the shared handlers module; the invite flow shares one Zod schema between client validation and the mocked server.

**Tech Stack (all already installed unless noted):** tiptap 3 suite + tiptap-markdown, marked, react-markdown + remark-gfm + remark-breaks, shiki, streamdown, mermaid, @xyflow/react, react-hook-form + `@hookform/resolvers` (**new dep**), react-resizable-panels, motion, @tanstack/react-query-devtools.

**Spec:** `docs/superpowers/specs/2026-08-12-library-demos-design.md`

## Global Constraints

- Everything from the parent plan still holds: Biome sole linter (`npm run check` clean at every task end), strict TS, `@/` alias, semantic color tokens only, `dark` class logic stays in `theme.tsx`/`preview.ts`, stories titled `Organisms/…`, commit per task on `main`.
- **Verification chain per task** (unless the task says otherwise): `npm test`, `npm run build`, `npm run check`, `npm run build-storybook` — run with `set -o pipefail`; never read exit codes through a pipe without it.
- All five demo route files are created as shells in Task 1 **before** anything links to them — the typed router rejects `<Link>` targets that don't exist yet (lesson from the `/users` sequencing bug).
- After installing any new runtime dependency, restart any long-running dev server before browser testing (Vite's pre-bundled dep cache does not pick up new majors/new deps mid-flight).
- Demo-page glue (toolbars, pickers, panel wiring, node data) lives beside its single consumer; only the four named organisms get atomic-level homes.
- The sample markdown document lives in `src/mocks/sampleMarkdown.ts` — the stream handler and the markdown page both need it, and mocks is the shared home (small, deliberate deviation from the spec's "sample documents live in the route file").
- e2e specs live in `e2e/`; Vitest is scoped to `src/**/*.test.{ts,tsx}` and must stay that way.

---

### Task 1: Demos section scaffold — nested layout + five route shells + header link

**Files:**
- Create: `src/routes/demos/route.tsx`, `src/routes/demos/index.tsx`, `src/routes/demos/editor.tsx`, `src/routes/demos/markdown.tsx`, `src/routes/demos/flow.tsx`, `src/routes/demos/form.tsx`
- Modify: `src/components/organisms/AppHeader.tsx`, `src/routeTree.gen.ts` (regenerated — commit it)

**Interfaces:**
- Consumes: existing `AppHeader`, router conventions.
- Produces: routes `/demos`, `/demos/editor`, `/demos/markdown`, `/demos/flow`, `/demos/form` — all typed `<Link>` targets from here on. Layout renders a sub-nav (`aria-label="Demos"`) + `<Outlet/>`. Tasks 2/8/10/12/13 replace shell page bodies.

- [ ] **Step 1: Create the section layout**

`src/routes/demos/route.tsx`:

```tsx
import { Link, Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/demos')({ component: DemosLayout });

const subNavLink =
  'text-sm text-muted-foreground transition-colors hover:text-foreground';
const activeProps = { className: 'font-medium text-foreground' };

function DemosLayout() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <nav aria-label="Demos" className="mb-6 flex items-center gap-4">
        <Link
          to="/demos"
          className={subNavLink}
          activeProps={activeProps}
          activeOptions={{ exact: true }}
        >
          Overview
        </Link>
        <Link to="/demos/editor" className={subNavLink} activeProps={activeProps}>
          Editor
        </Link>
        <Link to="/demos/markdown" className={subNavLink} activeProps={activeProps}>
          Markdown
        </Link>
        <Link to="/demos/flow" className={subNavLink} activeProps={activeProps}>
          Flow
        </Link>
        <Link to="/demos/form" className={subNavLink} activeProps={activeProps}>
          Form
        </Link>
      </nav>
      <Outlet />
    </main>
  );
}
```

- [ ] **Step 2: Create the five shells**

`src/routes/demos/index.tsx` (Task 2 replaces the body):

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/demos/')({ component: DemosIndexPage });

function DemosIndexPage() {
  return <h1 className="text-2xl font-semibold">Demos</h1>;
}
```

`src/routes/demos/editor.tsx` — same shape with `createFileRoute('/demos/editor')`, component `EditorDemoPage`, heading `Rich text editor`. Repeat for `markdown.tsx` (`/demos/markdown`, `Markdown pipeline`), `flow.tsx` (`/demos/flow`, `Architecture flow`), `form.tsx` (`/demos/form`, `Invite a user`) — each file is the index shell with route path, component name, and heading swapped.

- [ ] **Step 3: Add the header link (non-exact so it stays active on children)**

In `src/components/organisms/AppHeader.tsx`, after the Users link:

```tsx
<Link to="/demos" className={linkClass} activeProps={activeProps}>
  Demos
</Link>
```

- [ ] **Step 4: Regenerate the route tree and verify**

```bash
set -o pipefail
npx vite build > /dev/null 2>&1
npm test 2>&1 | grep 'Tests ' && npm run build | tail -1 && npm run check | tail -1 && npm run build-storybook 2>&1 | tail -1
```

Expected: all green; `src/routeTree.gen.ts` now contains the five `/demos` paths.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: scaffold /demos nested layout with route shells and nav"
```

---

### Task 2: Demos index — motion-animated cards

**Files:**
- Modify: `src/routes/demos/index.tsx`

**Interfaces:**
- Consumes: shadcn `Card*`, routes from Task 1, `motion/react`.
- Produces: the animated index page; the four card links define the demo titles the e2e spec (Task 13) clicks: `Rich text editor`, `Markdown pipeline`, `Architecture flow`, `Invite a user`.

- [ ] **Step 1: Implement the page**

Replace `src/routes/demos/index.tsx` with:

```tsx
import { Link, createFileRoute } from '@tanstack/react-router';
import { motion } from 'motion/react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/demos/')({ component: DemosIndexPage });

const demos = [
  {
    to: '/demos/editor',
    title: 'Rich text editor',
    description: 'tiptap + markdown round trip with @-mentions',
  },
  {
    to: '/demos/markdown',
    title: 'Markdown pipeline',
    description: 'react-markdown, shiki, mermaid, and streaming via streamdown',
  },
  {
    to: '/demos/flow',
    title: 'Architecture flow',
    description: 'this repo’s architecture as a draggable xyflow canvas',
  },
  {
    to: '/demos/form',
    title: 'Invite a user',
    description: 'react-hook-form + Zod, validated on both sides of the wire',
  },
] as const;

function DemosIndexPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Demos</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {demos.map((demo, index) => (
          <motion.div
            key={demo.to}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            whileHover={{ y: -4 }}
          >
            <Link to={demo.to} className="block h-full">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>{demo.title}</CardTitle>
                  <CardDescription>{demo.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify + commit**

Run the standard verification chain, then:

```bash
git add -A && git commit -m "feat: add motion-animated demos index cards"
```

---

### Task 3: InviteUserSchema (TDD)

**Files:**
- Modify: `src/schemas/user.ts`, `src/schemas/user.test.ts`

**Interfaces:**
- Consumes: `UserSchema`.
- Produces: `InviteUserSchema = UserSchema.omit({ id: true })` and `type InviteUser = z.infer<typeof InviteUserSchema>` — consumed by Task 4's handler and Task 7's form.

- [ ] **Step 1: Failing test first** — append to `src/schemas/user.test.ts`:

```ts
describe('InviteUserSchema', () => {
  it('accepts a user without an id', () => {
    const { id: _id, ...invite } = validUser;
    expect(InviteUserSchema.parse(invite)).toEqual(invite);
  });

  it('rejects an id field (strict shape: invites have no id)', () => {
    expect(InviteUserSchema.parse(validUser)).not.toHaveProperty('id');
  });

  it('rejects a malformed invite', () => {
    expect(() =>
      InviteUserSchema.parse({ name: 'X', email: 'nope', status: 'active' }),
    ).toThrow();
  });
});
```

Add `InviteUserSchema` to the existing import from `./user`. Run `npm test` — expected: FAIL (no such export).

- [ ] **Step 2: Implement** — append to `src/schemas/user.ts`:

```ts
export const InviteUserSchema = UserSchema.omit({ id: true });

export type InviteUser = z.infer<typeof InviteUserSchema>;
```

- [ ] **Step 3: Verify + commit**

`npm test` green, standard chain, then commit: `feat: add InviteUserSchema derived from UserSchema`.

---

### Task 4: MSW handler — POST /api/invites (TDD)

**Files:**
- Modify: `src/mocks/handlers.ts`, `src/mocks/handlers.test.ts`

**Interfaces:**
- Consumes: `InviteUserSchema` (Task 3).
- Produces: `POST /api/invites` → `201` + created `User` (server-assigned id) on valid body; `400` + `{ issues }` on invalid. Task 7's mutation posts here.

- [ ] **Step 1: Failing tests first** — append to `src/mocks/handlers.test.ts`:

```ts
describe('POST /api/invites handler', () => {
  it('creates a user from a valid invite', async () => {
    const response = await fetch('/api/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Nia Adeyemi',
        email: 'nia.adeyemi@example.com',
        status: 'invited',
      }),
    });
    expect(response.status).toBe(201);
    const created = UserSchema.parse(await response.json());
    expect(created.name).toBe('Nia Adeyemi');
    expect(created.id).toMatch(/^u-/);
  });

  it('rejects an invalid invite with the Zod issues', async () => {
    const response = await fetch('/api/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: 'nope', status: 'ghost' }),
    });
    expect(response.status).toBe(400);
    const body = (await response.json()) as { issues: unknown[] };
    expect(body.issues.length).toBeGreaterThan(0);
  });
});
```

Run `npm test` — expected: both FAIL (`onUnhandledRequest: 'error'` rejects the unhandled POST).

- [ ] **Step 2: Implement** — in `src/mocks/handlers.ts`, add to the array (and import `InviteUserSchema`):

```ts
http.post('/api/invites', async ({ request }) => {
  await delay(300);
  const result = InviteUserSchema.safeParse(await request.json());
  if (!result.success) {
    return HttpResponse.json({ issues: result.error.issues }, { status: 400 });
  }
  // Stateless by design: the created user is returned, never stored.
  const id = `u-${Math.random().toString(36).slice(2, 8)}`;
  return HttpResponse.json({ id, ...result.data }, { status: 201 });
}),
```

- [ ] **Step 3: Verify + commit** — standard chain; commit: `feat: add Zod-validated POST /api/invites handler`.

---

### Task 5: Sample document + MSW handler — GET /api/stream (TDD)

**Files:**
- Create: `src/mocks/sampleMarkdown.ts`
- Modify: `src/mocks/handlers.ts`, `src/mocks/handlers.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `SAMPLE_MARKDOWN` string export (GFM table, task list, strikethrough, a TypeScript code fence, a mermaid fence) and `GET /api/stream` emitting it as a chunked `text/plain` stream. Task 8 seeds the markdown page with the same constant; Task 8's stream toggle reads this endpoint.

- [ ] **Step 1: Create the sample document**

`src/mocks/sampleMarkdown.ts`:

````ts
export const SAMPLE_MARKDOWN = `# Markdown pipeline

This document exercises the full rendering pipeline.

## GFM

| Library | Role |
| --- | --- |
| react-markdown | renderer |
| shiki | highlighting |

- [x] tables
- [ ] ~~regrets~~

## Code

\`\`\`ts
export function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Diagram

\`\`\`mermaid
flowchart LR
  Editor --> Markdown --> HTML
\`\`\`
`;
````

- [ ] **Step 2: Failing test first** — append to `src/mocks/handlers.test.ts`:

```ts
describe('GET /api/stream handler', () => {
  it('streams the sample markdown in chunks', async () => {
    const response = await fetch('/api/stream');
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(SAMPLE_MARKDOWN);
  });
});
```

(import `SAMPLE_MARKDOWN`). Run `npm test` — expected: FAIL (unhandled request).

- [ ] **Step 3: Implement** — add to `src/mocks/handlers.ts`:

```ts
http.get('/api/stream', () => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < SAMPLE_MARKDOWN.length; i += 24) {
        controller.enqueue(encoder.encode(SAMPLE_MARKDOWN.slice(i, i + 24)));
        await delay(50);
      }
      controller.close();
    },
  });
  return new HttpResponse(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}),
```

- [ ] **Step 4: Verify + commit** — standard chain; commit: `feat: add chunked GET /api/stream handler with shared sample markdown`.

---

### Task 6: Form dependencies — @hookform/resolvers + shadcn input/label

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `src/components/ui/input.tsx`, `src/components/ui/label.tsx` (generated)

- [ ] **Step 1: Install**

```bash
npm install @hookform/resolvers
npx shadcn@latest add input label -y -o
```

- [ ] **Step 2: Verify + commit** — standard chain (Biome override already exempts `ui/`; run `npm run format` once if generated files report diffs); commit: `feat: add @hookform/resolvers and shadcn input/label`.

---

### Task 7: InviteUserForm organism + /demos/form page (TDD)

**Files:**
- Create: `src/components/organisms/InviteUserForm.test.tsx`, `InviteUserForm.tsx`, `InviteUserForm.stories.tsx`
- Modify: `src/routes/demos/form.tsx`

**Interfaces:**
- Consumes: `InviteUserSchema`/`InviteUser` (Task 3), `POST /api/invites` (Task 4), shadcn `input`/`label`/`Button` (Task 6), `useMutation`.
- Produces: `InviteUserForm()` — no props. Fields `Name`, `Email`, `Status` (native select), submit button `Send invite`; client Zod errors inline per field; success renders `role="status"` text `Invited <name>`; server rejection renders `role="alert"`.

- [ ] **Step 1: Failing tests first**

`src/components/organisms/InviteUserForm.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { InviteUserForm } from './InviteUserForm';

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <InviteUserForm />
    </QueryClientProvider>,
  );
}

describe('InviteUserForm', () => {
  it('shows Zod field errors and never hits the network on invalid submit', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Send invite' }));
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('submits a valid invite through MSW and shows the confirmation', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.type(screen.getByLabelText('Name'), 'Nia Adeyemi');
    await user.type(screen.getByLabelText('Email'), 'nia.adeyemi@example.com');
    await user.selectOptions(screen.getByLabelText('Status'), 'invited');
    await user.click(screen.getByRole('button', { name: 'Send invite' }));
    expect(
      await screen.findByRole('status', undefined, { timeout: 3000 }),
    ).toHaveTextContent('Invited Nia Adeyemi');
  });
});
```

Run `npm test` — expected: FAIL (module missing).

- [ ] **Step 2: Implement the organism**

`src/components/organisms/InviteUserForm.tsx`:

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type InviteUser, InviteUserSchema, type User } from '@/schemas/user';

async function postInvite(invite: InviteUser): Promise<User> {
  const response = await fetch('/api/invites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invite),
  });
  if (!response.ok) {
    throw new Error(`Invite rejected: ${response.status}`);
  }
  return (await response.json()) as User;
}

export function InviteUserForm() {
  const form = useForm<InviteUser>({
    resolver: zodResolver(InviteUserSchema),
    defaultValues: { name: '', email: '', status: 'invited' },
  });
  const mutation = useMutation({ mutationFn: postInvite });

  return (
    <form
      className="max-w-md space-y-4"
      onSubmit={form.handleSubmit((invite) => mutation.mutate(invite))}
      noValidate
    >
      <div className="space-y-1">
        <Label htmlFor="invite-name">Name</Label>
        <Input id="invite-name" {...form.register('name')} />
        {form.formState.errors.name && (
          <p role="alert" className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="invite-email">Email</Label>
        <Input id="invite-email" type="email" {...form.register('email')} />
        {form.formState.errors.email && (
          <p role="alert" className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="invite-status">Status</Label>
        <select
          id="invite-status"
          className="border-input bg-background flex h-8 w-full rounded-md border px-2.5 text-sm"
          {...form.register('status')}
        >
          <option value="active">active</option>
          <option value="invited">invited</option>
          <option value="suspended">suspended</option>
        </select>
      </div>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Sending…' : 'Send invite'}
      </Button>
      {mutation.isSuccess && (
        <p role="status" className="text-sm">
          Invited {mutation.data.name} ({mutation.data.id})
        </p>
      )}
      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error.message}
        </p>
      )}
    </form>
  );
}
```

Run `npm test` — expected: green.

- [ ] **Step 3: Page + story**

`src/routes/demos/form.tsx` body: heading `Invite a user`, a one-line explainer (`One Zod schema validates on both sides of the wire.`), and `<InviteUserForm />`.

`src/components/organisms/InviteUserForm.stories.tsx` — title `Organisms/InviteUserForm`, fresh-`QueryClient` decorator (copy the UsersTable story decorator), `parameters: { msw: { handlers } }` importing the shared handlers.

- [ ] **Step 4: Verify + commit** — standard chain; commit: `feat: add InviteUserForm with shared-schema mutation and /demos/form page`.

---

### Task 8: MarkdownView organism + /demos/markdown page (TDD)

**Files:**
- Create: `src/components/organisms/MarkdownView.test.tsx`, `MarkdownView.tsx`, `MarkdownView.stories.tsx`
- Modify: `src/routes/demos/markdown.tsx`, `src/index.css` (shiki dual-theme CSS)

**Interfaces:**
- Consumes: `SAMPLE_MARKDOWN` + `GET /api/stream` (Task 5), react-markdown/remark-gfm/remark-breaks/shiki/mermaid/streamdown/react-resizable-panels.
- Produces: `MarkdownView({ markdown }: { markdown: string })` — renders GFM; code fences highlighted by shiki (`.shiki` class present); ` ```mermaid ` fences rendered to SVG (falls back to a plain `<pre>` on render failure, e.g. in jsdom).

- [ ] **Step 1: Failing tests first**

`src/components/organisms/MarkdownView.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownView } from './MarkdownView';

describe('MarkdownView', () => {
  it('renders GFM tables', async () => {
    render(<MarkdownView markdown={'| a | b |\n| - | - |\n| 1 | 2 |'} />);
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });

  it('highlights code fences with shiki', async () => {
    const { container } = render(
      <MarkdownView markdown={'```ts\nconst x: number = 1;\n```'} />,
    );
    await screen.findByText(/const/, undefined, { timeout: 5000 });
    expect(container.querySelector('pre.shiki')).toBeInTheDocument();
  });
});
```

Run `npm test` — expected: FAIL (module missing).

- [ ] **Step 2: Implement the organism**

`src/components/organisms/MarkdownView.tsx`:

```tsx
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { codeToHtml } from 'shiki';

function ShikiBlock({ code, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    codeToHtml(code, {
      lang,
      themes: { light: 'github-light', dark: 'github-dark' },
    })
      .then((result) => {
        if (!cancelled) setHtml(result);
      })
      .catch(() => {
        if (!cancelled) setHtml(null);
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  if (!html) return <pre className="overflow-x-auto text-sm">{code}</pre>;
  // Shiki output is generated locally from the page's own source text.
  // biome-ignore lint/security/noDangerouslySetInnerHtml: local shiki output
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

function MermaidBlock({ code }: { code: string }) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    import('mermaid')
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
        const { svg: rendered } = await mermaid.render(
          `mmd-${Math.random().toString(36).slice(2)}`,
          code,
        );
        if (!cancelled) setSvg(rendered);
      })
      .catch(() => {
        if (!cancelled) setSvg(null); // jsdom / bad diagrams: plain fallback
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (!svg) return <pre className="overflow-x-auto text-sm">{code}</pre>;
  // biome-ignore lint/security/noDangerouslySetInnerHtml: local mermaid output
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function MarkdownView({ markdown }: { markdown: string }) {
  return (
    <div className="prose-sm max-w-none space-y-3 [&_table]:w-full [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          code({ className, children }) {
            const language = /language-(\w+)/.exec(className ?? '')?.[1];
            const code = String(children).replace(/\n$/, '');
            if (language === 'mermaid') return <MermaidBlock code={code} />;
            if (language) return <ShikiBlock code={code} lang={language} />;
            return <code className="rounded bg-muted px-1">{children}</code>;
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
```

Append to `src/index.css` (after the `color-scheme` block — this file is Biome-excluded):

```css
.dark .shiki,
.dark .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}
```

Run `npm test` — expected: green (mermaid falls back cleanly in jsdom; shiki runs fine there).

- [ ] **Step 3: Page with panels + streaming toggle**

Replace `src/routes/demos/markdown.tsx` body:

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Streamdown } from 'streamdown';
import { MarkdownView } from '@/components/organisms/MarkdownView';
import { Button } from '@/components/ui/button';
import { SAMPLE_MARKDOWN } from '@/mocks/sampleMarkdown';

export const Route = createFileRoute('/demos/markdown')({
  component: MarkdownDemoPage,
});

function MarkdownDemoPage() {
  const [source, setSource] = useState(SAMPLE_MARKDOWN);
  const [streamed, setStreamed] = useState<string | null>(null);

  async function streamIt() {
    setStreamed('');
    const response = await fetch('/api/stream');
    if (!response.body) return;
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      setStreamed((current) => (current ?? '') + value);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Markdown pipeline</h1>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={streamIt}>
            Stream it
          </Button>
          {streamed !== null && (
            <Button type="button" variant="ghost" onClick={() => setStreamed(null)}>
              Back to live editing
            </Button>
          )}
        </div>
      </div>
      <PanelGroup direction="horizontal" className="min-h-[24rem] rounded-md border">
        <Panel defaultSize={50} minSize={25}>
          <textarea
            aria-label="Markdown source"
            className="size-full resize-none bg-background p-4 font-mono text-sm outline-none"
            value={source}
            onChange={(event) => setSource(event.target.value)}
          />
        </Panel>
        <PanelResizeHandle className="w-1 bg-border" />
        <Panel minSize={25}>
          <div className="size-full overflow-auto p-4">
            {streamed !== null ? (
              <Streamdown>{streamed}</Streamdown>
            ) : (
              <MarkdownView markdown={source} />
            )}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
```

(If `streamdown`'s component signature differs from `<Streamdown>{text}</Streamdown>`, check `node_modules/streamdown/dist/*.d.ts` for the actual prop shape — ground truth over guessing.)

- [ ] **Step 4: Story**

`src/components/organisms/MarkdownView.stories.tsx` — title `Organisms/MarkdownView`, one story: `args: { markdown: SAMPLE_MARKDOWN }` (no decorators needed; imports `SAMPLE_MARKDOWN`).

- [ ] **Step 5: Verify + commit** — standard chain; commit: `feat: add MarkdownView pipeline and /demos/markdown page with streaming`.

---

### Task 9: ResizeObserver stub (for xyflow)

**Files:**
- Modify: `src/test/setup.ts`

**Interfaces:**
- Produces: global `ResizeObserver` in jsdom — Task 10's `StackFlow` test needs it.

- [ ] **Step 1: Append to `src/test/setup.ts`**

```ts
// jsdom lacks ResizeObserver; @xyflow/react measures its canvas with it.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverStub,
});
```

- [ ] **Step 2: Verify + commit** — `npm test` green; commit: `test: stub ResizeObserver for xyflow in jsdom`.

---

### Task 10: StackFlow organism + /demos/flow page (TDD)

**Files:**
- Create: `src/components/organisms/stackFlowData.ts`, `StackFlow.test.tsx`, `StackFlow.tsx`, `StackFlow.stories.tsx`
- Modify: `src/routes/demos/flow.tsx`

**Interfaces:**
- Consumes: `@xyflow/react`, ResizeObserver stub (Task 9).
- Produces: `StackFlow()` — no props; renders the architecture nodes (labels include `main.tsx`, `TanStack Router`, `UsersTable`, `MSW`), draggable, with MiniMap/Controls/Background.

- [ ] **Step 1: Node data**

`src/components/organisms/stackFlowData.ts`:

```ts
import type { Edge, Node } from '@xyflow/react';

export const stackNodes: Node[] = [
  { id: 'main', position: { x: 250, y: 0 }, data: { label: 'main.tsx (Theme + Query providers)' } },
  { id: 'router', position: { x: 250, y: 90 }, data: { label: 'TanStack Router (__root template)' } },
  { id: 'home', position: { x: 60, y: 180 }, data: { label: '/ hello page' } },
  { id: 'users', position: { x: 250, y: 180 }, data: { label: '/users page' } },
  { id: 'demos', position: { x: 440, y: 180 }, data: { label: '/demos section' } },
  { id: 'table', position: { x: 250, y: 270 }, data: { label: 'UsersTable (Query + Table + dnd-kit)' } },
  { id: 'api', position: { x: 250, y: 360 }, data: { label: 'fetchUsers (Zod boundary)' } },
  { id: 'msw', position: { x: 250, y: 450 }, data: { label: 'MSW handlers (mock backend)' } },
];

export const stackEdges: Edge[] = [
  { id: 'main-router', source: 'main', target: 'router', animated: true },
  { id: 'router-home', source: 'router', target: 'home' },
  { id: 'router-users', source: 'router', target: 'users' },
  { id: 'router-demos', source: 'router', target: 'demos' },
  { id: 'users-table', source: 'users', target: 'table' },
  { id: 'table-api', source: 'table', target: 'api' },
  { id: 'api-msw', source: 'api', target: 'msw', animated: true },
];
```

- [ ] **Step 2: Failing test first**

`src/components/organisms/StackFlow.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StackFlow } from './StackFlow';

describe('StackFlow', () => {
  it('renders the architecture nodes', async () => {
    render(<StackFlow />);
    expect(await screen.findByText(/main\.tsx/)).toBeInTheDocument();
    expect(screen.getByText(/MSW handlers/)).toBeInTheDocument();
    expect(screen.getByText(/UsersTable/)).toBeInTheDocument();
  });
});
```

Run `npm test` — expected: FAIL (module missing).

- [ ] **Step 3: Implement**

`src/components/organisms/StackFlow.tsx`:

```tsx
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { stackEdges, stackNodes } from './stackFlowData';

export function StackFlow() {
  const [nodes, , onNodesChange] = useNodesState(stackNodes);
  const [edges, , onEdgesChange] = useEdgesState(stackEdges);

  return (
    <div className="h-[32rem] rounded-md border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        colorMode="system"
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
```

- [ ] **Step 4: Page + story**

`src/routes/demos/flow.tsx` body: heading `Architecture flow`, explainer `This repo, documenting itself — drag the nodes.`, `<StackFlow />`.

`src/components/organisms/StackFlow.stories.tsx` — title `Organisms/StackFlow`, single `Default` story, no decorators.

- [ ] **Step 5: Verify + commit** — standard chain; commit: `feat: add StackFlow architecture canvas and /demos/flow page`.

---

### Task 11: RichTextEditor organism + /demos/editor page (TDD)

**Files:**
- Create: `src/components/organisms/RichTextEditor.test.tsx`, `RichTextEditor.tsx`, `RichTextEditor.stories.tsx`
- Modify: `src/routes/demos/editor.tsx`

**Interfaces:**
- Consumes: tiptap suite, tiptap-markdown, fixture `users` (mentions), `marked` (page preview).
- Produces: `RichTextEditor({ initialMarkdown?, onMarkdownChange?, onReady? })` — `onMarkdownChange` fires with the serialized markdown on every doc change; `onReady` hands out the tiptap `Editor` (exists for tests and stories to drive commands — jsdom cannot type into contenteditable reliably). Typing `@` opens a fixture-user mention picker.

- [ ] **Step 1: Failing test first**

`src/components/organisms/RichTextEditor.test.tsx`:

```tsx
import { render, waitFor } from '@testing-library/react';
import type { Editor } from '@tiptap/react';
import { describe, expect, it } from 'vitest';
import { RichTextEditor } from './RichTextEditor';

describe('RichTextEditor', () => {
  it('serializes bold text to markdown', async () => {
    let editor: Editor | null = null;
    let markdown = '';
    render(
      <RichTextEditor
        onReady={(instance) => {
          editor = instance;
        }}
        onMarkdownChange={(value) => {
          markdown = value;
        }}
      />,
    );
    await waitFor(() => expect(editor).not.toBeNull());
    editor?.chain().focus().insertContent('hello').selectAll().toggleBold().run();
    await waitFor(() => expect(markdown).toContain('**hello**'));
  });

  it('round-trips initial markdown', async () => {
    let editor: Editor | null = null;
    render(
      <RichTextEditor
        initialMarkdown="# Title"
        onReady={(instance) => {
          editor = instance;
        }}
      />,
    );
    await waitFor(() =>
      expect(editor?.getHTML()).toContain('<h1>Title</h1>'),
    );
  });
});
```

Run `npm test` — expected: FAIL (module missing).

- [ ] **Step 2: Implement the organism**

`src/components/organisms/RichTextEditor.tsx` — the mention picker is a manually positioned popup driven by `@tiptap/suggestion` (no positioning library installed; `props.clientRect` supplies coordinates):

```tsx
import { mergeAttributes, Node } from '@tiptap/core';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Placeholder } from '@tiptap/extensions';
import { PluginKey } from '@tiptap/pm/state';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Suggestion, { type SuggestionProps } from '@tiptap/suggestion';
import { useEffect } from 'react';
import { Markdown } from 'tiptap-markdown';
import { Button } from '@/components/ui/button';
import { users } from '@/mocks/fixtures';
import type { User } from '@/schemas/user';

const UserMention = Node.create({
  name: 'mention',
  group: 'inline',
  inline: true,
  atom: true,
  addAttributes() {
    return { id: { default: null }, label: { default: null } };
  },
  parseHTML() {
    return [{ tag: 'span[data-mention-id]' }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-mention-id': node.attrs.id,
        class: 'rounded bg-secondary px-1 font-medium',
      }),
      `@${node.attrs.label}`,
    ];
  },
  renderText({ node }) {
    return `@${node.attrs.label}`;
  },
  addStorage() {
    return {
      markdown: {
        serialize(state: { write: (text: string) => void }, node: { attrs: { label: string } }) {
          state.write(`@${node.attrs.label}`);
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion<User>({
        editor: this.editor,
        char: '@',
        pluginKey: new PluginKey('userMention'),
        items: ({ query }) =>
          users
            .filter((user) =>
              user.name.toLowerCase().includes(query.toLowerCase()),
            )
            .slice(0, 5),
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              { type: 'mention', attrs: { id: props.id, label: props.name } },
              { type: 'text', text: ' ' },
            ])
            .run();
        },
        render: () => {
          let popup: HTMLDivElement | null = null;

          const paint = (props: SuggestionProps<User>) => {
            if (!popup) return;
            popup.innerHTML = '';
            for (const item of props.items) {
              const button = document.createElement('button');
              button.type = 'button';
              button.textContent = item.name;
              button.className =
                'block w-full px-2 py-1 text-left text-sm hover:bg-accent';
              button.addEventListener('click', () => props.command(item));
              popup.appendChild(button);
            }
            const rect = props.clientRect?.();
            if (rect) {
              popup.style.left = `${rect.left + window.scrollX}px`;
              popup.style.top = `${rect.bottom + window.scrollY + 4}px`;
            }
          };

          return {
            onStart: (props) => {
              popup = document.createElement('div');
              popup.className =
                'absolute z-50 rounded-md border bg-popover text-popover-foreground shadow-md';
              popup.setAttribute('data-mention-popup', '');
              document.body.appendChild(popup);
              paint(props);
            },
            onUpdate: paint,
            onKeyDown: ({ event }) => {
              if (event.key === 'Escape') {
                popup?.remove();
                popup = null;
                return true;
              }
              return false;
            },
            onExit: () => {
              popup?.remove();
              popup = null;
            },
          };
        },
      }),
    ];
  },
});

interface RichTextEditorProps {
  initialMarkdown?: string;
  onMarkdownChange?: (markdown: string) => void;
  // Test/story hook: jsdom cannot type into contenteditable, so consumers
  // drive the editor through its command API instead.
  onReady?: (editor: Editor) => void;
}

export function RichTextEditor({
  initialMarkdown = '',
  onMarkdownChange,
  onReady,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write something… try @ to mention' }),
      Markdown,
      UserMention,
    ],
    content: initialMarkdown,
    editorProps: {
      attributes: {
        class:
          'prose-sm min-h-[16rem] max-w-none rounded-md border p-4 outline-none',
      },
    },
    onUpdate: ({ editor: instance }) => {
      onMarkdownChange?.(instance.storage.markdown.getMarkdown());
    },
  });

  useEffect(() => {
    if (editor) onReady?.(editor);
  }, [editor, onReady]);

  if (!editor) return null;

  const marks = [
    { label: 'Bold', run: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
    { label: 'Italic', run: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
    { label: 'Underline', run: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline') },
    {
      label: 'Link',
      // Demo-grade link toggle: applies a fixed href to the selection (a real
      // app would collect the URL in a popover).
      run: () =>
        editor.isActive('link')
          ? editor.chain().focus().unsetLink().run()
          : editor.chain().focus().setLink({ href: 'https://tanstack.com' }).run(),
      active: editor.isActive('link'),
    },
    { label: 'Undo', run: () => editor.chain().focus().undo().run(), active: false },
  ];

  return (
    <div className="space-y-2">
      <div role="toolbar" aria-label="Formatting" className="flex gap-1">
        {marks.map((mark) => (
          <Button
            key={mark.label}
            type="button"
            variant={mark.active ? 'secondary' : 'ghost'}
            size="sm"
            aria-pressed={mark.active}
            onClick={mark.run}
          >
            {mark.label}
          </Button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
```

Run `npm test` — expected: green. (If `tiptap-markdown`'s `Markdown` extension export name differs, check `node_modules/tiptap-markdown/dist/*.d.ts` — ground truth over guessing.)

- [ ] **Step 3: Page with marked preview**

Replace `src/routes/demos/editor.tsx` body:

```tsx
import { createFileRoute } from '@tanstack/react-router';
import { marked } from 'marked';
import { useMemo, useState } from 'react';
import { RichTextEditor } from '@/components/organisms/RichTextEditor';

export const Route = createFileRoute('/demos/editor')({
  component: EditorDemoPage,
});

function EditorDemoPage() {
  const [markdown, setMarkdown] = useState('');
  // Editor-local content only — nothing remote reaches this HTML.
  const html = useMemo(() => marked.parse(markdown, { async: false }), [markdown]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Rich text editor</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <RichTextEditor onMarkdownChange={setMarkdown} />
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            Markdown (tiptap-markdown)
          </h2>
          <pre className="min-h-[8rem] overflow-x-auto rounded-md border bg-muted/30 p-4 text-sm">
            {markdown || '—'}
          </pre>
          <h2 className="text-sm font-medium text-muted-foreground">
            HTML preview (marked)
          </h2>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: editor-local content */}
          <div
            className="min-h-[8rem] rounded-md border p-4"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Story**

`src/components/organisms/RichTextEditor.stories.tsx` — title `Organisms/RichTextEditor`, one story with `args: { initialMarkdown: '# Hello\n\nTry **bold**, _italic_, and @ mentions.' }`.

- [ ] **Step 5: Verify + commit** — standard chain; commit: `feat: add tiptap RichTextEditor with mentions and /demos/editor page`.

---

### Task 12: Query devtools (dev-only)

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Mount behind the DEV gate**

In `src/main.tsx`:

```tsx
import { StrictMode, Suspense, lazy } from 'react';
```

```tsx
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((module) => ({
        default: module.ReactQueryDevtools,
      })),
    )
  : null;
```

Inside `QueryClientProvider`, after `RouterProvider`:

```tsx
{ReactQueryDevtools && (
  <Suspense fallback={null}>
    <ReactQueryDevtools initialIsOpen={false} />
  </Suspense>
)}
```

- [ ] **Step 2: Verify + commit** — standard chain **plus** confirm exclusion from the production bundle: `grep -rl 'ReactQueryDevtools' dist/assets/ || echo "OK: not in prod bundle"`. Commit: `feat: mount TanStack Query devtools in dev only`.

---

### Task 13: e2e — demos walk-through

**Files:**
- Create: `e2e/demos.spec.ts`

**Interfaces:**
- Consumes: everything; card titles from Task 2, form labels from Task 7, editor toolbar from Task 11.

- [ ] **Step 1: Write the spec**

`e2e/demos.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('demos index navigates and each demo responds to one interaction', async ({
  page,
}) => {
  await page.goto('/demos');

  // Editor: toolbar bold + typing reaches the markdown preview.
  await page.getByRole('link', { name: /Rich text editor/ }).click();
  const editorSurface = page.locator('.tiptap');
  await editorSurface.click();
  await page.keyboard.type('hello demo');
  await expect(page.getByText('hello demo').first()).toBeVisible();

  // Markdown: editing the source re-renders the right panel.
  await page.getByRole('link', { name: 'Markdown' }).click();
  const source = page.getByLabel('Markdown source');
  await source.fill('# Live edit proof');
  await expect(
    page.getByRole('heading', { name: 'Live edit proof' }),
  ).toBeVisible();

  // Flow: the architecture nodes render.
  await page.getByRole('link', { name: 'Flow' }).click();
  await expect(page.getByText('MSW handlers (mock backend)')).toBeVisible();

  // Form: invalid submit errors, valid submit confirms through MSW.
  await page.getByRole('link', { name: 'Form' }).click();
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByRole('button', { name: 'Send invite' }).click();
  await expect(page.getByRole('alert').first()).toBeVisible();
  await page.getByLabel('Name').fill('Nia Adeyemi');
  await page.getByLabel('Email').fill('nia.adeyemi@example.com');
  await page.getByRole('button', { name: 'Send invite' }).click();
  await expect(page.getByRole('status')).toContainText('Invited Nia Adeyemi');
});
```

- [ ] **Step 2: Run all e2e**

```bash
set -o pipefail
lsof -ti :5173 | xargs kill 2>/dev/null; rm -rf node_modules/.vite
npm run test:e2e 2>&1 | tail -3
```

Expected: 3 passed (smoke + reorder + demos). The cache clear prevents the stale-prebundle failure mode after the new-dep tasks.

- [ ] **Step 3: Commit** — `test: add demos e2e walk-through`.

---

### Task 14: Full verification sweep

- [ ] **Step 1: All gates**

```bash
set -o pipefail
npm run check 2>&1 | tail -1 && npm test 2>&1 | grep 'Tests ' && npm run build 2>&1 | tail -1 && npm run build-storybook 2>&1 | tail -1 && npm run test:e2e 2>&1 | tail -2
```

Expected: all green.

- [ ] **Step 2: Spec-coverage checks**

```bash
# Every staged library imported somewhere under src/ (or e2e/):
for lib in @tiptap/core @tiptap/suggestion tiptap-markdown marked react-markdown remark-gfm remark-breaks shiki streamdown mermaid @xyflow/react react-hook-form @hookform/resolvers react-resizable-panels motion @tanstack/react-query-devtools; do
  grep -rql "from '$lib" src/ || echo "MISSING: $lib"
done
# Story taxonomy gained the four organisms:
grep -o '"title":"Organisms/[^"]*"' storybook-static/index.json | sort -u
```

Expected: no `MISSING:` lines; `Organisms/` now lists AppHeader, InviteUserForm, MarkdownView, RichTextEditor, StackFlow, ThemeToggle, UsersTable.

- [ ] **Step 3: Commit any stragglers and push**

```bash
git status --short
git add -A && git commit -m "chore: library demos verification fixes" # only if anything changed
```
