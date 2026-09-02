import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  const { id } = await request.json().catch(() => ({ id: null }));

  if (!accessToken || typeof id !== "string" || !id || id.length > 200) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    return Response.json({ error: "Server configuration is incomplete" }, { status: 503 });
  }

  const supabase = createClient<Database>(url, publishableKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: adminRecord, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (adminError || !adminRecord) return Response.json({ error: "Forbidden" }, { status: 403 });

  revalidateTag(`live-event-${id}`, { expire: 0 });
  revalidatePath(`/schedule/${encodeURIComponent(id)}`, "page");
  revalidatePath("/schedule", "page");
  revalidatePath("/", "page");
  return Response.json({ ok: true });
}
