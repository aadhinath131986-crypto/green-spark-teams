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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string
          icon: string
          id: string
          points: number
          title: string
          week_end: string
          week_start: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description: string
          icon: string
          id?: string
          points: number
          title: string
          week_end: string
          week_start: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          points?: number
          title?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      ar_trophies: {
        Row: {
          ar_model_url: string | null
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          required_kg: number
          tier: string
        }
        Insert: {
          ar_model_url?: string | null
          created_at?: string | null
          description: string
          icon: string
          id?: string
          name: string
          required_kg: number
          tier: string
        }
        Update: {
          ar_model_url?: string | null
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          required_kg?: number
          tier?: string
        }
        Relationships: []
      }
      general_submissions: {
        Row: {
          email: string | null
          full_name: string
          id: string
          phone_number: string
          photo_url: string
          points_awarded: number | null
          reason: string
          reviewed_at: string | null
          status: string | null
          submitted_at: string | null
        }
        Insert: {
          email?: string | null
          full_name: string
          id?: string
          phone_number: string
          photo_url: string
          points_awarded?: number | null
          reason: string
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
        }
        Update: {
          email?: string | null
          full_name?: string
          id?: string
          phone_number?: string
          photo_url?: string
          points_awarded?: number | null
          reason?: string
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
        }
        Relationships: []
      }
      geo_quests: {
        Row: {
          active: boolean | null
          badge_name: string
          created_at: string | null
          description: string
          ends_at: string
          icon: string
          id: string
          location_lat: number
          location_lng: number
          location_name: string
          points_multiplier: number | null
          starts_at: string
          title: string
        }
        Insert: {
          active?: boolean | null
          badge_name: string
          created_at?: string | null
          description: string
          ends_at: string
          icon: string
          id?: string
          location_lat: number
          location_lng: number
          location_name: string
          points_multiplier?: number | null
          starts_at: string
          title: string
        }
        Update: {
          active?: boolean | null
          badge_name?: string
          created_at?: string | null
          description?: string
          ends_at?: string
          icon?: string
          id?: string
          location_lat?: number
          location_lng?: number
          location_name?: string
          points_multiplier?: number | null
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      monthly_leaderboard_snapshots: {
        Row: {
          id: string
          month: number
          points: number
          rank: number
          snapshot_date: string | null
          user_id: string
          username: string
          year: number
        }
        Insert: {
          id?: string
          month: number
          points: number
          rank: number
          snapshot_date?: string | null
          user_id: string
          username: string
          year: number
        }
        Update: {
          id?: string
          month?: number
          points?: number
          rank?: number
          snapshot_date?: string | null
          user_id?: string
          username?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_leaderboard_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_leaderboard_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_streak: number | null
          email: string
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          points: number | null
          streak_freeze_tokens: number | null
          team_name: string | null
          total_waste_kg: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_streak?: number | null
          email: string
          id: string
          last_activity_date?: string | null
          longest_streak?: number | null
          points?: number | null
          streak_freeze_tokens?: number | null
          team_name?: string | null
          total_waste_kg?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_streak?: number | null
          email?: string
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          points?: number | null
          streak_freeze_tokens?: number | null
          team_name?: string | null
          total_waste_kg?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_id: string | null
          description: string | null
          estimated_kg: number | null
          id: string
          points_awarded: number | null
          proof_image_url: string | null
          reviewed_at: string | null
          status: string | null
          submitted_at: string | null
          user_id: string | null
        }
        Insert: {
          activity_id?: string | null
          description?: string | null
          estimated_kg?: number | null
          id?: string
          points_awarded?: number | null
          proof_image_url?: string | null
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          user_id?: string | null
        }
        Update: {
          activity_id?: string | null
          description?: string | null
          estimated_kg?: number | null
          id?: string
          points_awarded?: number | null
          proof_image_url?: string | null
          reviewed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_trophies: {
        Row: {
          id: string
          trophy_id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          trophy_id: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          trophy_id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_trophies_trophy_id_fkey"
            columns: ["trophy_id"]
            isOneToOne: false
            referencedRelation: "ar_trophies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_trophies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_trophies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string | null
          points: number | null
          team_name: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string | null
          points?: number | null
          team_name?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string | null
          points?: number | null
          team_name?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
