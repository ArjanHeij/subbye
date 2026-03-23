import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return Response.json(
        { error: "Supabase server keys ontbreken" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { users },
      error: usersError,
    } = await supabase.auth.admin.listUsers();

    if (usersError) {
      return Response.json({ error: usersError.message }, { status: 500 });
    }

    const user = users[0];

    if (!user) {
      return Response.json(
        { error: "Geen gebruiker gevonden" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("ai_insights")
      .select("insights, updated_at")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
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