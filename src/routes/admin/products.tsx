import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FileDown, Loader2, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import { useProducts, useDeleteProduct, useCategories } from "@/lib/adminStore";
import { importProductsCsv, exportProductsCsv } from "@/lib/api/products";
import { categories as defaultCategories, type Category, type Product } from "@/lib/products";
import type { ProductInput } from "@/lib/database.types";

const MotionTableRow = motion(TableRow);

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const { data: products, isLoading, isError } = useProducts();
  const deleteProduct = useDeleteProduct();
  const { data: dbCategories } = useCategories();
  const catOptions = (dbCategories && dbCategories.length > 0 ? dbCategories : defaultCategories).map((c: any) => ({
    value: c.category ?? c.name,
    label: c.name,
  }));
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>(undefined);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const productList = useMemo(() => (products || []) as unknown as Product[], [products]);

  const filtered = useMemo(() => {
    let list = productList;
    if (cat !== "all") list = list.filter((p) => p.category === cat);
    if (query.trim()) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [productList, cat, query]);

  const openAdd = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setFormOpen(true);
  };

  const handleExport = async () => {
    setExportBusy(true);
    try {
      const data = await exportProductsCsv();
      const csv = Papa.unparse(data, {
        columns: ["name", "category", "price", "unit", "description", "stock", "bestseller", "seasonal", "promo", "image_url"],
      });
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `produits-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExportBusy(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportBusy(true);
    setImportError("");
    setImportSuccess("");
    try {
      const text = await file.text();
      const result = Papa.parse(text, { header: true, skipEmptyLines: true });
      const rows = result.data as Record<string, string>[];
      const products: ProductInput[] = rows.map((row, i) => {
        if (!row.name || !row.category || !row.price) {
          throw new Error(`Ligne ${i + 2} : le nom, la catégorie et le prix sont obligatoires.`);
        }
        return {
          name: row.name.trim(),
          category: row.category.trim(),
          price: parseFloat(row.price),
          unit: (row.unit || "unité").trim(),
          description: (row.description || "").trim(),
          stock: parseInt(row.stock || "0", 10) || 0,
          bestseller: row.bestseller === "true" || row.bestseller === "1" || row.bestseller === "oui",
          seasonal: row.seasonal === "true" || row.seasonal === "1" || row.seasonal === "oui",
          promo: row.promo ? parseInt(row.promo, 10) : null,
          image_url: row.image_url?.trim() || undefined,
          images_urls: row.image_url ? [row.image_url.trim()] : [],
        };
      });
      await importProductsCsv({ data: { products } });
      setImportSuccess(`${products.length} produit(s) importé(s) avec succès.`);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Erreur lors de l'import CSV.");
    } finally {
      setImportBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isError && (
        <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 px-4 py-3 text-sm font-semibold text-accent-red">
          Erreur de chargement. Veuillez réessayer.
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full rounded-full border border-border bg-paper py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand"
            />
          </div>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value as Category | "all")}
            className="rounded-full border border-border bg-paper px-4 py-2.5 text-sm outline-none focus:border-brand"
          >
            <option value="all">Toutes les catégories</option>
            {catOptions.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importBusy}
            className="flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-ink hover:bg-cream disabled:opacity-60"
          >
            {importBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Importer CSV
          </button>
          <button
            onClick={handleExport}
            disabled={exportBusy}
            className="flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-ink hover:bg-cream disabled:opacity-60"
          >
            {exportBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            Exporter CSV
          </button>
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        </div>
      </div>

      {importError && (
        <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 px-4 py-3 text-sm font-semibold text-accent-red">
          {importError}
        </div>
      )}
      {importSuccess && (
        <div className="rounded-xl border border-mint/30 bg-mint/5 px-4 py-3 text-sm font-semibold text-brand-secondary">
          {importSuccess}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border bg-paper shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-2">Produit</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p, i) => (
              <MotionTableRow
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="max-w-[220px] truncate text-sm font-semibold text-ink">{p.name}</p>
                      <div className="mt-2 flex gap-1.5">
                        {p.bestseller && <Badge className="bg-brand text-brand-foreground">Best-seller</Badge>}
                        {(p.promo ?? 0) > 0 && <Badge className="bg-accent-red text-accent-red-foreground">-{p.promo}%</Badge>}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-ink-soft">{p.category}</TableCell>
                <TableCell className="text-sm font-semibold">
                  {p.price} MAD <span className="text-xs text-ink-soft">/ {p.unit}</span>
                </TableCell>
                <TableCell className="text-sm font-semibold">{p.stock}</TableCell>
                <TableCell>
                  {p.stock === 0 ? (
                    <Badge className="bg-accent-red/10 text-accent-red">Épuisé</Badge>
                  ) : p.stock <= 10 ? (
                    <Badge className="bg-sky/40 text-brand-secondary">Stock faible</Badge>
                  ) : (
                    <Badge className="bg-mint text-brand-secondary">En stock</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => openEdit(p)}
                      aria-label="Modifier"
                      className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-mint hover:text-brand"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setToDelete(p)}
                      aria-label="Supprimer"
                      className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-accent-red/10 hover:text-accent-red"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </MotionTableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-ink-soft">Aucun produit ne correspond à votre recherche.</div>
        )}
      </div>

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {toDelete?.name} » sera définitivement retiré du catalogue et du site. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-accent-red text-accent-red-foreground hover:bg-accent-red/90"
              onClick={() => {
                if (toDelete) deleteProduct.mutate(toDelete.id);
                setToDelete(null);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
