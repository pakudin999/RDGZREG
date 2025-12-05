import React, { useState, useRef } from 'react';
import { Info, Sparkles, Check, Copy, Upload, X, Loader2, AlertTriangle } from 'lucide-react';
import { UploadedFile } from '../types';

export const InfoButton: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="text-slate-400 hover:text-amber-400 p-2 rounded-full hover:bg-slate-800 transition-colors"
      >
        <Info size={20} />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 p-5 rounded-xl shadow-2xl z-20 text-left backdrop-blur-md bg-opacity-95 animate-fade-in">
            <h4 className="text-amber-400 font-bold mb-3 text-sm tracking-wide flex items-center gap-2">
              <Sparkles size={14} /> {title}
            </h4>
            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const CopyButton: React.FC<{ textToCopy: string; label?: string }> = ({ textToCopy, label = "Salin" }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => console.error("Copy failed", err));
  };

  return (
    <button 
      onClick={handleCopy} 
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-medium text-[10px] tracking-wider uppercase ${
        copied 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-amber-500/30 hover:text-amber-400'
      }`}
    >
      {copied ? <><Check size={12} /> {label}</> : <><Copy size={12} /> {label}</>}
    </button>
  );
};

interface ImageUploadProps {
  uploadedFile: UploadedFile | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

export const ImageUploadArea: React.FC<ImageUploadProps> = ({ uploadedFile, onFileSelect, onRemove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setIsDragging(false); 
    if(e.dataTransfer.files[0]) onFileSelect(e.dataTransfer.files[0]); 
  };

  return (
    <div 
      onClick={() => fileInputRef.current?.click()} 
      onDragOver={handleDragOver} 
      onDragLeave={handleDragLeave} 
      onDrop={handleDrop} 
      className={`relative group bg-slate-900/40 rounded-xl p-4 text-center border border-dashed transition-all duration-300 min-h-[160px] flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:bg-slate-800/60 ${
        isDragging ? 'border-amber-500 bg-slate-800/80 ring-2 ring-amber-500/20' : 'border-slate-700 hover:border-amber-500/40'
      } ${uploadedFile ? 'border-none p-0 h-auto min-h-0' : ''}`}
    >
      {uploadedFile ? (
        <div className="relative w-full">
          <img src={uploadedFile.previewUrl} alt="Preview" className="w-full h-64 object-contain rounded-lg bg-black/20" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
              Klik untuk tukar
            </span>
          </div>
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); onRemove(); }} 
            className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-500 text-white rounded-full p-1.5 shadow-lg transition-colors z-30 border border-white/10"
            title="Buang gambar"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="pointer-events-none z-10 flex flex-col items-center gap-3">
          <div className="p-3 bg-slate-800 rounded-full text-slate-400 group-hover:text-amber-500 shadow-md group-hover:shadow-amber-500/20 transition-all duration-300 border border-slate-700 group-hover:border-amber-500/30">
            <Upload size={20} />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Muat Naik Gambar</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Klik atau Tarik (JPG/PNG)</p>
          </div>
        </div>
      )}
      <input 
        ref={fileInputRef} 
        type="file" 
        className="hidden" 
        accept="image/jpeg,image/png,image/webp" 
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])} 
      />
    </div>
  );
};

export const AlertModal: React.FC<{ show: boolean; title: string; message: string; onClose: () => void }> = ({ show, title, message, onClose }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl transform scale-100 ring-1 ring-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-full text-red-400"><Info size={24} /></div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">{message}</p>
        <button 
          onClick={onClose} 
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all border border-slate-700 hover:border-slate-600 text-sm"
        >
          Tutup Mesej
        </button>
      </div>
    </div>
  );
};

export const LoadingModal: React.FC<{ show: boolean; title: string; message: string }> = ({ show, title, message }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-16 h-16 text-amber-400 animate-spin relative z-10" />
        </div>
        <h3 className="text-2xl font-serif text-white mb-3 tracking-wide">{title}</h3>
        <p className="text-slate-400 text-sm animate-pulse tracking-widest uppercase">{message}</p>
      </div>
    </div>
  );
};