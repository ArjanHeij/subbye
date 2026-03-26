import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeSecretKey) {
      return Response.json(
        { error: "STRIPE_SECRET_KEY ontbreekt" },
        { status: 500 }
      );
    }

    if (!appUrl) {
      return Response.json(
        { error: "NEXT_PUBLIC_APP_URL ontbreekt" },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return Response.json(
        { error: "Supabase env vars ontbreken" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    const accessToken = body?.accessToken;

    if (!accessToken) {
      return Response.json(
        { error: "Geen access token ontvangen" },
        { status: 401 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    // 1) gebruiker veilig valideren op basis van access token
    const authClient = createClient(supabaseUrl, supabaseAnonKey);

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(accessToken);

    if (userError || !user) {
      return Response.json(
        { error: "Niet ingelogd of sessie ongeldig" },
        { status: 401 }
      );
    }

    // 2) profiel ophalen met service role
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return Response.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    if (!profile?.stripe_customer_id) {
      return Response.json(
        { error: "Geen Stripe customer gekoppeld aan dit account" },
        { status: 400 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/settings`,
    });

    return Response.json({ url: session.url });
  } catch (err: any) {
    return Response.json(
      { error: err?.message ?? "Portal openen mislukt" },
      { status: 500 }
    );
  }
}