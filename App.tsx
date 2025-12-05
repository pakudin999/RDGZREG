import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Aperture, User, Settings, AlertTriangle, X } from 'lucide-react';
import { onAuthStateChanged, signInAnonymously, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

// Services & Components
import { auth, db, APP_ID } from './services/firebase';
import { AnalyzerState, PoseState, AlertState, LoadingState, SystemConfig } from './types';
import { AlertModal, LoadingModal } from './components/Common';
import StyleAnalyzerTab from './components/StyleAnalyzerTab';
import PoseGeneratorTab from './components/PoseGeneratorTab';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'poses'>('analyzer');
  const [analyzerData, setAnalyzerData] = useState<AnalyzerState>({ uploadedFile: null, generatedPrompt: '' });
  const [poseData, setPoseData] = useState<PoseState>({ uploadedFile: null, posePrompts: null });
  const [alert, setAlert] = useState<AlertState>({ show: false, title: '', message: '' });
  const [loading, setLoading] = useState<LoadingState>({ show: false, title: '', message: '' });

  // Auth & Config State
  const [showSettings, setShowSettings] = useState(false);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({ apiEnabled: true });
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authError, setAuthError] = useState(false);

  // Helper callbacks
  const showModal = useCallback((title: string, message: string) => setAlert({ show: true, title, message }), []);
  const showLoadingModal = useCallback((title: string, message: string) => setLoading({ show: true, title, message }), []);
  const hideLoadingModal = useCallback(() => setLoading(prev => ({ ...prev, show: false })), []);
  const handleResetAnalyzer = useCallback(() => setAnalyzerData({ uploadedFile: null, generatedPrompt: '' }), []);
  const handleResetPose = useCallback(() => setPoseData({ uploadedFile: null, posePrompts: null }), []);

  // Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error: any) {
        console.log("Auth Init Error:", error.message);
        setAuthError(true);
      }
    };
    initAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, setUser);
    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore Config
  useEffect(() => {
    if (!user) return;
    const configRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'system_settings', 'global_config');
    
    const unsubscribeConfig = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSystemConfig({ 
          apiEnabled: data.apiEnabled ?? true,
          // apiKey is not read from DB for security, strictly uses environment variable in Gemini service
        });
      }
    }, (error) => {
      console.error("Config Listener Error (Permission/Network):", error);
    });

    return () => unsubscribeConfig();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-4 md:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Effect */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none z-0"></div>

      {authError && (
        <div className="fixed top-0 left-0 w-full bg-red-900/90 text-white z-[100] px-4 py-3 flex items-center justify-center gap-3 backdrop-blur-md shadow-2xl border-b border-red-500/30 animate-slide-up">
          <AlertTriangle className="text-red-300 animate-pulse" size={24} />
          <div className="text-center">
            <p className="font-bold text-sm uppercase tracking-wider">Konfigurasi Firebase Diperlukan</p>
            <p className="text-xs text-red-200 mt-1">Sila aktifkan <strong>"Anonymous" & "Email/Password"</strong> di Firebase Console.</p>
          </div>
          <button onClick={() => setAuthError(false)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-red-800 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Admin Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed top-4 left-4 z-50 text-slate-700 hover:text-amber-500 transition-all p-2 rounded-full hover:bg-slate-900/80"
        title="Admin Access"
      >
        <Settings size={20} />
      </button>

      <div className="relative z-10 max-w-xl mx-auto">
        <AlertModal 
          show={alert.show} 
          title={alert.title} 
          message={alert.message} 
          onClose={() => setAlert(prev => ({ ...prev, show: false }))} 
        />
        <LoadingModal 
          show={loading.show} 
          title={loading.title} 
          message={loading.message} 
        />
        <SettingsModal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
          config={systemConfig} 
          user={user} 
        />

        <div className="flex flex-col items-center text-center mb-8 space-y-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="text-amber-500 fill-amber-500" size={16} />
            <span className="text-xs font-bold tracking-[0.3em] text-amber-500 uppercase">Sistem Pintar</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-white tracking-tight">WARKAH KASIH</h1>
          <p className="text-slate-400 text-sm font-light tracking-wide max-w-lg mx-auto">
            Analisis Gaya Kahwin & Penjana Prompt Profesional
          </p>

          {!systemConfig.apiEnabled && (
            <div className="mt-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">SYSTEM OFFLINE</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 bg-slate-900/80 rounded-2xl mb-8 border border-slate-800 backdrop-blur-sm relative">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'analyzer' ? 'bg-slate-800 text-white shadow-lg ring-1 ring-slate-700' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Aperture size={16} /> Analisis Style
          </button>
          <button
            onClick={() => setActiveTab('poses')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === 'poses' ? 'bg-slate-800 text-white shadow-lg ring-1 ring-slate-700' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <User size={16} /> Variasi Pose
          </button>
        </div>

        {/* Main Content Area */}
        <div className="bg-slate-900/20 rounded-3xl p-1 relative">
          {!systemConfig.apiEnabled && (
            <div className="absolute inset-0 bg-slate-950/50 z-10 rounded-3xl pointer-events-none border border-red-500/10 flex items-center justify-center"></div>
          )}

          {activeTab === 'analyzer' ? (
            <StyleAnalyzerTab
              formData={analyzerData}
              setFormData={setAnalyzerData}
              config={systemConfig}
              showModal={showModal}
              showLoading={showLoadingModal}
              hideLoading={hideLoadingModal}
              onReset={handleResetAnalyzer}
            />
          ) : (
            <PoseGeneratorTab
              formData={poseData}
              setFormData={setPoseData}
              config={systemConfig}
              showModal={showModal}
              showLoading={showLoadingModal}
              hideLoading={hideLoadingModal}
              onReset={handleResetPose}
            />
          )}
        </div>

        <div className="text-center mt-12 pb-8 border-t border-slate-800/50 pt-8 flex flex-col items-center gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-600 mb-2">DIKUASAKAN OLEH</p>
            <p className="text-xs text-slate-500 font-mono">@konten_beban</p>
          </div>
        </div>
      </div>
    </div>
  );
}