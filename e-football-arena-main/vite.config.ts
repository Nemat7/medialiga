import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      // Проксирование API запросов на Django бэкенд
      '/api': {
        target: 'http://localhost:8000',  // Django порт
        changeOrigin: true,
        secure: false,
//         rewrite: (path) => path.replace(/^\/api/, '')
      },

    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
