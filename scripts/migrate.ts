import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migrationsFolder = join(__dirname, '../src/db/migrations');

const connectionString = `postgres://${process.env.POSTGRES_USER!}:${process.env.POSTGRES_PASSWORD!}@${process.env.POSTGRES_HOST!}:${process.env.POSTGRES_PORT!}/${process.env.POSTGRES_DB!}`;
console.debug(`Connecting to database at: ${connectionString}`);

// Use max: 1 to ensure the migration script doesn't hold open multiple connections
const pool = new Pool({ 
  connectionString,
  max: 1 
});


async function runMigrations() {
  console.log('Running database migrations...');
  const db = drizzle({ client: pool, logger: true });
  
  try {
    // This points to the output folder defined in your drizzle.config.ts
    await migrate(db, { migrationsFolder });
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();