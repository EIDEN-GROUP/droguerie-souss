import { createFileRoute } from "@tanstack/react-router";
import { Eye, Search, Trash2 } from "lucide-react";
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
import { OrderDetailSheet } from "@/components/admin/OrderDetailSheet";
import { useAdminStore } from "@/lib/adminStore";
import type { Order, OrderStatus } from "@/lib/orders";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const statusBadge: Record<OrderStatus, string> = {
  pending: "bg-sky/40 text-brand-secondary",
  confirmed: "bg-mint text-brand-secondary",
  cancelled: "bg-accent-red/10 text-accent-red",
};

const statusLabel: Record<OrderStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
};

function AdminOrders() {
  const orders = useAdminStore((s) => s.orders);
  const deleteOrder = useAdminStore((s) => s.deleteOrder);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [viewing, setViewing] = useState<Order | null>(null);
  const [toDelete, setToDelete] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    let list = orders;
    if (status !== "all") list = list.filter((o) => o.status === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) => o.customer.name.toLowerCase().includes(q) || o.customer.phone.includes(q),
      );
    }
    return list;
  }, [orders, status, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un client..."
              className="w-full rounded-full border border-border bg-paper py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | "all")}
            className="rounded-full border border-border bg-paper px-4 py-2.5 text-sm outline-none focus:border-brand"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-paper shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Commande</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="text-sm font-semibold text-ink">
                  #{o.id.split("-")[1]}
                  <div className="text-xs font-normal text-ink-soft">
                    {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <p className="font-semibold text-ink">{o.customer.name}</p>
                  <p className="text-xs text-ink-soft">{o.customer.phone}</p>
                </TableCell>
                <TableCell className="text-sm text-ink-soft">{o.customer.city}</TableCell>
                <TableCell className="text-sm">{o.items.reduce((s, i) => s + i.qty, 0)}</TableCell>
                <TableCell className="text-sm font-bold text-brand">{o.total.toFixed(0)} MAD</TableCell>
                <TableCell>
                  <Badge className={statusBadge[o.status]}>{statusLabel[o.status]}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setViewing(o)}
                      aria-label="Voir"
                      className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-mint hover:text-brand"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setToDelete(o)}
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
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-ink-soft">
            {orders.length === 0
              ? "Aucune commande pour le moment   les commandes du checkout apparaîtront ici."
              : "Aucune commande ne correspond à votre recherche."}
          </div>
        )}
      </div>

      <OrderDetailSheet order={viewing} onOpenChange={(o) => !o && setViewing(null)} />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette commande ?</AlertDialogTitle>
            <AlertDialogDescription>
              La commande de « {toDelete?.customer.name} » sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-accent-red text-accent-red-foreground hover:bg-accent-red/90"
              onClick={() => {
                if (toDelete) deleteOrder(toDelete.id);
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
