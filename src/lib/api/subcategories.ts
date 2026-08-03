import { createServerFn } from "@tanstack/react-start";
import { createAdminClient } from "./db";

export interface DbSubcategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
}

export const getSubcategories = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .order("category")
    .order("name");
  if (error) throw error;
  return data as DbSubcategory[];
});

export const createSubcategory = createServerFn({ method: "POST" })
  .validator((data: { name: string; slug: string; description: string; category: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("subcategories")
      .insert({
        name: ctx.data.name,
        slug: ctx.data.slug,
        description: ctx.data.description,
        category: ctx.data.category,
      })
      .select()
      .single();
    if (error) throw new Error("Cette sous-catégorie existe déjà dans cette catégorie.");
    return data as DbSubcategory;
  });

export const updateSubcategory = createServerFn({ method: "POST" })
  .validator(
    (data: {
      id: string;
      patch: { name?: string; slug?: string; description?: string; category?: string };
    }) => data,
  )
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("subcategories")
      .update(ctx.data.patch)
      .eq("id", ctx.data.id)
      .select()
      .single();
    if (error) throw new Error("Cette sous-catégorie existe déjà dans cette catégorie.");
    return data as DbSubcategory;
  });

export const deleteSubcategory = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("subcategories")
      .delete()
      .eq("id", ctx.data.id);
    if (error) throw error;
    return { success: true };
  });

export const importSubcategoriesCsv = createServerFn({ method: "POST" })
  .validator(
    (data: {
      subcategories: { name: string; slug: string; description: string; category: string }[];
    }) => data,
  )
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("subcategories")
      .upsert(ctx.data.subcategories, { onConflict: "category,name" })
      .select();
    if (error) {
      throw new Error(
        "Import impossible : vérifiez que chaque catégorie indiquée existe déjà.",
      );
    }
    return { count: data.length };
  });

export const exportSubcategoriesCsv = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .order("category")
    .order("name");
  if (error) throw error;
  return data as DbSubcategory[];
});
