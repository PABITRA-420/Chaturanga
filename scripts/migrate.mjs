import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@db.gwceeuyenweuszxzmewp.supabase.co:5432/postgres';

async function runMigration() {
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

    const res = await client.query('SELECT count(*) FROM public.tournaments;');
    console.log(`Verified public.tournaments count: ${res.rows[0].count}`);

    const resReg = await client.query('SELECT count(*) FROM public.registrations;');
    console.log(`Verified public.registrations count: ${resReg.rows[0].count}`);

    console.log('MIGRATION COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('Migration failed:', err.message);
    if (err.code) console.error('Error code:', err.code);
  } finally {
    await client.end();
  }
}

runMigration();
