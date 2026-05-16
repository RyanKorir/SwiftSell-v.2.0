import { useState } from 'react';
import { 
  BookOpen, 
  PlayCircle, 
  ChevronRight, 
  ShoppingBag, 
  Users as UsersIcon, 
  BarChart, 
  ShieldCheck,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const tutorials = [
  {
    id: 'intro',
    title: 'Getting Started',
    icon: PlayCircle,
    color: 'text-brand-primary',
    content: [
      'Welcome to SwiftSell! Your all-in-one local business manager.',
      'Access your dashboard to see current revenue and pending tasks.',
      'Use the PIN "0000" to unlock the app for the first time.',
      'Make sure to change your PIN in Settings for security.',
      'Use the "Lock" button in the header or sidebar to secure your app when stepping away.'
    ]
  },
  {
    id: 'orders',
    title: 'Managing Orders',
    icon: ShoppingBag,
    color: 'text-brand-accent',
    content: [
      'Click "New Order" on the Dashboard or Orders page.',
      'Select a product and quantity. Customer info is optional.',
      'Orders start as "Pending". Once delivered, click the checkmark to complete.',
      'Completing orders earns you 20 XP!'
    ]
  },
  {
    id: 'inventory',
    title: 'Inventory Control',
    icon: Package,
    color: 'text-brand-secondary',
    content: [
      'Add products with cost and retail price to track profit.',
      'Stock levels automatically decrease when orders are placed.',
      'Low stock products will appear as warnings on your dashboard.',
      'Keep an eye on the "Margin" to ensure your business stays healthy.'
    ]
  },
  {
    id: 'finances',
    title: 'Financial Health',
    icon: BarChart,
    color: 'text-brand-danger',
    content: [
      'Revenue and Profit are calculated from "Delivered" orders.',
      'Log expenses (Rent, Marketing, Supplies) to see your Net Balance.',
      'The "Profit vs Expense" chart helps you visualize where money goes.'
    ]
  },
  {
    id: 'gamification',
    title: 'Earning XP & Rewards',
    icon: ShieldCheck,
    color: 'text-white',
    content: [
      'Completing business tasks earns you Experience Points (XP).',
      'Adding Products: 10 XP',
      'Adding Customers: 5 XP',
      'Delivering Orders: 20 XP',
      'Level up to unlock new badges (coming soon)!'
    ]
  }
];

export default function Tutorials() {
  const [selected, setSelected] = useState(tutorials[0].id);

  const activeTutorial = tutorials.find(t => t.id === selected)!;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Tutorials & Help</h1>
        <p className="text-slate-400 mt-1">Master SwiftSell with these quick guides.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Tutorial List */}
        <div className="space-y-2">
          {tutorials.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                selected === t.id 
                  ? 'bg-brand-primary/10 border border-brand-primary/20 text-white' 
                  : 'bg-white/5 border border-transparent text-slate-400 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <t.icon size={20} className={t.color} />
                <span className="font-semibold text-sm">{t.title}</span>
              </div>
              <ChevronRight size={16} className={selected === t.id ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>

        {/* Tutorial Content */}
        <div className="md:col-span-2 glass-card p-8 min-h-[400px]">
           <AnimatePresence mode="wait">
             <motion.div
               key={selected}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-6"
             >
                <div className="flex items-center space-x-4 mb-8">
                   <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${activeTutorial.color}`}>
                      <activeTutorial.icon size={32} />
                   </div>
                   <h2 className="text-2xl font-bold">{activeTutorial.title}</h2>
                </div>

                <div className="space-y-4">
                   {activeTutorial.content.map((point, idx) => (
                     <div key={idx} className="flex items-start space-x-3 p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="mt-1 w-5 h-5 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center text-[10px] font-bold">
                           {idx + 1}
                        </div>
                        <p className="text-slate-300 leading-relaxed">{point}</p>
                     </div>
                   ))}
                </div>

                <div className="mt-8 p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-between">
                   <span className="text-sm font-medium">Ready to try it out?</span>
                   <button className="text-brand-primary font-bold text-sm hover:underline">Go to Page</button>
                </div>
             </motion.div>
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
