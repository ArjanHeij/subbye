import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!stripeSecretKey) {
      return new Response("STRIPE_SECRET_KEY ontbreekt", { status: 500 });
    }

    if (!webhookSecret) {
      return new Response("STRIPE_WEBHOOK_SECRET ontbreekt", { status: 500 });
    }

    if (!supabaseUrl) {
      return new Response("NEXT_PUBLIC_SUPABASE_URL ontbreekt", { status: 500 });
    }

    if (!supabaseServiceRoleKey) {
      return new Response("SUPABASE_SERVICE_ROLE_KEY ontbreekt", { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey);
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const email = session.customer_details?.email ?? null;
      const customerId =
        typeof session.customer === "string" ? session.customer : null;

      if (email) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single();

        if (!profileError && profile?.id) {
          await supabase
            .from("profiles")
            .update({
              is_premium: true,
              plan: "premium",
              stripe_customer_id: customerId,
            })
            .eq("id", profile.id);
        }
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : null;

      if (customerId) {
        await supabase
          .from("profiles")
          .update({
            is_premium: false,
            plan: "free",
          })
          .eq("stripe_customer_id", customerId);
      }
    }

    return new Response("ok", { status: 200 });
  } catch (err: any) {
    return new Response(err?.message ?? "Webhook fout", { status: 400 });
  }
}