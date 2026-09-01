import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataApi as firestoreApi } from '../lib/database.ts';
import { exportToCSV, parseCSVFile } from '../lib/csv.ts';
import { 
  Plus, 
  Search, 
  Edit2, 
  Package, 
  Tag, 
  DollarSign, 
  AlertCircle,
  Download,
  Upload,
  RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Inventory() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({ 
    queryKey: ['products'], 
    queryFn: () => firestoreApi.getProducts() 
  });

  const createProductMutation = useMutation({
    mutationFn: (newProduct: any) => firestoreApi.addProduct({ ...newProduct, isActive: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsFormOpen(false);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => firestoreApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsFormOpen(false);
      setEditingProduct(null);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => firestoreApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleExport = () => {
    const rows = ((products as any[]) || []).map((p) => ({
      name: p.name,
      sku: p.sku ?? '',
      cost: p.cost,
      price: p.price,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold
    }));
    exportToCSV(`swiftsell-inventory-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsImporting(true);
    setImportSummary(null);

    try {
      const { rows, errors } = await parseCSVFile(file);
      let created = 0;
      let skipped = 0;

      for (const row of rows) {
        const name = row.name?.trim();
        const cost = parseFloat(row.cost);
        const price = parseFloat(row.price);
        const stock = parseInt(row.stock, 10);

        if (!name || isNaN(cost) || isNaN(price) || isNaN(stock)) {
          skipped++;
          continue;
        }

        await firestoreApi.addProduct({
          name,
          sku: row.sku?.trim() || null,
          cost,
          price,
          stock,
          lowStockThreshold: row.lowstockthreshold ? parseInt(row.lowstockthreshold, 10) : 5,
          isActive: true
        });
        created++;
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      setImportSummary(
        `Imported ${created} product${created !== 1 ? 's' : ''}` +
        (skipped > 0 ? `, skipped ${skipped} row${skipped !== 1 ? 's' : ''} (missing/invalid name, cost, price, or stock)` : '') +
        (errors.length > 0 ? `. ${errors.length} parse warning(s).` : '.')
      );
    } catch (err) {
      setImportSummary(err instanceof Error ? `Import failed: ${err.message}` : 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  const filteredProducts = (products as any[])?.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Inventory</h1>
          <p className="text-slate-400">Track stock levels and pricing.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleImportFile}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="btn-glow bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 px-4 py-2.5 rounded-xl font-semibold flex items-center space-x-2 active:scale-95 disabled:opacity-50"
            title="Import products from CSV (columns: name, sku, cost, price, stock, lowStockThreshold)"
          >
            {isImporting ? <RefreshCcw className="animate-spin" size={18} /> : <Upload size={18} />}
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleExport}
            className="btn-glow bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 px-4 py-2.5 rounded-xl font-semibold flex items-center space-x-2 active:scale-95"
          >
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="btn-glow bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 shadow-lg shadow-brand-primary/20 active:scale-95"
          >
            <Plus size={20} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {importSummary && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 flex items-start gap-3 text-sm"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-brand-accent" />
          <span className="text-slate-300">{importSummary}</span>
        </motion.div>
      )}

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-primary transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading && Array(6).fill(0).map((_, i) => (
          <div key={i} className="glass-card p-6 h-48 animate-pulse bg-white/5" />
        ))}
        {filteredProducts?.map((p) => (
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key={p.id} 
            className="glass-card group overflow-hidden"
          >
             <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                      {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover rounded-xl" /> : <Package size={24} />}
                   </div>
                   <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(p)}
                        className="p-2 text-slate-500 hover:text-white transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this product?')) {
                            deleteProductMutation.mutate(p.id);
                          }
                        }}
                        className="p-2 text-slate-500 hover:text-brand-danger transition-colors"
                      >
                        <AlertCircle size={16} />
                      </button>
                   </div>
                </div>

                <h3 className="text-lg font-bold truncate">{p.name}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">{p.sku || 'No SKU'}</p>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Stock</p>
                      <div className="flex items-center space-x-2">
                         <span className={`text-xl font-bold ${p.stock <= p.lowStockThreshold ? 'text-brand-danger' : 'text-white'}`}>
                           {p.stock}
                         </span>
                         {p.stock <= p.lowStockThreshold && (
                           <AlertCircle size={14} className="text-brand-danger" />
                         )}
                      </div>
                   </div>
                   <div className="space-y-1 text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Price</p>
                      <p className="text-xl font-bold text-brand-secondary">Ksh {p.price.toLocaleString()}</p>
                   </div>
                </div>
             </div>
             
             <div className="px-6 py-3 bg-white/5 flex justify-between items-center text-xs">
                <span className="text-slate-500">Cost: <span className="text-slate-300 font-medium">Ksh {p.cost.toLocaleString()}</span></span>
                <span className="text-brand-secondary/80 font-bold">Margin: {(((p.price - p.cost) / p.price) * 100).toFixed(0)}%</span>
             </div>
          </motion.div>
        ))}
        {filteredProducts?.length === 0 && !isLoading && (
          <div className="col-span-full py-20 glass-card text-center flex flex-col items-center">
             <Package size={48} className="text-slate-700 mb-4" />
             <h3 className="text-xl font-bold text-slate-500">No products found</h3>
             <p className="text-slate-600 mt-2">Start by adding your first product to the inventory.</p>
          </div>
        )}
      </div>

      {/* New Product Modal */}
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
                 <Tag className="text-brand-primary" />
                 <span>{editingProduct ? 'Edit Product' : 'Add Product'}</span>
               </h2>
               
               <form onSubmit={(e) => {
                 e.preventDefault();
                 const formData = new FormData(e.currentTarget);
                 const data = {
                   name: formData.get('name'),
                   sku: formData.get('sku'),
                   cost: parseFloat(formData.get('cost') as string),
                   price: parseFloat(formData.get('price') as string),
                   stock: parseInt(formData.get('stock') as string),
                   lowStockThreshold: parseInt(formData.get('lowStockThreshold') as string),
                 };

                 if (editingProduct) {
                   updateProductMutation.mutate({ id: editingProduct.id, data });
                 } else {
                   createProductMutation.mutate(data);
                 }
               }} className="space-y-4">
                 <div>
                   <label className="block text-sm text-slate-400 mb-1">Product Name</label>
                   <input type="text" name="name" defaultValue={editingProduct?.name} required placeholder="Ex: Signature Hoodie" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm text-slate-400 mb-1">SKU</label>
                     <input type="text" name="sku" defaultValue={editingProduct?.sku} placeholder="SH-001" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
                   </div>
                   <div>
                     <label className="block text-sm text-slate-400 mb-1">Stock Level</label>
                     <input type="number" name="stock" defaultValue={editingProduct?.stock ?? "0"} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm text-slate-400 mb-1 font-bold flex items-center space-x-1">
                        <DollarSign size={14} />
                        <span>Unit Cost (Ksh)</span>
                     </label>
                     <input type="number" step="1" name="cost" defaultValue={editingProduct?.cost} required placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
                   </div>
                   <div>
                     <label className="block text-sm text-slate-400 mb-1 font-bold flex items-center space-x-1">
                        <DollarSign size={14} />
                        <span>Retail Price (Ksh)</span>
                     </label>
                     <input type="number" step="1" name="price" defaultValue={editingProduct?.price} required placeholder="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
                   </div>
                 </div>

                 <div>
                    <label className="block text-sm text-slate-400 mb-1">Low Stock Warning Threshold</label>
                    <input type="number" name="lowStockThreshold" defaultValue={editingProduct?.lowStockThreshold ?? "5"} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
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
                      disabled={createProductMutation.isPending || updateProductMutation.isPending}
                      className="flex-1 py-3 rounded-xl bg-brand-primary text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-brand-primary/20"
                    >
                      {createProductMutation.isPending || updateProductMutation.isPending ? 'Saving...' : 'Save Product'}
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
