import { createFileRoute } from "@tanstack/react-router";
import { FileDown, Loader2, Mail, Phone, MapPin, Trash2, MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/admin/TablePagination";
import { usePagination } from "@/hooks/usePagination";
import { useContactMessages, useDeleteContactMessage } from "@/lib/adminStore";

export const Route = createFileRoute("/admin/contacts")({
  component: AdminContacts,
});

function AdminContacts() {
  const { data: messages, isLoading, isError } = useContactMessages();
  const deleteMessage = useDeleteContactMessage();
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);

  const messageList = useMemo(() => messages || [], [messages]);
  const pagination = usePagination(messageList, 10);

  const handleExport = () => {
    setExportBusy(true);
    try {
      const data = (messages || []).map((m) => ({
        date: new Date(m.created_at).toLocaleDateString("fr-FR"),
        name: m.name,
        phone: m.phone,
        email: m.email || "",
        city: m.city || "",
        message: m.message,
      }));
      const csv = Papa.unparse(data);
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-lg font-bold uppercase text-ink">Messages reçus</h2>
        <button
          onClick={handleExport}
          disabled={exportBusy}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-ink transition hover:border-brand hover:bg-cream hover:text-brand disabled:pointer-events-none disabled:opacity-60"
        >
          {exportBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
          Exporter CSV
        </button>
      </div>

      {isError && (
        <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 px-4 py-3 text-sm font-semibold text-accent-red">
          Erreur de chargement. Veuillez réessayer.
        </div>
      )}

      <div className="rounded-2xl border bg-paper shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead className="whitespace-nowrap">Client</TableHead>
              <TableHead className="whitespace-nowrap">Contact</TableHead>
              {/* w-full + max-w-0 makes this column soak up the leftover width
                  while still allowing its text to wrap instead of overflowing. */}
              <TableHead className="w-full max-w-0">Message</TableHead>
              <TableHead className="w-px whitespace-nowrap text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.pageItems.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="whitespace-nowrap align-top text-sm text-ink-soft">
                  {new Date(m.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="whitespace-nowrap align-top">
                  <div className="text-sm font-semibold text-ink">{m.name}</div>
                  {m.city && <div className="flex items-center gap-1 text-xs text-ink-soft"><MapPin className="h-3 w-3" />{m.city}</div>}
                </TableCell>
                <TableCell className="whitespace-nowrap align-top">
                  <div className="flex items-center gap-1 text-sm text-ink"><Phone className="h-3.5 w-3.5 text-ink-soft" />{m.phone}</div>
                  {m.email && <div className="flex items-center gap-1 text-xs text-ink-soft"><Mail className="h-3 w-3" />{m.email}</div>}
                </TableCell>
                <TableCell className="w-full max-w-0 align-top">
                  <button
                    onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                    aria-expanded={expanded === m.id}
                    className="flex w-full items-start gap-1.5 text-left text-sm text-ink-soft hover:text-brand"
                  >
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className={expanded === m.id ? "whitespace-pre-wrap break-words" : "line-clamp-2 break-words"}>
                      {m.message}
                    </span>
                  </button>
                </TableCell>
                <TableCell className="w-px align-top">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setToDelete(m.id)}
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
        {messageList.length === 0 && (
          <div className="py-16 text-center text-sm text-ink-soft">Aucun message pour le moment.</div>
        )}
        <TablePagination
          page={pagination.page}
          pageCount={pagination.pageCount}
          pageSize={pagination.pageSize}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          label="messages"
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.changePageSize}
        />
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
            <AlertDialogDescription>
              Ce message sera définitivement supprimé. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-accent-red text-accent-red-foreground hover:bg-accent-red/90"
              onClick={() => {
                if (toDelete) deleteMessage.mutate(toDelete);
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
