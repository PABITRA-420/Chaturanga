import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

// Auto-load .env.local
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
  console.error('Error: DATABASE_URL environment variable is required to run setup_admin_auth.');
  process.exit(1);
}

async function setupAdminAuth(): Promise<void> {
  console.log('--- Setting up Supabase Admin Authentication & Hardened RLS ---');
  console.log('Connecting to Supabase PostgreSQL database...');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  });

  try {
    await client.connect();
    console.log('Successfully connected to Supabase PostgreSQL!');

    // 1. Execute schema.sql to ensure all tables, functions, and hardened RLS policies exist
    const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');
    console.log('Applying updated schema.sql with Supabase Auth RBAC & RLS...');
    await client.query(sql);
    console.log('Successfully applied schema.sql!');

    const targetAdminEmail = process.env.ADMIN_EMAIL || 'admin@jgec.ac.in';

    // 2. Locate or ensure admin in auth.users
    const userRes = await client.query(`
      SELECT id, email, email_confirmed_at 
      FROM auth.users 
      WHERE email = $1
      LIMIT 1;
    `, [targetAdminEmail]);

    if (userRes.rows.length === 0) {
      console.log('Admin user not found in auth.users yet. Please run test_auth.ts or sign up once.');
    } else {
      const adminUserId = userRes.rows[0].id;
      console.log(`Found admin user: ${userRes.rows[0].email} (UUID: ${adminUserId})`);

      // 3. Ensure email is confirmed in auth.users
      if (!userRes.rows[0].email_confirmed_at) {
        await client.query(`
          UPDATE auth.users 
          SET email_confirmed_at = now() 
          WHERE id = $1;
        `, [adminUserId]);
        console.log('Confirmed admin email in auth.users.');
      }

      // 4. Upsert into public.admin_profiles
      const profileRes = await client.query(`
        INSERT INTO public.admin_profiles (id, email, full_name, role, is_active, updated_at)
        VALUES ($1, $2, 'Chief Arbiter & Tournament Director', 'superadmin', true, now())
        ON CONFLICT (id) DO UPDATE SET
          role = 'superadmin',
          is_active = true,
          updated_at = now()
        RETURNING id, email, role, is_active;
      `, [adminUserId, userRes.rows[0].email]);

      console.log('Verified admin profile in public.admin_profiles:', profileRes.rows[0]);
    }

    // 5. Verify RLS function is_admin() works
    const isPostgresAdmin = await client.query('SELECT public.is_admin() AS is_admin;');
    console.log('Verified public.is_admin() query result for postgres:', isPostgresAdmin.rows[0].is_admin);

    await client.end();
    console.log('ADMIN AUTHENTICATION SETUP COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err: any) {
    console.error('Setup failed:', err.message);
    if (err.detail) console.error('Detail:', err.detail);
    process.exit(1);
  }
}

setupAdminAuth();
