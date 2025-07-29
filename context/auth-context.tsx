"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { checkDatabaseSetup, initializeUserProfile } from "@/lib/database-init";

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  databaseReady: boolean;
  databaseError: string | null;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: any; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithFacebook: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  retryDatabaseSetup: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const hasInitialized = useRef(false);
  const lastUserId = useRef<string | null>(null);

  // Check database setup
  const checkDatabase = async () => {
    try {
      const result = await checkDatabaseSetup();
      setDatabaseReady(result.isSetup);
      setDatabaseError(result.error || null);

      if (!result.isSetup) {
        console.warn("Database setup incomplete:", result.error);
        if (!isSupabaseConfigured) {
          console.log("Running in anonymous-only mode");
        }
      } else {
        console.log("Database setup verified successfully");
      }
    } catch (error) {
      console.error("Database check failed:", error);
      setDatabaseReady(false);
      setDatabaseError(`Database check failed: ${error}`);
    }
  };

  const retryDatabaseSetup = async () => {
    setDatabaseError(null);
    await checkDatabase();
  };

  useEffect(() => {
    // Only run initialization once
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Check database setup first
    checkDatabase();

    // Skip auth setup if Supabase is not configured
    if (!isSupabaseConfigured) {
      console.log("Supabase not configured, skipping auth setup");
      setLoading(false);
      return;
    }

    // Get initial session with error handling
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        }

        setSession(session);
        setUser(session?.user ?? null);
        lastUserId.current = session?.user?.id ?? null;

        // Initialize user profile if user exists and database is ready
        if (session?.user && databaseReady) {
          try {
            await initializeUserProfile(
              session.user.id,
              session.user.email!,
              session.user.user_metadata?.full_name
            );
          } catch (profileError) {
            console.error("Error initializing user profile:", profileError);
          }
        }
      } catch (error) {
        console.error("Unexpected error getting session:", error);
        setSession(null);
        setUser(null);
        lastUserId.current = null;
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes with error handling
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          const currentUserId = session?.user?.id ?? null;

          // Only log and process if the user actually changed
          if (currentUserId !== lastUserId.current) {
            console.log("Auth state changed:", event, session?.user?.email);
            lastUserId.current = currentUserId;

            setSession(session);
            setUser(session?.user ?? null);

            // Initialize user profile for new sessions
            if (
              session?.user &&
              databaseReady &&
              (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
            ) {
              try {
                await initializeUserProfile(
                  session.user.id,
                  session.user.email!,
                  session.user.user_metadata?.full_name
                );
              } catch (profileError) {
                console.error("Error initializing user profile:", profileError);
              }
            }
          }

          setLoading(false);
        } catch (error) {
          console.error("Error in auth state change handler:", error);
          setLoading(false);
        }
      });

      return () => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error("Error unsubscribing from auth changes:", error);
        }
      };
    } catch (error) {
      console.error("Error setting up auth state listener:", error);
      setLoading(false);
    }
  }, [databaseReady]);

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: {
          message: "Authentication not available. Supabase is not configured.",
        },
        data: null,
      };
    }

    try {
      console.log("Starting signup process for:", email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        console.error("Supabase signup error:", error);
        return { error, data: null };
      }

      console.log("Signup successful:", data);
      return { error: null, data };
    } catch (error) {
      console.error("Unexpected signup error:", error);
      return {
        error: {
          message:
            "An unexpected error occurred during signup. Please try again.",
        },
        data: null,
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: {
          message: "Authentication not available. Supabase is not configured.",
        },
      };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Signin error:", error);
      }

      //if successful navigate to chat page
      if (!error) {
        window.location.href = "/chat";
      }

      return { error };
    } catch (error) {
      console.error("Unexpected signin error:", error);
      return {
        error: { message: "An unexpected error occurred during signin" },
      };
    }
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      return {
        error: {
          message: "Authentication not available. Supabase is not configured.",
        },
      };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Google signin error:", error);
      }

      return { error };
    } catch (error) {
      console.error("Unexpected Google signin error:", error);
      return {
        error: { message: "An unexpected error occurred during Google signin" },
      };
    }
  };

  const signInWithFacebook = async () => {
    if (!isSupabaseConfigured) {
      return {
        error: {
          message: "Authentication not available. Supabase is not configured.",
        },
      };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Facebook signin error:", error);
      }

      return { error };
    } catch (error) {
      console.error("Unexpected Facebook signin error:", error);
      return {
        error: {
          message: "An unexpected error occurred during Facebook signin",
        },
      };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Signout error:", error);
      }
      // Reset the user tracking
      lastUserId.current = null;
      //navigate to login page after signout
      window.location.href = "/login";
    } catch (error) {
      console.error("Unexpected signout error:", error);
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return {
        error: {
          message: "Authentication not available. Supabase is not configured.",
        },
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`,
      });
      return { error };
    } catch (error) {
      console.error("Unexpected reset password error:", error);
      return {
        error: {
          message: "An unexpected error occurred during password reset",
        },
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        databaseReady: databaseReady || !isSupabaseConfigured,
        databaseError,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithFacebook,
        signOut,
        resetPassword,
        retryDatabaseSetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
