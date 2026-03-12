export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; username: string; avatar_url: string | null; games_played: number; total_score: number; created_at: string; updated_at: string }
        Insert: { id: string; username?: string; avatar_url?: string | null; games_played?: number; total_score?: number }
        Update: { username?: string; avatar_url?: string | null; games_played?: number; total_score?: number }
      }
      rooms: {
        Row: { id: string; code: string; host_id: string; status: string; max_players: number; round_count: number; time_limit: number; created_at: string }
        Insert: { code: string; host_id: string; status?: string; max_players?: number; round_count?: number; time_limit?: number }
        Update: { status?: string; max_players?: number; round_count?: number; time_limit?: number }
      }
      room_players: {
        Row: { id: string; room_id: string; player_id: string; is_ready: boolean; created_at: string }
        Insert: { room_id: string; player_id: string; is_ready?: boolean }
        Update: { is_ready?: boolean }
      }
      room_categories: {
        Row: { id: string; room_id: string; category_id: string }
        Insert: { room_id: string; category_id: string }
        Update: { room_id?: string; category_id?: string }
      }
      categories: {
        Row: { id: string; name: string; emoji: string; is_default: boolean; created_by: string | null; created_at: string }
        Insert: { name: string; emoji: string; is_default?: boolean; created_by?: string | null }
        Update: { name?: string; emoji?: string; is_default?: boolean }
      }
      rounds: {
        Row: { id: string; room_id: string; round_number: number; letter: string; status: string; winner_id: string | null; ended_at: string | null; created_at: string }
        Insert: { room_id: string; round_number: number; letter: string; status?: string; winner_id?: string | null; ended_at?: string | null }
        Update: { status?: string; winner_id?: string | null; ended_at?: string | null }
      }
      answers: {
        Row: { id: string; round_id: string; player_id: string; category_id: string; value: string | null; is_valid: boolean | null; created_at: string }
        Insert: { round_id: string; player_id: string; category_id: string; value?: string | null; is_valid?: boolean | null }
        Update: { value?: string | null; is_valid?: boolean | null }
      }
      votes: {
        Row: { id: string; answer_id: string; voter_id: string; is_valid: boolean; created_at: string }
        Insert: { answer_id: string; voter_id: string; is_valid: boolean }
        Update: { is_valid?: boolean }
      }
      scores: {
        Row: { id: string; round_id: string; player_id: string; points: number; bac_bonus: number; created_at: string }
        Insert: { round_id: string; player_id: string; points?: number; bac_bonus?: number }
        Update: { points?: number; bac_bonus?: number }
      }
      chat_messages: {
        Row: { id: string; room_id: string; player_id: string; content: string; created_at: string }
        Insert: { room_id: string; player_id: string; content: string }
        Update: { content?: string }
      }
    }
    Views: {
      leaderboard_view: {
        Row: { id: string; username: string; avatar_url: string | null; total_score: number; games_played: number; avg_score_per_game: number }
      }
    }
    Functions: {
      compute_round_scores: { Args: { p_round_id: string }; Returns: void }
      increment_player_stats: { Args: { p_player_id: string; p_points: number }; Returns: void }
    }
    Enums: {}
  }
}