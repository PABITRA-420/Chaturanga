import fs from 'fs';
import path from 'path';

interface ColumnDef {
  name: string;
  type: string;
  nullable: boolean;
  hasDefault: boolean;
}

interface TableDef {
  name: string;
  columns: ColumnDef[];
}

function pgTypeToTs(pgType: string): string {
  const clean = pgType.toUpperCase().trim();
  if (clean.startsWith('TEXT') || clean.startsWith('VARCHAR') || clean.startsWith('UUID') || clean.startsWith('TIMESTAMPTZ') || clean.startsWith('TIMESTAMP')) {
    return 'string';
  }
  if (clean.startsWith('INT') || clean.startsWith('BIGINT') || clean.startsWith('SMALLINT') || clean.startsWith('NUMERIC') || clean.startsWith('DECIMAL') || clean.startsWith('REAL')) {
    return 'number';
  }
  if (clean.startsWith('BOOL')) {
    return 'boolean';
  }
  if (clean.startsWith('JSONB') || clean.startsWith('JSON')) {
    return 'Json';
  }
  return 'any';
}

function parseSqlTables(sqlContent: string): TableDef[] {
  const tables: TableDef[] = [];
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;

  let match: RegExpExecArray | null;
  while ((match = tableRegex.exec(sqlContent)) !== null) {
    const tableName = match[1];
    const body = match[2];

    const lines = body.split('\n');
    const columns: ColumnDef[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim().replace(/,$/, '');
      if (!line || line.startsWith('--') || line.startsWith('CONSTRAINT') || line.startsWith('PRIMARY KEY') || line.startsWith('FOREIGN KEY') || line.startsWith('UNIQUE') || line.startsWith('CHECK')) {
        continue;
      }

      const colMatch = line.match(/^([a-zA-Z0-9_]+)\s+([A-Za-z0-9_()]+)(.*)$/);
      if (colMatch) {
        const colName = colMatch[1];
        const rawType = colMatch[2];
        const rest = (colMatch[3] || '').toUpperCase();

        // Skip table-level keywords if matched accidentally
        if (['PRIMARY', 'FOREIGN', 'CONSTRAINT', 'UNIQUE', 'CHECK'].includes(colName.toUpperCase())) {
          continue;
        }

        const isPrimaryKey = rest.includes('PRIMARY KEY');
        const notNull = rest.includes('NOT NULL') || isPrimaryKey;
        const hasDefault = rest.includes('DEFAULT') || isPrimaryKey || rest.includes('IDENTITY');

        columns.push({
          name: colName,
          type: pgTypeToTs(rawType),
          nullable: !notNull,
          hasDefault
        });
      }
    }

    if (columns.length > 0) {
      // If table already parsed (e.g. from earlier script), merge/override
      const existing = tables.find(t => t.name === tableName);
      if (existing) {
        for (const col of columns) {
          const cIndex = existing.columns.findIndex(c => c.name === col.name);
          if (cIndex >= 0) existing.columns[cIndex] = col;
          else existing.columns.push(col);
        }
      } else {
        tables.push({ name: tableName, columns });
      }
    }
  }

  return tables;
}

