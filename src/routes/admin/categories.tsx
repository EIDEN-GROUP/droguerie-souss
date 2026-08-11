import { createFileRoute } from "@tanstack/react-router";
import { FileDown, FileText, ImagePlus, Link as LinkIcon, Plus, Pencil, Trash2, Upload, Loader2, X } from "lucide-react";
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
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/lib/adminStore";
import { TablePagination } from "@/components/admin/TablePagination";
import { usePagination } from "@/hooks/usePagination";
import { importCategoriesCsv, exportCategoriesCsv } from "@/lib/api/categories";
import { getUploadUrl } from "@/lib/api/uploads";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

const MAX_IMAGE_BYTES = 1_500_000;

interface CategoryRow {
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
}

function AdminCategories() {
  const { data: categories, isLoading, isError } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | undefined>(undefined);
  const [toDelete, setToDelete] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formError, setFormError] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const [importBusy, setImportBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const categoryList = useMemo(() => categories || [], [categories]);
  const pagination = usePagination(categoryList, 10);

  const openAdd = () => {
    setEditing(undefined);
    setFormName("");
    setFormSlug("");
    setFormDesc("");
    setFormImage("");
    setImageUrlInput("");
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (c: CategoryRow) => {
    setEditing(c);
    setFormName(c.name);
    setFormSlug(c.slug);
    setFormDesc(c.description);
    setFormImage(c.image_url || "");
    setImageUrlInput("");
    setFormError("");
    setFormOpen(true);
  };

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFormError("");
    if (file.size > MAX_IMAGE_BYTES) {
      setFormError("L'image dépasse 1.5 Mo.");
      return;
    }
    setImageBusy(true);
    try {
      const { signedUrl, publicUrl } = await getUploadUrl();
      const res = await fetch(signedUrl, {
        method: "PUT",
        body: file.slice(),
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error(`Échec de l'upload (${res.status})`);
      setFormImage(publicUrl);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur lors de l'upload de l'image.");
    } finally {
      setImageBusy(false);
    }
  };

  const addImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
      setFormImage(trimmed);
      setImageUrlInput("");
      setFormError("");
    } catch {
      setFormError("URL invalide");
    }
  };

  const handleSave = async () => {
    setFormError("");
    if (!formName.trim()) { setFormError("Le nom est requis."); return; }
    if (!formSlug.trim()) { setFormError("Le slug est requis."); return; }
    try {
      const payload = {
        name: formName.trim(),
        slug: formSlug.trim(),
        description: formDesc.trim(),
        /** Empty clears the image, so the storefront falls back to its bundled artwork. */
        image_url: formImage.trim() || null,
      };
      if (editing) {
        await updateCategory.mutateAsync({ name: editing.name, patch: payload });
      } else {
        await createCategory.mutateAsync(payload);
      }
      setFormOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
    }
  };

  const handleExample = () => {
    const rows = [
      "name,slug,description",
      '"Carrelage","carrelage","Carreaux céramiques et grès cérame"',
      '"Peinture","peinture","Peintures intérieures et extérieures"',
      '"Plomberie","plomberie","Plomberie et évacuation"',
    ];
    const blob = new Blob(["\ufeff" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exemple-categories.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExportBusy(true);
    try {
      const data = await exportCategoriesCsv();
      const csv = Papa.unparse(data, {
        columns: ["name", "slug", "description"],
      });
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `categories-${new Date().toISOString().slice(0, 10)}.csv`;
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
        if (!row.name || !row.slug) {
          throw new Error(`Ligne ${i + 2} : le nom et le slug sont obligatoires.`);
        }
        return {
          name: row.name.trim(),
          slug: row.slug.trim(),
          description: (row.description || "").trim(),
        };
      });
      const res = await importCategoriesCsv({ data: { categories: items } });
      setImportSuccess(`${res.count} catégorie(s) importée(s) avec succès.`);
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
        <h2 className="font-display text-lg font-bold uppercase text-ink">Catégories</h2>
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
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.pageItems.map((c) => (
              <TableRow key={c.name}>
                <TableCell>
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt={c.name}
                      className="h-10 w-10 rounded-lg border object-cover"
                    />
                  ) : (
                    <div className="grid h-10 w-10 place-items-center rounded-lg border border-dashed text-ink-soft">
                      <ImagePlus className="h-4 w-4" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm font-semibold text-ink">{c.name}</TableCell>
                <TableCell className="text-sm text-ink-soft">{c.slug}</TableCell>
                <TableCell className="max-w-xs truncate text-sm text-ink-soft">{c.description}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => openEdit(c)}
                      aria-label="Modifier"
                      className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-mint hover:text-brand"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setToDelete(c.name)}
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
        {categoryList.length === 0 && (
          <div className="py-16 text-center text-sm text-ink-soft">Aucune catégorie pour le moment.</div>
        )}
        <TablePagination
          page={pagination.page}
          pageCount={pagination.pageCount}
          pageSize={pagination.pageSize}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          label="catégories"
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.changePageSize}
        />
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-wide">
              {editing ? "Modifier la catégorie" : "Ajouter une catégorie"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
                Image de la catégorie
              </span>
              <div className="flex items-start gap-3">
                {formImage ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border">
                    <img src={formImage} alt="Aperçu de l'image de la catégorie" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormImage("")}
                      aria-label="Retirer l'image"
                      className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-ink/70 text-paper"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="grid h-20 w-20 shrink-0 cursor-pointer place-items-center rounded-lg border-2 border-dashed text-ink-soft transition hover:border-brand hover:text-brand">
                    {imageBusy ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ImagePlus className="h-5 w-5" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelected}
                      disabled={imageBusy}
                    />
                  </label>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Coller une URL d'image..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                      className="flex-1 rounded-xl border border-border bg-paper px-3 py-2.5 text-sm outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="flex items-center gap-1.5 rounded-xl bg-mint px-3 py-2 text-sm font-semibold text-ink hover:bg-mint/70"
                    >
                      <LinkIcon className="h-3.5 w-3.5" /> URL
                    </button>
                  </div>
                  <p className="text-xs text-ink-soft">
                    Optionnel — 1.5 Mo maximum. Sans image, le site utilise le visuel par défaut.
                  </p>
                </div>
              </div>
            </div>
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
                disabled={createCategory.isPending || updateCategory.isPending}
                className="flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand-dark disabled:opacity-60"
              >
                {(createCategory.isPending || updateCategory.isPending) && (
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
            <AlertDialogTitle>Supprimer cette catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {toDelete} » sera définitivement supprimée. Les produits associés ne seront pas supprimés, mais leur catégorie restera en l'état.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-accent-red text-accent-red-foreground hover:bg-accent-red/90"
              onClick={() => {
                if (toDelete) deleteCategory.mutate(toDelete);
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
