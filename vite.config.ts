import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill the 'global' variable for sockjs-client
    global: 'window',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
