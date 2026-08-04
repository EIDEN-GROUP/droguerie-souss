import { createServerFn } from "@tanstack/react-start";
import type { DbProductGift, ProductInput } from "@/lib/database.types";
import { createAdminClient } from "./db";

/** Rattache les variantes (dimension + stock) à chaque produit en une seule requête. */
async function withVariants<T extends { id: string }>(rows: T[]) {
  if (rows.length === 0) return rows;
  const supabase = createAdminClient();
  const ids = rows.map((r) => r.id);
  const { data: v, error } = await supabase
    .from("product_dimensions")
    .select("product_id, dimension, stock")
    .in("product_id", ids);
  if (error) throw error;
  const byProduct = new Map<string, { dimension: string; stock: number }[]>();
  for (const row of v || []) {
    const list = byProduct.get(row.product_id) || [];
    list.push({ dimension: row.dimension, stock: row.stock });
    byProduct.set(row.product_id, list);
  }
  return rows.map((r) => ({ ...r, variants: byProduct.get(r.id) || [] }));
}

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");
  if (error) throw error;
  return withVariants(data || []);
});

export const getProduct = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", ctx.data.id)
      .single();
    if (error) throw error;
    const [withV] = await withVariants([data]);
    return withV;
  });

export const createProduct = createServerFn({ method: "POST" })
  .validator((data: ProductInput) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .insert(ctx.data)
      .select()
      .single();
    if (error) throw error;
    return data;
  });

export const updateProduct = createServerFn({ method: "POST" })
  .validator((data: { id: string; patch: Partial<ProductInput> }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .update(ctx.data.patch)
      .eq("id", ctx.data.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", ctx.data.id);
    if (error) throw error;
    return { success: true };
  });

export const importProductsCsv = createServerFn({ method: "POST" })
  .validator((data: { products: ProductInput[] }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("products")
      .insert(ctx.data.products)
      .select();
    if (error) throw error;
    return { count: data.length, products: data };
  });

export const exportProductsCsv = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
});

/* ── Gifts ── */

export const getProductGifts = createServerFn({ method: "GET" })
  .validator((data: { product_id: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("product_gifts")
      .select("*")
      .eq("product_id", ctx.data.product_id);
    if (error) throw error;
    return data as DbProductGift[];
  });

export const setProductGifts = createServerFn({ method: "POST" })
  .validator((data: { product_id: string; gifts: Omit<DbProductGift, "id" | "product_id">[] }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    await supabase.from("product_gifts").delete().eq("product_id", ctx.data.product_id);
    if (ctx.data.gifts.length === 0) return [];
    const rows = ctx.data.gifts.map((g) => ({ ...g, product_id: ctx.data.product_id }));
    const { data, error } = await supabase.from("product_gifts").insert(rows).select();
    if (error) throw error;
    return data as DbProductGift[];
  });

/* ── Dimension variants ── */

/** Remplace l'ensemble des variantes (dimension + stock) d'un produit. */
export const setProductVariants = createServerFn({ method: "POST" })
  .validator((data: { product_id: string; variants: { dimension: string; stock: number }[] }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    await supabase.from("product_dimensions").delete().eq("product_id", ctx.data.product_id);
    if (ctx.data.variants.length === 0) return [];
    const rows = ctx.data.variants.map((v) => ({
      product_id: ctx.data.product_id,
      dimension: v.dimension.trim(),
      stock: Math.max(0, Math.floor(v.stock || 0)),
    }));
    const { data, error } = await supabase.from("product_dimensions").insert(rows).select();
    if (error) throw error;
    return data;
  });



