import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const connectionString = `postgres://${process.env.POSTGRES_USER!}:${process.env.POSTGRES_PASSWORD!}@${process.env.POSTGRES_HOST!}:${process.env.POSTGRES_PORT!}/${process.env.POSTGRES_DB!}`;
console.debug(`Connecting to database at: ${connectionString}`);

const pool = new Pool({ 
  connectionString,
  max: 10
});

export const db = drizzle({ client: pool, logger: process.env.NODE_ENV !== "production" });