import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const items = body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Resolve prices server-side. Merch items must reference a real Product and
    // we use that product's stored price (ignoring any client-supplied price) so a
    // buyer can't submit a tampered amount. Donation items have no product_id and
    // use the client-chosen amount.
    const cartItems = [];
    for (const item of items) {
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      let price;
      let name = String(item.name || "").slice(0, 255);

      if (item.product_id) {
        let product = null;
        try { product = await base44.asServiceRole.entities.Product.get(String(item.product_id)); }
        catch (e) { product = null; }
        if (!product) {
          return Response.json({ error: "Invalid product in cart" }, { status: 400 });
        }
        price = Number(product.price);
        if (!Number.isFinite(price) || price < 0) {
          return Response.json({ error: "Invalid product price" }, { status: 400 });
        }
        if (!name) name = String(product.name).slice(0, 255);
      } else {
        // Only explicit donation items may carry a client-chosen amount.
        // Reject any custom-priced line item that isn't clearly a donation, so a
        // buyer can't submit a tampered price for merchandise by omitting product_id.
        const isDonation = item.is_donation === true;
        const donationName = /^donation\b|\bdonation$/i.test(name) || /donation/i.test(name);
        if (!isDonation || !donationName) {
          return Response.json({ error: "Custom-priced items must be flagged as donations" }, { status: 400 });
        }
        // Donation names must not match real product names (prevents merch spoofing).
        if (/\b(hoodie|shirt|tee|hat|cap|jersey|jacket|beanie|merch)\b/i.test(name)) {
          return Response.json({ error: "Invalid donation item" }, { status: 400 });
        }
        price = parseFloat(item.price);
        if (!Number.isFinite(price) || price < 0) {
          return Response.json({ error: "Invalid amount" }, { status: 400 });
        }
      }
      cartItems.push({ name, quantity, price: price.toFixed(2) });
    }

    // Validate minimum charge (Wix rejects charges under 0.50)
    const total = cartItems.reduce((sum, ci) => sum + (parseFloat(ci.price) * ci.quantity), 0);
    if (total < 0.50) {
      return Response.json({ error: "Minimum order amount is $0.50" }, { status: 400 });
    }

    // Build URLs from Origin header — validated against an allowlist so a spoofed
    // origin can't redirect the buyer to an attacker-controlled domain after checkout.
    const ALLOWED_ORIGINS = [
      "https://wilbanks-fishing.app",
      "https://wilbanksfishing.app",
    ];
    const rawOrigin = req.headers.get("origin") || req.headers.get("Origin") || "";
    const origin = ALLOWED_ORIGINS.includes(rawOrigin) ? rawOrigin : ALLOWED_ORIGINS[0];
    const postFlowUrl = `${origin}/`;
    const thankYouPageUrl = `${origin}/ThankYou`;

    const WIX_API_KEY = Deno.env.get("WIX_PAYMENTS_API_KEY");
    const WIX_SITE_ID = Deno.env.get("WIX_PAYMENTS_SITE_ID");

    if (!WIX_API_KEY || !WIX_SITE_ID) {
      console.error("Missing WIX_PAYMENTS_API_KEY or WIX_PAYMENTS_SITE_ID");
      return Response.json({ error: "Payment configuration error" }, { status: 500 });
    }

    const response = await fetch(
      "https://www.wixapis.com/payments/platform/v1/checkout-sessions/construct",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": WIX_API_KEY,
          "wix-site-id": WIX_SITE_ID,
        },
        body: JSON.stringify({
          cart: { items: cartItems },
          callbackUrls: {
            postFlowUrl,
            thankYouPageUrl,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Wix checkout error:", JSON.stringify(data));
      return Response.json({ error: data?.message || "Failed to create checkout session" }, { status: response.status });
    }

    return Response.json({ redirectUrl: data.checkoutSession.redirectUrl });
  } catch (error) {
    console.error("create-checkout error:", error.message);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
});