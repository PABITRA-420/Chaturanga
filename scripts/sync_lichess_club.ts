import fs from 'fs';
import path from 'path';

// Load .env.local
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

import { syncLichessClub } from '../src/lib/lichessSync';

async function run() {
  console.log('Starting Lichess club synchronization via syncLichessClub service...');
  try {
    const result = await syncLichessClub(true);
    if (!result.success) {
      console.error('Lichess club sync failed:', result.error);
      process.exit(1);
    }

    console.log(`Successfully synced ${result.count} members! (Last synced at: ${result.lastSyncedAt})`);
    if (result.top3 && result.top3.length > 0) {
      console.log('Top 3 Club Members:');
      result.top3.forEach((p: any, idx: number) => {
        console.log(`  #${idx + 1}: ${p.username} (Peak: ${p.peak}, Rapid: ${p.rapid}, Blitz: ${p.blitz})`);
      });
    }
  } catch (err: any) {
    console.error('Unexpected error running syncLichessClub:', err);
    process.exit(1);
  }
}

run();
