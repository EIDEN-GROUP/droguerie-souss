import { createServerFn } from "@tanstack/react-start";
import { createAdminClient } from "./db";

export const getProductPriceMode = createServerFn({ method: "GET" })
  .validator((data: { productId: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select("price_mode, price, promo, unit")
      .eq("id", ctx.data.productId)
      .single();
    if (error) throw error;
    return data as { price_mode: "fixed" | "quote"; price: number; promo: number | null; unit: string };
  });
