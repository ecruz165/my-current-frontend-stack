import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/')({ component: HomePage });

function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <main className="mx-auto max-w-4xl p-8">
      <Card>
        <CardHeader>
          <CardTitle>Hello, world</CardTitle>
          <CardDescription>
            React 19 + Vite + Tailwind v4 + shadcn/ui, wired together.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setCount((c) => c + 1)}>
            Clicked {count} {count === 1 ? 'time' : 'times'}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
