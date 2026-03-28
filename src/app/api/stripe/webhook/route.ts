import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const runtime = "nodejs";

type StripeSubscriptionWithPeriod = Stripe.Subscription & {
  current_period_end?: number | null;
};

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }
  return secret;
}

function getStripeCustomerId(
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): string | null {
  if (!customer) return null;
  if (typeof customer === "string") return customer;
  return customer.id ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        getWebhookSecret()
      );
    } catch (err: any) {
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const customerId = getStripeCustomerId(session.customer);
        const customerEmail =
          session.customer_details?.email ?? session.customer_email ?? null;

        if (!customerId && !customerEmail) break;

        const profileQuery = supabase
          .from("profiles")
          .select("id, email, stripe_customer_id")
          .limit(1);

        const { data: profile, error: profileError } = customerId
          ? await profileQuery.eq("stripe_customer_id", customerId).maybeSingle()
          : await profileQuery.eq("email", customerEmail).maybeSingle();

        if (profileError) {
          throw new Error(`Profile lookup failed: ${profileError.message}`);
        }

        if (profile) {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              stripe_customer_id: customerId ?? profile.stripe_customer_id,
              is_premium: true,
              plan: "premium",
            })
            .eq("id", profile.id);

          if (updateError) {
            throw new Error(`Profile update failed: ${updateError.message}`);
          }
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as StripeSubscriptionWithPeriod;

        const customerId = getStripeCustomerId(subscription.customer);
        if (!customerId) {
          throw new Error("Subscription has no customer id");
        }

        const premiumUntil =
          subscription.current_period_end != null
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null;

        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing" ||
          subscription.status === "past_due";

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profileError) {
          throw new Error(`Profile lookup failed: ${profileError.message}`);
        }

        if (profile) {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              is_premium: isActive,
              plan: isActive ? "premium" : "free",
              premium_until: premiumUntil,
            })
            .eq("id", profile.id);

          if (updateError) {
            throw new Error(`Profile update failed: ${updateError.message}`);
          }
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as StripeSubscriptionWithPeriod;

        const customerId = getStripeCustomerId(subscription.customer);
        if (!customerId) {
          throw new Error("Subscription has no customer id");
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profileError) {
          throw new Error(`Profile lookup failed: ${profileError.message}`);
        }

        if (profile) {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              is_premium: false,
              plan: "free",
              premium_until: null,
            })
            .eq("id", profile.id);

          if (updateError) {
            throw new Error(`Profile update failed: ${updateError.message}`);
          }
        }

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Stripe webhook error:", err);

    return NextResponse.json(
      { error: err?.message ?? "Webhook handler failed" },
      { status: 500 }
    );
  }
}