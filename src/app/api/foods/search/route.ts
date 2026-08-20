import { NextResponse, type NextRequest } from "next/server";
import { searchFoods } from "@/lib/foods/search";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const query = request.nextUrl.searchParams.get("q") ?? "";
  if (query.trim().length < 2) return NextResponse.json({ hits: [] });

  try {
    const { hits, usdaUnavailable } = await searchFoods(supabase, user.id, query);
    if (usdaUnavailable && hits.length === 0) {
      return NextResponse.json({
        hits,
        error: "We couldn't load food results right now. Try again in a moment.",
      });
    }
    return NextResponse.json({ hits });
  } catch (error) {
    console.error("Food search failed:", error);
    return NextResponse.json({ hits: [], error: "Search is temporarily unavailable." });
  }
}
