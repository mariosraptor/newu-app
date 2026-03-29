export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          emergency_contact: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          emergency_contact?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          emergency_contact?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      journeys: {
        Row: {
          id: string
          user_id: string
          addiction_type: 'smoking' | 'vaping' | 'snus' | 'alcohol'
          quit_datetime: string
          daily_cost: number
          currency: string
          my_why: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          addiction_type: 'smoking' | 'vaping' | 'snus' | 'alcohol'
          quit_datetime: string
          daily_cost?: number
          currency?: string
          my_why: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          addiction_type?: 'smoking' | 'vaping' | 'snus' | 'alcohol'
          quit_datetime?: string
          daily_cost?: number
          currency?: string
          my_why?: string
          is_active?: boolean
          created_at?: string
        }
      }
      triggers: {
        Row: {
          id: string
          user_id: string
          journey_id: string | null
          category: 'emotional' | 'situational' | 'social'
          name: string
          is_custom: boolean
          activation_count: number
          resistance_count: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          journey_id?: string | null
          category: 'emotional' | 'situational' | 'social'
          name: string
          is_custom?: boolean
          activation_count?: number
          resistance_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          journey_id?: string | null
          category?: 'emotional' | 'situational' | 'social'
          name?: string
          is_custom?: boolean
          activation_count?: number
          resistance_count?: number
          created_at?: string
        }
      }
      trigger_logs: {
        Row: {
          id: string
          trigger_id: string
          user_id: string
          was_resisted: boolean
          strategy_used: string | null
          body_sensation: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trigger_id: string
          user_id: string
          was_resisted: boolean
          strategy_used?: string | null
          body_sensation?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trigger_id?: string
          user_id?: string
          was_resisted?: boolean
          strategy_used?: string | null
          body_sensation?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          activity_name: string
          duration_minutes: number | null
          notes: string | null
          vitality_points: number
          logged_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          activity_name: string
          duration_minutes?: number | null
          notes?: string | null
          vitality_points?: number
          logged_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          activity_name?: string
          duration_minutes?: number | null
          notes?: string | null
          vitality_points?: number
          logged_at?: string
        }
      }
      bucket_items: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          cost: number
          currency: string
          is_achieved: boolean
          achieved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          cost: number
          currency?: string
          is_achieved?: boolean
          achieved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          cost?: number
          currency?: string
          is_achieved?: boolean
          achieved_at?: string | null
          created_at?: string
        }
      }
      milestones: {
        Row: {
          id: string
          user_id: string
          journey_id: string
          milestone_type: string
          days_count: number
          achieved_at: string
          celebrated: boolean
        }
        Insert: {
          id?: string
          user_id: string
          journey_id: string
          milestone_type: string
          days_count: number
          achieved_at?: string
          celebrated?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          journey_id?: string
          milestone_type?: string
          days_count?: number
          achieved_at?: string
          celebrated?: boolean
        }
      }
      daily_checkins: {
        Row: {
          id: string
          user_id: string
          mood: 'strong' | 'good' | 'struggling' | 'need_help'
          notes: string | null
          checkin_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood: 'strong' | 'good' | 'struggling' | 'need_help'
          notes?: string | null
          checkin_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood?: 'strong' | 'good' | 'struggling' | 'need_help'
          notes?: string | null
          checkin_date?: string
          created_at?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          journey_id: string | null
          entry_type: 'trigger_journal' | 'general' | 'identity_statement'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          journey_id?: string | null
          entry_type: 'trigger_journal' | 'general' | 'identity_statement'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          journey_id?: string | null
          entry_type?: 'trigger_journal' | 'general' | 'identity_statement'
          content?: string
          created_at?: string
        }
      }
      selfie_records: {
        Row: {
          id: string
          user_id: string
          journey_id: string | null
          day_number: number
          image_data: string
          analysis_notes: string | null
          taken_at: string
        }
        Insert: {
          id?: string
          user_id: string
          journey_id?: string | null
          day_number: number
          image_data: string
          analysis_notes?: string | null
          taken_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          journey_id?: string | null
          day_number?: number
          image_data?: string
          analysis_notes?: string | null
          taken_at?: string
        }
      }
    }
  }
}
