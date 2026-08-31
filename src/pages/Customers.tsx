import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataApi as firestoreApi } from '../lib/database.ts';
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  User, 
  MessageSquare,
  History,
  Edit2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function Customers() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({ 
    queryKey: ['customers'], 
    queryFn: () => firestoreApi.getCustomers() 
  });

  const createCustomerMutation = useMutation({
    mutationFn: (newCustomer: any) => firestoreApi.addCustomer({ ...newCustomer, totalSpent: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsFormOpen(false);
    }
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => firestoreApi.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsFormOpen(false);
      setEditingCustomer(null);
    }
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: (id: string) => firestoreApi.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const filteredCustomers = (customers as any[])?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-slate-400">Manage relationships and history.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCustomer(null);
            setIsFormOpen(true);
          }}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-primary transition-all"
          />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 text-sm">
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Total Spent</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading customers...</td>
                </tr>
              )}
              {filteredCustomers?.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-white/5">
                          <User size={20} />
                       </div>
                       <div>
                          <p className="font-bold">{c.name}</p>
                          {c.totalSpent > 1000 && (
                            <span className="inline-flex items-center text-[10px] bg-brand-accent/20 text-brand-accent px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                Vip Customer
                            </span>
                          )}
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                       {c.phone && (
                         <div className="flex items-center space-x-2 text-xs text-slate-400">
                            <Phone size={12} />
                            <span>{c.phone}</span>
                         </div>
                       )}
                       {c.email && (
                         <div className="flex items-center space-x-2 text-xs text-slate-400">
                            <Mail size={12} />
                            <span>{c.email}</span>
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {c.createdAt ? format(new Date(c.createdAt instanceof Object ? c.createdAt.toDate() : c.createdAt), 'MMM dd, yyyy') : 'Recently Added'}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-brand-secondary">
                    Ksh {(c.totalSpent || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(c)}
                          className="p-2 text-slate-400 hover:text-white" 
                          title="Edit"
                        >
                           <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this customer?')) {
                              deleteCustomerMutation.mutate(c.id);
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-brand-danger" 
                          title="Delete"
                        >
                           <Trash2 size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-white" title="History">
                           <History size={16} />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
              {filteredCustomers?.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
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
               initial={{ opacity: 0, y: 120 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 120 }}
               transition={{ type: 'spring', damping: 28, stiffness: 300 }}
               className="fixed inset-x-0 bottom-0 sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-sm max-h-[88vh] sm:max-h-none overflow-y-auto p-6 glass-card rounded-b-none rounded-t-2xl sm:rounded-2xl z-[101]"
            >
               <div className="sm:hidden mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/20" />
               <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                 <User className="text-brand-primary" />
                 <span>{editingCustomer ? 'Edit Customer' : 'New Customer'}</span>
               </h2>
               
               <form onSubmit={(e) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 const data = {
                   name: formData.get('name'),
                   phone: formData.get('phone'),
                   email: formData.get('email'),
                   notes: formData.get('notes'),
                 };

                 if (editingCustomer) {
                   updateCustomerMutation.mutate({ id: editingCustomer.id, data });
                 } else {
                   createCustomerMutation.mutate(data);
                 }
               }} className="space-y-4">
                 <div>
                   <label className="block text-sm text-slate-400 mb-1">Full Name</label>
                   <input type="text" name="name" defaultValue={editingCustomer?.name} required placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-brand-primary" />
                 </div>

                 <div>
                   <label className="block text-sm text-slate-400 mb-1">Phone Number</label>
                   <input type="tel" name="phone" defaultValue={editingCustomer?.phone} placeholder="+1 (555) 000-0000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-brand-primary" />
                 </div>

                 <div>
                   <label className="block text-sm text-slate-400 mb-1">Email Address</label>
                   <input type="email" name="email" defaultValue={editingCustomer?.email} placeholder="john@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-brand-primary" />
                 </div>

                 <div>
                    <label className="block text-sm text-slate-400 mb-1">Internal Notes</label>
                    <textarea name="notes" defaultValue={editingCustomer?.notes} placeholder="Preferences, address, etc." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white h-24 resize-none outline-none focus:ring-2 focus:ring-brand-primary" />
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
                      disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                      className="flex-1 py-3 rounded-xl bg-brand-primary text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-brand-primary/20"
                    >
                      {createCustomerMutation.isPending || updateCustomerMutation.isPending ? 'Saving...' : 'Save Customer'}
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
