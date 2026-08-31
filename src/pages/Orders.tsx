import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataApi as firestoreApi } from '../lib/database.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Package,
  ArrowRight,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function Orders({ fabTrigger }: { fabTrigger?: number } = {}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();
  const { userStats } = useAuth();

  const { data: orders, isLoading } = useQuery({ 
    queryKey: ['orders'], 
    queryFn: () => firestoreApi.getOrders() 
  });

  const { data: products } = useQuery({ 
    queryKey: ['products'], 
    queryFn: () => firestoreApi.getProducts() 
  });

  const { data: customers } = useQuery({ 
    queryKey: ['customers'], 
    queryFn: () => firestoreApi.getCustomers() 
  });

  const createOrderMutation = useMutation({
    mutationFn: async ({ customerId, items, notes }: any) => {
      let totalAmount = 0;
      let totalProfit = 0;
      const orderItems = [];

      for (const item of items) {
        const product = (products as any[]).find(p => p.id === item.productId);
        if (!product) continue;

        const itemTotal = product.price * item.quantity;
        const itemProfit = (product.price - product.cost) * item.quantity;
        
        totalAmount += itemTotal;
        totalProfit += itemProfit;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          priceAtPurchase: product.price,
          costAtPurchase: product.cost
        });

        // Deduct stock
        await firestoreApi.updateProduct(product.id, { stock: Math.max(0, product.stock - item.quantity) });
      }

      const order = await firestoreApi.addOrder({
        customerId,
        notes,
        totalAmount,
        profit: totalProfit,
        status: 'pending'
      }, orderItems);

      // Add XP
      const currentXP = (userStats?.xp || 0) + 10;
      const currentLevel = Math.floor(currentXP / 100) + 1;
      await firestoreApi.updateXP(currentXP, currentLevel);

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsFormOpen(false);
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => firestoreApi.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsFormOpen(false);
      setEditingOrder(null);
    }
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (order: any) => {
      // Get items to restock
      const items = await firestoreApi.getOrderItems(order.id);
      if (items) {
        for (const item of items as any[]) {
          const product = (products as any[]).find(p => p.id === item.productId);
          if (product) {
            await firestoreApi.updateProduct(product.id, { stock: product.stock + item.quantity });
          }
        }
      }
      await firestoreApi.updateOrderStatus(order.id, 'cancelled');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id: string) => firestoreApi.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await firestoreApi.updateOrderStatus(id, status);
      if (status === 'delivered') {
        const currentXP = (userStats?.xp || 0) + 20;
        const currentLevel = Math.floor(currentXP / 100) + 1;
        await firestoreApi.updateXP(currentXP, currentLevel);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (fabTrigger) {
      setEditingOrder(null);
      setIsFormOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabTrigger]);

  const filteredOrders = (orders as any[])?.filter(o => 
    o.id.toString().includes(search) || 
    (o.notes && o.notes.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} className="text-brand-accent" />;
      case 'delivered': return <CheckCircle2 size={16} className="text-brand-secondary" />;
      case 'cancelled': return <XCircle size={16} className="text-brand-danger" />;
      default: return <Package size={16} className="text-slate-400" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-brand-accent/10 text-brand-accent border-brand-accent/20';
      case 'delivered': return 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20';
      case 'cancelled': return 'bg-brand-danger/10 text-brand-danger border-brand-danger/20';
      default: return 'bg-slate-500/10 text-slate-400 border-white/5';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-slate-400">Manage sales and fulfillment.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>New Order</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-primary transition-all"
          />
        </div>
        <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors">
          <Filter size={20} />
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 text-sm">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Total (Ksh)</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading orders...</td>
                </tr>
              )}
              {filteredOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-medium">#{order.id}</td>
                  <td className="px-6 py-4 text-slate-300">
                    {(customers as any[])?.find(c => c.id === order.customerId)?.name || 'Walk-in Customer'}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {format(new Date(order.createdAt), 'MMM dd, HH:mm')}
                  </td>
                  <td className="px-6 py-4 font-bold text-brand-secondary">Ksh {order.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusClass(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {order.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'delivered' })}
                            className="p-1.5 rounded-lg bg-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary/30"
                            title="Complete"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Cancel this order? Stock will be returned.')) {
                                cancelOrderMutation.mutate(order);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-brand-danger/20 text-brand-danger hover:bg-brand-danger/30"
                            title="Cancel"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleEdit(order)}
                        className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                        title="Edit Details"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Delete order record permanently?')) {
                            deleteOrderMutation.mutate(order.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-brand-danger"
                        title="Delete Permanently"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsFormOpen(false)}
               className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
               initial={{ opacity: 0, y: 120 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 120 }}
               transition={{ type: 'spring', damping: 28, stiffness: 300 }}
               className="fixed inset-x-0 bottom-0 sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-lg max-h-[88vh] sm:max-h-none overflow-y-auto p-6 glass-card rounded-b-none rounded-t-2xl sm:rounded-2xl z-[101]"
            >
               <div className="sm:hidden mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/20" />
               <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                 <Package className="text-brand-primary" />
                 <span>{editingOrder ? 'Edit Order Details' : 'New Order'}</span>
               </h2>
               
               <form onSubmit={(e) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 
                 if (editingOrder) {
                   updateOrderMutation.mutate({
                     id: editingOrder.id,
                     data: {
                       customerId: formData.get('customerId') || null,
                       notes: formData.get('notes')
                     }
                   });
                   return;
                 }

                 const productId = formData.get('productId') as string;
                 const quantity = parseInt(formData.get('quantity') as string);
                 const customerId = formData.get('customerId') || null;
                 
                 createOrderMutation.mutate({
                   customerId,
                   items: [{ productId, quantity }],
                   notes: formData.get('notes')
                 });
               }} className="space-y-4">
                 <div>
                   <label className="block text-sm text-slate-400 mb-1">Customer (Optional)</label>
                   <select name="customerId" defaultValue={editingOrder?.customerId || ""} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white">
                      <option value="">Walk-in Customer</option>
                      {(customers as any[])?.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                   </select>
                 </div>

                 {!editingOrder && (
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm text-slate-400 mb-1">Product</label>
                       <select name="productId" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white">
                          <option value="">Select Product</option>
                          {(products as any[])?.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Ksh {p.price})</option>
                          ))}
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm text-slate-400 mb-1">Quantity</label>
                       <input type="number" min="1" defaultValue="1" name="quantity" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
                     </div>
                   </div>
                 )}

                 <div>
                    <label className="block text-sm text-slate-400 mb-1 font-bold italic">
                      {editingOrder ? 'Edit Order Notes' : 'Order Notes'}
                    </label>
                    <textarea name="notes" defaultValue={editingOrder?.notes} placeholder="Any special requests?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white h-24 resize-none" />
                 </div>

                 {editingOrder && (
                    <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-400">
                      <p>Note: Products and quantities cannot be edited for existing orders to maintain inventory integrity. If you need to change items, cancel the order and create a new one.</p>
                    </div>
                 )}

                 <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingOrder(null);
                      }}
                      className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={createOrderMutation.isPending || updateOrderMutation.isPending}
                      className="flex-1 py-3 rounded-xl bg-brand-primary text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-brand-primary/20"
                    >
                      {createOrderMutation.isPending || updateOrderMutation.isPending ? 'Processing...' : (
                        <>
                          <CheckCircle2 size={18} />
                          <span>{editingOrder ? 'Update Order' : 'Create Order'}</span>
                        </>
                      )}
                    </button>
                 </div>
               </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
