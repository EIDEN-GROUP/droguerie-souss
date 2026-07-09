import { createServerFn } from "@tanstack/react-start";
import { createAdminClient } from "./db";

interface DbCategory {
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
}

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data as DbCategory[];
});

export const createCategory = createServerFn({ method: "POST" })
  .validator((data: { name: string; slug: string; description: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .insert({ name: ctx.data.name, slug: ctx.data.slug, description: ctx.data.description })
      .select()
      .single();
    if (error) throw new Error("Cette catégorie existe déjà.");
    return data as DbCategory;
  });

export const updateCategory = createServerFn({ method: "POST" })
  .validator((data: { name: string; patch: { name?: string; slug?: string; description?: string } }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .update(ctx.data.patch)
      .eq("name", ctx.data.name)
      .select()
      .single();
    if (error) throw error;
    return data as DbCategory;
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .validator((data: { name: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("name", ctx.data.name);
    if (error) throw error;
    return { success: true };
  });

export const importCategoriesCsv = createServerFn({ method: "POST" })
  .validator((data: { categories: { name: string; slug: string; description: string }[] }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .upsert(ctx.data.categories, { onConflict: "name" })
      .select();
    if (error) throw error;
    return { count: data.length };
  });

export const exportCategoriesCsv = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data as DbCategory[];
});
