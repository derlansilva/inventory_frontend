import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface SapAlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  onClose: () => void;
}

export default function SapAlertModal({
  isOpen,
  title = 'Mensagem do Sistema (S/4HANA)',
  message,
  type = 'info',
  onClose
}: SapAlertModalProps) {
  if (!isOpen) return null;

  const getHeaderColor = () => {
    switch (type) {
      case 'success': return 'bg-green-800 text-white';
      case 'error': return 'bg-red-800 text-white';
      case 'warning': return 'bg-amber-700 text-white';
      default: return 'bg-[#002B49] text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-300" />;
      default: return <Info className="w-4 h-4 text-blue-300" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded shadow-2xl border border-gray-400 w-full max-w-md overflow-hidden">
        
        {/* Cabeçalho Estilo SAP */}
        <div className={`px-3 py-2 flex items-center justify-between ${getHeaderColor()}`}>
          <div className="flex items-center space-x-2">
            {getIcon()}
            <span className="font-bold text-xs tracking-wide">{title}</span>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo da Mensagem */}
        <div className="p-5 bg-white text-gray-800 text-xs font-sans">
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1 font-medium leading-relaxed">
              {message}
            </div>
          </div>
        </div>

        {/* Rodapé com Botão OK */}
        <div className="bg-gray-100 px-4 py-2.5 flex justify-end border-t border-gray-200">
          <button 
            onClick={onClose}
            className="bg-[#002B49] hover:bg-blue-900 text-white px-6 py-1 rounded font-bold text-xs shadow-xs cursor-pointer transition"
          >
            OK
          </button>
        </div>

      </div>
    </div>
  );
}