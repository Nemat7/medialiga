import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true,
    proxy: {
      "/fantasy-api": {
        target: "https://apifantasy.footballplus.tv/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fantasy-api/, ""),
        secure: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
