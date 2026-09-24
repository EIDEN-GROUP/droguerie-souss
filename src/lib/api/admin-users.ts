import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "./admin-guard";
import { createSessionClient } from "./auth";
import { createAdminClient } from "./db";

export const getAdminRole = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((data: { email: string }) => data)
  .handler(async (ctx) => {
    // Anti-énumération : on ne révèle le rôle que pour le compte connecté.
    const session = createSessionClient();
    const { data: userData } = await session.auth.getUser();
    const sessionEmail = userData.user?.email?.toLowerCase().trim();
    const wanted = String(ctx.data.email || "")
      .toLowerCase()
      .trim();
    if (!sessionEmail || sessionEmail !== wanted) return null;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select("role")
      .ilike("email", wanted)
      .single();
    if (error) return null;
    return data as { role: "admin" | "sales" };
  });
