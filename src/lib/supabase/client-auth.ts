"use client";

import { supabaseBrowserClient } from "./client";

export async function signInWithEmail(email: string) {
  const supabase = supabaseBrowserClient();
  const redirectUrl = `${window.location.origin.replace(/\/$/, "")}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, data };
}
