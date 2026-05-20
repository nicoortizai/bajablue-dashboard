"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, AUTH_MAX_AGE, tokenForPassword, verifyPassword } from "@/lib/auth";

export async function signIn(formData: FormData): Promise<void> {
  const pw = (formData.get("password") ?? "").toString();
  const from = (formData.get("from") ?? "/").toString() || "/";

  const ok = await verifyPassword(pw);
  if (!ok) {
    redirect(`/login?from=${encodeURIComponent(from)}&error=1`);
  }

  const token = await tokenForPassword(pw);
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_MAX_AGE,
  });

  redirect(from.startsWith("/") ? from : "/");
}

export async function signOut(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
  redirect("/login");
}
