import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

declare const process: {
  env: Record<string, string | undefined>;
};

const productionBase = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : productionBase,
  plugins: [react()],
  server: {
    port: 5173,
  },
}));
