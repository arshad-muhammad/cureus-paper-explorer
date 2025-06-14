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
      author_emails: {
        Row: {
          author_name: string
          confidence_score: number | null
          created_at: string
          email: string | null
          id: string
          last_updated: string
          source: string
        }
        Insert: {
          author_name: string
          confidence_score?: number | null
          created_at?: string
          email?: string | null
          id?: string
          last_updated?: string
          source: string
        }
        Update: {
          author_name?: string
          confidence_score?: number | null
          created_at?: string
          email?: string | null
          id?: string
          last_updated?: string
          source?: string
        }
        Relationships: []
      }
      code_reviews: {
        Row: {
          created_at: string | null
          id: string
          pr_id: string
          results: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pr_id: string
          results: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pr_id?: string
          results?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "code_reviews_pr_id_fkey"
            columns: ["pr_id"]
            isOneToOne: false
            referencedRelation: "pull_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          created_at: string
          file_type: string
          file_url: string
          id: string
          plagiarism_score: number | null
          report_json: Json | null
          status: string
          title: string
          updated_at: string
          upload_date: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_type: string
          file_url: string
          id?: string
          plagiarism_score?: number | null
          report_json?: Json | null
          status?: string
          title: string
          updated_at?: string
          upload_date?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_type?: string
          file_url?: string
          id?: string
          plagiarism_score?: number | null
          report_json?: Json | null
          status?: string
          title?: string
          updated_at?: string
          upload_date?: string
          user_id?: string
        }
        Relationships: []
      }
      pull_requests: {
        Row: {
          author: string
          branch: string
          created_at: string | null
          diff_url: string
          id: string
          pr_id: number
          repo_id: number
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author: string
          branch: string
          created_at?: string | null
          diff_url: string
          id?: string
          pr_id: number
          repo_id: number
          status: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string
          branch?: string
          created_at?: string | null
          diff_url?: string
          id?: string
          pr_id?: number
          repo_id?: number
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rewrites: {
        Row: {
          created_at: string
          document_id: string
          id: string
          original_text: string
          rewritten_text: string
          tone: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          original_text: string
          rewritten_text: string
          tone: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          original_text?: string
          rewritten_text?: string
          tone?: string
        }
        Relationships: [
          {
            foreignKeyName: "rewrites_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      scraping_jobs: {
        Row: {
          author_count: number | null
          completed_at: string | null
          created_at: string
          doi: string
          emails_found: number | null
          error_message: string | null
          id: string
          status: string
        }
        Insert: {
          author_count?: number | null
          completed_at?: string | null
          created_at?: string
          doi: string
          emails_found?: number | null
          error_message?: string | null
          id?: string
          status?: string
        }
        Update: {
          author_count?: number | null
          completed_at?: string | null
          created_at?: string
          doi?: string
          emails_found?: number | null
          error_message?: string | null
          id?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      document_status: "uploaded" | "processing" | "completed" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      document_status: ["uploaded", "processing", "completed", "failed"],
    },
  },
} as const
