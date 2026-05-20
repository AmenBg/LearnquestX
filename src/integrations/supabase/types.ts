export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      exercise_history: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          question_hash: string
          subject_id: string
          user_id: string
          was_correct: boolean
          xp_earned: number
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          question_hash: string
          subject_id: string
          user_id: string
          was_correct: boolean
          xp_earned?: number
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          question_hash?: string
          subject_id?: string
          user_id?: string
          was_correct?: boolean
          xp_earned?: number
        }
        Relationships: []
      }
      match_players: {
        Row: {
          answers: Json
          finished: boolean
          id: string
          joined_at: string
          match_id: string
          player_name: string
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json
          finished?: boolean
          id?: string
          joined_at?: string
          match_id: string
          player_name?: string
          score?: number
          user_id: string
        }
        Update: {
          answers?: Json
          finished?: boolean
          id?: string
          joined_at?: string
          match_id?: string
          player_name?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "quiz_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          country: string
          created_at: string
          current_term: string
          education_level: string
          grade: string
          id: string
          last_activity_date: string | null
          level: number
          name: string
          preferred_language: string
          streak: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          country?: string
          created_at?: string
          current_term?: string
          education_level?: string
          grade?: string
          id?: string
          last_activity_date?: string | null
          level?: number
          name?: string
          preferred_language?: string
          streak?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          country?: string
          created_at?: string
          current_term?: string
          education_level?: string
          grade?: string
          id?: string
          last_activity_date?: string | null
          level?: number
          name?: string
          preferred_language?: string
          streak?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      purchased_games: {
        Row: {
          game_id: string
          id: string
          purchased_at: string
          user_id: string
          xp_cost: number
        }
        Insert: {
          game_id: string
          id?: string
          purchased_at?: string
          user_id: string
          xp_cost?: number
        }
        Update: {
          game_id?: string
          id?: string
          purchased_at?: string
          user_id?: string
          xp_cost?: number
        }
        Relationships: []
      }
      quiz_matches: {
        Row: {
          created_at: string
          created_by: string | null
          finished_at: string | null
          id: string
          match_type: string
          max_players: number
          question_data: Json
          started_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          finished_at?: string | null
          id?: string
          match_type?: string
          max_players?: number
          question_data?: Json
          started_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          finished_at?: string | null
          id?: string
          match_type?: string
          max_players?: number
          question_data?: Json
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      subject_progress: {
        Row: {
          created_at: string
          current_lesson: string | null
          id: string
          lessons_completed: number
          subject_id: string
          total_xp_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_lesson?: string | null
          id?: string
          lessons_completed?: number
          subject_id: string
          total_xp_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_lesson?: string | null
          id?: string
          lessons_completed?: number
          subject_id?: string
          total_xp_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_xp_rpc: { Args: { amount: number }; Returns: undefined }
      get_leaderboard: {
        Args: { p_limit?: number }
        Returns: {
          level: number
          name: string
          user_id: string
          xp: number
        }[]
      }
      purchase_game_rpc: {
        Args: { p_game_id: string; p_xp_cost: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
