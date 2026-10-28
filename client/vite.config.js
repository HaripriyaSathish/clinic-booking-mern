import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // /api calls go to the Express server, so no CORS issues whatever port Vite ends up on
    proxy: { '/api': 'http://localhost:5000' },
  },
});
