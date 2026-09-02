import { useState, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataApi as firestoreApi } from '../lib/database.ts';
import { useAuth } from '../context/AuthContext.tsx';
import ThemeSwitcher from '../components/ThemeSwitcher.tsx';
import { 
  Lock, 
  ShieldCheck, 
  Save, 
  RefreshCcw,
  AlertCircle,
  UserCircle,
  Palette
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const queryClient = useQueryClient();
  const { user, userStats, logOut, refreshStats } = useAuth();

  const resolvedName =
    userStats?.displayName ||
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'Seller';

  const [displayName, setDisplayName] = useState('');
  const [nameSuccess, setNameSuccess] = useState(false);

  const updateNameMutation = useMutation({
    mutationFn: (name: string) => firestoreApi.updateDisplayName(name),
    onSuccess: async () => {
      await refreshStats();
      setDisplayName('');
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    }
  });

  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updatePinMutation = useMutation({
    mutationFn: (pin: string) => firestoreApi.updatePin(pin),
    onSuccess: async () => {
      await refreshStats();
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setNewPin('');
      setConfirmPin('');
      setSuccess('PIN updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to update PIN');
      setTimeout(() => setError(''), 3000);
    }
  });

  const handleUpdatePin = (e: FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    updatePinMutation.mutate(newPin);
  };

  return (
    <div className="space-y-8 max-w-2xl pb-20">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-slate-400 mt-1">Configure your app and security preferences.</p>
      </div>

      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
            <Lock size={20} />
          </div>
          <h2 className="text-xl font-bold">Security Settings</h2>
        </div>

        <form onSubmit={handleUpdatePin} className="space-y-4">
          <p className="text-sm text-slate-400">Change your application access PIN (4 digits). Your profile data is secured by your Google identity.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">New PIN</label>
              <input 
                type="password" 
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="****"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl tracking-[1rem] text-center outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Confirm PIN</label>
              <input 
                type="password" 
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="****"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl tracking-[1rem] text-center outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-brand-danger/10 text-brand-danger text-sm flex items-center space-x-2"
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-brand-secondary/10 text-brand-secondary text-sm flex items-center space-x-2"
            >
              <ShieldCheck size={16} />
              <span>{success}</span>
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={updatePinMutation.isPending}
            className="w-full md:w-fit px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg shadow-brand-primary/20"
          >
            {updatePinMutation.isPending ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}
            <span>Update PIN</span>
          </button>
        </form>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
            <Palette size={20} />
          </div>
          <h2 className="text-xl font-bold">Appearance</h2>
        </div>
        <p className="text-sm text-slate-400 mb-5">Pick a color scheme. Changes apply instantly across the whole app.</p>
        <ThemeSwitcher />
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-brand-accent/10 text-brand-accent">
            <UserCircle size={20} />
          </div>
          <h2 className="text-xl font-bold">Profile</h2>
        </div>
        <p className="text-sm text-slate-400 mb-5">
          Choose how your name appears around the app — separate from your Google account name.
        </p>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            if (displayName.trim().length === 0) return;
            updateNameMutation.mutate(displayName.trim());
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={resolvedName}
            maxLength={60}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={updateNameMutation.isPending || displayName.trim().length === 0}
            className="btn-glow bg-brand-primary hover:bg-brand-primary/90 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
          >
            {updateNameMutation.isPending ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
            <span>Save</span>
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-3">
          Signed in as <span className="text-slate-300">{user?.email}</span>
        </p>
        {nameSuccess && <p className="text-xs text-brand-secondary mt-2">Display name updated!</p>}
      </div>

      <button 
        onClick={logOut}
        className="w-full py-4 rounded-xl border border-white/5 bg-brand-danger/5 text-brand-danger hover:bg-brand-danger/10 transition-all font-bold flex items-center justify-center space-x-2"
      >
        <Lock size={20} />
        <span>Terminate Identity Session</span>
      </button>

      <div className="flex justify-center gap-4 text-xs text-slate-500 pt-2">
        <a href="/privacy-policy.html" target="_blank" rel="noreferrer" className="hover:text-slate-300 underline-offset-4 hover:underline">
          Privacy Policy
        </a>
        <span>·</span>
        <a href="/terms-of-service.html" target="_blank" rel="noreferrer" className="hover:text-slate-300 underline-offset-4 hover:underline">
          Terms of Service
        </a>
      </div>
    </div>
  );
}
