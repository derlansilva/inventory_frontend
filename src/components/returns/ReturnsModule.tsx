import React, { useState } from 'react';
import CentralSac from './CentralSac';
import ReturnsEntry from './ReturnsEntry';
import PendingManifests from './PendingManifests';
import { Headphones, PackagePlus, ArrowLeft, UploadCloud, ChevronDown } from 'lucide-react';

interface ReturnsModuleProps {
  onBack: () => void;
}

export default function ReturnsModule({ onBack }: ReturnsModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'lancamento' | 'recebimento' | 'sac'>('lancamento');

  return (
    <div className="w-full font-sans rounded shadow-md overflow-hidden bg-white relative z-20 mt-0 flex flex-col h-full">
      
      {/* HEADER TOP COMPACTO */}
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

        {/* Lado Direito: Combobox com as Telas */}
        <div className="relative">
          <div className="flex items-center space-x-2 bg-[#002B49] text-white px-3 py-1.5 rounded-md border border-[#002B49] shadow-sm cursor-pointer hover:bg-[#003d66] transition-all">
            {activeSubTab === 'lancamento' && <PackagePlus className="w-4 h-4 text-white" />}
            {activeSubTab === 'recebimento' && <UploadCloud className="w-4 h-4 text-white" />}
            {activeSubTab === 'sac' && <Headphones className="w-4 h-4 text-white" />}

            <select
              value={activeSubTab}
              onChange={(e) => setActiveSubTab(e.target.value as 'lancamento' | 'recebimento' | 'sac')}
              className="bg-transparent text-white font-bold text-[11px] outline-none cursor-pointer pr-4 appearance-none"
            >
              <option value="lancamento" className="bg-white text-[#002B49] font-medium py-1">
                Lançamento de Devoluções
              </option>
              <option value="recebimento" className="bg-white text-[#002B49] font-medium py-1">
                Recebimento Cego (XMLs)
              </option>
              <option value="sac" className="bg-white text-[#002B49] font-medium py-1">
                Central SAC & Histórico
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-white pointer-events-none -ml-4" />
          </div>
        </div>
      </div>

      {/* CONTEÚDO DO MÓDULO */}
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