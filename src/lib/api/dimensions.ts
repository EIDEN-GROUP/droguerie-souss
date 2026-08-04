import { createServerFn } from "@tanstack/react-start";
import { createAdminClient } from "./db";

export interface DbDimension {
  id: string;
  value: string;
  created_at: string;
}

export const getDimensions = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("dimensions")
    .select("*")
    .order("value");
  if (error) throw error;
  return (data || []) as DbDimension[];
});

export const createDimension = createServerFn({ method: "POST" })
  .validator((data: { value: string }) => data)
  .handler(async (ctx) => {
    const value = ctx.data.value.trim();
    if (!value) throw new Error("Dimension vide.");
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("dimensions")
      .insert({ value })
      .select()
      .single();
    if (error) throw new Error("Cette dimension existe déjà.");
    return data as DbDimension;
  });

/** Renomme le preset et propage la nouvelle valeur sur les produits et variantes. */
export const updateDimension = createServerFn({ method: "POST" })
  .validator((data: { id: string; value: string }) => data)
  .handler(async (ctx) => {
    const value = ctx.data.value.trim();
    if (!value) throw new Error("Dimension vide.");
    const supabase = createAdminClient();
    const { data: current } = await supabase
      .from("dimensions")
      .select("value")
      .eq("id", ctx.data.id)
      .single();
    const oldValue = current?.value;
    if (!oldValue) throw new Error("Dimension introuvable.");

    const { data: clash } = await supabase
      .from("dimensions")
      .select("id")
      .eq("value", value)
      .neq("id", ctx.data.id)
      .maybeSingle();
    if (clash) throw new Error("Cette dimension existe déjà.");

    /* Le couple (product_id, dimension) est unique : si un produit possède déjà une
       variante portant le nouveau libellé, on retire la cible avant de renommer. */
    const { data: oldRows } = await supabase
      .from("product_dimensions")
      .select("product_id")
      .eq("dimension", oldValue);
    const productIds = [...new Set((oldRows || []).map((r) => r.product_id))];
    if (productIds.length > 0) {
      await supabase
        .from("product_dimensions")
        .delete()
        .eq("dimension", value)
        .in("product_id", productIds);
    }

    await supabase.from("product_dimensions").update({ dimension: value }).eq("dimension", oldValue);
    await supabase.from("products").update({ dimension: value }).eq("dimension", oldValue);
    const { data, error } = await supabase
      .from("dimensions")
      .update({ value })
      .eq("id", ctx.data.id)
      .select()
      .single();
    if (error) throw error;
    return data as DbDimension;
  });

/** Supprime le preset, retire les variantes correspondantes et les dimension des produits. */
export const deleteDimension = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data: dim } = await supabase
      .from("dimensions")
      .select("value")
      .eq("id", ctx.data.id)
      .single();
    if (dim) {
      await supabase.from("product_dimensions").delete().eq("dimension", dim.value);
      await supabase.from("products").update({ dimension: null }).eq("dimension", dim.value);
    }
    const { error } = await supabase.from("dimensions").delete().eq("id", ctx.data.id);
    if (error) throw error;
    return { success: true };
  });