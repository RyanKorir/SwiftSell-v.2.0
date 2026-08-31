import { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  Users, 
  History, 
  Award,
  LayoutDashboard,
  BookOpen,
  Settings as SettingsIcon,
  Bell,
  Menu,
  X,
  Leaf,
  LogOut,
  ShieldCheck,
  LogIn,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './context/AuthContext.tsx';
import ThemeSwitcher from './components/ThemeSwitcher.tsx';

// Pages
import Dashboard from './pages/Dashboard.tsx';
import Orders from './pages/Orders.tsx';
import Inventory from './pages/Inventory.tsx';
import Customers from './pages/Customers.tsx';
import Finances from './pages/Finances.tsx';
import SettingsPage from './pages/Settings.tsx';
import Tutorials from './pages/Tutorials.tsx';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}

function AppShell() {
  const { user, userStats, loading, signIn, logOut, authError } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'inventory' | 'customers' | 'finances' | 'settings' | 'tutorials'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [errorStatus, setErrorStatus] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: History },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'finances', label: 'Finances', icon: BarChart3 },
    { id: 'tutorials', label: 'Tutorials', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const getIcon = (id: string) => {
    switch(id) {
      case 'dashboard': return LayoutDashboard;
      case 'orders': return History;
      case 'inventory': return Package;
      case 'customers': return Users;
      case 'finances': return BarChart3;
      case 'tutorials': return BookOpen;
      case 'settings': return SettingsIcon;
      default: return LayoutDashboard;
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 relative overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="glass-card hud-panel p-0 w-full max-w-md overflow-hidden shadow-[0_0_80px_color-mix(in_srgb,var(--color-brand-primary)_15%,transparent)]"
        >
          <div className="bg-brand-primary/5 p-12 text-center border-b border-white/5">
            <div className="w-20 h-20 bg-brand-primary rounded-3xl flex items-center justify-center mx-auto mb-6 neon-glow shadow-2xl shadow-brand-primary/30">
              <Leaf size={40} className="text-white" />
            </div>
            <h1 className="font-display text-4xl font-bold text-white tracking-tighter">SwiftSell</h1>
            <p className="text-slate-400 text-lg mt-2 font-medium">High Order Hub</p>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <h2 className="font-display text-xl font-bold text-center">Identity Verification</h2>
              <p className="text-slate-400 text-sm text-center">Please sign in with your corporate or business account to access your workspace.</p>
            </div>

            <button 
              onClick={signIn}
              className="btn-glow w-full py-4 bg-white text-slate-950 rounded-2xl font-bold text-lg hover:bg-slate-200 active:scale-95 shadow-xl flex items-center justify-center space-x-3"
            >
              <LogIn size={22} />
              <span>Connect with Identity Profile</span>
            </button>

            {authError && (
              <p className="text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {authError}
              </p>
            )}

            <div className="flex items-center space-x-4">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Secure Handshake</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <p className="text-[10px] text-slate-500 text-center leading-relaxed font-medium">
              By continuing, you agree to SwiftSell's{' '}
              <a href="/terms-of-service.html" target="_blank" rel="noreferrer" className="text-slate-400 underline hover:text-slate-200">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy-policy.html" target="_blank" rel="noreferrer" className="text-slate-400 underline hover:text-slate-200">
                Privacy Policy
              </a>.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isLocked) {
    const isDefaultPin = userStats?.pin === '0000';

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 relative overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className={`glass-card hud-panel p-0 w-full max-w-md overflow-hidden transition-all duration-500 ${errorStatus ? 'border-brand-danger shadow-brand-danger/30 shake' : 'shadow-[0_0_80px_color-mix(in_srgb,var(--color-brand-primary)_15%,transparent)]'}`}
        >
          <div className="bg-brand-primary/5 p-8 text-center border-b border-white/5">
            <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-4 neon-glow">
              <Leaf size={32} className="text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">SwiftSell Portal</h1>
            <p className="text-slate-400 text-sm mt-1">High Order Hub</p>
          </div>

          <div className="p-8">
            <div className="flex items-center space-x-4 mb-8 p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-brand-secondary/20 flex items-center justify-center text-brand-secondary font-bold text-xl border border-brand-secondary/30 overflow-hidden">
                {user.photoURL ? <img src={user.photoURL} alt="" /> : user.displayName?.charAt(0) || 'G'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Authenticated As</p>
                <p className="text-white font-semibold">{user.displayName || 'Ganja Slinger'}</p>
              </div>
              <div className="ml-auto">
                <div className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-4">
                  {isDefaultPin ? 'Setup Required: Use default PIN 0000' : 'Enter security PIN to decrypt workspace'}
                </p>
                
                <div className="flex justify-center space-x-4 mb-8">
                  {[...Array(4)].map((_, i) => (
                    <motion.div 
                      key={i} 
                      animate={pin.length > i ? { scale: [1, 1.3, 1], rotate: [0, 10, 0] } : {}}
                      className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${pin.length > i ? 'bg-brand-primary border-brand-primary neon-glow' : 'border-white/20'}`} 
                    />
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'Cancel', 0, 'Delete'].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        if (num === 'Cancel') setPin('');
                        else if (num === 'Delete') setPin(prev => prev.slice(0, -1));
                        else if (pin.length < 4) setPin(prev => prev + num);
                      }}
                      className={`h-14 rounded-xl flex items-center justify-center transition-all active:scale-95 text-xl font-bold font-mono
                        ${typeof num === 'string' 
                          ? 'bg-transparent text-slate-500 text-xs uppercase tracking-widest hover:text-white font-sans' 
                          : 'bg-white/5 border border-white/5 hover:bg-white/10 text-slate-200 hover-lift'}
                      `}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => {
                  if (userStats && pin === userStats.pin) {
                    setIsLocked(false);
                    if (isDefaultPin) {
                      setActiveTab('settings');
                    }
                  } else {
                    setErrorStatus(true);
                    setPin('');
                    setTimeout(() => setErrorStatus(false), 500);
                  }
                }}
                disabled={pin.length < 4}
                className={`btn-glow w-full py-4 rounded-xl font-bold text-lg active:scale-95 shadow-xl flex items-center justify-center space-x-2
                  ${pin.length === 4 
                    ? 'bg-brand-primary text-white shadow-brand-primary/20 hover:bg-brand-primary/90' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                `}
              >
                <ShieldCheck size={22} />
                <span>Initialize Dashboard</span>
              </button>
            </div>

            <button 
              onClick={logOut}
              className="w-full mt-4 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest font-bold"
            >
              Sign Out Account
            </button>
          </div>

          <div className="p-4 bg-slate-900/50 text-center border-t border-white/5">
             <p className="text-[10px] text-slate-600 font-mono uppercase tracking-[0.2em]">Secure Node: CLOUD-RUN-PROD</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
      <aside className="hidden lg:flex w-64 flex-col bg-slate-900 border-r border-white/5 p-6 space-y-8">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center neon-glow">
            <Leaf className="text-white w-6 h-6" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">SwiftSell</span>
        </div>

        <nav className="flex-1 space-y-1">
          {tabs.map((tab) => {
             const Icon = getIcon(tab.id);
             return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-brand-primary/10 text-brand-primary font-semibold border border-brand-primary/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 hover:translate-x-0.5'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
             );
          })}
        </nav>

        <div className="glass-card hud-panel p-4 space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="font-display font-semibold tracking-wide">LEVEL {userStats?.level || 1}</span>
            <span className="font-mono">{userStats?.xp || 0} XP</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-brand-primary"
              style={{ boxShadow: '0 0 12px color-mix(in srgb, var(--color-brand-primary) 70%, transparent)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((userStats?.xp % 100) || 0, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest font-bold">
            Stay active for level { (userStats?.level || 1) + 1 }
          </p>
        </div>

        <button 
          onClick={() => {
            setIsLocked(true);
            setPin('');
          }}
          className="flex items-center justify-center space-x-3 w-full py-3 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-brand-danger hover:bg-brand-danger/10 hover:border-brand-danger/20 transition-all font-semibold"
        >
          <LogOut size={18} />
          <span>Lock Session</span>
        </button>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-slate-950/50 backdrop-blur-md z-10 lg:pl-6">
          <div className="flex items-center lg:hidden">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400">
               <Menu size={24} />
             </button>
             <span className="ml-2 font-display font-bold text-lg">SwiftSell</span>
          </div>
          <div className="hidden lg:block text-slate-400 font-medium">
            Welcome back, <span className="text-slate-100 italic">{user.displayName?.split(' ')[0] || 'Seller'}</span>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="relative">
               <button
                 type="button"
                 onClick={() => setIsThemePickerOpen((v) => !v)}
                 aria-expanded={isThemePickerOpen}
                 aria-label="Change color scheme"
                 className="p-2 text-slate-400 hover:text-slate-200 transition-colors btn-glow rounded-lg"
               >
                 <Palette size={20} />
               </button>
               <AnimatePresence>
                 {isThemePickerOpen && (
                   <>
                     <div
                       className="fixed inset-0 z-30"
                       onClick={() => setIsThemePickerOpen(false)}
                     />
                     <motion.div
                       initial={{ opacity: 0, y: -8, scale: 0.96 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: -8, scale: 0.96 }}
                       transition={{ duration: 0.15 }}
                       className="absolute right-0 top-full mt-2 z-40 glass-card p-4 w-64"
                     >
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                         Color Scheme
                       </p>
                       <ThemeSwitcher />
                     </motion.div>
                   </>
                 )}
               </AnimatePresence>
             </div>
             <button 
               onClick={() => {
                 setIsLocked(true);
                 setPin('');
               }}
               className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-400 hover:text-brand-danger hover:bg-brand-danger/10 hover:border-brand-danger/20 transition-all text-xs font-semibold"
               title="Lock Application"
             >
               <LogOut size={16} />
               <span className="hidden sm:inline">Lock</span>
             </button>
             <button className="p-2 text-slate-400 hover:text-slate-200 transition-colors">
               <Bell size={20} />
             </button>
             <div className="w-8 h-8 rounded-full bg-brand-secondary/20 flex items-center justify-center text-brand-secondary border border-brand-secondary/30 overflow-hidden">
                {user.photoURL ? <img src={user.photoURL} alt="" /> : user.displayName?.charAt(0) || 'G'}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
               className="h-full"
             >
               {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
               {activeTab === 'orders' && <Orders />}
               {activeTab === 'inventory' && <Inventory />}
               {activeTab === 'customers' && <Customers />}
               {activeTab === 'finances' && <Finances />}
               {activeTab === 'settings' && <SettingsPage />}
               {activeTab === 'tutorials' && <Tutorials setActiveTab={setActiveTab} />}
             </motion.div>
           </AnimatePresence>
        </main>

        <nav className="lg:hidden h-16 bg-slate-900 border-t border-white/5 flex items-center justify-around px-2 pb-safe">
           {tabs.slice(0, 6).map((tab) => {
             const Icon = getIcon(tab.id);
             return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                  activeTab === tab.id ? 'text-brand-primary' : 'text-slate-500'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] mt-1">{tab.label}</span>
              </button>
             );
           })}
        </nav>
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 p-6 lg:hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-display font-bold text-xl">SwiftSell</span>
                <button onClick={() => setIsSidebarOpen(false)}>
                  <X />
                </button>
              </div>
              <div className="space-y-1 flex-1 overflow-y-auto">
                {tabs.map((tab) => {
                  const Icon = getIcon(tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id as any); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl ${
                        activeTab === tab.id ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'text-slate-400'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto pt-6 border-t border-white/5">
                <button 
                  onClick={() => {
                    setIsLocked(true);
                    setPin('');
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-brand-danger hover:bg-brand-danger/10 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-semibold">Lock Session</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
