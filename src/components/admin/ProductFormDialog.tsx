import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminStore } from "@/lib/adminStore";
import { categories, type Product } from "@/lib/products";

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
  const addProduct = useAdminStore((s) => s.addProduct);
  const updateProduct = useAdminStore((s) => s.updateProduct);
  const [images, setImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", category: categories[0].category, price: 0, unit: "", stock: 0, description: "" },
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
          : { name: "", category: categories[0].category, price: 0, unit: "", stock: 0, description: "" },
      );
      setImages(product?.images && product.images.length > 0 ? product.images : product?.image ? [product.image] : []);
      setImageError("");
    }
  }, [open, product, reset]);

  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImageError("");
    for (const file of files) {
      if (file.size > MAX_IMAGE_BYTES) {
        setImageError("Une image dépasse 1.5 Mo et a été ignorée.");
        continue;
      }
      const reader = new FileReader();
      reader.onload = () => setImages((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const onSubmit = (values: FormValues) => {
    if (images.length === 0) {
      setImageError("Ajoutez au moins une image du produit.");
      return;
    }
    const payload = { ...values, category: values.category as Product["category"], image: images[0], images };
    if (product) updateProduct(product.id, payload);
    else addProduct(payload);
    onOpenChange(false);
  };

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
              {images.map((img, i) => (
                <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border">
                  <img src={img} alt="" className="h-full w-full object-cover" />
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
                <ImagePlus className="h-5 w-5" />
                <input type="file" accept="image/*" multiple className="hidden" onChange={onFilesSelected} />
              </label>
            </div>
            {imageError && <p className="mt-1.5 text-xs font-semibold text-accent-red">{imageError}</p>}
          </div>

          <Field label="Nom du produit" error={errors.name?.message}>
            <input {...register("name")} className="ci" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Catégorie" error={errors.category?.message}>
              <select {...register("category")} className="ci">
                {categories.map((c) => (
                  <option key={c.slug} value={c.category}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Unité (m², sac, boîte...)" error={errors.unit?.message}>
              <input {...register("unit")} className="ci" />
            </Field>
            <Field label="Prix (MAD)" error={errors.price?.message}>
              <input type="number" step="0.01" {...register("price")} className="ci" />
            </Field>
            <Field label="Stock" error={errors.stock?.message}>
              <input type="number" {...register("stock")} className="ci" />
            </Field>
            <Field label="Promo % (optionnel)" error={errors.promo?.message}>
              <input type="number" {...register("promo")} className="ci" />
            </Field>
          </div>

          <Field label="Description" error={errors.description?.message}>
            <textarea rows={3} {...register("description")} className="ci" />
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
              className="rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand-dark"
            >
              {product ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
        <style>{`.ci{width:100%;border:1px solid var(--color-border);border-radius:0.5rem;padding:0.6rem 0.8rem;font-size:0.875rem;outline:none;background:white}.ci:focus{border-color:var(--color-brand)}`}</style>
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
