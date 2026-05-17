import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

declare const process: {
  env: Record<string, string | undefined>;
};

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/").pop();
const githubPagesBase = process.env.VITE_BASE_PATH || (
  repositoryName ? `/${repositoryName}/` : "/dublimarksite/"
);

export default defineConfig(({ command }) => ({
  base: command === "serve" ? "/" : githubPagesBase,
  plugins: [react()],
  server: {
    port: 5173,
  },
}));
