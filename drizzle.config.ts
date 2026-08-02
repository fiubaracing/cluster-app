// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./src/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: `postgres://${process.env.POSTGRES_USER!}:${process.env.POSTGRES_PASSWORD!}@${process.env.POSTGRES_HOST!}:${process.env.POSTGRES_PORT!}/${process.env.POSTGRES_DB!}`,
	},
	schemaFilter: ['core'],
});
