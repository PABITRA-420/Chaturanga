import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@db.gwceeuyenweuszxzmewp.supabase.co:5432/postgres';

async function syncAllData() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    // 1. Sync tournaments
    const tourneyPath = path.join(process.cwd(), 'src', 'data', 'tournaments.json');
    if (fs.existsSync(tourneyPath)) {
      const tourneys = JSON.parse(fs.readFileSync(tourneyPath, 'utf-8'));
      console.log(`Syncing ${tourneys.length} tournaments...`);

      for (const t of tourneys) {
        await client.query(`
          INSERT INTO public.tournaments (
            id, title, date, target_date, time, venue, format, prize_pool, slots,
            max_slots, registered_count, is_featured, description, status,
            registration_start_date, registration_end_date, entry_fee, arbiter_name,
            contact_email, contact_phone, fair_play_notice, form_config, custom_fields,
            is_past, total_participants, summary, podium, results, updated_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,now())
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            status = EXCLUDED.status,
            max_slots = EXCLUDED.max_slots,
            registered_count = EXCLUDED.registered_count,
            form_config = EXCLUDED.form_config,
            podium = EXCLUDED.podium,
            results = EXCLUDED.results;
        `, [
          t.id, t.title, t.date || '', t.targetDate || '', t.time || '', t.venue || '',
          t.format || '', t.prizePool || '', t.slots || '', t.maxSlots || 100,
          t.registeredCount || 0, !!t.isFeatured, t.description || '', t.status || 'open',
          t.registrationStartDate || '', t.registrationEndDate || '', t.entryFee || '',
          t.arbiterName || '', t.contactEmail || '', t.contactPhone || '',
          t.fairPlayNotice || '', JSON.stringify(t.formConfig || []), JSON.stringify(t.customFields || []),
          !!t.isPast, t.totalParticipants || 0, t.summary || '',
          JSON.stringify(t.podium || []), JSON.stringify(t.results || [])
        ]);
      }
    }

    // 2. Sync registrations
    const regPath = path.join(process.cwd(), 'src', 'data', 'registrations.json');
    if (fs.existsSync(regPath)) {
      const regs = JSON.parse(fs.readFileSync(regPath, 'utf-8'));
      console.log(`Syncing ${regs.length} registrations...`);

      for (const r of regs) {
        await client.query(`
          INSERT INTO public.registrations (
            ticket_id, tournament, full_name, roll_number, institution, department, year,
            email, phone, rating_category, chess_username, fide_id, custom_answers,
            check_in_status, registered_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
          ON CONFLICT (ticket_id) DO UPDATE SET
            check_in_status = EXCLUDED.check_in_status;
        `, [
          r.ticketId, r.tournament, r.fullName, r.rollNumber, r.institution || '',
          r.department || '', r.year || '', r.email, r.phone, r.ratingCategory || '',
          r.chessUsername || 'N/A', r.fideId || 'Unrated',
          JSON.stringify(r.customAnswers || {}), r.checkInStatus || 'confirmed',
          r.registeredAt || new Date().toISOString()
        ]);
      }
    }

    const tCount = await client.query('SELECT count(*) FROM public.tournaments;');
    const rCount = await client.query('SELECT count(*) FROM public.registrations;');
    console.log(`Done! Total tournaments in DB: ${tCount.rows[0].count}`);
    console.log(`Done! Total registrations in DB: ${rCount.rows[0].count}`);
  } catch (err) {
    console.error('Sync error:', err);
  } finally {
    await client.end();
  }
}

syncAllData();
