import type { Preview } from '@storybook/vue3-vite';
import '../packages/ui/src/styles/index.css';
import { BRANDS, MODES } from '../packages/ui/src/themes';

const preview: Preview = {
  globalTypes: {
    brand: {
      description: 'Brand',
      toolbar: { title: 'Brand', icon: 'paintbrush', items: BRANDS.map((b) => ({ value: b, title: b })), dynamicTitle: true },
    },
    mode: {
      description: 'Mode',
      toolbar: { title: 'Mode', icon: 'mirror', items: MODES.map((m) => ({ value: m, title: m })), dynamicTitle: true },
    },
  },
  initialGlobals: { brand: 'pulse', mode: 'dark' },
  decorators: [
    (story, { globals }) => {
      const root = document.documentElement;
      root.dataset.brand = globals.brand ?? 'pulse';
      root.dataset.mode = globals.mode ?? 'dark';
      return story();
    },
  ],
  loaders: [
    // Fonts are self-hosted; wait for them so screenshots and tests never see a fallback font.
    async () => {
      await Promise.all(
        ['400 1em Inter', '600 1em Inter', '800 1em "Barlow Condensed"', '600 1em "Barlow Condensed"'].map((f) => document.fonts.load(f)),
      );
      await document.fonts.ready;
      return {};
    },
  ],
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
    controls: { matchers: { color: /(background|color)$/i } },
  },
};

export default preview;
