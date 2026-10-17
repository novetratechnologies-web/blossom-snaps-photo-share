import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: false,
  server: {
    fs: {
      deny: ['.env', '.env.*', '*.{crt,pem,key,p12,pfx,cer,der}', '.npmrc', '.yarnrc.yml', '**/.git/**', '**/storage/**'],
    },
    watch: {
      // Uploaded originals are private application data, not frontend source.
      // Watching them can crash Chokidar when PHP writes large files on Windows.
      ignored: ['**/storage/**'],
    },
    proxy: {
      '/api': 'http://127.0.0.1:8766',
    },
  },
  build: {
    outDir: 'public',
    emptyOutDir: false,
  },
});
