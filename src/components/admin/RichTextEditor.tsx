import { useEffect, useRef, useState } from "react";
import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react";
import { cn } from "@/lib/utils";
import { stripTags } from "@/lib/richtext";

/**
 * Éditeur de texte enrichi minimal (gras, italique, souligné, listes).
 * Zéro dépendance : utilise les commandes natives du navigateur.
 * Le HTML produit est assaini à l'enregistrement ET à l'affichage
 * (voir src/lib/richtext.ts) — coller depuis Word/une page web est sûr.
 */
export function RichTextEditor({
  value,
  onChange,
  onBlur,
  resetKey,
}: {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  /** Change quand on édite un autre produit : réinitialise le contenu. */
  resetKey?: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState({ bold: false, italic: false, underline: false });

  // Contenu initial (ou produit suivant). Non synchronisé ensuite pour ne
  // jamais déplacer le curseur pendant la frappe.
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const exec = (command: string) => {
    ref.current?.focus();
    document.execCommand(command, false);
    emit();
    refreshActive();
  };

  const emit = () => {
    const html = ref.current?.innerHTML ?? "";
    // Éditeur visuellement vide (<p><br></p>, …) → chaîne vide (la validation
    // « description trop courte » s'applique alors normalement).
    onChange(stripTags(html) ? html : "");
  };

  const refreshActive = () => {
    try {
      setActive({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      });
    } catch {
      /* navigateurs anciens */
    }
  };

  const buttons = [
    { command: "bold", icon: Bold, label: "Gras", isActive: active.bold },
    { command: "italic", icon: Italic, label: "Italique", isActive: active.italic },
    { command: "underline", icon: Underline, label: "Souligné", isActive: active.underline },
    { command: "insertUnorderedList", icon: List, label: "Liste à puces", isActive: false },
    { command: "insertOrderedList", icon: ListOrdered, label: "Liste numérotée", isActive: false },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white transition focus-within:border-brand">
      <div className="flex items-center gap-1 border-b border-border/70 bg-cream/60 px-2 py-1.5">
        {buttons.map((b) => (
          <button
            key={b.command}
            type="button"
            title={b.label}
            aria-label={b.label}
            onMouseDown={(e) => {
              // Garde la sélection : le clic ne doit pas voler le focus.
              e.preventDefault();
              exec(b.command);
            }}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-md text-ink-soft transition hover:bg-mint hover:text-brand",
              b.isActive && "bg-mint text-brand",
            )}
          >
            <b.icon className="h-4 w-4" />
          </button>
        ))}
        <span className="ml-auto hidden px-2 text-[11px] text-ink-soft sm:inline">
          Sélectionnez du texte puis cliquez
        </span>
      </div>
      <div
        ref={ref}
        contentEditable
        role="textbox"
        aria-multiline
        aria-label="Description du produit"
        onInput={emit}
        onBlur={() => {
          setActive({ bold: false, italic: false, underline: false });
          onBlur?.();
        }}
        onMouseUp={refreshActive}
        onKeyUp={refreshActive}
        className="min-h-[120px] max-h-64 overflow-y-auto px-3 py-2.5 text-sm leading-relaxed text-ink outline-none empty:before:text-ink-soft/60 empty:before:content-[attr(data-placeholder)] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
        data-placeholder="Décrivez le produit : usage, avantages, formats…"
      />
    </div>
  );
}
