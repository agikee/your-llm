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

    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient({
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: any) => cookieStore.set(name, value, options),
      remove: (name: string, options: any) => cookieStore.set(name, "", { ...options, maxAge: 0 }),
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Signin error:", error);
      
      // Handle specific error cases
      if (error.message.includes("Invalid login credentials")) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
      
      if (error.message.includes("Email not confirmed")) {
        return NextResponse.json(
          { error: "Please confirm your email address before signing in" },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || "Failed to sign in" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
      message: "Signed in successfully",
    });
  } catch (error) {
    console.error("Signin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
