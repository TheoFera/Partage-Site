// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

const expected = Deno.env.get("BILLING_INTERNAL_SECRET") ?? "";
const got = req.headers.get("x-internal-secret") ?? "";
if (!expected || got !== expected) return new Response("Unauthorized", { status: 401 });


// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from Functions!")

Deno.serve(async (req) => {
  const { name } = await req.json()
  const data = {
    message: `Hello ${name}!`,
  }

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  )
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-emails-sortants' \
    --header 'Authorization: Bearer eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjIwODQyODE4MjN9.FxV6eCcSWC4w1f-UWLwsTlru_Xawhrvo3JjPUsj8DcORNY7UJhXDI2vHH0bPBLexM4BiYPAjRXa_0iMfI6h0Pg' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
