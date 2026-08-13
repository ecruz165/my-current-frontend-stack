import { createFileRoute, Link } from '@tanstack/react-router';
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
    description: "this repo's architecture as a draggable xyflow canvas",
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
