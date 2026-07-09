import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
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
import { useAdminStore } from "@/lib/adminStore";
import { categories, type Category, type Product } from "@/lib/products";

const MotionTableRow = motion(TableRow);

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

function AdminProducts() {
  const products = useAdminStore((s) => s.products);
  const deleteProduct = useAdminStore((s) => s.deleteProduct);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>(undefined);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    let list = products;
    if (cat !== "all") list = list.filter((p) => p.category === cat);
    if (query.trim()) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    return list;
  }, [products, cat, query]);

  const openAdd = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
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
            {categories.map((c) => (
              <option key={c.slug} value={c.category}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-brand-foreground hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" /> Ajouter un produit
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-paper shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                      <div className="mt-0.5 flex gap-1.5">
                        {p.bestseller && <Badge className="bg-brand text-brand-foreground">Best-seller</Badge>}
                        {p.promo && <Badge className="bg-accent-red text-accent-red-foreground">-{p.promo}%</Badge>}
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
                if (toDelete) deleteProduct(toDelete.id);
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
