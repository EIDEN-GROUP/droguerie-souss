import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, FileDown, FileText, Loader2, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { TablePagination } from "@/components/admin/TablePagination";
import { usePagination } from "@/hooks/usePagination";
import { useProducts, useDeleteProduct, useCategories } from "@/lib/adminStore";
import { importProductsCsv, exportProductsCsv } from "@/lib/api/products";
import { categories as defaultCategories, type Category, type Product } from "@/lib/products";
import type { ProductInput } from "@/lib/database.types";
import { ProductPrice } from "@/components/ProductPrice";

const MotionTableRow = motion(TableRow);

interface CsvPreviewRow {
  rowNum: number;
  name: string;
  category: string;
  price: string;
  errors: string[];
}

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
  const [preview, setPreview] = useState<{ rows: CsvPreviewRow[]; productInputs: ProductInput[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const productList = useMemo(() => (products || []) as unknown as Product[], [products]);

  const filtered = useMemo(() => {
    let list = productList;
    if (cat !== "all") list = list.filter((p) => p.category === cat);
    if (query.trim()) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [productList, cat, query]);

  const pagination = usePagination(filtered, 10);

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
        columns: ["name", "category", "price_mode", "price", "unit", "description", "stock", "bestseller", "seasonal", "promo", "dimension", "image_url"],
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
      const rawRows = result.data as Record<string, string>[];
      const previewRows: CsvPreviewRow[] = [];
      const goodRows: ProductInput[] = [];

      for (let i = 0; i < rawRows.length; i++) {
        const row = rawRows[i];
        const errors: string[] = [];
        if (!row.name?.trim()) errors.push("Nom manquant");
        if (!row.category?.trim()) errors.push("Catégorie manquante");
        const priceMode = (row.price_mode?.trim() as "fixed" | "quote" | undefined) || "fixed";
        const priceRaw = row.price?.trim();
        if (priceMode === "fixed" && (!priceRaw || isNaN(parseFloat(priceRaw)) || parseFloat(priceRaw) < 0))
          errors.push("Prix invalide");
        previewRows.push({ rowNum: i + 2, name: row.name?.trim() || "", category: row.category?.trim() || "", price: priceRaw || "", errors });
        if (errors.length === 0) {
          goodRows.push({
            name: row.name.trim(),
            category: row.category.trim(),
            price_mode: priceMode,
            price: priceMode === "quote" ? 0 : parseFloat(priceRaw!),
            unit: (row.unit || "unité").trim(),
            description: (row.description || "").trim(),
            stock: parseInt(row.stock || "0", 10) || 0,
            bestseller: row.bestseller === "true" || row.bestseller === "1" || row.bestseller === "oui",
            seasonal: row.seasonal === "true" || row.seasonal === "1" || row.seasonal === "oui",
            promo: row.promo ? parseInt(row.promo, 10) : null,
            dimension: row.dimension?.trim() || undefined,
            image_url: row.image_url?.trim() || undefined,
            images_urls: row.image_url ? [row.image_url.trim()] : [],
          });
        }
      }
      setPreview({ rows: previewRows, productInputs: goodRows });
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Erreur lors de la lecture du fichier.");
    } finally {
      setImportBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleExample = () => {
    const headers = ["name", "category", "price_mode", "price", "unit", "description", "stock", "bestseller", "seasonal", "promo", "dimension", "image_url"];
    const rows = [
      headers.join(","),
      '"Carreau céramique 30x30","Carrelage","fixed","89.00","m²","Carreau de sol beige 30×30 cm","50","true","false","","30x30","https://example.com/carrelage.jpg"',
      '"Peinture mate blanche","Peinture","fixed","145.00","L","Peinture acrylique mate blanc pur","20","false","false","10","",""',
      '"Marbre beige","Marbre","quote","0","m²","Marbre beige importé d Italie","0","true","false","","",""',
    ];
    const blob = new Blob(["\ufeff" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exemple-produits.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const confirmImport = async () => {
    if (!preview) return;
    setImportBusy(true);
    setImportError("");
    setImportSuccess("");
    try {
      const { count } = await importProductsCsv({ data: { products: preview.productInputs } });
      setImportSuccess(`${count} produit(s) importé(s) avec succès.`);
      setPreview(null);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Erreur lors de l'import.");
    } finally {
      setImportBusy(false);
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
            onClick={handleExample}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-ink transition hover:border-brand hover:bg-cream hover:text-brand"
          >
            <FileText className="h-4 w-4" /> Exemple CSV
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importBusy}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-ink transition hover:border-brand hover:bg-cream hover:text-brand disabled:pointer-events-none disabled:opacity-60"
          >
            {importBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Importer CSV
          </button>
          <button
            onClick={handleExport}
            disabled={exportBusy}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-ink transition hover:border-brand hover:bg-cream hover:text-brand disabled:pointer-events-none disabled:opacity-60"
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

      <div className="rounded-2xl border bg-paper shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-2">Produit</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Dimensions</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.pageItems.map((p, i) => (
              <MotionTableRow
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i, 10) * 0.04 }}
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
                  <ProductPrice priceMode={p.price_mode} price={p.price} unit={p.unit} size="md" />
                </TableCell>
                <TableCell>
                  {p.variants && p.variants.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.variants.slice(0, 2).map((v) => (
                        <span
                          key={v.dimension}
                          className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5 text-[11px] font-semibold text-ink"
                          title={`${v.dimension} : ${v.stock} en stock`}
                        >
                          {v.dimension}
                          <span className="text-[10px] font-bold text-ink-soft">({v.stock})</span>
                        </span>
                      ))}
                      {p.variants.length > 2 && (
                        <span className="inline-flex items-center rounded-full bg-mint px-2 py-0.5 text-[11px] font-bold text-ink-soft">
                          +{p.variants.length - 2}
                        </span>
                      )}
                    </div>
                  ) : p.dimension ? (
                    <span className="text-sm text-ink-soft">{p.dimension}</span>
                  ) : (
                    <span className="text-sm text-ink-soft/50">—</span>
                  )}
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
        <TablePagination
          page={pagination.page}
          pageCount={pagination.pageCount}
          pageSize={pagination.pageSize}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          label="produits"
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.changePageSize}
        />
      </div>

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />

      <Dialog open={!!preview} onOpenChange={(o) => { if (!o) setPreview(null); }}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wide">Aperçu de l'import</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-4">
              {preview.rows.filter((r) => r.errors.length > 0).length > 0 && (
                <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 px-4 py-3">
                  <p className="text-xs font-bold text-accent-red">
                    {preview.rows.filter((r) => r.errors.length > 0).length} ligne(s) avec des erreurs — elles seront ignorées.
                  </p>
                </div>
              )}
              <p className="text-xs text-ink-soft">
                {preview.productInputs.length} produit(s) valide(s) sur {preview.rows.length} ligne(s).
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Erreurs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.rows.map((r) => (
                    <TableRow key={r.rowNum} className={r.errors.length > 0 ? "bg-accent-red/5" : ""}>
                      <TableCell className="text-xs text-ink-soft">{r.rowNum}</TableCell>
                      <TableCell className="text-sm font-semibold">{r.name}</TableCell>
                      <TableCell className="text-xs text-ink-soft">{r.category}</TableCell>
                      <TableCell className="text-sm">{r.price || "—"}</TableCell>
                      <TableCell>
                        {r.errors.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-red">
                            <X className="h-3 w-3" /> {r.errors.join(", ")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-mint-dark">
                            <Check className="h-3 w-3" /> OK
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="rounded-full border border-border px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-ink-soft hover:bg-cream"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={importBusy || preview.productInputs.length === 0}
                  onClick={confirmImport}
                  className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand-dark disabled:opacity-60"
                >
                  {importBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                  Importer {preview.productInputs.length} produit(s)
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
