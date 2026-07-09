import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "./db";

export const getUploadUrl = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = createAdminClient();
  await ensureBucket(supabase);

  const filePath = `products/${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const { data, error } = await supabase.storage
    .from("product-images")
    .createSignedUploadUrl(filePath);

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage
    .from("product-images")
    .getPublicUrl(filePath);

  return {
    signedUrl: data.signedUrl,
    publicUrl: urlData.publicUrl,
    path: filePath,
  };
});

async function ensureBucket(supabase: SupabaseClient) {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === "product-images")) return;
  const { error } = await supabase.storage.createBucket("product-images", {
    public: true,
    fileSizeLimit: 5_242_880,
  });
  if (error && !error.message.includes("already exists")) throw error;
}
