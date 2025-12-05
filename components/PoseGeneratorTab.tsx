import React from 'react';
import { Layers, ScanFace, Check, RefreshCw } from 'lucide-react';
import { PoseState, SystemConfig } from '../types';
import { InfoButton, CopyButton, ImageUploadArea } from './Common';
import { fileToBase64, generatePoseVariations } from '../services/geminiService';

interface Props {
  formData: PoseState;
  setFormData: React.Dispatch<React.SetStateAction<PoseState>>;
  config: SystemConfig;
  showModal: (title: string, message: string) => void;
  showLoading: (title: string, message: string) => void;
  hideLoading: () => void;
  onReset: () => void;
}

const PoseGeneratorTab: React.FC<Props> = ({
  formData, setFormData, config, showModal, showLoading, hideLoading, onReset
}) => {
  const { uploadedFile, posePrompts } = formData;
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
    setFormData(prev => ({ ...prev, uploadedFile: null, posePrompts: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiEnabled) {
      showModal('Sistem Diselenggara', 'Maaf, servis AI sedang dimatikan oleh Admin untuk penyelenggaraan.');
      return;
    }
    if (!uploadedFile) {
      showModal('Tiada Gambar', 'Sila muat naik gambar rujukan tema terlebih dahulu.');
      return;
    }

    showLoading('Menjana Variasi...', 'AI sedang mencipta 8 jenis pose profesional & candid...');
    setFormData(prev => ({ ...prev, posePrompts: null }));

    try {
      const base64 = await fileToBase64(uploadedFile.file);
      const prompts = await generatePoseVariations(base64, uploadedFile.file.type);
      setFormData(prev => ({ ...prev, posePrompts: prompts }));
    } catch (error) {
      showModal('Ralat', 'Sistem gagal menjana pose. Sila cuba lagi.');
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="animate-slide-up">
      <div className="flex justify-between items-center mb-6 px-1">
        <h3 className="text-lg font-serif text-slate-200">Variasi Pose & Angle</h3>
        <InfoButton title="Batch Pose">
          <p>Muat naik gambar tema, dan AI akan menjana 8 variasi prompt berbeza (Candid, Romantic, Artistic, dll) mengikut estetik gambar tersebut.</p>
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
            {uploadedFile ? <Layers size={18} className="animate-pulse" /> : <ScanFace size={18} />}
            <span className="tracking-wide">{apiEnabled ? 'JANA 8 VARIASI POSE' : 'SYSTEM OFFLINE'}</span>
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

      {posePrompts && (
        <div className="mt-10 space-y-4 animate-slide-up delay-100">
          <h2 className="text-sm font-serif text-white flex items-center gap-2 mb-4">
            <Check className="text-emerald-500" size={16} /> Senarai Batch Prompt (8 Variasi)
          </h2>
          {posePrompts.map((item, index) => (
            <div key={index} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 hover:border-amber-500/30 transition-colors group">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">{index + 1}. {item.title}</span>
                <CopyButton textToCopy={item.prompt} label="SALIN" />
              </div>
              <p className="font-mono text-xs text-slate-300 leading-relaxed opacity-90">{item.prompt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PoseGeneratorTab;