export function generateDatabaseTypes(): string {
  const root = process.cwd();
  const schemaPath = path.join(root, 'supabase', 'schema.sql');
  const incrementalPath = path.join(root, 'supabase', 'incremental_migration.sql');

  let allSql = '';
  if (fs.existsSync(schemaPath)) {
    allSql += fs.readFileSync(schemaPath, 'utf-8') + '\n';
  }
  if (fs.existsSync(incrementalPath)) {
    allSql += fs.readFileSync(incrementalPath, 'utf-8') + '\n';
  }
  const phase4Path = path.join(root, 'supabase', 'phase4_tournaments_expansion.sql');
  if (fs.existsSync(phase4Path)) {
    allSql += fs.readFileSync(phase4Path, 'utf-8') + '\n';
  }

  const tables = parseSqlTables(allSql);

  let output = `/**
 * AUTO-GENERATED DATABASE TYPE DEFINITIONS
 * Generated from supabase/schema.sql & migrations
 * DO NOT EDIT DIRECTLY - Run 'npm run db:types' to regenerate
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {\n`;

  for (const table of tables) {
    output += `      ${table.name}: {\n`;
    
    // Row
    output += `        Row: {\n`;
    for (const col of table.columns) {
      const typeStr = col.nullable ? `${col.type} | null` : col.type;
      output += `          ${col.name}: ${typeStr};\n`;
    }
    output += `        };\n`;

    // Insert
    output += `        Insert: {\n`;
    for (const col of table.columns) {
      const isOptional = col.hasDefault || col.nullable;
      const typeStr = col.nullable ? `${col.type} | null` : col.type;
      output += `          ${col.name}${isOptional ? '?' : ''}: ${typeStr};\n`;
    }
    output += `        };\n`;

    // Update
    output += `        Update: {\n`;
    for (const col of table.columns) {
      const typeStr = col.nullable ? `${col.type} | null` : col.type;
      output += `          ${col.name}?: ${typeStr};\n`;
    }
    output += `        };\n`;

    output += `      };\n`;
  }

  output += `    };\n`;
  output += `    Views: {\n      [_ in never]: never;\n    };\n`;
  output += `    Functions: {\n`;
  output += `      register_participant_atomic: {\n`;
  output += `        Args: {\n`;
  output += `          p_ticket_id: string;\n`;
  output += `          p_tournament_id: string;\n`;
  output += `          p_tournament_title: string;\n`;
  output += `          p_full_name: string;\n`;
  output += `          p_roll_number: string;\n`;
  output += `          p_institution: string;\n`;
  output += `          p_department: string;\n`;
  output += `          p_year: string;\n`;
  output += `          p_email: string;\n`;
  output += `          p_phone: string;\n`;
  output += `          p_rating_category: string;\n`;
  output += `          p_chess_platform: string | null;\n`;
  output += `          p_chess_username: string;\n`;
  output += `          p_fide_id: string;\n`;
  output += `          p_custom_answers: Json;\n`;
  output += `        };\n`;
  output += `        Returns: Json;\n`;
  output += `      };\n`;
  output += `      recalculate_tournament_counts: {\n`;
  output += `        Args: {\n          p_tournament_id: string;\n        };\n`;
  output += `        Returns: number;\n`;
  output += `      };\n`;
  output += `    };\n`;
  output += `  };\n`;
  output += `}\n\n`;

  // Convenient type helpers
  output += `export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];\n`;
  output += `export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];\n`;
  output += `export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];\n\n`;

  output += `export type TournamentRow = Tables<'tournaments'>;\n`;
  output += `export type TournamentInsert = TablesInsert<'tournaments'>;\n`;
  output += `export type RegistrationRow = Tables<'registrations'>;\n`;
  output += `export type RegistrationInsert = TablesInsert<'registrations'>;\n`;
  output += `export type LeaderboardPlayerRow = Tables<'leaderboard_players'>;\n`;
  output += `export type AnnouncementRow = Tables<'announcements'>;\n`;
  output += `export type TeamMemberRow = Tables<'team_members'>;\n`;
  output += `export type GalleryRow = Tables<'gallery'>;\n`;
  output += `export type TournamentRoundRow = Tables<'tournament_rounds'>;\n`;
  output += `export type TournamentRoundInsert = TablesInsert<'tournament_rounds'>;\n`;
  output += `export type TournamentMatchRow = Tables<'tournament_matches'>;\n`;
  output += `export type TournamentMatchInsert = TablesInsert<'tournament_matches'>;\n`;
  output += `export type TournamentGameRow = Tables<'tournament_games'>;\n`;
  output += `export type TournamentGameInsert = TablesInsert<'tournament_games'>;\n`;

  return output;
}

console.log('Generating TypeScript database definitions from Supabase SQL schemas...');
const typesContent = generateDatabaseTypes();
const outputPath = path.join(process.cwd(), 'src', 'types', 'database.ts');
fs.writeFileSync(outputPath, typesContent, 'utf-8');
console.log(`Successfully generated ${outputPath}!`);

