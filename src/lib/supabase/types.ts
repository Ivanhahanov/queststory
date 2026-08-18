export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_runs: {
        Row: {
          activity_template_id: string
          game_id: string
          id: string
          resolved_at: string | null
          result: Json | null
          started_at: string
          status: string
        }
        Insert: {
          activity_template_id: string
          game_id: string
          id?: string
          resolved_at?: string | null
          result?: Json | null
          started_at?: string
          status?: string
        }
        Update: {
          activity_template_id?: string
          game_id?: string
          id?: string
          resolved_at?: string | null
          result?: Json | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_runs_activity_template_id_fkey"
            columns: ["activity_template_id"]
            isOneToOne: false
            referencedRelation: "activity_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_runs_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_submissions: {
        Row: {
          activity_run_id: string
          created_at: string
          id: string
          payload: Json
          player_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          activity_run_id: string
          created_at?: string
          id?: string
          payload?: Json
          player_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          activity_run_id?: string
          created_at?: string
          id?: string
          payload?: Json
          player_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_submissions_activity_run_id_fkey"
            columns: ["activity_run_id"]
            isOneToOne: false
            referencedRelation: "activity_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_submissions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_templates: {
        Row: {
          config: Json
          created_at: string
          display_mode: string
          game_id: string
          id: string
          instructions: string
          linked_goal_id: string | null
          name: string
          type: string
        }
        Insert: {
          config?: Json
          created_at?: string
          display_mode?: string
          game_id: string
          id?: string
          instructions?: string
          linked_goal_id?: string | null
          name: string
          type: string
        }
        Update: {
          config?: Json
          created_at?: string
          display_mode?: string
          game_id?: string
          id?: string
          instructions?: string
          linked_goal_id?: string | null
          name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_templates_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_templates_linked_goal_id_fkey"
            columns: ["linked_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      effect_templates: {
        Row: {
          color: string
          created_at: string
          default_text: string | null
          game_id: string
          icon: string | null
          id: string
          name: string
          type: string
        }
        Insert: {
          color?: string
          created_at?: string
          default_text?: string | null
          game_id: string
          icon?: string | null
          id?: string
          name: string
          type: string
        }
        Update: {
          color?: string
          created_at?: string
          default_text?: string | null
          game_id?: string
          icon?: string | null
          id?: string
          name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "effect_templates_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          accent_color: string
          active_activity_run_id: string | null
          common_goal: string
          created_at: string
          current_round_id: string | null
          current_round_started_at: string | null
          id: string
          owner_id: string
          status: string
          story_synopsis: string
          timer_elapsed_seconds: number
          timer_paused_at: string | null
          timer_started_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          active_activity_run_id?: string | null
          common_goal?: string
          created_at?: string
          current_round_id?: string | null
          current_round_started_at?: string | null
          id?: string
          owner_id: string
          status?: string
          story_synopsis?: string
          timer_elapsed_seconds?: number
          timer_paused_at?: string | null
          timer_started_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          active_activity_run_id?: string | null
          common_goal?: string
          created_at?: string
          current_round_id?: string | null
          current_round_started_at?: string | null
          id?: string
          owner_id?: string
          status?: string
          story_synopsis?: string
          timer_elapsed_seconds?: number
          timer_paused_at?: string | null
          timer_started_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_active_activity_run_id_fkey"
            columns: ["active_activity_run_id"]
            isOneToOne: false
            referencedRelation: "activity_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_current_round_id_fkey"
            columns: ["current_round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          description: string
          game_id: string
          id: string
          player_can_complete: boolean
          position: number
          role_id: string | null
          title: string
          unlock_round_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          game_id: string
          id?: string
          player_can_complete?: boolean
          position?: number
          role_id?: string | null
          title: string
          unlock_round_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          game_id?: string
          id?: string
          player_can_complete?: boolean
          position?: number
          role_id?: string | null
          title?: string
          unlock_round_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_unlock_round_id_fkey"
            columns: ["unlock_round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          game_id: string
          id: string
          player_id: string | null
          sender: string
        }
        Insert: {
          body: string
          created_at?: string
          game_id: string
          id?: string
          player_id?: string | null
          sender?: string
        }
        Update: {
          body?: string
          created_at?: string
          game_id?: string
          id?: string
          player_id?: string | null
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_effects: {
        Row: {
          active: boolean
          applied_at: string
          applied_by: string | null
          custom_text: string | null
          effect_template_id: string
          expires_at: string | null
          id: string
          player_id: string
          target_goal_id: string | null
          value: number | null
        }
        Insert: {
          active?: boolean
          applied_at?: string
          applied_by?: string | null
          custom_text?: string | null
          effect_template_id: string
          expires_at?: string | null
          id?: string
          player_id: string
          target_goal_id?: string | null
          value?: number | null
        }
        Update: {
          active?: boolean
          applied_at?: string
          applied_by?: string | null
          custom_text?: string | null
          effect_template_id?: string
          expires_at?: string | null
          id?: string
          player_id?: string
          target_goal_id?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_effects_effect_template_id_fkey"
            columns: ["effect_template_id"]
            isOneToOne: false
            referencedRelation: "effect_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_effects_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_effects_target_goal_id_fkey"
            columns: ["target_goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      player_goal_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          goal_id: string
          id: string
          player_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          goal_id: string
          id?: string
          player_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          goal_id?: string
          id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_goal_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_goal_progress_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          assigned_at: string | null
          auth_user_id: string | null
          created_at: string
          display_name: string | null
          game_id: string
          id: string
          join_token: string
          joined_at: string | null
          role_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          auth_user_id?: string | null
          created_at?: string
          display_name?: string | null
          game_id: string
          id?: string
          join_token?: string
          joined_at?: string | null
          role_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          auth_user_id?: string | null
          created_at?: string
          display_name?: string | null
          game_id?: string
          id?: string
          join_token?: string
          joined_at?: string | null
          role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          keys: Json
          player_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          keys: Json
          player_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          keys?: Json
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          avatar_seed: string
          avatar_style: string
          color: string
          created_at: string
          description: string
          game_id: string
          id: string
          name: string
        }
        Insert: {
          avatar_seed?: string
          avatar_style?: string
          color?: string
          created_at?: string
          description?: string
          game_id: string
          id?: string
          name: string
        }
        Update: {
          avatar_seed?: string
          avatar_style?: string
          color?: string
          created_at?: string
          description?: string
          game_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      rounds: {
        Row: {
          created_at: string
          description: string
          game_id: string
          id: string
          name: string
          planned_duration_seconds: number | null
          position: number
        }
        Insert: {
          created_at?: string
          description?: string
          game_id: string
          id?: string
          name: string
          planned_duration_seconds?: number | null
          position: number
        }
        Update: {
          created_at?: string
          description?: string
          game_id?: string
          id?: string
          name?: string
          planned_duration_seconds?: number | null
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "rounds_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_player: {
        Args: { p_display_name: string; p_join_token: string }
        Returns: {
          assigned_at: string | null
          auth_user_id: string | null
          created_at: string
          display_name: string | null
          game_id: string
          id: string
          join_token: string
          joined_at: string | null
          role_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "players"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_visible_goals: {
        Args: { p_player_id: string }
        Returns: {
          completed: boolean
          completed_at: string
          description: string
          goal_position: number
          id: string
          player_can_complete: boolean
          role_id: string
          title: string
          unlock_round_id: string
        }[]
      }
      goal_allows_player_complete: {
        Args: { p_goal_id: string }
        Returns: boolean
      }
      is_game_owner: { Args: { p_game_id: string }; Returns: boolean }
      is_own_player: { Args: { p_player_id: string }; Returns: boolean }
      leave_player: { Args: { p_player_id: string }; Returns: undefined }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

