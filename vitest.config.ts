import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "frontend", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
    },
  },
  test: {
    environment: "node",
    include: ["backend/**/*.test.ts", "backend/**/*.spec.ts"],
  },
});
