import { createClient } from '@supabase/supabase-js'

// These will be automatically populated by Supabase integration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url: string | null
          points: number
          team_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          avatar_url?: string | null
          points?: number
          team_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_url?: string | null
          points?: number
          team_name?: string | null
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          title: string
          description: string
          points: number
          icon: string
          active: boolean
          week_start: string
          week_end: string
          created_at: string
        }
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          activity_id: string
          proof_image_url: string | null
          status: 'pending' | 'approved' | 'rejected'
          points_awarded: number
          submitted_at: string
          reviewed_at: string | null
        }
      }
    }
  }
}