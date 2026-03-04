import { createServerSupabaseClient } from "@/lib/database/supabase";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient({
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: any) => cookieStore.set(name, value, options),
      remove: (name: string, options: any) => cookieStore.set(name, "", { ...options, maxAge: 0 }),
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Signup error:", error);
      
      // Handle specific error cases
      if (error.message.includes("already registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || "Failed to create account" },
        { status: 400 }
      );
    }

    // If email confirmation is required, data.session might be null
    return NextResponse.json({
      user: data.user,
      session: data.session,
      message: data.session 
        ? "Account created successfully" 
        : "Account created. Please check your email to confirm your account.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
