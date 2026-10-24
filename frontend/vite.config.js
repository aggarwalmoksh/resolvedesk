import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res && res.writeHead && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                error: 'Backend API is currently starting or unreachable on port 4000. Please start your backend with "npm run dev".' 
              }));
            }
          });
        }
      },
      '/telegram': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  }
});
