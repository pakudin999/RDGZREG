import React from 'react';
import { Sparkles, Aperture, Check, RefreshCw } from 'lucide-react';
import { AnalyzerState, SystemConfig } from '../types';
import { InfoButton, CopyButton, ImageUploadArea } from './Common';
import { fileToBase64, generateStyleAnalysis } from '../services/geminiService';

interface Props {
  formData: AnalyzerState;
  setFormData: React.Dispatch<React.SetStateAction<AnalyzerState>>;
  config: SystemConfig;
  showModal: (title: string, message: string) => void;
  showLoading: (title: string, message: string) => void;
  hideLoading: () => void;
  onReset: () => void;
}

const StyleAnalyzerTab: React.FC<Props> = ({ 
  formData, setFormData, config, showModal, showLoading, hideLoading, onReset 
}) => {
  const { uploadedFile, generatedPrompt } = formData;
  const { apiEnabled } = config;

  const handleFileSelect = (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showModal('Format Tidak Sah', 'Sila muat naik fail gambar JPG atau PNG sahaja.');
      return;
    }
    if (uploadedFile) URL.revokeObjectURL(uploadedFile.previewUrl);
    setFormData(prev => ({ ...prev, uploadedFile: { file, previewUrl: URL.createObjectURL(file) } }));
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, uploadedFile: null, generatedPrompt: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiEnabled) {
      showModal('Sistem Diselenggara', 'Maaf, servis AI sedang dimatikan oleh Admin untuk penyelenggaraan.');
      return;
    }
    if (!uploadedFile) {
      showModal('Tiada Gambar', 'Sila muat naik gambar rujukan gaya kahwin terlebih dahulu.');
      return;
    }

    showLoading('Analisis Gaya...', 'AI sedang membaca tekstur, pencahayaan, dan mood...');
    setFormData(prev => ({ ...prev, generatedPrompt: '' }));
    
    try {
      const base64 = await fileToBase64(uploadedFile.file);
      const prompt = await generateStyleAnalysis(base64, uploadedFile.file.type);
      setFormData(prev => ({ ...prev, generatedPrompt: prompt }));
    } catch (error) {
      showModal('Ralat', 'Sistem gagal memproses gambar. Sila cuba lagi.');
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="flex justify-between items-center mb-6 px-1">
        <h3 className="text-lg font-serif text-slate-200">Analisis Style & Tone</h3>
        <InfoButton title="Info Analisis">
          <p>AI akan menganalisis estetik gambar (warna, lighting, mood) dan menghasilkan satu prompt utama untuk ditiru.</p>
        </InfoButton>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ImageUploadArea 
          uploadedFile={uploadedFile} 
          onFileSelect={handleFileSelect} 
          onRemove={handleRemoveFile} 
        />
        
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button 
            type="submit" 
            disabled={!uploadedFile} 
            className={`flex-1 w-full bg-gradient-to-r ${
              apiEnabled 
                ? 'from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600' 
                : 'from-slate-700 to-slate-800 cursor-not-allowed grayscale'
            } disabled:opacity-70 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 ease-out flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 hover:shadow-amber-500/20 hover:-translate-y-0.5 group text-sm`}
          >
            {uploadedFile ? <Sparkles size={18} className="animate-pulse" /> : <Aperture size={18} />}
            <span className="tracking-wide">{apiEnabled ? 'ANALISIS STYLE' : 'SYSTEM OFFLINE'}</span>
          </button>
          <button 
            type="button" 
            onClick={onReset} 
            className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-medium py-3.5 px-4 rounded-xl transition duration-300 border border-slate-700 hover:border-slate-500"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </form>

      {generatedPrompt && (
        <div className="mt-10 animate-slide-up delay-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-serif text-white flex items-center gap-2">
              <Check className="text-emerald-500" size={16} /> Prompt Hasil Analisis
            </h2>
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Gemini 2.5</span>
          </div>
          <div className="relative bg-slate-900/80 rounded-xl p-1 border border-slate-700/50 shadow-2xl backdrop-blur-sm overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
            <textarea 
              value={generatedPrompt} 
              className="w-full bg-transparent border-0 text-slate-300 focus:ring-0 resize-none p-5 font-mono text-xs md:text-sm leading-loose focus:outline-none" 
              rows={8} 
              readOnly 
            />
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <CopyButton textToCopy={generatedPrompt} label="SALIN" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleAnalyzerTab;