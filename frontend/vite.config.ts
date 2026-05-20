import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Defaults to the host port mapped by docker-compose (host 8082 → container 8080).
  // Override via VITE_API_PROXY_TARGET when running the backend on a different port
  // (e.g. `mvn spring-boot:run` defaults to 8080).
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8082';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
  };
});
