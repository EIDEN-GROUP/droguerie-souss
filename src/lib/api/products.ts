import { createServerFn } from "@tanstack/react-start";
import type { ProductInput } from "@/lib/database.types";
import { createAdminClient } from "./db";

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
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
    return data;
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



