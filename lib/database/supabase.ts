import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ============================================================================
// Browser Client
// ============================================================================

/**
 * Create a Supabase client for use in browser components
 * Uses @supabase/ssr for better SSR support
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Singleton instance for browser
let browserClient: ReturnType<typeof createBrowserSupabaseClient> | undefined;

export function getBrowserClient() {
  if (typeof window === "undefined") {
    throw new Error("getBrowserClient should only be called in browser");
  }
  
  if (!browserClient) {
    browserClient = createBrowserSupabaseClient();
  }
  
  return browserClient;
}

// ============================================================================
// Server Client
// ============================================================================

/**
 * Create a Supabase client for use in server components, API routes, and server actions
 * Uses cookies for session management
 */
export function createServerSupabaseClient(cookies: {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options: any) => void;
  remove: (name: string, options: any) => void;
}) {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookies.get(name);
      },
      set(name: string, value: string, options: any) {
        try {
          cookies.set(name, value, options);
        } catch {
          // Cookie might fail in server components
        }
      },
      remove(name: string, options: any) {
        try {
          cookies.remove(name, options);
        } catch {
          // Cookie might fail in server components
        }
      },
    },
  });
}

/**
 * Create a Supabase client with service role privileges
 * Use ONLY in secure server contexts (API routes, server actions)
 * This client bypasses Row Level Security
 */
export function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  
  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ============================================================================
// Legacy Client (deprecated - use getBrowserClient instead)
// ============================================================================

/**
 * @deprecated Use getBrowserClient() for browser, createServerSupabaseClient() for server
 */
export const supabase = typeof window !== "undefined"
  ? getBrowserClient()
  : createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the current session from browser
 */
export async function getSession() {
  const client = getBrowserClient();
  const { data: { session }, error } = await client.auth.getSession();
  
  if (error) {
    console.error("Error getting session:", error);
    return null;
  }
  
  return session;
}

/**
 * Get the current user from browser
 */
export async function getCurrentUser() {
  const client = getBrowserClient();
  const { data: { user }, error } = await client.auth.getUser();
  
  if (error) {
    console.error("Error getting user:", error);
    return null;
  }
  
  return user;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const client = getBrowserClient();
  const { error } = await client.auth.signOut();
  
  if (error) {
    console.error("Error signing out:", error);
    return { success: false, error };
  }
  
  return { success: true, error: null };
}

/**
 * Get profile data for current user
 */
export async function getCurrentProfile() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  const client = getBrowserClient();
  const { data: profile, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  
  if (error) {
    console.error("Error getting profile:", error);
    return null;
  }
  
  return profile;
}

export default supabase;
