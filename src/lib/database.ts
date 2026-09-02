import { supabase } from './supabase.ts';

async function currentUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');
  return session.user.id;
}

function handleError(error: unknown, context: string): never {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Supabase error [${context}]:`, message);
  throw new Error(message);
}

// --- Row <-> app-shape mappers (snake_case DB columns -> camelCase, matching the old Firestore shape) ---

function mapProduct(row: any) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    sku: row.sku,
    cost: Number(row.cost),
    price: Number(row.price),
    stock: row.stock,
    lowStockThreshold: row.low_stock_threshold,
    isActive: row.is_active,
    createdAt: row.created_at
  };
}

function mapCustomer(row: any) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    notes: row.notes,
    totalSpent: Number(row.total_spent),
    createdAt: row.created_at
  };
}

function mapOrder(row: any) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    customerId: row.customer_id,
    status: row.status,
    totalAmount: Number(row.total_amount),
    profit: Number(row.profit),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapOrderItem(row: any) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    orderId: row.order_id,
    productId: row.product_id,
    quantity: row.quantity,
    priceAtPurchase: Number(row.price_at_purchase),
    costAtPurchase: Number(row.cost_at_purchase)
  };
}

function mapExpense(row: any) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    category: row.category,
    amount: Number(row.amount),
    description: row.description,
    date: row.created_at
  };
}

export const dataApi = {
  // --- Products ---
  getProducts: async () => {
    try {
      const userId = await currentUserId();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('owner_id', userId)
        .eq('is_active', true);
      if (error) throw error;
      return (data ?? []).map(mapProduct);
    } catch (error) {
      handleError(error, 'getProducts');
    }
  },

  addProduct: async (data: any) => {
    try {
      const userId = await currentUserId();
      const { data: row, error } = await supabase
        .from('products')
        .insert({
          owner_id: userId,
          name: data.name,
          sku: data.sku ?? null,
          cost: data.cost,
          price: data.price,
          stock: data.stock,
          low_stock_threshold: data.lowStockThreshold ?? 5,
          is_active: data.isActive ?? true
        })
        .select()
        .single();
      if (error) throw error;
      return mapProduct(row);
    } catch (error) {
      handleError(error, 'addProduct');
    }
  },

  updateProduct: async (id: string, data: any) => {
    try {
      const patch: Record<string, any> = {};
      if (data.name !== undefined) patch.name = data.name;
      if (data.sku !== undefined) patch.sku = data.sku;
      if (data.cost !== undefined) patch.cost = data.cost;
      if (data.price !== undefined) patch.price = data.price;
      if (data.stock !== undefined) patch.stock = data.stock;
      if (data.lowStockThreshold !== undefined) patch.low_stock_threshold = data.lowStockThreshold;
      if (data.isActive !== undefined) patch.is_active = data.isActive;

      const { error } = await supabase.from('products').update(patch).eq('id', id);
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updateProduct');
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      handleError(error, 'deleteProduct');
    }
  },

  // --- Customers ---
  getCustomers: async () => {
    try {
      const userId = await currentUserId();
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapCustomer);
    } catch (error) {
      handleError(error, 'getCustomers');
    }
  },

  addCustomer: async (data: any) => {
    try {
      const userId = await currentUserId();
      const { data: row, error } = await supabase
        .from('customers')
        .insert({
          owner_id: userId,
          name: data.name,
          phone: data.phone ?? null,
          email: data.email ?? null,
          notes: data.notes ?? null,
          total_spent: data.totalSpent ?? 0
        })
        .select()
        .single();
      if (error) throw error;
      return mapCustomer(row);
    } catch (error) {
      handleError(error, 'addCustomer');
    }
  },

  updateCustomer: async (id: string, data: any) => {
    try {
      const patch: Record<string, any> = {};
      if (data.name !== undefined) patch.name = data.name;
      if (data.phone !== undefined) patch.phone = data.phone;
      if (data.email !== undefined) patch.email = data.email;
      if (data.notes !== undefined) patch.notes = data.notes;
      if (data.totalSpent !== undefined) patch.total_spent = data.totalSpent;

      const { error } = await supabase.from('customers').update(patch).eq('id', id);
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updateCustomer');
    }
  },

  deleteCustomer: async (id: string) => {
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      handleError(error, 'deleteCustomer');
    }
  },

  // --- Orders ---
  getOrders: async () => {
    try {
      const userId = await currentUserId();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapOrder);
    } catch (error) {
      handleError(error, 'getOrders');
    }
  },

  // Atomic, server-side: validates stock (rejects overselling instead of
  // silently clamping to 0), deducts stock, logs the stock_movements
  // ledger entry, and keeps the customer's total_spent in sync — all in
  // one database transaction. See DATA_MODEL.md for why this replaced the
  // old client-side read-then-write approach.
  addOrder: async (orderData: any, items: any[]) => {
    try {
      const { data, error } = await supabase.rpc('create_order_with_items', {
        p_customer_id: orderData.customerId ?? null,
        p_notes: orderData.notes ?? null,
        p_items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity
        }))
      });
      if (error) throw error;
      return mapOrder(data);
    } catch (error) {
      handleError(error, 'addOrder');
    }
  },

  // Atomic, server-side: restores stock from the order's own item ledger
  // (never from a possibly-stale "current stock" read), reverses the
  // customer's total_spent, and blocks double-cancellation or cancelling
  // a delivered order.
  cancelOrder: async (orderId: string) => {
    try {
      const { data, error } = await supabase.rpc('cancel_order', {
        p_order_id: orderId
      });
      if (error) throw error;
      return mapOrder(data);
    } catch (error) {
      handleError(error, 'cancelOrder');
    }
  },

  updateOrderStatus: async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updateOrderStatus');
    }
  },

  updateOrder: async (id: string, data: any) => {
    try {
      const patch: Record<string, any> = { updated_at: new Date().toISOString() };
      if (data.customerId !== undefined) patch.customer_id = data.customerId;
      if (data.notes !== undefined) patch.notes = data.notes;
      if (data.totalAmount !== undefined) patch.total_amount = data.totalAmount;
      if (data.profit !== undefined) patch.profit = data.profit;
      if (data.status !== undefined) patch.status = data.status;

      const { error } = await supabase.from('orders').update(patch).eq('id', id);
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updateOrder');
    }
  },

  deleteOrder: async (id: string) => {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      handleError(error, 'deleteOrder');
    }
  },

  getOrderItems: async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      if (error) throw error;
      return (data ?? []).map(mapOrderItem);
    } catch (error) {
      handleError(error, 'getOrderItems');
    }
  },

  // --- Expenses ---
  getExpenses: async () => {
    try {
      const userId = await currentUserId();
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapExpense);
    } catch (error) {
      handleError(error, 'getExpenses');
    }
  },

  addExpense: async (data: any) => {
    try {
      const userId = await currentUserId();
      const { data: row, error } = await supabase
        .from('expenses')
        .insert({
          owner_id: userId,
          category: data.category,
          amount: data.amount,
          description: data.description ?? null
        })
        .select()
        .single();
      if (error) throw error;
      return mapExpense(row);
    } catch (error) {
      handleError(error, 'addExpense');
    }
  },

  updateExpense: async (id: string, data: any) => {
    try {
      const patch: Record<string, any> = {};
      if (data.category !== undefined) patch.category = data.category;
      if (data.amount !== undefined) patch.amount = data.amount;
      if (data.description !== undefined) patch.description = data.description;

      const { error } = await supabase.from('expenses').update(patch).eq('id', id);
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updateExpense');
    }
  },

  deleteExpense: async (id: string) => {
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      handleError(error, 'deleteExpense');
    }
  },

  // --- Stats ---
  updateDisplayName: async (displayName: string) => {
    try {
      const userId = await currentUserId();
      const trimmed = displayName.trim();
      const { error } = await supabase
        .from('users')
        .update({ display_name: trimmed.length > 0 ? trimmed : null })
        .eq('id', userId);
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updateDisplayName');
    }
  },

  updatePin: async (pin: string) => {
    try {
      const userId = await currentUserId();
      const { error } = await supabase.from('users').update({ pin }).eq('id', userId);
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updatePin');
    }
  },

  updateXP: async (xp: number, level: number) => {
    try {
      const userId = await currentUserId();
      const { error } = await supabase
        .from('users')
        .update({ xp, level, last_active_date: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;
    } catch (error) {
      handleError(error, 'updateXP');
    }
  }
};
