import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 8080,
    proxy: {
        "/notification/subscribe": {
            target: "http://localhost:5001",
            changeOrigin: true,
            ws: true,
            rewrite: (path) => path.replace(/^\/notification/, "/notification"),
          },
        "/api": {
          target: "http://localhost:5001",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, "/api"),
        }
    },
  },
});
