import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Mail, Phone, MapPin, Trash2, MessageSquare } from "lucide-react";
import { useState } from "react";
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
import { useContactMessages, useDeleteContactMessage } from "@/lib/adminStore";

export const Route = createFileRoute("/admin/contacts")({
  component: AdminContacts,
});

function AdminContacts() {
  const { data: messages, isLoading, isError } = useContactMessages();
  const deleteMessage = useDeleteContactMessage();
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

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
      </div>

      {isError && (
        <div className="rounded-xl border border-accent-red/30 bg-accent-red/5 px-4 py-3 text-sm font-semibold text-accent-red">
          Erreur de chargement. Veuillez réessayer.
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border bg-paper shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(messages || []).map((m) => (
              <TableRow key={m.id}>
                <TableCell className="whitespace-nowrap text-sm text-ink-soft">
                  {new Date(m.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  <div className="text-sm font-semibold text-ink">{m.name}</div>
                  {m.city && <div className="flex items-center gap-1 text-xs text-ink-soft"><MapPin className="h-3 w-3" />{m.city}</div>}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-ink"><Phone className="h-3.5 w-3.5 text-ink-soft" />{m.phone}</div>
                  {m.email && <div className="flex items-center gap-1 text-xs text-ink-soft"><Mail className="h-3 w-3" />{m.email}</div>}
                </TableCell>
                <TableCell className="max-w-xs">
                  <button
                    onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                    className="flex items-center gap-1.5 text-left text-sm text-ink-soft hover:text-brand"
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {expanded === m.id ? m.message : m.message.slice(0, 80) + (m.message.length > 80 ? "..." : "")}
                    </span>
                  </button>
                </TableCell>
                <TableCell>
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
        {(!messages || messages.length === 0) && (
          <div className="py-16 text-center text-sm text-ink-soft">Aucun message pour le moment.</div>
        )}
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
