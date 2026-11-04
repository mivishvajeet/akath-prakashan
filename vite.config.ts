import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

/**
 * Ensures the Vite public base URL always has a leading and trailing slash
 * (e.g., '/' for root deployments or '/<repo-name>/' for GitHub Pages subpaths).
 */
function normalizePublicBasePath(rawBase?: string): string {
  const trimmed = (rawBase || '').trim();
  if (!trimmed || trimmed === '/' || trimmed === '.' || trimmed === './') {
    return '/';
  }
  const withoutRelativePrefix = trimmed.replace(/^\.+/, '');
  const withLeading = withoutRelativePrefix.startsWith('/')
    ? withoutRelativePrefix
    : `/${withoutRelativePrefix}`;
  const collapsed = withLeading.replace(/\/+/g, '/');
  return collapsed.endsWith('/') ? collapsed : `${collapsed}/`;
}

function resolvePublicBaseUrl(env: Record<string, string>): string {
  // 1. Explicit VITE_BASE_PATH from environment or .env files
  const explicitBase = process.env.VITE_BASE_PATH || env.VITE_BASE_PATH;
  if (explicitBase) {
    return normalizePublicBasePath(explicitBase);
  }

  // 2. Automatic GitHub Actions repository subpath detection (<owner>/<repo>)
  const ghRepo = process.env.GITHUB_REPOSITORY || env.GITHUB_REPOSITORY;
  if (ghRepo && ghRepo.includes('/')) {
    const repoName = ghRepo.split('/')[1]?.trim();
    if (repoName && !repoName.toLowerCase().endsWith('.github.io')) {
      return normalizePublicBasePath(`/${repoName}/`);
    }
  }

  // 3. Default public base URL with a leading slash
  return '/';
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = resolvePublicBaseUrl(env);

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    experimental: {
      renderBuiltUrl(filename) {
        return `${base}${filename.replace(/^\/+/, '')}`;
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
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
