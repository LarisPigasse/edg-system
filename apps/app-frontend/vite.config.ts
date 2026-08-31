import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { ProxyOptions } from 'vite';
import type { ClientRequest } from 'http';
import path from 'path';

/**
 * app-frontend — portale utenti.
 *
 * I pacchetti @edg/ui e @edg/auth sono workspace locali consumati come sorgente
 * TypeScript: nessuno step di build intermedio, e una modifica al design system
 * si vede subito con l'hot reload.
 */

/** L'Origin del browser non deve sopravvivere al proxy: oltre il salto la
 *  richiesta è server-to-server e il gateway rifiuterebbe un'origine non elencata. */
const stripBrowserOrigin: ProxyOptions['configure'] = proxy => {
  proxy.on('proxyReq', (proxyReq: ClientRequest) => {
    proxyReq.removeHeader('origin');
    proxyReq.removeHeader('referer');
  });
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const platformTarget = env.VITE_PROXY_TARGET || 'http://localhost';
  const logServiceTarget = env.VITE_PROXY_LOG_TARGET || 'http://localhost:4001';

  return {
    plugins: [react(), tailwindcss()],

    server: {
      host: '0.0.0.0',
      port: 5174,
      strictPort: true,
      watch: { usePolling: true, interval: 1000 },
      hmr: true,
      allowedHosts: ['app.edg.local', 'app-frontend', 'localhost', '.localhost', 'api-gateway', 'host.docker.internal'],
      headers: { 'Cache-Control': 'no-cache' },
      proxy: {
        '/auth': { target: platformTarget, changeOrigin: true, secure: false, configure: stripBrowserOrigin },
        '/api': { target: platformTarget, changeOrigin: true, secure: false, configure: stripBrowserOrigin },
        '/log-api': {
          target: logServiceTarget,
          changeOrigin: true,
          secure: false,
          configure: stripBrowserOrigin,
          rewrite: p => p.replace(/^\/log-api/, ''),
        },
      },
    },

    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },

    build: { outDir: 'dist', sourcemap: false, minify: 'esbuild', chunkSizeWarningLimit: 1000 },
    preview: { port: 5174, strictPort: true },
  };
});
