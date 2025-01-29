import { fetchSubscription, stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.text();
  /* 
  checkout.session.completed
customer.subscription.deleted
customer.subscription.updated
payment_intent.payment_failed
price.created
price.deleted
price.updated 
*/
  if (!body) {
    return new Response("No event found", { status: 400 });
  }

  let event = stripe.webhooks.constructEvent(
    body,
    request.headers.get("stripe-signature")!,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  switch (event.type) {
    case "checkout.session.completed":
      console.log("checkout.session.completed");
      const subId = event.data.object.subscription as string;
      if (!subId) {
        throw new Error("No subscription ID found");
      }
      const subscription = await fetchSubscription(subId);
      console.log("subscription: ", subscription);
      console.log("checkout.session.completed event: ", event);
      break;
    case "customer.subscription.updated":
      console.log("customer.subscription.updated");
      console.log("checkout.session.updated event: ", event);
      break;
    case "customer.subscription.deleted":
      console.log("customer.subscription.deleted");
      console.log("customer.subscription.deleted event: ", event);
      break;
    case "payment_intent.payment_failed":
      console.log("payment_intent.payment_failed");
      console.log("payment_intent.payment_failed event: ", event);
      break;
    default:
      console.log("unhandled event: ", event);
      break;
  }
  return Response.json({ received: true });
}
