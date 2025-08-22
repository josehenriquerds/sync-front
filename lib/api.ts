const API_BASE = process.env.NEXT_PUBLIC_API_BASE!

export type Product = { id: string; name: string; category: string; prepSeconds: number; available: boolean }
export type OrderItem = { productId: string; productName: string; quantity: number; prepSeconds: number }
export type Order = { id: string; createdAt: string; status: 'Pending'|'InProgress'|'Completed'|'Cancelled'; isUrgent: boolean; items: OrderItem[] }

export const api = {
  // PRODUCTS
  listProducts: async (): Promise<Product[]> => {
    const r = await fetch(`${API_BASE}/api/products`, { cache: 'no-store' });
    return r.json();
  },
  createProduct: async (p: Omit<Product,'id'>): Promise<Product> => {
    const r = await fetch(`${API_BASE}/api/products`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(p) });
    if (!r.ok) throw new Error('Falha ao criar produto');
    return r.json();
  },
  updateProduct: async (id: string, p: Omit<Product,'id'>) => {
    const r = await fetch(`${API_BASE}/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(p) });
    if (!r.ok) throw new Error('Falha ao atualizar produto');
  },
  deleteProduct: async (id: string) => {
    const r = await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error('Falha ao excluir produto');
  },

  // ORDERS
  listOrders: async (): Promise<Order[]> => {
    const r = await fetch(`${API_BASE}/api/orders`, { cache: 'no-store' });
    return r.json();
  },
  createOrder: async (items: { productId: string; quantity: number }[],opts?: { urgent?: boolean }  ): Promise<Order> => {
    const r = await fetch(`${API_BASE}/api/orders`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ items, isUrgent: !!opts?.urgent }), });
    if (!r.ok) throw new Error('Falha ao criar pedido');
    return r.json();
  },
  updateOrderStatus: async (id: string, status: Order['status']) => {
    const r = await fetch(`${API_BASE}/api/orders/${id}/status`, { method: 'PATCH', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ status }) });
    if (!r.ok) throw new Error('Falha ao atualizar status');
  },
}
