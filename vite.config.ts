import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

function normalizeBasePath(rawBase?: string): string {
  const trimmed = (rawBase || '').trim();
  if (!trimmed || trimmed === '/') return '/';
  if (trimmed === '.' || trimmed === './') return './';
  const withoutRelativePrefix = trimmed.replace(/^\.+/, '');
  const withLeading = withoutRelativePrefix.startsWith('/')
    ? withoutRelativePrefix
    : `/${withoutRelativePrefix}`;
  const collapsed = withLeading.replace(/\/+/g, '/');
  return collapsed.endsWith('/') ? collapsed : `${collapsed}/`;
}

function resolveViteBasePath(
  command: 'build' | 'serve',
  env: Record<string, string>
): string {
  const explicitBase = process.env.VITE_BASE_PATH || env.VITE_BASE_PATH;
  if (explicitBase) {
    return normalizeBasePath(explicitBase);
  }
  // Use './' for production builds so dist/ works at any subpath or root
  return command === 'build' ? './' : '/';
}

export default defineConfig(({command, mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = resolveViteBasePath(command, env);

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/app-bundle.js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name][extname]',
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
