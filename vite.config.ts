import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

function normalizeBasePath(rawBase?: string): string {
  const segments = (rawBase || '').trim().split('/').filter(Boolean);
  return segments.length ? `/${segments.join('/')}/` : '/';
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const explicitBase = process.env.VITE_BASE_PATH || env.VITE_BASE_PATH;
  return {
    base: normalizeBasePath(explicitBase || '/'),
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': path.resolve(__dirname, '.') } },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/app-bundle.js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name][extname]'
        }
      }
    }
  };
});
