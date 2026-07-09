import { createServerFn } from "@tanstack/react-start";
import type { OrderInput } from "@/lib/database.types";
import { createAdminClient, sendEmail } from "./db";
import { orderConfirmationEmail, orderCustomerConfirmation } from "@/lib/email-templates";

export const createOrder = createServerFn({ method: "POST" })
  .validator((data: OrderInput) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();

    const total = ctx.data.items.reduce(
      (sum, i) => sum + i.price * i.qty, 0
    );

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: ctx.data.customer_name,
        customer_phone: ctx.data.customer_phone,
        customer_email: ctx.data.customer_email || null,
        customer_city: ctx.data.customer_city,
        customer_address: ctx.data.customer_address,
        payment_method: ctx.data.payment_method,
        total,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const items = ctx.data.items.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      product_name: i.product_name,
      product_image: i.product_image || null,
      price: i.price,
      qty: i.qty,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(items);

    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    const { error: stockError } = await supabase.rpc("decrement_stock", {
      p_items: ctx.data.items.map((i) => ({
        pid: i.product_id,
        q: i.qty,
      })),
    });

    if (stockError) {
      console.error("stock decrement failed:", stockError);
    }

    sendEmail({
      adminSubject: "Nouvelle commande — Droguerie Souss",
      adminHtml: orderConfirmationEmail({
        id: order.id,
        customer_name: ctx.data.customer_name,
        customer_phone: ctx.data.customer_phone,
        customer_email: ctx.data.customer_email,
        customer_city: ctx.data.customer_city,
        customer_address: ctx.data.customer_address,
        payment_method: ctx.data.payment_method,
        total,
        items: ctx.data.items.map((i) => ({
          product_name: i.product_name,
          qty: i.qty,
          price: i.price,
        })),
      }),
      customerTo: ctx.data.customer_email || undefined,
      customerSubject: ctx.data.customer_email ? "Confirmation de votre demande de devis — Droguerie Souss" : undefined,
      customerHtml: ctx.data.customer_email ? orderCustomerConfirmation({ customer_name: ctx.data.customer_name, total }) : undefined,
    }).catch((err) => console.error("sendEmail (order) failed:", err));

    return { id: order.id, total };
  });

export const getOrders = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createAdminClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const orderIds = orders.map((o: any) => o.id);
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
  .validator((data: { id: string }) => data)
  .handler(async (ctx) => {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", ctx.data.id);
    if (error) throw error;
    return { success: true };
  });
