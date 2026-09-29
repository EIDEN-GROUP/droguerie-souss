import { Minus, Plus } from "lucide-react";
import { useState } from "react";

const SIZES = {
  sm: { button: "h-7 w-7", icon: "h-3 w-3", input: "w-10" },
  md: { button: "h-9 w-8", icon: "h-3.5 w-3.5", input: "w-12" },
  lg: { button: "h-11 w-11", icon: "h-4 w-4", input: "w-14" },
} as const;

/**
 * Quantite : boutons - et +, et le nombre lui-meme, saisissable pour une grosse quantite
 * sans cliquer cinquante fois. Clavier numerique sur telephone ; le texte est selectionne
 * a l'entree dans le champ, la frappe remplace donc la valeur.
 *
 * Chaque frappe valide est transmise aussitot (bornee a `min`-`max`). Pendant la saisie, le
 * champ garde le texte tape (il peut etre vide) ; en sortant, il reprend la derniere valeur
 * valide. Police a 16px : en dessous, Safari iOS zoome la page a la saisie.
 */
export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 9999,
  size = "md",
  className = "",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const s = SIZES[size];
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  /** Les boutons repartent de la valeur valide et referment toute saisie en cours. */
  const stepBy = (delta: number) => {
    setDraft(null);
    onChange(clamp(value + delta));
  };
  const step =
    "grid shrink-0 place-items-center text-ink-soft transition hover:bg-mint hover:text-ink disabled:pointer-events-none disabled:opacity-30";

  return (
    <div
      className={`flex items-center rounded-full border transition focus-within:border-brand ${className}`}
    >
      <button
        type="button"
        onClick={() => stepBy(-1)}
        disabled={value <= min}
        aria-label="Diminuer la quantité"
        className={`${step} ${s.button} rounded-l-full`}
      >
        <Minus className={s.icon} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        aria-label="Quantité"
        maxLength={String(max).length}
        value={draft ?? String(value)}
        onFocus={(e) => {
          setDraft(String(value));
          e.currentTarget.select();
        }}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          setDraft(digits);
          const n = Number(digits);
          if (digits && n >= min) onChange(clamp(n));
        }}
        onBlur={() => setDraft(null)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const next = clamp(value + (e.key === "ArrowUp" ? 1 : -1));
            onChange(next);
            setDraft(String(next));
          }
        }}
        className={`${s.input} min-w-0 bg-transparent text-center text-base font-bold tabular-nums text-ink outline-none`}
      />
      <button
        type="button"
        onClick={() => stepBy(1)}
        disabled={value >= max}
        aria-label="Augmenter la quantité"
        className={`${step} ${s.button} rounded-r-full`}
      >
        <Plus className={s.icon} />
      </button>
    </div>
  );
}
