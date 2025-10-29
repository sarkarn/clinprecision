import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@domains': path.resolve(__dirname, '../../packages/domains'),
    },
  },
  server: {
    port: 3000,
  },
});
