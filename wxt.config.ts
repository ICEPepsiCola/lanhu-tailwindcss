import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    plugins: [react()],
  }),
  srcDir: 'src',
  manifest: {
    permissions: ['clipboardWrite', 'notifications', 'storage', 'fileSystemProvider']
  }
});
