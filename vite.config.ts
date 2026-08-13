/// <reference types="vitest/config" />
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  // Deterministic port for Playwright's webServer health check.
  server: { port: 5173, strictPort: true },
  // Code-split routes are lazily discovered by default; crawling them at
  // startup prevents mid-session re-optimization full-reloads, which can
  // wipe in-page state while parallel e2e specs share the dev server.
  optimizeDeps: { entries: ['index.html', 'src/routes/**/*.tsx'] },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // Unit tests live in src/; e2e/*.spec.ts belongs to Playwright.
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
