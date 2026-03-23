import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripePriceId = process.env.STRIPE_PRICE_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!stripeSecretKey) {
      return Response.json(
        { error: "STRIPE_SECRET_KEY ontbreekt" },
        { status: 500 }
      );
    }

    if (!stripePriceId) {
      return Response.json(
        { error: "STRIPE_PRICE_ID ontbreekt" },
        { status: 500 }
      );
    }

    if (!appUrl) {
      return Response.json(
        { error: "NEXT_PUBLIC_APP_URL ontbreekt" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/premium/success`,
      cancel_url: `${appUrl}/premium`,
    });

    return Response.json({ url: checkoutSession.url });
  } catch (err: any) {
    return Response.json(
      { error: err?.message ?? "Checkout fout" },
      { status: 500 }
    );
  }
}