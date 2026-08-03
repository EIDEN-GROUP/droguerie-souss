import { createFileRoute } from "@tanstack/react-router";
import { FileDown, FileText, Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCategories,
  useSubcategories,
  useCreateSubcategory,
  useUpdateSubcategory,
  useDeleteSubcategory,
} from "@/lib/adminStore";
import { TablePagination } from "@/components/admin/TablePagination";
import { usePagination } from "@/hooks/usePagination";
import {
  importSubcategoriesCsv,
  exportSubcategoriesCsv,
  type DbSubcategory,
} from "@/lib/api/subcategories";

export const Route = createFileRoute("/admin/subcategories")({
  component: AdminSubcategories,
});

const ALL_CATEGORIES = "__all__";

function AdminSubcategories() {
  const { data: subcategories, isLoading, isError } = useSubcategories();
  const { data: categories } = useCategories();
  const createSubcategory = useCreateSubcategory();
  const updateSubcategory = useUpdateSubcategory();
  const deleteSubcategory = useDeleteSubcategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DbSubcategory | undefined>(undefined);
  const [toDelete, setToDelete] = useState<DbSubcategory | null>(null);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formError, setFormError] = useState("");

  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);

  const [importBusy, setImportBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const categoryList = useMemo(() => categories || [], [categories]);
  const subcategoryList = useMemo(() => {
    const list = subcategories || [];
    if (categoryFilter === ALL_CATEGORIES) return list;
    return list.filter((s) => s.category === categoryFilter);
  }, [subcategories, categoryFilter]);
  const pagination = usePagination(subcategoryList, 10);

  const openAdd = () => {
    setEditing(undefined);
    setFormName("");
    setFormSlug("");
    setFormDesc("");
    setFormCategory(
      categoryFilter !== ALL_CATEGORIES ? categoryFilter : categoryList[0]?.name || "",
    );
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (s: DbSubcategory) => {
    setEditing(s);
    setFormName(s.name);
    setFormSlug(s.slug);
    setFormDesc(s.description);
    setFormCategory(s.category);
    setFormError("");
    setFormOpen(true);
  };

  const handleSave = async () => {
    setFormError("");
    if (!formCategory) { setFormError("La catégorie est requise."); return; }
    if (!formName.trim()) { setFormError("Le nom est requis."); return; }
    if (!formSlug.trim()) { setFormError("Le slug est requis."); return; }
    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim(),
        description: formDesc.trim(),
        category: formCategory,
      };
      if (editing) {
        await updateSubcategory.mutateAsync({ id: editing.id, patch: payload });
      } else {
        await createSubcategory.mutateAsync(payload);
      }
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
    }
  };

  const handleExample = () => {
    const rows = [
      "category,name,slug,description",
      '"Carrelage","Carreaux de sol","carreaux-de-sol","Carrelage pour sols intérieurs"',
      '"Carrelage","Faïence","faience","Carrelage mural"',
      '"Plomberie","Robinetterie","robinetterie","Robinets et mitigeurs"',
    ];
    const blob = new Blob(["\ufeff" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exemple-sous-categories.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExportBusy(true);
    try {
      const data = await exportSubcategoriesCsv();
      const csv = Papa.unparse(data, {
        columns: ["category", "name", "slug", "description"],
      });
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sous-categories-${new Date().toISOString().slice(0, 10)}.csv`;
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
      const items = rows.map((row, i) => {
        if (!row.category || !row.name || !row.slug) {
          throw new Error(`Ligne ${i + 2} : la catégorie, le nom et le slug sont obligatoires.`);
        }
        return {
          category: row.category.trim(),
          name: row.name.trim(),
          slug: row.slug.trim(),
          description: (row.description || "").trim(),
        };
      });
      const res = await importSubcategoriesCsv({ data: { subcategories: items } });
      setImportSuccess(`${res.count} sous-catégorie(s) importée(s) avec succès.`);
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
        <h2 className="font-display text-lg font-bold uppercase text-ink">Sous-catégories</h2>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImport}
          />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              pagination.setPage(1);
            }}
            className="cursor-pointer rounded-full border border-border bg-paper px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-ink outline-none transition hover:border-brand focus:border-brand"
          >
            <option value={ALL_CATEGORIES}>Toutes les catégories</option>
            {categoryList.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
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
            disabled={categoryList.length === 0}
            className="flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand-dark disabled:pointer-events-none disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> Ajouter
          </button>
        </div>
      </div>

      {categoryList.length === 0 && (
        <div className="rounded-xl border border-border bg-paper px-4 py-3 text-sm font-semibold text-ink-soft">
          Créez d'abord une catégorie pour pouvoir y rattacher des sous-catégories.
        </div>
      )}

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
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.pageItems.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="text-sm font-semibold text-ink">{s.name}</TableCell>
                <TableCell>
                  <span className="inline-flex rounded-full bg-mint px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand">
                    {s.category}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-ink-soft">{s.slug}</TableCell>
                <TableCell className="max-w-xs truncate text-sm text-ink-soft">{s.description}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => openEdit(s)}
                      aria-label="Modifier"
                      className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-mint hover:text-brand"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setToDelete(s)}
                      aria-label="Supprimer"
                      className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-accent-red/10 hover:text-accent-red"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {subcategoryList.length === 0 && (
          <div className="py-16 text-center text-sm text-ink-soft">
            {categoryFilter === ALL_CATEGORIES
              ? "Aucune sous-catégorie pour le moment."
              : `Aucune sous-catégorie dans « ${categoryFilter} ».`}
          </div>
        )}
        <TablePagination
          page={pagination.page}
          pageCount={pagination.pageCount}
          pageSize={pagination.pageSize}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          label="sous-catégories"
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.changePageSize}
        />
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wide">
              {editing ? "Modifier la sous-catégorie" : "Ajouter une sous-catégorie"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">Catégorie parente</span>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-border bg-paper px-3 py-2.5 text-sm outline-none focus:border-brand"
              >
                <option value="" disabled>
                  Choisir une catégorie
                </option>
                {categoryList.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">Nom</span>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full rounded-xl border border-border bg-paper px-3 py-2.5 text-sm outline-none focus:border-brand" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">Slug</span>
              <input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} className="w-full rounded-xl border border-border bg-paper px-3 py-2.5 text-sm outline-none focus:border-brand" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">Description</span>
              <textarea rows={3} value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="w-full rounded-xl border border-border bg-paper px-3 py-2.5 text-sm outline-none focus:border-brand" />
            </label>
            {formError && (
              <p className="text-xs font-semibold text-accent-red">{formError}</p>
            )}
            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => setFormOpen(false)}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-ink-soft hover:bg-cream"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={createSubcategory.isPending || updateSubcategory.isPending}
                className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand-dark disabled:opacity-60"
              >
                {(createSubcategory.isPending || updateSubcategory.isPending) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {editing ? "Enregistrer" : "Ajouter"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette sous-catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {toDelete?.name} » sera définitivement supprimée de la catégorie « {toDelete?.category} ». Les produits associés ne seront pas supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-accent-red text-accent-red-foreground hover:bg-accent-red/90"
              onClick={() => {
                if (toDelete) deleteSubcategory.mutate(toDelete.id);
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
