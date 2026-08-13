// Shared by the /demos/markdown page (initial source) and the /api/stream
// handler (streamed payload) — one document, two consumers.
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
