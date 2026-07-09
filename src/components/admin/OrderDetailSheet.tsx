import { MapPin, Phone, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUpdateOrderStatus } from "@/lib/adminStore";
import type { Order, OrderStatus } from "@/lib/orders";

const paymentLabels: Record<Order["payment"], string> = {
  cod: "Paiement à la livraison",
  bank: "Virement bancaire",
  rep: "À arranger avec le commercial",
};

export function OrderDetailSheet({
  order,
  onOpenChange,
}: {
  order: Order | null;
  onOpenChange: (open: boolean) => void;
}) {
  const updateOrderStatus = useUpdateOrderStatus();

  return (
    <Sheet open={!!order} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {order && (
          <>
            <SheetHeader>
              <SheetTitle className="font-display uppercase tracking-wide">Commande #{order.id.slice(0, 8)}</SheetTitle>
              <SheetDescription>
                {new Date(order.createdAt).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Statut
                </label>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus.mutate({ id: order.id, status: e.target.value as OrderStatus })}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-brand"
                >
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>

              <div className="rounded-xl border bg-cream p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold text-ink">
                  <User className="h-4 w-4 text-brand" /> {order.customer.name}
                </p>
                <p className="mt-2 flex items-center gap-2 text-ink-soft">
                  <Phone className="h-4 w-4" /> {order.customer.phone}
                </p>
                <p className="mt-2 flex items-start gap-2 text-ink-soft">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {order.customer.address}, {order.customer.city}
                </p>
                {order.customer.email && <p className="mt-2 text-ink-soft">{order.customer.email}</p>}
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-brand">
                  {paymentLabels[order.payment]}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">Articles</p>
                <ul className="divide-y rounded-xl border">
                  {order.items.map((item) => (
                    <li key={item.productId} className="flex gap-3 p-3">
                      <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-semibold">{item.name}</p>
                        <p className="text-[11px] text-ink-soft">
                          {item.qty} × {item.price.toFixed(0)} MAD
                        </p>
                      </div>
                      <p className="text-xs font-bold">{(item.price * item.qty).toFixed(0)} MAD</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-baseline justify-between border-t pt-4">
                <span className="text-sm text-ink-soft">Total</span>
                <span className="font-display text-2xl font-bold text-brand">{order.total.toFixed(0)} MAD</span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
