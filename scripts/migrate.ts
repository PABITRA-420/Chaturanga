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

async function runMigration(): Promise<void> {
  console.log('Connecting to Supabase PostgreSQL database...');
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Successfully connected to Supabase PostgreSQL!');

    const sqlFilePath = path.join(process.cwd(), 'supabase', 'schema.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf-8');

    console.log('Executing supabase/schema.sql...');
    await client.query(sql);
    console.log('Successfully executed schema.sql! All tables, indexes, triggers, and seed data created!');

    const resT = await client.query('SELECT count(*) FROM public.tournaments;');
    console.log(`Verified public.tournaments count: ${resT.rows[0].count}`);

    const resReg = await client.query('SELECT count(*) FROM public.registrations;');
    console.log(`Verified public.registrations count: ${resReg.rows[0].count}`);

    const resL = await client.query('SELECT count(*) FROM public.leaderboard_players;');
    console.log(`Verified public.leaderboard_players count: ${resL.rows[0].count}`);

    const resA = await client.query('SELECT count(*) FROM public.announcements;');
    console.log(`Verified public.announcements count: ${resA.rows[0].count}`);

    console.log('MIGRATION COMPLETED SUCCESSFULLY!');
  } catch (err: any) {
    console.error('Migration failed:', err.message);
    if (err.code) console.error('Error code:', err.code);
  } finally {
    await client.end();
  }
}

runMigration();
