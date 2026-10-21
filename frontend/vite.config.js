import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development the browser talks to Vite (port 5173) and Vite forwards /api calls
// to the Spring Boot backend, so no CORS setup is needed while developing.
const proxy = {
"/api": { target: "http://127.0.0.1:8080", changeOrigin: true },
};

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy },
  preview: { port: 4173, proxy },
});
