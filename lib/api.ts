// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE!

export type DishType = "Prato" | "Porcao"

export interface Product {
  id: string
  name: string
  category: string
  prepSeconds: number
  available: boolean
  tags: string[]
  isRecurring: boolean
  type: DishType
}

export type OrderItem = {
  productId: string
  productName: string
  quantity: number
  prepSeconds: number
}

export type Order = {
  id: string
  createdAt: string
  status: "Pending" | "InProgress" | "Completed" | "Cancelled"
  isUrgent: boolean
  items: OrderItem[]
}

// --------------------------------------
// helpers
// --------------------------------------
function buildQuery(obj: Record<string, any>) {
  const u = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v)) {
      if (v.length === 0) continue
      u.set(k, v.join(","))
    } else {
      u.set(k, String(v))
    }
  }
  return u.toString()
}

// --------------------------------------
// PRODUCTS
// --------------------------------------
// Correspondente ao GET /api/products com filtros do backend
export async function listProducts(params?: {
  q?: string
  categories?: string[]          // mapeadas para ?cat=Cat1,Cat2
  onlyAvailable?: boolean        // default no back = true (se quiser TODOS, passe false)
  recurring?: boolean
  portion?: boolean              // atalho para type=Porcao no back
  type?: DishType                // "Prato" | "Porcao"
  sort?: "az" | "sold" | "fast"
  take?: number
}): Promise<Product[]> {
  const query: Record<string, any> = {}

  if (params?.q) query.q = params.q
  if (params?.categories?.length) query.cat = params.categories.join(",")
  if (params?.onlyAvailable === false) query.onlyAvailable = false
  if (params?.recurring !== undefined) query.recurring = params.recurring
  if (params?.portion !== undefined) query.portion = params.portion
  if (params?.type) query.type = params.type
  if (params?.sort) query.sort = params.sort
  if (params?.take) query.take = params.take

  const url =
    Object.keys(query).length === 0
      ? `${API_BASE}/api/products`
      : `${API_BASE}/api/products?${buildQuery(query)}`

  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch products")
  return res.json()
}

export async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products/${id}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch product")
  return res.json()
}

// GET /api/products/categories -> [{ name, count }]
export async function listCategories(): Promise<{ name: string; count: number }[]> {
  const res = await fetch(`${API_BASE}/api/products/categories`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error("Failed to fetch categories")
  return res.json()
}

// --------------------------------------
// API agrupada (mantive o objeto `api` mas agora com params)
// --------------------------------------
export const api = {
  // PRODUCTS
  listProducts: (params?: Parameters<typeof listProducts>[0]) => listProducts(params),
  getProduct,
  createProduct: async (p: Omit<Product, "id">): Promise<Product> => {
    const r = await fetch(`${API_BASE}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    })
    if (!r.ok) throw new Error("Falha ao criar produto")
    return r.json()
  },
  updateProduct: async (id: string, p: Omit<Product, "id">) => {
    const r = await fetch(`${API_BASE}/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    })
    if (!r.ok) throw new Error("Falha ao atualizar produto")
  },
  deleteProduct: async (id: string) => {
    const r = await fetch(`${API_BASE}/api/products/${id}`, { method: "DELETE" })
    if (!r.ok) throw new Error("Falha ao excluir produto")
  },

  // CATEGORIES
  listCategories,

  // ORDERS
  listOrders: async (): Promise<Order[]> => {
    const r = await fetch(`${API_BASE}/api/orders`, { cache: "no-store" })
    if (!r.ok) throw new Error("Falha ao listar pedidos")
    return r.json()
  },
  createOrder: async (
    items: { productId: string; quantity: number }[],
    opts?: { urgent?: boolean }
  ): Promise<Order> => {
    const r = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, isUrgent: !!opts?.urgent }),
    })
    if (!r.ok) throw new Error("Falha ao criar pedido")
    return r.json()
  },
  updateOrderStatus: async (id: string, status: Order["status"]) => {
    const r = await fetch(`${API_BASE}/api/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!r.ok) throw new Error("Falha ao atualizar status")
  },
}
