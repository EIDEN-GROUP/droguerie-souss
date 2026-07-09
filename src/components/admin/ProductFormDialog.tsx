import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateProduct, useUpdateProduct, useCategories } from "@/lib/adminStore";
import { getUploadUrl } from "@/lib/api/uploads";
import { categories as defaultCategories, type Product } from "@/lib/products";

const MAX_IMAGE_BYTES = 1_500_000;

const schema = z.object({
  name: z.string().min(2, "Nom trop court"),
  category: z.string().min(1, "Catégorie requise"),
  price: z.coerce.number().positive("Le prix doit être positif"),
  unit: z.string().min(1, "Unité requise"),
  stock: z.coerce.number().int().min(0, "Le stock ne peut pas être négatif"),
  description: z.string().min(5, "Description trop courte"),
  bestseller: z.boolean().optional(),
  seasonal: z.boolean().optional(),
  promo: z.coerce.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof schema>;

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}) {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { data: dbCategories } = useCategories();
  const catOptions = (dbCategories && dbCategories.length > 0 ? dbCategories : defaultCategories).map((c) => ({
    value: "category" in c ? (c as any).category : c.name,
    label: "name" in c ? c.name : (c as any).name,
  }));
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageError, setImageError] = useState("");
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", category: catOptions[0]?.value ?? "", price: 0, unit: "", stock: 0, description: "" },
  });

  useEffect(() => {
    if (open) {
      reset(
        product
          ? {
              name: product.name,
              category: product.category,
              price: product.price,
              unit: product.unit,
              stock: product.stock,
              description: product.description,
              bestseller: product.bestseller,
              seasonal: product.seasonal,
              promo: product.promo,
            }
          : { name: "", category: catOptions[0]?.value ?? "", price: 0, unit: "", stock: 0, description: "" },
      );
      setImageUrls(product?.images && product.images.length > 0 ? product.images : product?.image ? [product.image] : []);
      setImageError("");
    }
  }, [open, product, reset]);

  const onFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImageError("");
    setUploading(true);
    for (const file of files) {
      if (file.size > MAX_IMAGE_BYTES) {
        setImageError("Une image dépasse 1.5 Mo et a été ignorée.");
        continue;
      }
      try {
        const { signedUrl, publicUrl } = await getUploadUrl();
        const blob = file.slice();
        const res = await fetch(signedUrl, {
          method: "PUT",
          body: blob,
          headers: { "Content-Type": file.type },
        });
        if (!res.ok) throw new Error(`Échec de l'upload (${res.status})`);
        setImageUrls((prev) => [...prev, publicUrl]);
      } catch (err) {
        console.error("Upload error:", err);
        setImageError(err instanceof Error ? err.message : "Erreur lors de l'upload de l'image.");
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (i: number) => setImageUrls((prev) => prev.filter((_, idx) => idx !== i));

  const onSubmit = async (values: FormValues) => {
    if (imageUrls.length === 0) {
      setImageError("Ajoutez au moins une image du produit.");
      return;
    }
    const payload = {
      ...values,
      category: values.category,
      image_url: imageUrls[0],
      images_urls: imageUrls,
    };
    try {
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, patch: payload });
      } else {
        await createProduct.mutateAsync(payload);
      }
      onOpenChange(false);
    } catch (err) {
      console.error("Save error:", err);
      setImageError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
    }
  };

  const busy = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display uppercase tracking-wide">
            {product ? "Modifier le produit" : "Ajouter un produit"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
              Images du produit
            </label>
            <div className="flex flex-wrap gap-3">
              {imageUrls.map((url, i) => (
                <div key={url + i} className="relative h-20 w-20 overflow-hidden rounded-lg border">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-ink/70 text-paper"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute inset-x-0 bottom-0 bg-brand/90 py-0.5 text-center text-[9px] font-bold uppercase text-paper">
                      Principale
                    </span>
                  )}
                </div>
              ))}
              <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-lg border-2 border-dashed text-ink-soft transition hover:border-brand hover:text-brand">
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ImagePlus className="h-5 w-5" />
                )}
                <input type="file" accept="image/*" multiple className="hidden" onChange={onFilesSelected} disabled={uploading} />
              </label>
            </div>
            {imageError && <p className="mt-1.5 text-xs font-semibold text-accent-red">{imageError}</p>}
          </div>

          <Field label="Nom du produit" error={errors.name?.message}>
            <input {...register("name")} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Catégorie" error={errors.category?.message}>
              <select {...register("category")} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand">
                {catOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Unité (m², sac, boîte...)" error={errors.unit?.message}>
              <input {...register("unit")} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand" />
            </Field>
            <Field label="Prix (MAD)" error={errors.price?.message}>
              <input type="number" step="0.01" {...register("price")} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand" />
            </Field>
            <Field label="Stock" error={errors.stock?.message}>
              <input type="number" {...register("stock")} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand" />
            </Field>
            <Field label="Promo % (optionnel)" error={errors.promo?.message}>
              <input type="number" {...register("promo")} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand" />
            </Field>
          </div>

          <Field label="Description" error={errors.description?.message}>
            <textarea rows={3} {...register("description")} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand" />
          </Field>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" {...register("bestseller")} className="h-4 w-4 accent-[#4274d9]" />
              Best-seller
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" {...register("seasonal")} className="h-4 w-4 accent-[#4274d9]" />
              Saisonnier
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-ink-soft hover:bg-cream"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand-dark disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {product ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-semibold text-accent-red">{error}</span>}
    </label>
  );
}


