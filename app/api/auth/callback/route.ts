import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();

    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) { // upsert if not present it will going to make the row 
      await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name ?? "",
        image: user.user_metadata?.avatar_url ?? null,

      });
    }
  }

  return NextResponse.redirect(
    new URL("/editor", request.url)
  );
}