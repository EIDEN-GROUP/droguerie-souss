import { createServerFn } from "@tanstack/react-start";
import { createAdminClient } from "./db";

export const getAdminRole = createServerFn({ method: "GET" })
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
