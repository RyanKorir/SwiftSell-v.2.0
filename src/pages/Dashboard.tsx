import { useQuery } from '@tanstack/react-query';
import { firestoreApi } from '../lib/firestore.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  ArrowRight,
  Plus,
  AlertTriangle,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  setActiveTab: (tab: any) => void;
}

export default function Dashboard({ setActiveTab }: DashboardProps) {
  const { userStats } = useAuth();
  
  const { data: products } = useQuery({ 
    queryKey: ['products'], 
    queryFn: () => firestoreApi.getProducts() 
  });
  
  const { data: orders } = useQuery({ 
    queryKey: ['orders'], 
    queryFn: () => firestoreApi.getOrders() 
  });

  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => firestoreApi.getExpenses()
  });

  const lowStockProducts = (products as any[])?.filter(p => p.stock <= (p.lowStockThreshold || 5)) || [];
  const pendingOrders = (orders as any[])?.filter(o => o.status === 'pending') || [];
  const deliveredOrders = (orders as any[])?.filter(o => o.status === 'delivered') || [];

  const revenue = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const profit = deliveredOrders.reduce((sum, o) => sum + (o.profit || 0), 0);

  const statsCards = [
    { label: 'Revenue', value: `Ksh ${revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10' },
    { label: 'Profit', value: `Ksh ${profit.toLocaleString()}`, icon: Award, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
    { label: 'Active Orders', value: pendingOrders.length, icon: ShoppingCart, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
    { label: 'Daily Streak', value: `${userStats?.currentStreak || 0} Days`, icon: Award, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">Here's what's happening today.</p>
        </div>
        <button 
          onClick={() => setActiveTab('orders')}
          className="flex items-center space-x-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-brand-primary/20"
        >
          <Plus size={18} />
          <span className="font-semibold">New Order</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex flex-col justify-between"
          >
            <div className={`p-2 rounded-lg w-fit ${card.bg} ${card.color} mb-4`}>
              <card.icon size={20} />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">{card.label}</p>
              <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h2 className="font-bold flex items-center space-x-2">
                <AlertTriangle className="text-brand-accent" size={18} />
                <span>Action Required</span>
              </h2>
              {lowStockProducts.length > 0 && (
                <span className="bg-brand-danger/20 text-brand-danger text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Critical</span>
              )}
            </div>
            <div className="p-4 space-y-3">
              {lowStockProducts.length === 0 && pendingOrders.length === 0 && (
                <p className="text-center py-6 text-slate-500 italic text-sm">All caught up! 🎉</p>
              )}
              
              {lowStockProducts.slice(0, 3).map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                   <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-brand-danger font-semibold">{product.stock} left in stock</p>
                   </div>
                   <button onClick={() => setActiveTab('inventory')} className="text-slate-400 hover:text-white p-1">
                      <ArrowRight size={16} />
                   </button>
                </div>
              ))}

              {pendingOrders.slice(0, 3).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                   <div>
                    <p className="text-sm font-medium">Order #{order.id.slice(-4)}</p>
                    <p className="text-xs text-brand-accent font-semibold">Ksh {order.totalAmount.toLocaleString()}</p>
                   </div>
                   <button onClick={() => setActiveTab('orders')} className="text-slate-400 hover:text-white p-1">
                      <ArrowRight size={16} />
                   </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-brand-primary/20 to-transparent">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Next Milestone</h3>
                <Award className="text-brand-primary" />
             </div>
             <p className="text-sm text-slate-300 mb-4">You're {100 - ((userStats?.xp || 0) % 100)} XP away from reaching Level { (userStats?.level || 1) + 1 }! 🚀</p>
             <div className="h-1.5 w-full bg-white/10 rounded-full mb-2">
                <motion.div 
                  className="h-full bg-brand-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(userStats?.xp || 0) % 100}%` }}
                />
             </div>
             <p className="text-[10px] text-slate-500 uppercase tracking-widest text-right font-bold">{(userStats?.xp || 0) % 100}/100 XP</p>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-6">
           <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold text-lg">Sales Activity</h2>
              <select className="bg-white/5 text-xs rounded-lg border border-white/10 px-2 py-1 outline-none focus:ring-1 focus:ring-brand-primary">
                 <option>Last 7 Days</option>
                 <option>Last 30 Days</option>
              </select>
           </div>
           
           <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { day: 'Mon', sales: 400 },
                  { day: 'Tue', sales: 300 },
                  { day: 'Wed', sales: 600 },
                  { day: 'Thu', sales: 800 },
                  { day: 'Fri', sales: 500 },
                  { day: 'Sat', sales: 900 },
                  { day: 'Sun', sales: 750 },
                ]}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#8b5cf6' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}
