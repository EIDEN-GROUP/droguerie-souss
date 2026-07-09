import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProduct,
  createProduct as createProductFn,
  updateProduct as updateProductFn,
  deleteProduct as deleteProductFn,
} from "@/lib/api/products";
import {
  getOrders,
  updateOrderStatus as updateOrderStatusFn,
  deleteOrder as deleteOrderFn,
} from "@/lib/api/orders";
import {
  getCategories as getCategoriesFn,
  createCategory as createCategoryFn,
  updateCategory as updateCategoryFn,
  deleteCategory as deleteCategoryFn,
} from "@/lib/api/categories";
import {
  getContactMessages as getContactMessagesFn,
  deleteContactMessage as deleteContactMessageFn,
} from "@/lib/api/contact";
import type { ProductInput } from "./database.types";

function mapDbProduct(p: any) {
  return {
    ...p,
    image: p.image_url || p.image || "",
    images: (p.images_urls || p.images || []).filter(Boolean),
  };
}

export const queryKeys = {
  products: ["products"] as const,
  product: (id: string) => ["products", id] as const,
  orders: ["orders"] as const,
  orderItems: (orderId: string) => ["orders", orderId, "items"] as const,
  categories: ["categories"] as const,
  contacts: ["contacts"] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: async () => {
      const data = await getProducts();
      return (data || []).map(mapDbProduct);
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: async () => {
      const data = await getProduct({ data: { id } });
      return data ? mapDbProduct(data) : null;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductInput) => createProductFn({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<ProductInput> }) =>
      updateProductFn({ data: { id, patch } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProductFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.products }),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => getCategoriesFn(),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; slug: string; description: string }) => createCategoryFn({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, patch }: { name: string; patch: { name?: string; slug?: string; description?: string } }) =>
      updateCategoryFn({ data: { name, patch } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => deleteCategoryFn({ data: { name } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}

export function useContactMessages() {
  return useQuery({
    queryKey: queryKeys.contacts,
    queryFn: () => getContactMessagesFn(),
  });
}

export function useDeleteContactMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContactMessageFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.contacts }),
  });
}

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: async () => {
      const data = await getOrders();
      const itemsMap = new Map<string, any[]>();
      for (const order of data || []) {
        itemsMap.set(order.id, order.items || []);
      }
      return (data || []).map((o: any) => ({
        ...o,
        customer: {
          name: o.customer_name,
          phone: o.customer_phone,
          email: o.customer_email,
          city: o.customer_city,
          address: o.customer_address,
        },
        payment: o.payment_method,
        items: (o.items || []).map((i: any) => ({
          productId: i.product_id,
          name: i.product_name,
          image: i.product_image || "",
          price: i.price,
          qty: i.qty,
        })),
      }));
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "pending" | "confirmed" | "cancelled" }) =>
      updateOrderStatusFn({ data: { id, status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders }),
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOrderFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders }),
  });
}
