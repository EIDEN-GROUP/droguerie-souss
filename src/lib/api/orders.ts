import { createServerFn } from "@tanstack/react-start";
import type { OrderInput } from "@/lib/database.types";
import { requireAdminUser } from "./admin-guard";
import { requireCustomerEmail } from "./customer-session";
import { createAdminClient, sendEmail } from "./db";
import { orderConfirmationEmail, orderCustomerConfirmation } from "@/lib/email-templates";

/** Garde-fous anti-spam/abus : validation + plafond + rate limit en mémoire. */
const MAX_ORDERS_PER_WINDOW = 10;
const ORDER_WINDOW_MS = 10 * 60 * 1000;
let orderSubmissions: number[] = [];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s()./-]{3,38}$/;

/** Caractères de contrôle à retirer des champs libres (source 100 % ASCII). */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]", "g");

function clean(value: unknown, max: number): string {
  return String(value ?? "")
    .replace(CONTROL_CHARS_RE, "")
    .trim()
    .slice(0, max);
}

export const createOrder = createServerFn({ method: "POST" })
  .validator((data: OrderInput) => data)
  .handler(async (ctx) => {
    // Anti-spam : même garde-fou que le contact (aucun changement visuel).
    const now = Date.now();
    orderSubmissions = orderSubmissions.filter((t) => now - t < ORDER_WINDOW_MS);
    if (orderSubmissions.length >= MAX_ORDERS_PER_WINDOW) {
      throw new Error("Trop de demandes envoyées. Réessayez dans quelques minutes.");
    }

    // Validation des champs client (le formulaire n'a que du HTML required).
    const customer_name = clean(ctx.data.customer_name, 120);
    const customer_phone = clean(ctx.data.customer_phone, 40);
    const customer_city = clean(ctx.data.customer_city, 120);
    const customer_address = clean(ctx.data.customer_address, 300);
    const customer_email = clean(ctx.data.customer_email, 254) || undefined;
    const note = clean(ctx.data.note, 2000) || undefined;
    if (customer_name.length < 2) throw new Error("Nom client invalide.");
    if (!PHONE_RE.test(customer_phone)) throw new Error("Téléphone invalide.");
    if (customer_city.length < 2) throw new Error("Ville invalide.");
    if (customer_address.length < 5) throw new Error("Adresse invalide.");
    if (customer_email && !EMAIL_RE.test(customer_email)) throw new Error("E-mail invalide.");
    if (!["cod", "bank", "rep"].includes(ctx.data.payment_method)) {
      throw new Error("Moyen de paiement invalide.");
    }
    const type = ctx.data.type === "quote" ? "quote" : "order";

    // Panier : jamais de prix navigateur. Chaque article est re-chiffré
    // depuis la base (prix + promo du moment, images/noms officiels).
    const rawItems = Array.isArray(ctx.data.items) ? ctx.data.items : [];
    if (rawItems.length === 0 || rawItems.length > 100) {
      throw new Error("Panier vide ou trop volumineux.");
    }
    const supabase = createAdminClient();
    const ids = [...new Set(rawItems.map((i) => String(i.product_id ?? "")))].filter(Boolean);
    if (ids.length === 0) throw new Error("Panier invalide.");
    const { data: dbProducts, error: priceError } = await supabase
      .from("products")
      .select("id, name, price, promo, price_mode, image_url")
      .in("id", ids);
    if (priceError) throw new Error("Catalogue momentanément indisponible.");
    type DbPriceRow = {
      id: string;
      name: string;
      price: number;
      promo: number | null;
      price_mode: string;
      image_url: string | null;
    };
    const byId = new Map((dbProducts || []).map((p) => [p.id, p as unknown as DbPriceRow]));

    type CartItem = {
      product_id?: unknown;
      qty?: unknown;
      product_dimension?: unknown;
    };
    const priced = (rawItems as CartItem[]).map((i) => {
      const qty = Math.floor(Number(i.qty));
      if (!Number.isFinite(qty) || qty < 1 || qty > 999) throw new Error("Quantité invalide.");
      const db = byId.get(String(i.product_id));
      if (!db) throw new Error("Article inconnu du catalogue.");
      const pct = Number(db.promo) || 0;
      const unit =
        db.price_mode === "fixed" && Number(db.price) > 0
          ? Math.round(Number(db.price) * (1 - pct / 100) * 100) / 100
          : 0;
      return {
        product_id: db.id,
        product_name: db.name,
        product_image: db.image_url || null,
        price: unit,
        qty,
        product_dimension:
          typeof i.product_dimension === "string" && i.product_dimension.length <= 60
            ? i.product_dimension
            : null,
      };
    });
    const total = Math.round(priced.reduce((sum, i) => sum + i.price * i.qty, 0) * 100) / 100;

    orderSubmissions.push(now);

    const row = {
      customer_name,
      customer_phone,
      customer_email: customer_email || null,
      customer_city,
      customer_address,
      payment_method: ctx.data.payment_method,
      total,
      type,
      status: "pending",
    };

    /** `note` needs migration 011. Until it runs, retry without it rather than
     *  losing the order - the note still reaches us in the email below. */
    let { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ ...row, note: note || null })
      .select()
      .single();

    if (orderError?.code === "42703") {
      console.warn("orders.note missing (migration 011 not applied) - saving without it");
      ({ data: order, error: orderError } = await supabase
        .from("orders")
        .insert(row)
        .select()
        .single());
    }

    if (orderError) throw orderError;

    const items = priced.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      product_name: i.product_name,
      product_image: i.product_image || null,
      price: i.price,
      qty: i.qty,
      product_dimension: i.product_dimension || null,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(items);

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    const isQuote = type === "quote";
    sendEmail({
      adminSubject: isQuote
        ? "Nouvelle demande de devis   Souss Droguerie"
        : "Nouvelle commande   Souss Droguerie",
      adminHtml: orderConfirmationEmail({
        id: order.id,
        customer_name,
        customer_phone,
        customer_email,
        customer_city,
        customer_address,
        payment_method: ctx.data.payment_method,
        total,
        type,
        note,
        items: priced.map((i) => ({
          product_name: i.product_name,
          qty: i.qty,
          price: i.price,
          dimension: i.product_dimension || undefined,
        })),
      }),
      customerTo: customer_email || undefined,
      customerSubject: customer_email
        ? isQuote
          ? "Confirmation de votre demande de devis   Souss Droguerie"
          : "Confirmation de votre commande   Souss Droguerie"
        : undefined,
      customerHtml: customer_email
        ? orderCustomerConfirmation({
            customer_name,
            total,
            type,
            items: priced,
          })
        : undefined,
    }).catch((err) => console.error("sendEmail (order) failed:", err));

    return { id: order.id, total };
  });

