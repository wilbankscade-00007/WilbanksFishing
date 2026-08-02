import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const email = body.email?.toLowerCase().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Valid email required" }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    const existing = await base44.asServiceRole.entities.NewsletterSubscriber.filter({ email });
    if (existing && existing.length > 0) {
      return Response.json({ success: true, message: "Already subscribed" });
    }

    await base44.asServiceRole.entities.NewsletterSubscriber.create({ email });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Newsletter signup error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});