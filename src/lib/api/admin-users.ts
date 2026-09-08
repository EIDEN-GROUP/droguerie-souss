import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "./admin-guard";
import { createAdminClient } from "./db";

export const getAdminRole = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((data: { email: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("admin_users")
      .select("role")
      .eq("email", ctx.data.email)
      .single();
    if (error) return null;
    return data as { role: "admin" | "sales" };
  });
