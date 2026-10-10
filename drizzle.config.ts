import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  dbCredentials: {
    url: ":memory:",
  },
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  // expo-sqlite uses a file on device; drizzle-kit generate only needs the
  // schema for typesafe migration diffs. We use :memory: for generation.
  //
  // If you prefer to generate against a real file, point url at a local db
  // (e.g. ./data/tally-dev.db) and keep it in .gitignore.
  strict: true,
});
