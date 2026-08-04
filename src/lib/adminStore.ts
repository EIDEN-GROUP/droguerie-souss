import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProduct,
  createProduct as createProductFn,
  updateProduct as updateProductFn,
  deleteProduct as deleteProductFn,
  getProductGifts,
  setProductGifts,
} from "@/lib/api/products";
import {
  getOrders,
  getOrdersByEmail,
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
  getSubcategories as getSubcategoriesFn,
  createSubcategory as createSubcategoryFn,
  updateSubcategory as updateSubcategoryFn,
  deleteSubcategory as deleteSubcategoryFn,
} from "@/lib/api/subcategories";
import {
  getDimensions as getDimensionsFn,
  createDimension as createDimensionFn,
  updateDimension as updateDimensionFn,
  deleteDimension as deleteDimensionFn,
} from "@/lib/api/dimensions";
import {
  getContactMessages as getContactMessagesFn,
  deleteContactMessage as deleteContactMessageFn,
} from "@/lib/api/contact";
import { setProductVariants as setProductVariantsFn } from "@/lib/api/products";
import type { DbProductGift, ProductInput } from "./database.types";

function mapDbProduct(p: any) {
  return {
    ...p,
    price_mode: p.price_mode || "fixed",
    subcategory: p.subcategory || undefined,
    image: p.image_url || p.image || "",
    images: (p.images_urls || p.images || []).filter(Boolean),
    variants: p.variants || [],
  };
}

export const queryKeys = {
  products: ["products"] as const,
  product: (id: string) => ["products", id] as const,
  productVariants: (id: string) => ["products", id, "dimensions"] as const,
  orders: ["orders"] as const,
  orderItems: (orderId: string) => ["orders", orderId, "items"] as const,
  categories: ["categories"] as const,
  subcategories: ["subcategories"] as const,
  dimensions: ["dimensions"] as const,
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
    mutationFn: (data: { name: string; slug: string; description: string; image_url?: string | null }) =>
      createCategoryFn({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}

/** Renaming a category cascades onto its subcategories, so refresh both lists. */
export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      patch,
    }: {
      name: string;
      patch: { name?: string; slug?: string; description?: string; image_url?: string | null };
    }) => updateCategoryFn({ data: { name, patch } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.categories });
      qc.invalidateQueries({ queryKey: queryKeys.subcategories });
    },
  });
}

/** Deleting a category cascades onto its subcategories, so refresh both lists. */
export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => deleteCategoryFn({ data: { name } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.categories });
      qc.invalidateQueries({ queryKey: queryKeys.subcategories });
    },
  });
}

export function useSubcategories() {
  return useQuery({
    queryKey: queryKeys.subcategories,
    queryFn: () => getSubcategoriesFn(),
  });
}

export function useCreateSubcategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; slug: string; description: string; category: string }) =>
      createSubcategoryFn({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.subcategories }),
  });
}

export function useUpdateSubcategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: { name?: string; slug?: string; description?: string; category?: string };
    }) => updateSubcategoryFn({ data: { id, patch } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.subcategories }),
  });
}

export function useDeleteSubcategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSubcategoryFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.subcategories }),
  });
}

export function useDimensions() {
  return useQuery({
    queryKey: queryKeys.dimensions,
    queryFn: () => getDimensionsFn(),
  });
}

export function useCreateDimension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { value: string }) => createDimensionFn({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.dimensions }),
  });
}

/** Un renommage change la valeur portée par les produits : on rafraîchit les deux. */
export function useUpdateDimension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value }: { id: string; value: string }) => updateDimensionFn({ data: { id, value } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.dimensions });
      qc.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

/** Une suppression nettoie les variantes et la dimension des produits : on rafraîchit. */
export function useDeleteDimension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDimensionFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.dimensions });
      qc.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
}

export function useSetProductVariants() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ product_id, variants }: { product_id: string; variants: { dimension: string; stock: number }[] }) =>
      setProductVariantsFn({ data: { product_id, variants } }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.productVariants(vars.product_id) });
      qc.invalidateQueries({ queryKey: queryKeys.product(vars.product_id) });
      qc.invalidateQueries({ queryKey: queryKeys.products });
    },
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

/* ── Gifts ── */

export function useProductGifts(productId: string) {
  return useQuery({
    queryKey: ["productGifts", productId],
    queryFn: () => getProductGifts({ data: { product_id: productId } }),
    enabled: !!productId,
  });
}

export function useSetProductGifts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ product_id, gifts }: { product_id: string; gifts: Omit<DbProductGift, "id" | "product_id">[] }) =>
      setProductGifts({ data: { product_id, gifts } }),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["productGifts", vars.product_id] }),
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
        type: o.type || "order",
        createdAt: o.created_at,
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
          dimension: i.product_dimension || "",
        })),
      }));
    },
  });
}

export function useCustomerOrders(email: string) {
  return useQuery({
    queryKey: ["orders", "customer", email],
    queryFn: () => getOrdersByEmail({ data: { email } }),
    enabled: !!email,
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
