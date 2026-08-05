import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Gift, ImagePlus, Link, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  useCreateProduct,
  useUpdateProduct,
  useCategories,
  useProductGifts,
  useSetProductGifts,
  useSetProductVariants,
} from "@/lib/adminStore";
import { getUploadUrl } from "@/lib/api/uploads";
import { categories as defaultCategories, type Product, type ProductVariant } from "@/lib/products";
import type { DbProductGift, ProductInput } from "@/lib/database.types";
import { GiftPicker } from "./GiftPicker";
import { DimensionsCombobox } from "./DimensionsCombobox";

const MAX_IMAGE_BYTES = 1_500_000;

const schema = z.object({
  name: z.string().min(2, "Nom trop court"),
  category: z.string().min(1, "Catégorie requise"),
  subcategory: z.string().optional(),
  price_mode: z.enum(["fixed", "quote"]),
  price: z.coerce.number().min(0, "Le prix ne peut pas être négatif"),
  unit: z.string().min(1, "Unité requise"),
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
  const [urlInput, setUrlInput] = useState("");
  const { data: loadedGifts } = useProductGifts(product?.id ?? "");
  const saveGifts = useSetProductGifts();
  const [gifts, setGifts] = useState<Omit<DbProductGift, "id" | "product_id">[]>([]);

  const saveVariants = useSetProductVariants();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [editor, setEditor] = useState<{ dimension: string }>({ dimension: "" });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [variantsDirty, setVariantsDirty] = useState(false);
  const [variantsError, setVariantsError] = useState("");

  useEffect(() => {
    if (loadedGifts) {
      setGifts(loadedGifts.map((g) => ({ gift_product_id: g.gift_product_id, min_qty: g.min_qty, gift_qty: g.gift_qty })));
    }
  }, [loadedGifts]);

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
      setImageUrls((prev) => [...prev, trimmed]);
      setUrlInput("");
      setImageError("");
    } catch {
      setImageError("URL invalide");
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", category: catOptions[0]?.value ?? "", subcategory: "", price_mode: "fixed", price: 0, unit: "", description: "" },
  });

  const currentPriceMode = watch("price_mode");
  const isQuote = currentPriceMode === "quote";

  useEffect(() => {
    if (open) {
      reset(
        product
          ? {
              name: product.name,
              category: product.category,
              subcategory: product.subcategory || "",
              price_mode: (product as any).price_mode || "fixed",
              price: product.price,
              unit: product.unit,
              description: product.description,
              bestseller: product.bestseller,
              seasonal: product.seasonal,
              promo: product.promo,
            }
          : { name: "", category: catOptions[0]?.value ?? "", price_mode: "fixed", price: 0, unit: "", description: "" },
      );
      setImageUrls(product?.images && product.images.length > 0 ? product.images : product?.image ? [product.image] : []);
      setImageError("");
      setVariants((product?.variants || []).map((v) => ({ dimension: v.dimension })));
      setEditor({ dimension: "" });
      setEditingIndex(null);
      setVariantsDirty(false);
      setVariantsError("");
    }
  }, [open, product, reset]);

  const loadVariantInEditor = (i: number) => {
    const v = variants[i];
    if (!v) return;
    setEditor({ dimension: v.dimension });
    setEditingIndex(i);
    setVariantsError("");
  };

  const resetEditor = () => {
    setEditor({ dimension: "" });
    setEditingIndex(null);
    setVariantsError("");
  };

  const saveVariantInEditor = () => {
    const dimension = editor.dimension.trim();
    if (!dimension) {
      setVariantsError("Choisissez ou créez une dimension.");
      return;
    }
    if (
      editingIndex !== null &&
      variants[editingIndex] &&
      variants[editingIndex].dimension === dimension
    ) {
      resetEditor();
      return;
    }
    if (editingIndex !== null && variants[editingIndex]) {
      setVariants((prev) =>
        prev.map((v, i) => (i === editingIndex ? { dimension } : v)),
      );
    } else {
      if (variants.some((v) => v.dimension.toLowerCase() === dimension.toLowerCase())) {
        setVariantsError(`La dimension « ${dimension} » est déjà présente sur ce produit.`);
        return;
      }
      setVariants((prev) => [...prev, { dimension }]);
    }
    setVariantsDirty(true);
    resetEditor();
  };

  const removeVariant = (i: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== i));
    if (editingIndex === i) resetEditor();
    setVariantsDirty(true);
  };

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
    if (values.price_mode !== "quote" && imageUrls.length === 0) {
      setImageError("Ajoutez au moins une image du produit.");
      return;
    }
    const payload: ProductInput = {
      ...values,
      price: values.price_mode === "quote" ? 0 : values.price,
      category: values.category,
      subcategory: values.subcategory || undefined,
      image_url: imageUrls[0],
      images_urls: imageUrls,
      dimension: variants[0]?.dimension || undefined,
    };
    if (!payload.promo || (payload.promo as number) <= 0) delete payload.promo;
    if (!payload.subcategory) delete payload.subcategory;
    if (!payload.dimension) delete payload.dimension;
    try {
      let savedId = product?.id ?? "";
      if (product) {
        await updateProduct.mutateAsync({ id: product.id, patch: payload });
      } else {
        const created = await createProduct.mutateAsync(payload);
        savedId = created.id;
      }
      if (gifts.length > 0 && savedId) {
        await saveGifts.mutateAsync({ product_id: savedId, gifts });
      }
      if (variantsDirty && savedId) {
        await saveVariants.mutateAsync({ product_id: savedId, variants });
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
            <div className="mt-2 flex gap-2">
              <input
                type="url"
                placeholder="Coller une URL d'image..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
                className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-brand"
              />
              <button type="button" onClick={addUrl} className="flex items-center gap-1.5 rounded-lg bg-mint px-3 py-2 text-sm font-semibold text-ink hover:bg-mint/70">
                <Link className="h-3.5 w-3.5" /> URL
              </button>
            </div>
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
            <Field label="Sous-catégorie (optionnel)" error={errors.subcategory?.message}>
              <input {...register("subcategory")} placeholder="ex: Carreaux de sol, Faïence..." className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand" />
            </Field>
            <Field label="Unité (m², sac, boîte...)" error={errors.unit?.message}>
              <input {...register("unit")} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand" />
            </Field>
            <Field label="Mode de prix" error={errors.price_mode?.message}>
              <select {...register("price_mode")} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand">
                <option value="fixed">Prix fixe</option>
                <option value="quote">Prix sur demande</option>
              </select>
            </Field>
            <Field label="Prix (MAD)" error={errors.price?.message}>
              <input type="number" step="0.01" {...register("price")} disabled={isQuote} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand disabled:cursor-not-allowed disabled:opacity-50" />
            </Field>
            <Field label="Promo % (optionnel)" error={errors.promo?.message}>
              <input type="number" {...register("promo")} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand" />
            </Field>
          </div>

          <div className="space-y-3">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
              Dimensions
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <DimensionsCombobox
                value={editor.dimension}
                onChange={(dimension) => setEditor((e) => ({ ...e, dimension }))}
                placeholder="Choisir / créer une dimension"
                className="sm:max-w-xs"
              />
              <div className="flex items-center gap-2">
                {editingIndex !== null && (
                  <button
                    type="button"
                    onClick={resetEditor}
                    className="shrink-0 rounded-full px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-ink-soft hover:bg-cream"
                  >
                    Annuler
                  </button>
                )}
                <button
                  type="button"
                  onClick={saveVariantInEditor}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold",
                    editingIndex !== null ? "bg-mint text-ink hover:bg-mint/70" : "bg-brand text-brand-foreground hover:bg-brand-dark",
                  )}
                >
                  {editingIndex !== null && <Check className="h-3.5 w-3.5" />}
                  {editingIndex !== null ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </div>
            {variantsError && (
              <p className="text-xs font-semibold text-accent-red">{variantsError}</p>
            )}
            {variants.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {variants.map((v, i) => (
                  <button
                    type="button"
                    key={v.dimension}
                    onClick={() => loadVariantInEditor(i)}
                    className={cn(
                      "group flex items-center gap-2 rounded-full border py-1 pl-4 pr-1.5 text-sm font-semibold text-ink transition",
                      editingIndex === i
                        ? "border-brand bg-mint text-brand"
                        : "border-border bg-paper hover:border-brand",
                    )}
                  >
                    <span>{v.dimension}</span>
                    <span
                      role="button"
                      aria-label={`Retirer ${v.dimension}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeVariant(i);
                      }}
                      className="grid h-6 w-6 place-items-center rounded-full text-ink-soft transition group-hover:text-accent-red hover:bg-accent-red/10 hover:!text-accent-red"
                    >
                      <X className="h-3.5 w-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink-soft">Aucune dimension pour l'instant.</p>
            )}
          </div>

          <GiftPicker gifts={gifts} onChange={setGifts} />

          <Field label="Description" error={errors.description?.message}>
            <textarea rows={3} {...register("description")} className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand" />
          </Field>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" {...register("bestseller")} className="h-4 w-4 accent-[#2f378d]" />
              Best-seller
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" {...register("seasonal")} className="h-4 w-4 accent-[#2f378d]" />
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


