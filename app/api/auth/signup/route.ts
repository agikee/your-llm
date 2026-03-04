import { createServerSupabaseClient } from "@/lib/database/supabase";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validate, signUpRequestSchema } from "@/lib/validations";

import type { SignUpRequest } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request using Zod schema
    const validationResult = validate(signUpRequestSchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const { email, password, name } = validationResult.data as SignUpRequest;

    // Check for special character
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{}|;:'"\\|<>,.\/?]/;
    if (!specialCharRegex.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one special character" },
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
      options: {
        data: {
          name: name || undefined,
        },
      },
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
