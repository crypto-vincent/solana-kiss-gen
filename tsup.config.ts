import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  clean: true,
  banner: { js: "#!/usr/bin/env node" },
});
