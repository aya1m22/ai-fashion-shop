import Stripe from "stripe";
import { ENV } from "./_core/env";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    if (!ENV.stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is not configured");
    _stripe = new Stripe(ENV.stripeSecretKey, { apiVersion: "2025-05-28.basil" });
  }
  return _stripe;
}

export interface CartLineItem {
  name: string;
  price: string;
  quantity: number;
  imageUrl?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  address: string;
}

export async function createCheckoutSession(
  items: CartLineItem[],
  customer: CustomerInfo,
  successUrl: string,
  cancelUrl: string,
): Promise<string> {
  const stripe = getStripe();

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.name,
        ...(item.imageUrl ? { images: [item.imageUrl] } : {}),
      },
      unit_amount: Math.round(parseFloat(item.price) * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    customer_email: customer.email,
    metadata: {
      customerName: customer.name,
      customerAddress: customer.address,
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 599, currency: "usd" },
          display_name: "Standard Shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 5 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session.url!;
}

export async function retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "line_items.data.price.product"],
  });
}
