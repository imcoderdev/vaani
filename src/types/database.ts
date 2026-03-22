export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string | null
          date: string
          id: string
          percentage: number | null
          present: boolean | null
          student_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          percentage?: number | null
          present?: boolean | null
          student_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          percentage?: number | null
          present?: boolean | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          created_at: string | null
          direction: Database["public"]["Enums"]["call_direction"]
          duration_seconds: number | null
          flag_counselor: boolean | null
          id: string
          parent_id: string | null
          sentiment: Database["public"]["Enums"]["call_sentiment"] | null
          student_id: string | null
          summary: string | null
          transcript: string | null
          triggered_by_id: string | null
          vapi_call_id: string | null
        }
        Insert: {
          created_at?: string | null
          direction: Database["public"]["Enums"]["call_direction"]
          duration_seconds?: number | null
          flag_counselor?: boolean | null
          id?: string
          parent_id?: string | null
          sentiment?: Database["public"]["Enums"]["call_sentiment"] | null
          student_id?: string | null
          summary?: string | null
          transcript?: string | null
          triggered_by_id?: string | null
          vapi_call_id?: string | null
        }
        Update: {
          created_at?: string | null
          direction?: Database["public"]["Enums"]["call_direction"]
          duration_seconds?: number | null
          flag_counselor?: boolean | null
          id?: string
          parent_id?: string | null
          sentiment?: Database["public"]["Enums"]["call_sentiment"] | null
          student_id?: string | null
          summary?: string | null
          transcript?: string | null
          triggered_by_id?: string | null
          vapi_call_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_triggered_by_id_fkey"
            columns: ["triggered_by_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      counselor_alerts: {
        Row: {
          assigned_to_id: string | null
          call_log_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          reason: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["alert_status"] | null
          student_id: string | null
        }
        Insert: {
          assigned_to_id?: string | null
          call_log_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["alert_status"] | null
          student_id?: string | null
        }
        Update: {
          assigned_to_id?: string | null
          call_log_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["alert_status"] | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "counselor_alerts_assigned_to_id_fkey"
            columns: ["assigned_to_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counselor_alerts_call_log_id_fkey"
            columns: ["call_log_id"]
            isOneToOne: true
            referencedRelation: "call_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "counselor_alerts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_profiles: {
        Row: {
          created_at: string | null
          id: string
          phone: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          phone?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          phone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_students: {
        Row: {
          id: string
          parent_id: string | null
          student_id: string | null
        }
        Insert: {
          id?: string
          parent_id?: string | null
          student_id?: string | null
        }
        Update: {
          id?: string
          parent_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "parent_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          assigned_teacher_id: string | null
          class_group: string
          created_at: string | null
          id: string
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          risk_score: number | null
          roll_number: string | null
          section: string | null
          user_id: string | null
        }
        Insert: {
          assigned_teacher_id?: string | null
          class_group: string
          created_at?: string | null
          id?: string
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_score?: number | null
          roll_number?: string | null
          section?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_teacher_id?: string | null
          class_group?: string
          created_at?: string | null
          id?: string
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          risk_score?: number | null
          roll_number?: string | null
          section?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_assigned_teacher_id_fkey"
            columns: ["assigned_teacher_id"]
            isOneToOne: false
            referencedRelation: "teacher_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_profiles: {
        Row: {
          class_group: string | null
          created_at: string | null
          department: string | null
          id: string
          section: string | null
          user_id: string | null
        }
        Insert: {
          class_group?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          section?: string | null
          user_id?: string | null
        }
        Update: {
          class_group?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          section?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_risk_score: { Args: { p_student_id: string }; Returns: number }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      alert_status: "open" | "reviewed" | "resolved"
      app_role: "admin" | "teacher" | "counselor" | "student" | "parent"
      call_direction: "outbound" | "inbound"
      call_sentiment: "positive" | "neutral" | "concerned" | "distress"
      risk_level: "green" | "yellow" | "red"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]

// Convenient type aliases
export type User = Tables<"users">
export type UserRole = Tables<"user_roles">
export type StudentProfile = Tables<"student_profiles">
export type TeacherProfile = Tables<"teacher_profiles">
export type ParentProfile = Tables<"parent_profiles">
export type Attendance = Tables<"attendance">
export type CallLog = Tables<"call_logs">
export type CounselorAlert = Tables<"counselor_alerts">
export type Notification = Tables<"notifications">

export type AppRole = Enums<"app_role">
export type RiskLevel = Enums<"risk_level">
export type CallDirection = Enums<"call_direction">
export type CallSentiment = Enums<"call_sentiment">
export type AlertStatus = Enums<"alert_status">
