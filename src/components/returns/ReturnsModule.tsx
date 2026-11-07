import React, { useState } from 'react';
import CentralSac from './CentralSac';
import ReturnsEntry from './ReturnsEntry';
import PendingManifests from './PendingManifests';
import { Headphones, PackagePlus, ArrowLeft, UploadCloud } from 'lucide-react';

interface ReturnsModuleProps {
  onBack: () => void;
}

export default function ReturnsModule({ onBack }: ReturnsModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'lancamento' | 'recebimento' | 'sac'>('lancamento');

  const baseButtonClass = "px-3 py-1.5 rounded-md font-bold text-[11px] transition-all duration-300 ease-in-out flex items-center space-x-1.5 border shadow-sm";
  const activeClass = "bg-white text-[#002B49] border-gray-300 ring-1 ring-black/5"; 
  const inactiveClass = "bg-[#002B49] hover:bg-[#003d66] text-white border-[#002B49] hover:border-[#003d66]";

  return (
    <div className="w-full font-sans rounded shadow-md overflow-hidden bg-white relative z-20 mt-0 flex flex-col h-full">
      
      {/* 
        HEADER TOP COMPACTO 
        Adicionado z-50 e relative para garantir que os botões fiquem SEMPRE por cima de qualquer tela (como o SAC)
      */}
      <div className="bg-[#E9ECEF] px-4 py-2 flex items-center justify-between text-xs border-b border-gray-300 relative z-50 shrink-0">
        
        {/* Lado Esquerdo */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack} 
            className="hover:bg-gray-300 p-1.5 rounded-full text-gray-600 transition cursor-pointer"
            title="Voltar ao Início"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <span className="bg-[#1E4D6B] text-white px-2 py-0.5 rounded font-mono font-bold text-[10px] tracking-wider border border-blue-800">
            ZMM_RET
          </span>

          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm tracking-wide text-[#002B49]">
              GESTÃO DE DEVOLUÇÕES & SAC
            </span>
            <span className="text-[10px] hidden md:inline font-medium border-l border-gray-400 pl-2 text-gray-500">
              Tratamento de recusas, avarias e central de chamados
            </span>
          </div>
        </div>

        {/* Lado Direito: Abas do Menu */}
        <div className="flex items-center space-x-1.5">
          
          <button 
            onClick={() => setActiveSubTab('lancamento')}
            className={`${baseButtonClass} ${activeSubTab === 'lancamento' ? activeClass : inactiveClass}`}
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Lançamento de Devoluções</span>
          </button>

          <button 
            onClick={() => setActiveSubTab('recebimento')}
            className={`${baseButtonClass} ${activeSubTab === 'recebimento' ? activeClass : inactiveClass}`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Recebimento Cego (XMLs)</span>
          </button>

          <button 
            onClick={() => setActiveSubTab('sac')}
            className={`${baseButtonClass} ${activeSubTab === 'sac' ? activeClass : inactiveClass}`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Central SAC & Histórico</span>
          </button>

        </div>
      </div>

      {/* 
        CONTEÚDO DO MÓDULO 
        Adicionado 'animate-in fade-in' para uma transição suave de opacidade.
        O z-10 garante que o conteúdo fique abaixo do header (que é z-50).
      */}
      <div className="w-full flex-1 bg-[#E9ECEF] relative z-10 overflow-hidden">
        <div key={activeSubTab} className="w-full h-full animate-in fade-in duration-300">
          {activeSubTab === 'lancamento' && <ReturnsEntry />}
          {activeSubTab === 'recebimento' && <PendingManifests />}
          {activeSubTab === 'sac' && <CentralSac />}
        </div>
      </div>

    </div>
  );
}