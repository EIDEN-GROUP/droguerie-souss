import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, FileDown, Loader2, Search, Trash2 } from "lucide-react";
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
import { OrderDetailSheet } from "@/components/admin/OrderDetailSheet";
import { TablePagination } from "@/components/admin/TablePagination";
import { usePagination } from "@/hooks/usePagination";
import { useOrders, useDeleteOrder } from "@/lib/adminStore";
import type { Order, OrderStatus } from "@/lib/orders";

const MotionTableRow = motion(TableRow);

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
  const { data: orders, isLoading, isError } = useOrders();
  const deleteOrder = useDeleteOrder();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Order | null>(null);
  const [exportBusy, setExportBusy] = useState(false);

  const orderList = useMemo(() => (orders || []) as unknown as Order[], [orders]);

  const viewing = useMemo(
    () => (viewingId ? (orderList.find((o) => o.id === viewingId) ?? null) : null),
    [viewingId, orderList],
  );

  const filtered = useMemo(() => {
    let list = orderList;
    if (status !== "all") list = list.filter((o) => o.status === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) => o.customer.name.toLowerCase().includes(q) || o.customer.phone.includes(q),
      );
    }
    return list;
  }, [orderList, status, query]);

  const pagination = usePagination(filtered, 10);

  const handleExport = () => {
    setExportBusy(true);
    try {
      const data = filtered.map((o) => ({
        id: o.id,
        date: new Date(o.createdAt).toLocaleDateString("fr-FR"),
        client: o.customer.name,
        phone: o.customer.phone,
        email: o.customer.email,
        city: o.customer.city,
        address: o.customer.address,
        total: o.total,
        status: statusLabel[o.status],
      }));
      const csv = Papa.unparse(data);
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ventes-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExportBusy(false);
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
        <button
          onClick={handleExport}
          disabled={exportBusy}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-ink transition hover:border-brand hover:bg-cream hover:text-brand disabled:pointer-events-none disabled:opacity-60"
        >
          {exportBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          Exporter CSV
        </button>
      </div>

      <div className="rounded-2xl border bg-paper shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-2">Commande</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Articles</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right pr-2">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.pageItems.map((o, i) => (
              <MotionTableRow
                key={o.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(i, 10) * 0.04 }}
              >
                <TableCell className="text-sm font-semibold text-ink">
                  {o.id.slice(0, 8)}
                  <div className="text-xs font-normal text-ink-soft">
                    {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                  </div>
                </TableCell>
                <TableCell className="text-sm font-semibold text-ink">{o.customer.name}</TableCell>
                <TableCell className="whitespace-nowrap text-sm text-ink-soft">{o.customer.phone}</TableCell>
                <TableCell className="text-sm text-ink-soft">{o.customer.city}</TableCell>
                <TableCell className="text-sm">{o.items.reduce((s, i) => s + i.qty, 0)}</TableCell>
                <TableCell className="text-sm font-bold text-brand">{o.items.every((i: any) => i.price === 0) ? "Prix à confirmer" : o.items.reduce((s: number, i: any) => s + i.price * i.qty, 0).toFixed(0) + " MAD"}</TableCell>
                <TableCell>
                  <Badge className={statusBadge[o.status]}>{statusLabel[o.status]}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setViewingId(o.id)}
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
              </MotionTableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-ink-soft">
            {orderList.length === 0
              ? "Aucune commande pour le moment   les commandes du checkout apparaîtront ici."
              : "Aucune commande ne correspond à votre recherche."}
          </div>
        )}
        <TablePagination
          page={pagination.page}
          pageCount={pagination.pageCount}
          pageSize={pagination.pageSize}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          label="commandes"
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.changePageSize}
        />
      </div>

      <OrderDetailSheet order={viewing} onOpenChange={(o) => !o && setViewingId(null)} />

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
                if (toDelete) deleteOrder.mutate(toDelete.id);
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
