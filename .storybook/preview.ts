import type { Decorator, Preview } from '@storybook/react-vite';
import { mswLoader } from 'msw-storybook-addon/csf3';
import '../src/index.css';

// Same mechanism as the app: the dark class lives on <html> so
// portal-rendered content stays themed.
const withTheme: Decorator = (Story, context) => {
  document.documentElement.classList.toggle(
    'dark',
    context.globals.theme === 'dark',
  );
  return Story();
};

const preview: Preview = {
  loaders: [mswLoader()],
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
};

export default preview;
