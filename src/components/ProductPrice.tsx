import { cn } from "@/lib/utils";

type PriceSize = "sm" | "md" | "lg" | "xl";

const sizeStyles: Record<PriceSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
  xl: "text-base",
};

export function ProductPrice({
  size = "lg",
  className,
}: {
  priceMode?: "fixed" | "quote" | null;
  price?: number;
  unit?: string;
  size?: PriceSize;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 font-bold uppercase tracking-wider text-brand", sizeStyles[size], className)}>
      Demander un devis
    </span>
  );
}

export function ProductPromoPrice(props: {
  priceMode?: "fixed" | "quote" | null;
  price?: number;
  promoPrice?: number | null;
  unit?: string;
  size?: PriceSize;
}) {
  return <ProductPrice {...props} />;
}
