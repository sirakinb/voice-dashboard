"use server";

import { redirect } from "next/navigation";
import { supabaseServerClient } from "./server";

export async function signOut() {
  const supabase = await supabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getUser() {
  const supabase = await supabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const supabase = await supabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
