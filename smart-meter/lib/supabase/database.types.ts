export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      smart_meters: {
        Row: {
          id: string
          meter_id: string
          user_id: string | null
          status: string
          current_units: number
          last_update: string
          update_frequency: number
          data_retention_days: number
          created_at: string
        }
        Insert: {
          id?: string
          meter_id: string
          user_id?: string | null
          status?: string
          current_units?: number
          last_update?: string
          update_frequency?: number
          data_retention_days?: number
          created_at?: string
        }
        Update: {
          id?: string
          meter_id?: string
          user_id?: string | null
          status?: string
          current_units?: number
          last_update?: string
          update_frequency?: number
          data_retention_days?: number
          created_at?: string
        }
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          type: string
          name: string
          details: string
          is_default: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          name: string
          details: string
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          name?: string
          details?: string
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          meter_id: string | null
          type: string
          amount: number | null
          units: number | null
          status: string
          description: string
          payment_method_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meter_id?: string | null
          type: string
          amount?: number | null
          units?: number | null
          status?: string
          description: string
          payment_method_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meter_id?: string | null
          type?: string
          amount?: number | null
          units?: number | null
          status?: string
          description?: string
          payment_method_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      auto_load_settings: {
        Row: {
          id: string
          user_id: string
          enabled: boolean
          threshold: number
          amount: number
          max_daily: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          enabled?: boolean
          threshold?: number
          amount?: number
          max_daily?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          enabled?: boolean
          threshold?: number
          amount?: number
          max_daily?: number
          created_at?: string
          updated_at?: string
        }
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          low_balance: boolean
          auto_load: boolean
          purchases: boolean
          system_updates: boolean
          marketing: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          low_balance?: boolean
          auto_load?: boolean
          purchases?: boolean
          system_updates?: boolean
          marketing?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          low_balance?: boolean
          auto_load?: boolean
          purchases?: boolean
          system_updates?: boolean
          marketing?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
