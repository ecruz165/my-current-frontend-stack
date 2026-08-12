import { Link } from '@tanstack/react-router';
import { ThemeToggle } from '@/components/molecules/ThemeToggle';

const linkClass =
  'text-sm text-muted-foreground transition-colors hover:text-foreground';
// The router merges activeProps.className with the base className.
const activeProps = { className: 'font-medium text-foreground' };

export function AppHeader() {
  return (
    <header className="border-b">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-4xl items-center gap-6 p-4"
      >
        <span className="font-semibold">hello-stack</span>
        <Link
          to="/"
          className={linkClass}
          activeProps={activeProps}
          activeOptions={{ exact: true }}
        >
          Home
        </Link>
        <Link to="/users" className={linkClass} activeProps={activeProps}>
          Users
        </Link>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
