import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/agentic-design/landing/',
  plugins: [vue(), tailwindcss()],
  server: { port: 5174 },
  preview: { port: 4175 },
});
