/**
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
    Tables: {
      tournaments: {
        Row: {
          id: string;
          title: string;
          date: string;
          target_date: string;
          time: string;
          venue: string;
          format: string;
          prize_pool: string;
          slots: string | null;
          max_slots: number | null;
          registered_count: number | null;
          is_featured: boolean | null;
          is_visible: boolean | null;
          description: string | null;
          status: string | null;
          registration_start_date: string | null;
          registration_end_date: string | null;
          entry_fee: string | null;
          arbiter_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          fair_play_notice: string | null;
          form_config: Json | null;
          custom_fields: Json | null;
          is_past: boolean | null;
          total_participants: number | null;
          summary: string | null;
          podium: Json | null;
          results: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          date: string;
          target_date: string;
          time: string;
          venue: string;
          format: string;
          prize_pool: string;
          slots?: string | null;
          max_slots?: number | null;
          registered_count?: number | null;
          is_featured?: boolean | null;
          is_visible?: boolean | null;
          description?: string | null;
          status?: string | null;
          registration_start_date?: string | null;
          registration_end_date?: string | null;
          entry_fee?: string | null;
          arbiter_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          fair_play_notice?: string | null;
          form_config?: Json | null;
          custom_fields?: Json | null;
          is_past?: boolean | null;
          total_participants?: number | null;
          summary?: string | null;
          podium?: Json | null;
          results?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          date?: string;
          target_date?: string;
          time?: string;
          venue?: string;
          format?: string;
          prize_pool?: string;
          slots?: string | null;
          max_slots?: number | null;
          registered_count?: number | null;
          is_featured?: boolean | null;
          is_visible?: boolean | null;
          description?: string | null;
          status?: string | null;
          registration_start_date?: string | null;
          registration_end_date?: string | null;
          entry_fee?: string | null;
          arbiter_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          fair_play_notice?: string | null;
          form_config?: Json | null;
          custom_fields?: Json | null;
          is_past?: boolean | null;
          total_participants?: number | null;
          summary?: string | null;
          podium?: Json | null;
          results?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      registrations: {
        Row: {
          id: string;
          ticket_id: string;
          tournament_id: string | null;
          tournament: string;
          full_name: string;
          roll_number: string;
          institution: string;
          department: string;
          year: string;
          email: string;
          phone: string;
          rating_category: string | null;
          chess_username: string | null;
          fide_id: string | null;
          custom_answers: Json | null;
          check_in_status: string | null;
          checked_in_at: string | null;
          arbiter_notes: string | null;
          registered_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          tournament_id?: string | null;
          tournament: string;
          full_name: string;
          roll_number: string;
          institution: string;
          department: string;
          year: string;
          email: string;
          phone: string;
          rating_category?: string | null;
          chess_username?: string | null;
          fide_id?: string | null;
          custom_answers?: Json | null;
          check_in_status?: string | null;
          checked_in_at?: string | null;
          arbiter_notes?: string | null;
          registered_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          tournament_id?: string | null;
          tournament?: string;
          full_name?: string;
          roll_number?: string;
          institution?: string;
          department?: string;
          year?: string;
          email?: string;
          phone?: string;
          rating_category?: string | null;
          chess_username?: string | null;
          fide_id?: string | null;
          custom_answers?: Json | null;
          check_in_status?: string | null;
          checked_in_at?: string | null;
          arbiter_notes?: string | null;
          registered_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      leaderboard_players: {
        Row: {
          id: string;
          rank: number | null;
          name: string;
          roll_number: string;
          department: string;
          year: string;
          fide_id: string | null;
          chess_username: string | null;
          lichess_username: string | null;
          title: string | null;
          rapid_elo: number;
          blitz_elo: number;
          classical_elo: number;
          bullet_elo: number;
          peak_elo: number;
          matches_played: number;
          wins: number;
          draws: number;
          losses: number;
          win_rate: number | null;
          tournaments_won: number;
          recent_form: Json | null;
          avatar_color: string | null;
          chess_piece: string | null;
          chess_com_username: string | null;
          chess_com_verified: boolean | null;
          chess_com_last_synced_at: string | null;
          chess_com_blitz_rating: number | null;
          chess_com_rapid_rating: number | null;
          chess_com_bullet_rating: number | null;
          chess_com_puzzle_rating: number | null;
          chess_com_avatar_url: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          rank?: number | null;
          name: string;
          roll_number: string;
          department: string;
          year: string;
          fide_id?: string | null;
          chess_username?: string | null;
          lichess_username?: string | null;
          title?: string | null;
          rapid_elo?: number;
          blitz_elo?: number;
          classical_elo?: number;
          bullet_elo?: number;
          peak_elo?: number;
          matches_played?: number;
          wins?: number;
          draws?: number;
          losses?: number;
          win_rate?: number | null;
          tournaments_won?: number;
          recent_form?: Json | null;
          avatar_color?: string | null;
          chess_piece?: string | null;
          chess_com_username?: string | null;
          chess_com_verified?: boolean | null;
          chess_com_last_synced_at?: string | null;
          chess_com_blitz_rating?: number | null;
          chess_com_rapid_rating?: number | null;
          chess_com_bullet_rating?: number | null;
          chess_com_puzzle_rating?: number | null;
          chess_com_avatar_url?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          rank?: number | null;
          name?: string;
          roll_number?: string;
          department?: string;
          year?: string;
          fide_id?: string | null;
          chess_username?: string | null;
          lichess_username?: string | null;
          title?: string | null;
          rapid_elo?: number;
          blitz_elo?: number;
          classical_elo?: number;
          bullet_elo?: number;
          peak_elo?: number;
          matches_played?: number;
          wins?: number;
          draws?: number;
          losses?: number;
          win_rate?: number | null;
          tournaments_won?: number;
          recent_form?: Json | null;
          avatar_color?: string | null;
          chess_piece?: string | null;
          chess_com_username?: string | null;
          chess_com_verified?: boolean | null;
          chess_com_last_synced_at?: string | null;
          chess_com_blitz_rating?: number | null;
          chess_com_rapid_rating?: number | null;
          chess_com_bullet_rating?: number | null;
          chess_com_puzzle_rating?: number | null;
          chess_com_avatar_url?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          category: string | null;
          date: string;
          badge_color: string | null;
          summary: string;
          content: string;
          is_urgent: boolean | null;
          link_text: string | null;
          link_url: string | null;
          is_active: boolean | null;
          display_order: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          category?: string | null;
          date: string;
          badge_color?: string | null;
          summary: string;
          content: string;
          is_urgent?: boolean | null;
          link_text?: string | null;
          link_url?: string | null;
          is_active?: boolean | null;
          display_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          category?: string | null;
          date?: string;
          badge_color?: string | null;
          summary?: string;
          content?: string;
          is_urgent?: boolean | null;
          link_text?: string | null;
          link_url?: string | null;
          is_active?: boolean | null;
          display_order?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      admin_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string | null;
        };
        Insert: {
          key?: string;
          value: Json;
          updated_at?: string | null;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string | null;
        };
      };
      admin_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: string;
          is_active: boolean;
          last_login: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string;
          role?: string;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: string;
          is_active?: boolean;
          last_login?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          role: string;
          category: string;
          department: string | null;
          year: string | null;
          elo: string | null;
          fide_id: string | null;
          bio: string | null;
          responsibilities: Json | null;
          favorite_opening: string | null;
          achievements: Json | null;
          chess_piece: string | null;
          avatar_color: string | null;
          title_badge: string | null;
          image_url: string | null;
          display_order: number | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          role: string;
          category: string;
          department?: string | null;
          year?: string | null;
          elo?: string | null;
          fide_id?: string | null;
          bio?: string | null;
          responsibilities?: Json | null;
          favorite_opening?: string | null;
          achievements?: Json | null;
          chess_piece?: string | null;
          avatar_color?: string | null;
          title_badge?: string | null;
          image_url?: string | null;
          display_order?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          role?: string;
          category?: string;
          department?: string | null;
          year?: string | null;
          elo?: string | null;
          fide_id?: string | null;
          bio?: string | null;
          responsibilities?: Json | null;
          favorite_opening?: string | null;
          achievements?: Json | null;
          chess_piece?: string | null;
          avatar_color?: string | null;
          title_badge?: string | null;
          image_url?: string | null;
          display_order?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      gallery: {
        Row: {
          id: string;
          title: string;
          category: string;
          date: string | null;
          tournament_name: string | null;
          description: string | null;
          image_src: string;
          aspect: string | null;
          tag: string | null;
          display_order: number | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          category: string;
          date?: string | null;
          tournament_name?: string | null;
          description?: string | null;
          image_src: string;
          aspect?: string | null;
          tag?: string | null;
          display_order?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          category?: string;
          date?: string | null;
          tournament_name?: string | null;
          description?: string | null;
          image_src?: string;
          aspect?: string | null;
          tag?: string | null;
          display_order?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      tournament_rounds: {
        Row: {
          id: string;
          tournament_id: string;
          round_number: number;
          status: string;
          start_time: string | null;
          duration_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          round_number: number;
          status?: string;
          start_time?: string | null;
          duration_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          round_number?: number;
          status?: string;
          start_time?: string | null;
          duration_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tournament_matches: {
        Row: {
          id: string;
          round_id: string;
          tournament_id: string;
          board_number: number;
          white_player_id: string | null;
          white_player_name: string;
          black_player_id: string | null;
          black_player_name: string | null;
          result: string;
          pgn: string | null;
          arbiter_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          round_id: string;
          tournament_id: string;
          board_number: number;
          white_player_id?: string | null;
          white_player_name: string;
          black_player_id?: string | null;
          black_player_name?: string | null;
          result?: string;
          pgn?: string | null;
          arbiter_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          round_id?: string;
          tournament_id?: string;
          board_number?: number;
          white_player_id?: string | null;
          white_player_name?: string;
          black_player_id?: string | null;
          black_player_name?: string | null;
          result?: string;
          pgn?: string | null;
          arbiter_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tournament_games: {
        Row: {
          id: string;
          tournament_id: string;
          white_player: string;
          black_player: string;
          result: string;
          pgn: string;
          event_name: string;
          round: number;
          date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          white_player: string;
          black_player: string;
          result: string;
          pgn: string;
          event_name: string;
          round?: number;
          date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          tournament_id?: string;
          white_player?: string;
          black_player?: string;
          result?: string;
          pgn?: string;
          event_name?: string;
          round?: number;
          date?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      register_participant_atomic: {
        Args: {
          p_ticket_id: string;
          p_tournament_id: string;
          p_tournament_title: string;
          p_full_name: string;
          p_roll_number: string;
          p_institution: string;
          p_department: string;
          p_year: string;
          p_email: string;
          p_phone: string;
          p_rating_category: string;
          p_chess_platform: string | null;
          p_chess_username: string;
          p_fide_id: string;
          p_custom_answers: Json;
        };
        Returns: Json;
      };
      recalculate_tournament_counts: {
        Args: {
          p_tournament_id: string;
        };
        Returns: number;
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type TournamentRow = Tables<'tournaments'>;
export type TournamentInsert = TablesInsert<'tournaments'>;
export type RegistrationRow = Tables<'registrations'>;
export type RegistrationInsert = TablesInsert<'registrations'>;
export type LeaderboardPlayerRow = Tables<'leaderboard_players'>;
export type AnnouncementRow = Tables<'announcements'>;
export type TeamMemberRow = Tables<'team_members'>;
export type GalleryRow = Tables<'gallery'>;
export type TournamentRoundRow = Tables<'tournament_rounds'>;
export type TournamentRoundInsert = TablesInsert<'tournament_rounds'>;
export type TournamentMatchRow = Tables<'tournament_matches'>;
export type TournamentMatchInsert = TablesInsert<'tournament_matches'>;
export type TournamentGameRow = Tables<'tournament_games'>;
export type TournamentGameInsert = TablesInsert<'tournament_games'>;
