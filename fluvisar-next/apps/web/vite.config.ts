import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // OneDrive-synced project folder: chokidar's fs events are unreliable here, so HMR was
  // silently skipping edits (browser kept serving stale modules → "fix keno dekhtesena").
  // Polling guarantees edits are detected reliably. node_modules is ignored to keep CPU sane.
  server: {
    proxy: { '/api': 'http://127.0.0.1:8000' },
    watch: {
      usePolling: true,
      interval: 300,
      ignored: ['**/node_modules/**'],
    },
  },
})
