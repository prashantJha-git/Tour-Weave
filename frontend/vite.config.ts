import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Tour-Weave frontend Vite config. Talks to the Tour-Weave FastAPI backend
// over VITE_API_BASE_URL (see src/api/client.ts) -- this file only concerns
// the dev server / build itself, not the backend connection.
export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
