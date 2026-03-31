import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return Response.json(
        { error: "Supabase server keys ontbreken" },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();

    if (!token) {
      return Response.json(
        { error: "Geen authorisatie token ontvangen" },
        { status: 401 }
      );
    }

    const authSupabase = createClient(supabaseUrl, anonKey);
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user },
      error: userError,
    } = await authSupabase.auth.getUser(token);

    if (userError || !user) {
      return Response.json(
        { error: userError?.message ?? "Ongeldige gebruiker" },
        { status: 401 }
      );
    }

    const { data, error } = await adminSupabase
      .from("ai_insights")
      .select("insights, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      insights: Array.isArray(data?.insights) ? data.insights : [],
      updated_at: data?.updated_at ?? null,
    });
  } catch (err: any) {
    return Response.json(
      { error: err?.message ?? "Inzichten laden mislukt" },
      { status: 500 }
    );
  }
}