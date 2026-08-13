import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

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
        <Link
          to="/demos/editor"
          className={subNavLink}
          activeProps={activeProps}
        >
          Editor
        </Link>
        <Link
          to="/demos/markdown"
          className={subNavLink}
          activeProps={activeProps}
        >
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
