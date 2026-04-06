import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const email = "admin@mantaray.energy";
    const password = "MantaRay2026!";

    // Check if already exists
    const { data: existingProfiles } = await adminClient
      .from("profiles")
      .select("user_id")
      .eq("first_name", "Manta Ray")
      .eq("last_name", "Admin");

    if (existingProfiles && existingProfiles.length > 0) {
      return new Response(JSON.stringify({ message: "Admin already exists", email }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: "Manta Ray", last_name: "Admin" },
    });

    if (createError) {
      // Might already exist
      return new Response(JSON.stringify({ error: createError.message, email }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (newUser?.user) {
      // Update role from default 'owner' to 'admin'
      await adminClient.from("user_roles").update({ role: "admin" }).eq("user_id", newUser.user.id);
    }

    return new Response(JSON.stringify({ success: true, email, password }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: corsHeaders,
    });
  }
});
