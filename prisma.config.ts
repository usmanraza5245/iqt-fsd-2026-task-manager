import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 moved the Migrate/introspection connection URL out of schema.prisma
// and into this config file. The runtime PrismaClient connects via a driver
// adapter (see lib/prisma.ts) instead.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
