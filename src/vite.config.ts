import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/iptv-dashboard/', // ⚠️ IMPORTANTE: Altere para o nome do seu repositório GitHub
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
