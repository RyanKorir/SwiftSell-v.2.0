import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firestoreApi } from '../lib/firestore.ts';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart as PieChartIcon,
  DollarSign,
  Edit2,
  Trash2,
  Table
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { format } from 'date-fns';

export default function Finances() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: orders } = useQuery({ 
    queryKey: ['orders'], 
    queryFn: () => firestoreApi.getOrders() 
  });

  const { data: expenses, isLoading: isLoadingExpenses } = useQuery({ 
    queryKey: ['expenses'], 
    queryFn: () => firestoreApi.getExpenses() 
  });

  const deliveredOrders = (orders as any[])?.filter(o => o.status === 'delivered') || [];
  const revenue = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const profit = deliveredOrders.reduce((sum, o) => sum + (o.profit || 0), 0);
  const expenseTotal = (expenses as any[])?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  const net = profit - expenseTotal;

  const finances = { revenue, profit, expenses: expenseTotal, net };

  const createExpenseMutation = useMutation({
    mutationFn: (newExpense: any) => firestoreApi.addExpense(newExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsFormOpen(false);
    }
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => firestoreApi.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsFormOpen(false);
      setEditingExpense(null);
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => firestoreApi.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    }
  });

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const summary = [
    { label: 'Total Revenue', value: finances.revenue, icon: TrendingUp, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10' },
    { label: 'Total Profit', value: finances.profit, icon: DollarSign, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
    { label: 'Total Expenses', value: finances.expenses, icon: TrendingDown, color: 'text-brand-danger', bg: 'bg-brand-danger/10' },
    { label: 'Net Balance', value: finances.net, icon: Wallet, color: 'text-white', bg: 'bg-white/10' },
  ];

  const pieData = [
    { name: 'Net Profit', value: Math.max(0, finances.net), color: '#8b5cf6' },
    { name: 'Expenses', value: finances.expenses, color: '#ef4444' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Finances</h1>
          <p className="text-slate-400">Analysis of your business health.</p>
        </div>
        <button 
          onClick={() => {
            setEditingExpense(null);
            setIsFormOpen(true);
          }}
          className="bg-brand-danger hover:bg-brand-danger/90 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 shadow-lg shadow-brand-danger/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Log Expense</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 border-l-4 border-l-transparent hover:border-l-brand-primary transition-all group"
          >
            <div className={`p-2 rounded-lg w-fit ${item.bg} ${item.color} mb-4 group-hover:neon-glow transition-all`}>
              <item.icon size={20} />
            </div>
            <p className="text-slate-500 text-sm font-medium">{item.label}</p>
            <h3 className={`text-2xl font-bold mt-1 ${item.label === 'Net Balance' && (finances?.net < 0 ? 'text-brand-danger' : 'text-brand-secondary')}`}>
               Ksh {(item.value || 0).toLocaleString()}
            </h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 glass-card p-6 flex flex-col items-center">
           <h3 className="font-bold mb-6 self-start flex items-center space-x-2">
             <PieChartIcon size={18} className="text-brand-primary" />
             <span>Profit vs Expense</span>
           </h3>
           <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="flex space-x-6 text-xs mt-4">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span className="text-slate-400">{d.name}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="lg:col-span-2 glass-card overflow-hidden">
           <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="font-bold flex items-center space-x-2">
                <Table size={18} className="text-brand-primary" />
                <span>Expense Transactions</span>
              </h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-white/5">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {isLoadingExpenses && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading expenses...</td>
                    </tr>
                  )}
                  {(expenses as any[])?.map((e) => (
                    <tr key={e.id} className="hover:bg-white/[0.02] group transition-colors">
                      <td className="px-6 py-4 text-slate-400">
                        {e.date ? format(new Date(e.date instanceof Object ? e.date.toDate() : e.date), 'MMM dd') : 'Today'}
                      </td>
                      <td className="px-6 py-4 font-bold">{e.category}</td>
                      <td className="px-6 py-4 text-slate-500 truncate max-w-[150px]">{e.description}</td>
                      <td className="px-6 py-4 text-right font-bold text-brand-danger">Ksh {(e.amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEdit(e)}
                              className="p-1.5 text-slate-400 hover:text-white"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this expense?')) {
                                  deleteExpenseMutation.mutate(e.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-brand-danger"
                            >
                              <Trash2 size={14} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {expenses?.length === 0 && !isLoadingExpenses && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No expenses logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>
      </div>

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
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm p-6 glass-card z-[101]"
            >
               <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                 <TrendingDown className="text-brand-danger" />
                 <span>{editingExpense ? 'Edit Expense' : 'Log Expense'}</span>
               </h2>
               
               <form onSubmit={(e) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 const data = {
                   category: formData.get('category'),
                   amount: parseFloat(formData.get('amount') as string),
                   description: formData.get('description'),
                 };

                 if (editingExpense) {
                   updateExpenseMutation.mutate({ id: editingExpense.id, data });
                 } else {
                   createExpenseMutation.mutate({ ...data, date: new Date() });
                 }
               }} className="space-y-4">
                 <div>
                   <label className="block text-sm text-slate-400 mb-1">Category</label>
                   <select name="category" defaultValue={editingExpense?.category} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-brand-primary">
                      <option value="Supplies">Supplies</option>
                      <option value="Shipping">Shipping</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Rent">Rent</option>
                      <option value="Other">Other</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm text-slate-400 mb-1">Amount (Ksh)</label>
                   <input type="number" step="1" name="amount" defaultValue={editingExpense?.amount} required placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-brand-primary" />
                 </div>

                 <div>
                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                    <textarea name="description" defaultValue={editingExpense?.description} placeholder="What was this for?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white h-24 resize-none outline-none focus:ring-2 focus:ring-brand-primary" />
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}
                      className="flex-1 py-3 rounded-xl bg-brand-danger text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-brand-danger/20"
                    >
                      {createExpenseMutation.isPending || updateExpenseMutation.isPending ? 'Saving...' : 'Save Expense'}
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
