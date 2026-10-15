# 📋 CHATURANGA JGEC — PROJECT IMPLEMENTATION ROADMAP (`TASK.md`)

> **Platform:** Chaturanga Chess Club — Jalpaiguri Government Engineering College (JGEC)  
> **Architecture:** Next.js (App Router) + Supabase PostgreSQL + Netlify Blobs + Chess.com Public API  
> **Audit Status:** Phase 1 Complete (Read-Only Inspection)  
> **Preservation Guarantee:** Clean, existing implementations are cataloged below and locked (`DO NOT TOUCH`).

---

## 📊 Current Codebase Audit Summary

### ✅ Already Implemented & Working Well (DO NOT TOUCH / PRESERVE)
The following modules, schemas, API routes, and interfaces are already written in a clean, production-grade manner. We build *around* them:

1. **Supabase Client & Auth Architecture:**
   - [`src/lib/supabase/client.ts`](file:///f:/Chaturanga/src/lib/supabase/client.ts): Browser client with `@supabase/ssr` `createBrowserClient`.
   - [`src/lib/supabase/server.ts`](file:///f:/Chaturanga/src/lib/supabase/server.ts): Server client with Next.js cookieStore management, service role bypass, and dynamic Proxy resolver.
   - [`src/lib/adminAuth.ts`](file:///f:/Chaturanga/src/lib/adminAuth.ts): Dual-strategy auth (Supabase JWT cryptographic check against `admin_profiles` + transitional environment session cookie `chaturanga_admin_session`).
   - [`src/middleware.ts`](file:///f:/Chaturanga/src/middleware.ts): Enterprise route guard on `/admin/:path*` with redirects, security headers, and session verification.
2. **Database Core Tables & Triggers (`supabase/schema.sql`):**
   - `public.tournaments`: Comprehensive tournament table with Swiss format, prize pool, slots, visibility toggle, form configuration, custom fields, and podium/crosstable JSONB.
   - `public.registrations`: Robust registration records with ticket IDs, roll numbers, check-in status, and arbiter notes.
   - `public.leaderboard_players`: Player profiles with Rapid, Blitz, Classical, Bullet ratings, Chess.com handles, and auto-stats trigger (`auto_calculate_player_stats()`).
   - `public.announcements`: Category-tagged club notices with urgency flags, badge styles, and display order.
   - `public.admin_profiles`: RBAC permissions (`superadmin`, `arbiter`, `editor`) linked to `auth.users`.
   - Auto-triggers: `update_tournament_registration_count()` increments/decrements `tournaments.registered_count` on participant insert/delete.
3. **Admin Authentication & Dashboard Core (`/admin`, `/admin/login`):**
   - [`src/app/admin/login/page.tsx`](file:///f:/Chaturanga/src/app/admin/login/page.tsx): Secure login UI with Supabase Auth + emergency credential fallback.
   - [`src/app/api/admin/login/route.ts`](file:///f:/Chaturanga/src/app/api/admin/login/route.ts): Session establishment and cryptographic JWT exchange.
   - [`src/app/api/admin/check/route.ts`](file:///f:/Chaturanga/src/app/api/admin/check/route.ts) & [`src/app/api/admin/logout/route.ts`](file:///f:/Chaturanga/src/app/api/admin/logout/route.ts): Auth status checks and clean cookie invalidation.
   - [`src/app/admin/page.tsx`](file:///f:/Chaturanga/src/app/admin/page.tsx): 3,200+ line arbiter dashboard with Supabase Realtime listeners (`admin-dashboard-live-sync`), 1-click tournament visibility toggle, walk-in registrations desk, and printable QR passes.
   - [`src/components/admin/AdminResultsTab.tsx`](file:///f:/Chaturanga/src/components/admin/AdminResultsTab.tsx): Event completion, podium winners input (1st/2nd/3rd Gold/Silver/Bronze), and full Swiss standings/crosstable builder.
   - [`src/components/admin/AdminAnnouncementsTab.tsx`](file:///f:/Chaturanga/src/components/admin/AdminAnnouncementsTab.tsx): Dynamic club notices manager (Create, Edit, Delete notices).
   - [`src/components/admin/AdminMediaManager.tsx`](file:///f:/Chaturanga/src/components/admin/AdminMediaManager.tsx) & [`src/app/api/admin/upload/route.ts`](file:///f:/Chaturanga/src/app/api/admin/upload/route.ts): Netlify Blobs asset uploader for event banners and posters.
4. **Player Registration & Digital Pass Verification (`/register`, `/my-ticket`):**
   - [`src/app/register/page.tsx`](file:///f:/Chaturanga/src/app/register/page.tsx): Dynamic registration form with custom fields per tournament, localStorage draft auto-save, and terms validation.
   - [`src/app/api/register/route.ts`](file:///f:/Chaturanga/src/app/api/register/route.ts): Inserts participant into Supabase `registrations`, prevents duplicate roll numbers, generates ticket codes (`CHTR-2026-XXXXXX`), and dispatches to Google Sheets Webhook.
   - [`src/app/my-ticket/page.tsx`](file:///f:/Chaturanga/src/app/my-ticket/page.tsx) & [`src/components/MyTicketView.tsx`](file:///f:/Chaturanga/src/components/MyTicketView.tsx): Roll number & Ticket ID lookup querying Supabase via [`src/app/api/registrations/verify/route.ts`](file:///f:/Chaturanga/src/app/api/registrations/verify/route.ts).
5. **Live Chess.com API Engine:**
   - [`src/lib/chessComApi.ts`](file:///f:/Chaturanga/src/lib/chessComApi.ts): Fetches Rapid, Blitz, Bullet, Tactics ratings, and avatars from `api.chess.com` with required `User-Agent`.
   - [`src/app/api/leaderboard/sync-chess/route.ts`](file:///f:/Chaturanga/src/app/api/leaderboard/sync-chess/route.ts): Endpoint supporting individual player sync (`{ playerId }`) and bulk club sync (`{ syncAll: true }`).
   - [`src/components/admin/AdminLeaderboardTab.tsx`](file:///f:/Chaturanga/src/components/admin/AdminLeaderboardTab.tsx): Arbiter controls for syncing players with Chess.com live ratings.

---

### ⚠️ Partially Implemented / Using `localStorage` or Mock Fallbacks
These files query Supabase APIs, but when the database returns 0 records (empty state) or during initial component mount, they fall back to hardcoded mock arrays:

1. [`src/lib/tournamentStore.ts`](file:///f:/Chaturanga/src/lib/tournamentStore.ts): `getAllTournaments()` falls back to `getLocalTournamentsFallback()` -> `getInitialSeedTournaments()`. If all events are deleted or an empty state is desired, mock tournaments reappear.
2. [`src/lib/announcementsStore.ts`](file:///f:/Chaturanga/src/lib/announcementsStore.ts): `getAllAnnouncements()` falls back to `CLUB_ANNOUNCEMENTS` array when database returns empty.
3. [`src/lib/leaderboardStore.ts`](file:///f:/Chaturanga/src/lib/leaderboardStore.ts): `getAllLeaderboardPlayers()` falls back to `LEADERBOARD_PLAYERS` array when database returns empty.
4. [`src/components/HomeView.tsx`](file:///f:/Chaturanga/src/components/HomeView.tsx): Initial states for `upcomingEvents` and `pastEvents` are seeded with `UPCOMING_EVENTS` and `PAST_EVENTS`.
5. [`src/components/home/HomeTournaments.tsx`](file:///f:/Chaturanga/src/components/home/HomeTournaments.tsx): Lacks a graceful empty state when no upcoming tournaments are scheduled.
6. [`src/components/UpcomingEventsView.tsx`](file:///f:/Chaturanga/src/components/UpcomingEventsView.tsx): Initial state initialized to `UPCOMING_EVENTS`. Lacks an empty state if no tournaments exist.
7. [`src/components/PastEventsView.tsx`](file:///f:/Chaturanga/src/components/PastEventsView.tsx): Initial state initialized to `PAST_EVENTS`.
8. [`src/components/home/HomeLeaderboardPreview.tsx`](file:///f:/Chaturanga/src/components/home/HomeLeaderboardPreview.tsx): Initial state initialized to `LEADERBOARD_PLAYERS.slice(0, 3)`. Can crash if fewer than 3 players exist in Supabase.
9. [`src/components/LeaderboardView.tsx`](file:///f:/Chaturanga/src/components/LeaderboardView.tsx): Initial state initialized to `LEADERBOARD_PLAYERS`.
10. [`src/components/TournamentCalendar.tsx`](file:///f:/Chaturanga/src/components/TournamentCalendar.tsx): Hardcoded `ALL_CALENDAR_EVENTS` (5 static tournaments) used as fallback.
11. [`src/app/admin/page.tsx`](file:///f:/Chaturanga/src/app/admin/page.tsx): `INITIAL_PARTICIPANTS` (5 mock participants) defined in file header.

---

### ❌ Still 100% Hardcoded (No Supabase Wiring Exists)
1. **Club Team & Leadership (`/team`):**
   - [`src/data/teamData.ts`](file:///f:/Chaturanga/src/data/teamData.ts): 8 hardcoded members (Aniket Roy, Ritwick Paul, Suman Sen, etc.).
   - [`src/components/TeamView.tsx`](file:///f:/Chaturanga/src/components/TeamView.tsx): Directly filters `TEAM_MEMBERS` without any API call or database table.
   - Missing Supabase table: `public.team_members`.
   - Missing API route: `/api/team`.
   - Missing Admin UI: No tab in `/admin` to add/edit/remove team members.
2. **Club Gallery Photos (`/gallery`):**
   - [`src/data/galleryData.ts`](file:///f:/Chaturanga/src/data/galleryData.ts): 6 hardcoded Unsplash photo entries.
   - [`src/components/GalleryView.tsx`](file:///f:/Chaturanga/src/components/GalleryView.tsx): Directly filters `GALLERY_PHOTOS` without any API call or database table.
   - Missing Supabase table: `public.gallery`.
   - Missing API route: `/api/gallery`.
   - Missing Admin UI: No tab in `/admin` to manage gallery photos.
3. **Homepage Live Ticker Marquee:**
   - [`src/components/home/TickerMarquee.tsx`](file:///f:/Chaturanga/src/components/home/TickerMarquee.tsx): `tickerItems` array is 100% hardcoded ("Aritra Sen holds #1 Elo at 2185", "Clock Sparring Wednesdays & Fridays in Room 204", "Inter-University Selection Rounds on May 10").
4. **Hero Counter Numbers:**
   - [`src/components/HomeView.tsx`](file:///f:/Chaturanga/src/components/HomeView.tsx): Hardcoded animation targets `participantsCount = 500` and `eventsCount = 12`.
   - [`src/components/home/HeroSection.tsx`](file:///f:/Chaturanga/src/components/home/HeroSection.tsx): Hardcoded Peak Elo number `2185`.
   - Missing API route: `/api/stats` to aggregate real counts from `registrations`, `tournaments`, and max rating from `leaderboard_players`.

---

## 🗄️ Module 1: Supabase Database & Schema Alignment

- [x] **Task 1.1: Verify Existing Supabase Client & `.env` Setup**
  - **Status:** Already Implemented (No changes needed).
  - **Details:** `@supabase/supabase-js` and `@supabase/ssr` are installed. `.env.local` is configured with `NEXT_PUBLIC_SUPABASE_URL`, publishable anon key, `SUPABASE_SERVICE_ROLE_KEY`, and direct `DATABASE_URL`. Client and server utilities at `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts` are robust.

- [x] **Task 1.2: Incremental SQL Migration for Missing Tables (`team_members` & `gallery`)**
  - **Action:** Create `supabase/incremental_migration.sql` to add ONLY the missing tables without touching existing `tournaments`, `registrations`, `leaderboard_players`, `announcements`, `admin_profiles`, or their triggers.
  - **Tables to add:**
    1. `public.team_members`:
       - Columns: `id` (TEXT PK), `name` (TEXT), `role` (TEXT), `category` (TEXT CHECK in 'core', 'coordinator', 'mentor'), `department` (TEXT), `year` (TEXT), `elo` (TEXT), `fide_id` (TEXT), `bio` (TEXT), `responsibilities` (JSONB), `favorite_opening` (TEXT), `achievements` (JSONB), `chess_piece` (TEXT), `avatar_color` (TEXT), `title_badge` (TEXT), `image_url` (TEXT), `display_order` (INT), `is_active` (BOOLEAN), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
       - RLS: Public SELECT, Admin full access via `public.is_admin()`.
    2. `public.gallery`:
       - Columns: `id` (TEXT PK), `title` (TEXT), `category` (TEXT CHECK in 'Tournaments', 'Awards', 'Blitz Night', 'Club Room'), `date` (TEXT), `tournament_name` (TEXT), `description` (TEXT), `image_src` (TEXT), `aspect` (TEXT DEFAULT 'landscape'), `tag` (TEXT), `display_order` (INT), `is_active` (BOOLEAN), `created_at` (TIMESTAMPTZ), `updated_at` (TIMESTAMPTZ).
       - RLS: Public SELECT, Admin full access via `public.is_admin()`.
  - **Migration runner:** Enhance `scripts/migrate.ts` to execute incremental migrations idempotently.

---

## 🧹 Module 2: Erase Remaining Hardcoded Mock Data & Connect to Supabase

- [x] **Task 2.1 (Events - Upcoming & Past Dynamic Connection & Empty States):**
  - **Action:**
    1. Update `src/lib/tournamentStore.ts`: In `getAllTournaments()`, return empty array `[]` when Supabase returns empty (instead of returning seed mock data). Keep `getLocalTournamentsFallback()` strictly as offline network recovery.
    2. Update `src/components/HomeView.tsx`: Initialize `upcomingEvents` and `pastEvents` to empty arrays (`[]`) with proper loading skeletons.
    3. Update `src/components/home/HomeTournaments.tsx`: Render a stylish empty state ("No tournaments currently scheduled. Check back soon or follow announcements.") if `upcomingEvents.length === 0`.
    4. Update `src/components/UpcomingEventsView.tsx`: Initialize state to empty array `[]`. Display an empty state card when no tournaments exist.
    5. Update `src/components/PastEventsView.tsx`: Initialize state to empty array `[]`. Display an empty archive state with "No archived tournaments yet" if none exist.
    6. Update `src/components/TournamentCalendar.tsx`: Remove hardcoded `ALL_CALENDAR_EVENTS`. Populate strictly from `/api/tournaments`.

- [x] **Task 2.2 (Announcements & Ticker Dynamic Connection):**
  - **Action:**
    1. Update `src/lib/announcementsStore.ts`: Return `[]` when Supabase table has 0 active announcements instead of falling back to `CLUB_ANNOUNCEMENTS`.
    2. Update `src/components/home/AnnouncementsBanner.tsx`: Initialize state to empty array `[]` with loading skeleton. Render clean empty state if no active notices exist.
    3. Update `src/components/home/TickerMarquee.tsx`: Fetch dynamic headlines from `/api/announcements` and the top active tournament from `/api/tournaments?type=upcoming`. Eliminate hardcoded "Aritra Sen holds #1 Elo at 2185" and "SAC 204" strings.

- [x] **Task 2.3 (Team & Gallery Supabase Connection):**
  - **Action:**
    1. Create API route `src/app/api/team/route.ts` with GET (public), POST (admin), PUT (admin), DELETE (admin).
    2. Create `src/lib/teamStore.ts` querying `public.team_members`.
    3. Update `src/components/TeamView.tsx`: Fetch team members dynamically from `/api/team`.
    4. Create API route `src/app/api/gallery/route.ts` with GET (public), POST (admin), PUT (admin), DELETE (admin).
    5. Create `src/lib/galleryStore.ts` querying `public.gallery`.
    6. Update `src/components/GalleryView.tsx`: Fetch gallery photos dynamically from `/api/gallery`.

- [x] **Task 2.4 (Hero Stats Counter Calculation):**
  - **Action:**
    1. Create API route `src/app/api/stats/route.ts` querying:
       - `totalCompetitors`: `SELECT count(*) FROM registrations` (plus sum of past tournament participants).
       - `totalTournaments`: `SELECT count(*) FROM tournaments`.
       - `peakElo`: `SELECT max(peak_elo) FROM leaderboard_players` (falling back to max rapid/blitz).
    2. Update `src/components/HomeView.tsx` and `src/components/home/HeroSection.tsx`: Replace hardcoded 500, 12, and 2185 with animated numbers populated from `/api/stats`.

---

## ♟️ Module 3: Live Chess.com & Lichess Elo Rating Sync

- [x] **Task 3.1: Live Chess.com Ratings Engine & API**
  - **Status:** Already Implemented (No changes needed).
  - **Details:** `src/lib/chessComApi.ts` already queries Chess.com public API with `User-Agent: Chaturanga-JGEC-ChessClub/1.0 (contact@chaturanga-jgec.ac.in)`. `src/app/api/leaderboard/sync-chess/route.ts` handles individual player sync and `{ syncAll: true }` bulk sync. `AdminLeaderboardTab.tsx` already has one-click buttons for both.
  - *Minor Enhancement:* Increase Next.js fetch revalidation to `revalidate: 3600` (1 hour) in `src/lib/chessComApi.ts`.

- [x] **Task 3.2: Homepage Podium & Leaderboard Page Fallback Elimination:**
  - **Action:**
    1. Update `src/lib/leaderboardStore.ts`: Return `[]` when Supabase table has 0 players instead of falling back to `LEADERBOARD_PLAYERS`.
    2. Update `src/components/home/HomeLeaderboardPreview.tsx`: Initialize state to `[]`. Guard against index errors if fewer than 3 players exist, rendering placeholder cards or an empty state when table is empty.
    3. Update `src/components/LeaderboardView.tsx`: Initialize state to `[]` with loading skeleton. Remove static `LEADERBOARD_PLAYERS` fallback.

---

## 🛠️ Module 4: Dynamic Admin Portal (`/admin`)

- [x] **Task 4.1: Admin Event Card Builder**
  - **Status:** Already Implemented (No changes needed).
  - **Details:** Event creation and editing form in `src/app/admin/page.tsx` inserts directly into `tournaments` table via `POST /api/tournaments` and `PUT /api/tournaments/[id]`. Configures format, venue, prize pool, date, custom registration fields, and instant visibility toggle.

- [x] **Task 4.2: One-Click "Complete Event & Publish Winners"**
  - **Status:** Already Implemented (No changes needed).
  - **Details:** `src/app/admin/page.tsx` includes an "Archive Tournament" modal that collects Gold/Silver/Bronze podium winners, score, prizes, and summary, setting `status = 'completed'` and `isPast = true`. In addition, `src/components/admin/AdminResultsTab.tsx` allows entering and updating full Swiss standings crosstables.

- [x] **Task 4.3: Admin Player & Notice Manager**
  - **Status:** Already Implemented (No changes needed).
  - **Details:** `src/components/admin/AdminLeaderboardTab.tsx` provides full CRUD for club players with Chess.com sync. `src/components/admin/AdminAnnouncementsTab.tsx` provides full CRUD for announcements with urgency flags and badge colors.

- [x] **Task 4.4: Admin Team & Gallery Manager (New Admin Tabs):**
  - **Action:**
    1. Add `AdminTeamTab.tsx` to `src/components/admin/` allowing admins to add, edit, reorder, and remove club council members.
    2. Add `AdminGalleryTab.tsx` to `src/components/admin/` allowing admins to upload gallery photos (via Netlify Blobs or direct URL), set tags, and delete photos.
    3. Add `'team'` and `'gallery'` to `activeTab` navigation in `src/app/admin/page.tsx`.

---

## 🎟️ Module 5: Live Tournament Registration & Ticket Pass (`/register` & `/my-ticket`)

- [x] **Task 5.1: Tournament Registration Insertion & Pass ID Generation**
  - **Status:** Already Implemented (No changes needed).
  - **Details:** `/register` validates fields, handles custom tournament questions, saves draft in `localStorage`, and posts to `/api/register`. Inserts directly into Supabase `registrations` table, checks duplicate roll numbers, increments `tournaments.registered_count`, generates `CHTR-2026-XXXXXX` pass IDs, and forwards data to Google Sheets Webhook.

- [x] **Task 5.2: Verification and Rendering Player Pass (`/my-ticket`)**
  - **Status:** Already Implemented (No changes needed).
  - **Details:** `/my-ticket` calls `GET /api/registrations/verify?q=...` querying Supabase `registrations` table. Renders verified registration ticket with check-in status, event details, and print capability.

---

## 🧭 Execution Menu (Choose Next Action)

When ready, instruct the agent with one of the following directives:
- **`Execute Module 1`** or **`Execute Task 1.2`**: Generate `supabase/incremental_migration.sql` for `team_members` and `gallery` tables without breaking existing tables.
- **`Execute Task 2.1`**: Clean event fallbacks and add empty states for Homepage, `/upcoming`, and `/past-events`.
- **`Execute Task 2.2`**: Connect Ticker and Notice board dynamically to Supabase.
- **`Execute Task 2.3`**: Connect `/team` and `/gallery` to Supabase with API routes and database tables.
- **`Execute Task 2.4`**: Implement dynamic `/api/stats` and wire hero counters.
- **`Execute Task 3.2`**: Connect Homepage Top 3 Podium and `/leaderboard` cleanly to live database rankings without mock fallbacks.
- **`Execute Task 4.4`**: Add Team and Gallery management tabs inside the `/admin` portal.
