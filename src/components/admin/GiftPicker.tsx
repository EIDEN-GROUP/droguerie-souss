import { Gift, Trash2 } from "lucide-react";
import { useProducts } from "@/lib/adminStore";
import type { DbProductGift } from "@/lib/database.types";

export function GiftPicker({
  gifts,
  onChange,
}: {
  gifts: Omit<DbProductGift, "id" | "product_id">[];
  onChange: (gifts: Omit<DbProductGift, "id" | "product_id">[]) => void;
}) {
  const { data: products } = useProducts();

  const add = () => {
    const gift = products?.find((p) => !gifts.some((g) => g.gift_product_id === p.id));
    if (!gift) return;
    onChange([...gifts, { gift_product_id: gift.id, min_qty: 1, gift_qty: 1 }]);
  };

  const update = (i: number, patch: Partial<Omit<DbProductGift, "id" | "product_id">>) => {
    const next = gifts.map((g, idx) => (idx === i ? { ...g, ...patch } : g));
    onChange(next);
  };

  const remove = (i: number) => onChange(gifts.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
        Offrir un cadeau
      </label>
      {gifts.length === 0 && (
        <p className="text-xs text-ink-soft">Aucun cadeau configuré.</p>
      )}
      {gifts.map((g, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg border p-3">
          <select
            value={g.gift_product_id}
            onChange={(e) => update(i, { gift_product_id: e.target.value })}
            className="min-w-0 flex-1 rounded border border-border bg-white px-2 py-1.5 text-xs outline-none"
          >
            <option value="">Choisir un produit</option>
            {(products || [])
              .filter((p) => p.id === g.gift_product_id || !gifts.some((x) => x.gift_product_id === p.id))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
          <span className="text-[10px] text-ink-soft">dès</span>
          <input
            type="number"
            min={1}
            value={g.min_qty}
            onChange={(e) => update(i, { min_qty: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-14 rounded border border-border px-2 py-1.5 text-xs text-center outline-none"
            title="Quantité minimale d'achat"
          />
          <span className="text-[10px] text-ink-soft">→</span>
          <input
            type="number"
            min={1}
            value={g.gift_qty}
            onChange={(e) => update(i, { gift_qty: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-14 rounded border border-border px-2 py-1.5 text-xs text-center outline-none"
            title="Quantité offerte"
          />
          <span className="text-[10px] text-ink-soft">offert(s)</span>
          <button type="button" onClick={() => remove(i)} className="ml-auto shrink-0 text-accent-red hover:text-accent-red/70">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline">
        <Gift className="h-3.5 w-3.5" /> Ajouter un cadeau
      </button>
    </div>
  );
}
