import React, { useState, useEffect } from 'react';
import { X, Settings, Lock, AlertTriangle, Power, LogOut } from 'lucide-react';
import { signInWithEmailAndPassword, signOut, signInAnonymously, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, APP_ID } from '../services/firebase';
import { SystemConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: SystemConfig;
  user: User | null;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, config, user }) => {
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isAdmin = user && !user.isAnonymous;

  useEffect(() => {
    if (isOpen) {
      setError('');
      setEmail('');
      setPassword('');
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error("Login Error:", err);
      setError("Log masuk gagal. Sila semak emel dan kata laluan.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await signInAnonymously(auth);
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  const updateConfig = async (shouldEnableSystem: boolean) => {
    if (!isAdmin) return;
    setIsUpdating(true);

    try {
      await setDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'system_settings', 'global_config'), {
        apiEnabled: shouldEnableSystem,
        lastUpdated: new Date().toISOString(),
        updatedBy: user?.email || 'Admin'
      }, { merge: true });
    } catch (err) {
      console.error("Error updating config:", err);
      setError("Gagal menyimpan. Pastikan Firestore Rules anda betul.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-slate-800 rounded-full mb-3 text-slate-300 border border-slate-700">
            {isAdmin ? <Settings size={24} className="text-emerald-500" /> : <Lock size={24} />}
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">
            {isAdmin ? 'Admin Control Panel' : 'Akses Terhad'}
          </h3>
          {user && !user.isAnonymous && <p className="text-[10px] text-slate-400 mt-1">{user.email}</p>}
        </div>

        {!isAdmin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <p className="text-sm text-center text-slate-400 mb-2">Log masuk Admin</p>
            <div>
              <input
                type="email"
                placeholder="Emel Admin"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Kata Laluan"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 placeholder:text-slate-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-white hover:text-black text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 border border-slate-700 shadow-lg mt-2"
            >
              Log Masuk
            </button>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-left mt-2">
                <p className="text-red-400 text-xs leading-relaxed flex items-start gap-2">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {error}
                </p>
              </div>
            )}
          </form>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${config?.apiEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  <Power size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Status Sistem</h4>
                  <p className="text-[10px] text-slate-400">{config?.apiEnabled ? 'Online (Semua Pengguna)' : 'Maintenance (Ditutup)'}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 space-y-3">
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => updateConfig(false)}
                  disabled={isUpdating}
                  className="w-full flex items-center justify-center gap-2 bg-red-900/80 hover:bg-red-800 text-white py-2.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 border border-red-700/50"
                >
                  <Power size={14} /> Matikan Sistem (OFF)
                </button>
                <button
                  onClick={() => updateConfig(true)}
                  disabled={isUpdating}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-900/80 hover:bg-emerald-800 text-white py-2.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 border border-emerald-700/50"
                >
                  <Power size={14} /> Hidupkan Sistem (ON)
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs text-center">{error}</p>}

            <div className="flex justify-between items-center pt-2 border-t border-slate-800 mt-2">
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 font-medium py-2">
                <LogOut size={12} /> Log Keluar
              </button>
              <button onClick={onClose} className="text-slate-400 hover:text-white text-xs underline py-2">Tutup</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;