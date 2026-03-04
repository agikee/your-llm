// Database types for Supabase
// These types match the schema defined in lib/database/schema.sql

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
      profiles: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      discovery_sessions: {
        Row: {
          id: string;
          user_id: string;
          phase: string;
          messages: Json[];
          context: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          phase?: string;
          messages?: Json[];
          context?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          phase?: string;
          messages?: Json[];
          context?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_contexts: {
        Row: {
          id: string;
          user_id: string;
          comprehensive: Json;
          modules: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          comprehensive?: Json;
          modules?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          comprehensive?: Json;
          modules?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience types for tables
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type DiscoverySession = Database["public"]["Tables"]["discovery_sessions"]["Row"];
export type UserContext = Database["public"]["Tables"]["user_contexts"]["Row"];

// Insert types
export type NewProfile = Database["public"]["Tables"]["profiles"]["Insert"];
export type NewDiscoverySession = Database["public"]["Tables"]["discovery_sessions"]["Insert"];
export type NewUserContext = Database["public"]["Tables"]["user_contexts"]["Insert"];

// Update types
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type DiscoverySessionUpdate = Database["public"]["Tables"]["discovery_sessions"]["Update"];
export type UserContextUpdate = Database["public"]["Tables"]["user_contexts"]["Update"];
