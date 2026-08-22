import { NextResponse } from "next/server";
import { routes } from "@/lib/site";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(routes.account, origin));
      }
    }
  }

  return NextResponse.redirect(new URL(routes.login, origin));
}
