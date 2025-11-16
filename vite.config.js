/**
 * Vite Configuration for Django Integration
 *
 * This configuration sets up Vite to work seamlessly with Django:
 * - Development: Hot Module Replacement (HMR) via dev server
 * - Production: Optimized builds with manifest for Django static files
 */

import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    // Base public path - Django will serve from /static/dist/
    base: isDev ? '/' : '/static/dist/',

    // Root directory for source files
    root: resolve(__dirname, 'resources'),

    // Build configuration
    build: {
      // Output directory relative to project root
      outDir: resolve(__dirname, 'static/dist'),

      // Empty output directory before build
      emptyOutDir: true,

      // Generate manifest for Django to reference hashed files
      manifest: true,

      // Rollup options
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'resources/js/main.js'),
          styles: resolve(__dirname, 'vite-src/css/main.css'),
        },
        output: {
          // Organize output files
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            // CSS files go to css/ directory
            if (assetInfo.name.endsWith('.css')) {
              return 'css/[name]-[hash][extname]';
            }
            // Images and other assets
            return 'assets/[name]-[hash][extname]';
          },
        },
      },

      // Source maps for debugging
      sourcemap: isDev,

      // Minification (disabled in dev for faster builds)
      minify: !isDev,

      // Target modern browsers (ES2020+)
      target: 'es2020',
    },

    // Development server configuration
    server: {
      // Port for Vite dev server
      port: 5173,

      // Enable HMR
      hmr: {
        host: 'localhost',
        port: 5173,
      },

      // Proxy Django server (if needed for API calls during dev)
      proxy: {
        // Proxy API calls to Django
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },

      // Watch for changes
      watch: {
        usePolling: false,
      },
    },

    // Resolve configuration
    resolve: {
      alias: {
        '@': resolve(__dirname, 'resources/js'),
        '@css': resolve(__dirname, 'vite-src/css'),
      },
    },

    // CSS configuration
    css: {
      devSourcemap: true,
      postcss: {
        plugins: [
          // Tailwind CSS v4 handles its own PostCSS internally
        ],
      },
    },

    // Plugin configuration
    plugins: [
      // Copy static assets that don't need processing
      viteStaticCopy({
        targets: [
          {
            src: 'icons/**/*',
            dest: 'assets/icons',
          },
          {
            src: 'favicon.ico',
            dest: 'assets',
          },
        ],
      }),
    ],

    // Optimize dependencies
    optimizeDeps: {
      include: ['alpinejs'],
    },
  };
});
