import jwt from "npm:jsonwebtoken@9.0.2";
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const WEBHOOK_PUBLIC_KEY = Deno.env.get("WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY");
    if (!WEBHOOK_PUBLIC_KEY) {
      console.error("Missing WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY");
      return new Response("Webhook key not configured", { status: 500 });
    }

    const requestBody = await req.text();

    // Step 1: Verify JWT signature — fail closed if verification fails
    let rawPayload;
    try {
      rawPayload = jwt.verify(requestBody, WEBHOOK_PUBLIC_KEY, { algorithms: ["RS256"] });
    } catch (verifyError) {
      console.error("JWT verification failed:", verifyError.message);
      return new Response("Invalid signature", { status: 401 });
    }

    // Step 2: Parse double-nested JSON
    const event = JSON.parse(rawPayload.data);
    const eventData = JSON.parse(event.data);

    // Step 3: Route by event type
    if (event.eventType === "wix.ecom.v1.order_approved") {
      const order = eventData.actionEvent.body.order;
      console.log(`Order approved: ${order.id}, checkout: ${order.checkoutId}, total: ${order.priceSummary?.total?.amount} ${order.currency}`);
      try {
        const base44 = createClientFromRequest(req);
        const existing = await base44.asServiceRole.entities.Order.filter({ order_id: order.id });
        if (!existing || !existing.length) {
          const lineItems = (order.lineItems || []).map((li) => ({
            name: (li.productName && li.productName.original) || li.name || "Item",
            quantity: li.quantity || 1,
            price: parseFloat((li.price && li.price.amount) || 0),
          }));
          const contact = (order.billingInfo && order.billingInfo.contactDetails) || {};
          await base44.asServiceRole.entities.Order.create({
            order_id: order.id,
            checkout_id: order.checkoutId || "",
            buyer_email: (order.buyerInfo && order.buyerInfo.email) || "",
            buyer_name: [contact.firstName, contact.lastName].filter(Boolean).join(" "),
            total: parseFloat((order.priceSummary && order.priceSummary.total && order.priceSummary.total.amount) || 0),
            currency: order.currency || "USD",
            items: lineItems,
          });
        }
      } catch (storeErr) {
        console.error("Order store error:", storeErr.message);
      }
    } else if (event.eventType === "wix.ecom.subscription_contracts.v1.subscription_contract_canceled") {
      const sub = eventData.actionEvent.body.subscriptionContract;
      console.log(`Subscription canceled: ${sub.id}`);
    } else if (event.eventType === "wix.ecom.subscription_contracts.v1.subscription_contract_expired") {
      const sub = eventData.actionEvent.body.subscriptionContract;
      console.log(`Subscription expired: ${sub.id}`);
    } else {
      console.log(`Unhandled event type: ${event.eventType}`);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook handler error:", error.message);
    return new Response("Internal error", { status: 500 });
  }
});