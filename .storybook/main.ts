import type { StorybookConfig } from '@storybook/vue3-vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

const config: StorybookConfig = {
  stories: ['../packages/ui/src/**/*.stories.ts', '../apps/web/src/**/*.stories.ts'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: { name: '@storybook/vue3-vite', options: { docgen: 'vue-component-meta' } },
  core: { disableTelemetry: true },
  async viteFinal(config) {
    const hasVue = (config.plugins ?? []).flat().some((p) => p && typeof p === 'object' && 'name' in p && p.name === 'vite:vue');
    config.plugins = [...(config.plugins ?? []), ...(hasVue ? [] : [vue()]), tailwindcss()];
    config.resolve = {
      ...config.resolve,
      alias: { ...config.resolve?.alias, '@web': fileURLToPath(new URL('../apps/web/src', import.meta.url)) },
    };
    return config;
  },
};
export default config;
