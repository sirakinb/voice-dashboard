"use server";

import { redirect } from "next/navigation";
import { supabaseServerClient } from "./server";

export async function signInWithEmail(email: string) {
  const supabase = await supabaseServerClient();
  
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3030'}/auth/callback`,
    },
  });

  if (error) {
    console.error('Supabase auth error:', error);
    return { error: error.message };
  }

  // Note: Even if successful, Supabase might not send email if:
  // 1. SMTP is not configured in Supabase dashboard
  // 2. Email templates are not set up
  // 3. Rate limiting is in effect
  // Check Supabase dashboard -> Authentication -> Logs for email delivery status
  
  return { success: true, data };
}

export async function signOut() {
  const supabase = await supabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getUser() {
  const supabase = await supabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const supabase = await supabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

