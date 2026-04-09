import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      '@domain': resolve(__dirname, 'src/domain'),
      '@data': resolve(__dirname, 'src/data'),
      '@infrastructure': resolve(__dirname, 'src/infrastructure'),
      '@presentation': resolve(__dirname, 'src/presentation'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
