import React, { useState } from 'react';
import CentralSac from './CentralSac';
import ReturnsEntry from './ReturnsEntry';
import { Headphones, PackagePlus, ArrowLeft } from 'lucide-react';

interface ReturnsModuleProps {
  onBack: () => void;
}

export default function ReturnsModule({ onBack }: ReturnsModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'lancamento' | 'sac'>('lancamento');

  return (
    <div className="w-full font-sans rounded shadow-md overflow-hidden bg-white relative z-20 mt-0 ">
      
      {/* HEADER TOP COMPACTO */}
      <div className="bg-[ #f5f6f7] text-[#f5f6f7]  px-3 py-1.5 flex items-center justify-between text-xs">
        
        {/* Lado Esquerdo: Botão Voltar, Transação e Título */}
        <div className="flex items-center space-x-2.5">
          <button 
            onClick={onBack} 
            className="hover:  bg-[#1E4D6B] text-[#f5f6f7] p-1 rounded text-gray-300 hover:text-[#354a5f] transition cursor-pointer"
            title="Voltar ao Início"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-white bg-[#1E4D6B] text-[#f5f6f7]" />
          </button>
          
          <span className="bg-[#1E4D6B] text-[#f5f6f7] px-1.5 py-0.5 rounded font-mono font-bold text-[10px] tracking-wider text-white border border-blue-800">
            ZMM_RET
          </span>

          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs tracking-wide uppercase" style={{ color: '#354a5f', WebkitTextFillColor: '#354a5f' }}>
              Gestão de Devoluções & SAC
            </span>
            <span className="text-[10px] hidden md:inline font-normal border-l border-blue-800 pl-2" style={{ color: '#354a5f' }}>
              Tratamento de recusas, avarias e central de chamados
            </span>
          </div>
        </div>

        {/* Lado Direito: Abas Corporativas da Barra Superior */}
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setActiveSubTab('lancamento')}
            className={`px-3 py-1 rounded font-semibold text-[11px] transition cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'lancamento' 
                ? 'bg-white text-[#002B49] font-bold shadow-xs' 
                : 'bg-[#1E4D6B] hover:bg-blue-900 text-white'
            }`}
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Lançamento de Devoluções</span>
          </button>

          <button 
            onClick={() => setActiveSubTab('sac')}
            className={`px-3 py-1 rounded font-semibold text-[11px] transition cursor-pointer border-gray-300 flex items-center space-x-1.5 ${
              activeSubTab === 'sac' 
                ? 'bg-white text-[#002B49] font-bold shadow-xs' 
                : 'bg-[#1E4D6B] hover:bg-blue-900 text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Central SAC & Histórico</span>
          </button>
        </div>

      </div>

      {/* CONTEÚDO DO MÓDULO */}
      <div className="w-full bg-[#354a5f]  " >
        {activeSubTab === 'lancamento' && <ReturnsEntry />}
        {activeSubTab === 'sac' && <CentralSac />}
      </div>

    </div>
  );
}