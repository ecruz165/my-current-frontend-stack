import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  framework: { name: '@storybook/react-vite', options: {} },
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', 'msw-storybook-addon'],
  // Serves public/ so MSW's mockServiceWorker.js is reachable from stories.
  staticDirs: ['../public'],
};

export default config;
