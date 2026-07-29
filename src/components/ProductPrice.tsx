import { cn } from "@/lib/utils";

type PriceSize = "sm" | "md" | "lg" | "xl";

const sizeStyles: Record<PriceSize, { price: string; unit: string }> = {
  sm: { price: "text-xs font-semibold", unit: "text-[10px]" },
  md: { price: "text-sm font-bold", unit: "text-xs" },
  lg: { price: "font-display text-lg font-bold", unit: "text-xs" },
  xl: { price: "font-display text-4xl font-bold", unit: "text-sm" },
};

export function ProductPrice({
  priceMode,
  price,
  unit,
  size = "lg",
  className,
}: {
  priceMode?: "fixed" | "quote" | null;
  price: number;
  unit?: string;
  size?: PriceSize;
  className?: string;
}) {
  const s = sizeStyles[size];

  if (priceMode === "quote") {
    return (
      <span className={cn("inline-flex items-center gap-1 rounded bg-brand/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-brand", s.price, className)}>
        Prix sur demande
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      <span className={cn("text-ink", s.price)}>
        {price.toFixed(0)} MAD
      </span>
      {unit && <span className={cn("text-ink-soft", s.unit)}>/ {unit}</span>}
    </span>
  );
}

export function ProductPromoPrice({
  priceMode,
  price,
  promoPrice,
  unit,
  size = "lg",
}: {
  priceMode?: "fixed" | "quote" | null;
  price: number;
  promoPrice: number | null;
  unit?: string;
  size?: PriceSize;
}) {
  const s = sizeStyles[size];

  if (priceMode === "quote") {
    return <ProductPrice priceMode={priceMode} price={price} unit={unit} size={size} />;
  }

  if (promoPrice) {
    return (
      <span className="inline-flex items-baseline gap-2">
        <span className={cn("font-display font-bold text-accent-red", s.price)}>
          {promoPrice.toFixed(0)} MAD
        </span>
        <span className={cn("text-ink-soft line-through", s.price === "text-4xl" ? "text-lg" : "text-xs")}>
          {price.toFixed(0)} MAD
        </span>
        {unit && <span className={cn("text-ink-soft", s.unit)}>/ {unit}</span>}
      </span>
    );
  }

  return <ProductPrice priceMode={priceMode} price={price} unit={unit} size={size} />;
}
