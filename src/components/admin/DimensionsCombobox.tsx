import { useState } from "react";
import { Check, ChevronsUpDown, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  useDimensions,
  useCreateDimension,
  useUpdateDimension,
  useDeleteDimension,
} from "@/lib/adminStore";
import type { DbDimension } from "@/lib/api/dimensions";

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/**
 * Liste des dimensions globales avec gestion embarquée :
 *  - saisir un libellé et valider avec Entrée crée un nouveau preset global ;
 *  - chaque entrée peut être renommée (crayon) ou supprimée (poubelle), auquel cas
 *    elle est retirée des produits qui l'utilisent ;
 *  - sélectionner une entrée existante la renvoie simplement via `onChange`.
 */
export function DimensionsCombobox({
  value,
  onChange,
  placeholder = "Choisir / créer une dimension",
  disabled = false,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const { data: dimensions = [], isLoading } = useDimensions();
  const createDimension = useCreateDimension();
  const updateDimension = useUpdateDimension();
  const deleteDimension = useDeleteDimension();

  const searchNormalized = normalize(search.trim());
  const filtered = (dimensions as DbDimension[])
    .filter((d) => {
      const n = normalize(d.value);
      return n.includes(searchNormalized);
    })
    .sort((a, b) => {
      if (searchNormalized) {
        const aStarts = normalize(a.value).startsWith(searchNormalized) ? 1 : 0;
        const bStarts = normalize(b.value).startsWith(searchNormalized) ? 1 : 0;
        if (aStarts !== bStarts) return bStarts - aStarts;
      }
      return a.value.localeCompare(b.value, "fr");
    });

  const canCreate =
    search.trim().length > 0 &&
    !dimensions.some((d) => normalize(d.value) === searchNormalized);

  const busy = createDimension.isPending || updateDimension.isPending || deleteDimension.isPending;
  const selected = dimensions.find((d) => d.value === value);

  const close = () => {
    setOpen(false);
    setSearch("");
    setError("");
    setEditingId(null);
  };

  const handleCreate = async () => {
    const v = search.trim();
    if (!v || busy) return;
    try {
      const created = await createDimension.mutateAsync({ value: v });
      onChange(created.value);
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la création.");
    }
  };

  const handleRename = async (id: string) => {
    const v = editingValue.trim();
    if (!v || busy) {
      setEditingId(null);
      return;
    }
    try {
      const updated = await updateDimension.mutateAsync({ id, value: v });
      if (value === editingValue) onChange(updated.value);
      setEditingId(null);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors du renommage.");
    }
  };

  const handleDelete = async (d: DbDimension) => {
    if (
      !window.confirm(
        `Supprimer la dimension « ${d.value} » ?\nElle sera retirée des produits qui l'utilisent.`,
      )
    ) {
      return;
    }
    try {
      await deleteDimension.mutateAsync(d.id);
      if (value === d.value) onChange("");
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la suppression.");
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        if (o) setOpen(true);
        else close();
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-border bg-paper px-3 py-2.5 text-sm text-ink outline-none transition hover:border-brand focus:border-brand disabled:pointer-events-none disabled:opacity-60",
            className,
          )}
        >
          <span className={cn("truncate text-left", !selected && "text-ink-soft")}>
            {selected?.value ?? placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-ink-soft" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[max(20rem,var(--radix-popover-trigger-width))] rounded-xl p-0"
      >
        <div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canCreate) {
                e.preventDefault();
                handleCreate();
              }
              if (e.key === "Escape") close();
            }}
            placeholder="Rechercher ou créer…"
            className="w-full border-b border-border bg-transparent px-3 py-2.5 text-sm outline-none"
            autoFocus
          />
        </div>

        <div className="styled-scrollbar max-h-64 overflow-y-auto p-1">
          {isLoading && (
            <div className="px-2 py-4 text-center text-xs text-ink-soft">Chargement…</div>
          )}

          {!isLoading && canCreate && (
            <button
              type="button"
              disabled={busy}
              onClick={handleCreate}
              className="mb-0.5 flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-brand hover:bg-mint disabled:opacity-60"
            >
              {createDimension.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
              ) : (
                <Plus className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">Créer « {search.trim()} »</span>
            </button>
          )}

          {!isLoading && filtered.length === 0 && !canCreate && (
            <div className="px-2 py-6 text-center text-sm text-ink-soft">
              Aucune dimension trouvée.
            </div>
          )}

          {filtered.map((d) =>
            editingId === d.id ? (
              <div key={d.id} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5">
                <input
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(d.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  autoFocus
                  className="min-w-0 flex-1 rounded-md border border-brand px-2 py-1 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRename(d.id)}
                  aria-label="Enregistrer"
                  className="grid h-7 w-7 place-items-center rounded-full text-brand hover:bg-mint"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  aria-label="Annuler"
                  className="grid h-7 w-7 place-items-center rounded-full text-ink-soft hover:bg-cream"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div
                key={d.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg text-sm",
                  value === d.value ? "bg-mint/60" : "hover:bg-mint/40",
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    onChange(d.value);
                    close();
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left"
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0 text-brand",
                      value === d.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{d.value}</span>
                </button>
                {!busy && (
                  <div className="flex shrink-0 items-center gap-0.5 pr-1.5 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(d.id);
                        setEditingValue(d.value);
                      }}
                      aria-label="Renommer"
                      className="grid h-7 w-7 place-items-center rounded-full hover:bg-mint hover:text-brand"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(d);
                      }}
                      aria-label="Supprimer"
                      className="grid h-7 w-7 place-items-center rounded-full hover:bg-accent-red/10 hover:text-accent-red"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ),
          )}
        </div>

        {error && (
          <div className="border-t border-accent-red/20 bg-accent-red/5 px-3 py-2 text-xs font-semibold text-accent-red">
            {error}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}