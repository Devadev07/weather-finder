
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    strictPort: false, // This allows Vite to use a different port if 8080 is occupied
    open: true, // Automatically open browser on server start
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Explicitly set the build target
  build: {
    target: 'es2015',
  },
  // Tell Vite this is a JavaScript project
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2015',
    }
  }
}));