export const getOrders = createServerFn({ method: "GET" })
  .middleware([requireAdminUser])
  .handler(async () => {
    const supabase = createAdminClient();
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const orderIds = orders.map((o: any) => o.id);
    if (orderIds.length === 0) return [];
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    if (itemsError) throw itemsError;

    const itemsByOrder = new Map<string, any[]>();
    for (const item of items || []) {
      const list = itemsByOrder.get(item.order_id) || [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }

    return (orders || []).map((o: any) => ({
      ...o,
      items: itemsByOrder.get(o.id) || [],
    }));
  });

export const getOrdersByEmail = createServerFn({ method: "GET" })
  .validator((data: { email: string }) => data)
  .handler(async (ctx) => {
    // Données personnelles : l'e-mail demandé doit être celui du connecté.
    requireCustomerEmail(ctx.data.email);
    const supabase = createAdminClient();
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_email", ctx.data.email)
      .order("created_at", { ascending: false });
    if (error) throw error;

    const orderIds = orders.map((o: any) => o.id);
    if (orderIds.length === 0) return [];
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds);

    if (itemsError) throw itemsError;

    const itemsByOrder = new Map<string, any[]>();
    for (const item of items || []) {
      const list = itemsByOrder.get(item.order_id) || [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }

    return (orders || []).map((o: any) => ({
      ...o,
      items: itemsByOrder.get(o.id) || [],
    }));
  });

export const getOrderItems = createServerFn({ method: "GET" })
  .middleware([requireAdminUser])
  .validator((data: { orderId: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", ctx.data.orderId);
    if (error) throw error;
    return data;
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireAdminUser])
  .validator((data: { id: string; status: "pending" | "confirmed" | "cancelled" }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status: ctx.data.status })
      .eq("id", ctx.data.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .middleware([requireAdminUser])
  .validator((data: { id: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { error } = await supabase.from("orders").delete().eq("id", ctx.data.id);
    if (error) throw error;
    return { success: true };
  });
