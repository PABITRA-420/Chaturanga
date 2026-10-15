import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

// Auto-load .env.local if present
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const k = trimmed.substring(0, eqIdx).trim();
        const v = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (k && !process.env[k]) process.env[k] = v;
      }
    }
  });
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Error: DATABASE_URL environment variable is required to run migrations.');
  process.exit(1);
}

async function runIncrementalMigration(): Promise<void> {
  console.log('Connecting to Supabase PostgreSQL database...');
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Successfully connected to Supabase PostgreSQL!');

    const sqlFilePath = path.join(process.cwd(), 'supabase', 'incremental_migration.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    console.log('Executing supabase/incremental_migration.sql...');
    await client.query(sql);
    console.log('Successfully executed incremental_migration.sql!');

    const resTeam = await client.query('SELECT count(*) FROM public.team_members;');
    console.log(`Verified public.team_members row count: ${resTeam.rows[0].count}`);

    const resGal = await client.query('SELECT count(*) FROM public.gallery;');
    console.log(`Verified public.gallery row count: ${resGal.rows[0].count}`);

    console.log('INCREMENTAL MIGRATION COMPLETED SUCCESSFULLY!');
  } catch (err: any) {
    console.error('Migration failed:', err.message);
    if (err.code) console.error('Error code:', err.code);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runIncrementalMigration();
