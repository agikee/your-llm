import { useState, useEffect, useCallback } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/database/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

interface SignUpCredentials {
  email: string;
  password: string;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface UseAuthReturn extends AuthState {
  signUp: (credentials: SignUpCredentials) => Promise<{ error: AuthError | null }>;
  signIn: (credentials: SignInCredentials) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
}

/**
 * Authentication hook for managing user authentication state
 * Provides sign up, sign in, sign out, and session management
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  const supabase = getBrowserClient();

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            setState({ user: null, session: null, loading: false, error });
          } else {
            setState({
              user: session?.user ?? null,
              session,
              loading: false,
              error: null,
            });
          }
        }
      } catch (err) {
        if (mounted) {
          setState({
            user: null,
            session: null,
            loading: false,
            error: err as AuthError,
          });
        }
      }
    }

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setState({
            user: session?.user ?? null,
            session,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  /**
   * Sign up a new user
   */
  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error }));
      return { error };
    }

    // The session might not be immediately available if email confirmation is required
    setState({
      user: data.user,
      session: data.session,
      loading: false,
      error: null,
    });

    return { error: null };
  }, [supabase.auth]);

  /**
   * Sign in an existing user
   */
  const signIn = useCallback(async (credentials: SignInCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error }));
      return { error };
    }

    setState({
      user: data.user,
      session: data.session,
      loading: false,
      error: null,
    });

    return { error: null };
  }, [supabase.auth]);

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { error } = await supabase.auth.signOut();

    if (error) {
      setState(prev => ({ ...prev, loading: false, error }));
      return { error };
    }

    setState({
      user: null,
      session: null,
      loading: false,
      error: null,
    });

    return { error: null };
  }, [supabase.auth]);

  /**
   * Refresh the current session
   */
  const refreshSession = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error) {
      setState(prev => ({ ...prev, loading: false, error }));
      return;
    }

    setState({
      user: session?.user ?? null,
      session,
      loading: false,
      error: null,
    });
  }, [supabase.auth]);

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    refreshSession,
  };
}

export default useAuth;
