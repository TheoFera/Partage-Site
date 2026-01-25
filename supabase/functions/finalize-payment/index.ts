import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const BILLING_INTERNAL_SECRET = Deno.env.get("BILLING_INTERNAL_SECRET") ?? "";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return jsonResponse({ ok: false, error: "Supabase env not configured" }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) {
    return jsonResponse({ ok: false, error: "Missing Authorization header" }, 401);
  }

  let body: { paymentId?: string } = {};
  try {
    body = (await req.json()) as { paymentId?: string };
  } catch {
    body = {};
  }

  const paymentId = body.paymentId ?? "";
  if (!paymentId || !UUID_REGEX.test(paymentId)) {
    return jsonResponse({ ok: false, error: "Invalid paymentId" }, 400);
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await userClient.rpc("finalize_payment_simulation", {
    p_payment_id: paymentId,
  });

  if (error) {
    return jsonResponse({ ok: false, error: error.message }, 400);
  }

  let emailResult: unknown = null;
  let emailError: string | null = null;

  if (!BILLING_INTERNAL_SECRET || !SERVICE_ROLE_KEY) {
    emailError = "Missing BILLING_INTERNAL_SECRET or SERVICE_ROLE_KEY";
  } else {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/process-emails-sortants`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-internal-secret": BILLING_INTERNAL_SECRET,
          authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          apikey: SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({ mode: "scan_pending" }),
      });
      const text = await res.text();
      if (!res.ok) {
        emailError = `process-emails-sortants ${res.status}: ${text}`;
      } else {
        try {
          emailResult = JSON.parse(text);
        } catch {
          emailResult = { raw: text };
        }
      }
    } catch (err) {
      emailError = err instanceof Error ? err.message : String(err);
    }
  }

  return jsonResponse({
    ok: true,
    data,
    email: { ok: !emailError, error: emailError, result: emailResult },
  });
});
