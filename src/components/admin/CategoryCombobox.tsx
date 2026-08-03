import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type ComboboxOption = { value: string; label: string };

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/**
 * Le score approximatif de cmdk retient trop large — « carr » remonterait « Toutes les
 * catégories » et « Béton Armé, Ciments, Agrégats ». On s'en tient à une sous-chaîne,
 * insensible aux accents, en faisant remonter les libellés qui commencent par la saisie.
 */
const matchLabel = (label: string, search: string) => {
  const l = normalize(label);
  const s = normalize(search.trim());
  if (!s) return 1;
  if (l.startsWith(s)) return 1;
  return l.includes(s) ? 0.5 : 0;
};

/**
 * Liste déroulante avec recherche, en remplacement d'un `<select>` natif : au-delà d'une
 * poignée d'entrées, retrouver une catégorie dans la liste système devient pénible.
 *
 * `pill` reprend l'allure des boutons de la barre d'outils, `field` celle des champs de
 * formulaire.
 */
export function CategoryCombobox({
  value,
  onChange,
  options,
  placeholder = "Choisir une catégorie",
  searchPlaceholder = "Rechercher une catégorie…",
  emptyLabel = "Aucune catégorie trouvée.",
  variant = "field",
  disabled = false,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  variant?: "pill" | "field";
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    /** Volontairement non `modal` : le champ de recherche reçoit le focus même ouvert
     *  depuis un Dialog, et empiler une seconde couche de `pointer-events: none` sur
     *  celle du Dialog risquerait de figer la page si les deux se démontent dans le
     *  désordre. */
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "flex cursor-pointer items-center justify-between gap-2 border border-border bg-paper text-ink outline-none transition hover:border-brand focus:border-brand disabled:pointer-events-none disabled:opacity-60",
            variant === "pill"
              ? "rounded-full px-4 py-2.5 text-sm font-bold uppercase tracking-wider"
              : "w-full rounded-xl px-3 py-2.5 text-sm",
            className,
          )}
        >
          <span className={cn("truncate", !selected && "text-ink-soft")}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-ink-soft" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        /** Le panneau épouse la largeur du déclencheur, avec un plancher pour la pastille
         *  de la barre d'outils qui peut être étroite. */
        className="w-[max(16rem,var(--radix-popover-trigger-width))] rounded-xl p-0"
      >
        <Command filter={matchLabel}>
          <CommandInput placeholder={searchPlaceholder} className="text-sm" />
          <CommandList className="styled-scrollbar">
            <CommandEmpty className="py-6 text-center text-sm text-ink-soft">
              {emptyLabel}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  /** cmdk filtre sur `value` : on lui donne le libellé pour que la
                   *  recherche porte sur le texte affiché. */
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer gap-2 rounded-lg text-sm"
                >
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0 text-brand",
                      option.value === value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
