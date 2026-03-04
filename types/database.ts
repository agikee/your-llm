// Database types - placeholder for Supabase generated types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export interface Database {
  public: {
    Tables: {
      users: { Row: { id: string; email: string; created_at: string }; Insert: { id?: string; email: string }; Update: { email?: string } };
      user_contexts: { Row: { id: string; user_id: string; personality_context: string | null; full_context: string | null }; Insert: { user_id: string }; Update: {} };
    };
  };
}
