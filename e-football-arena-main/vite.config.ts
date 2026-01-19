import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/static/efootball/", // <--- важно для правильных путей к JS/CSS
  server: {
    port: 3000,
    host: true,
    proxy: {
      // Проксирование API запросов на Django бэкенд
      '/api': {
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
