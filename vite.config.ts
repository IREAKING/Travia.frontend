import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  server: {
    hmr: {
      // Giảm timeout để tránh cảnh báo khi tab inactive
      clientPort: 5173,
      protocol: 'ws',
    },
    // Tăng timeout cho WebSocket
    watch: {
      usePolling: false,
    },
  },
})
