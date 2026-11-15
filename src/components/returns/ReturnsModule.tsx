import React, { useState, useRef, useEffect } from 'react';
import CentralSac from './CentralSac';
import ReturnsEntry from './ReturnsEntry';
import PendingManifests from './PendingManifests';
import { Headphones, PackagePlus, ArrowLeft, UploadCloud, ChevronDown, Box } from 'lucide-react';

interface ReturnsModuleProps {
  onBack: () => void;
}

type SubTab = 'lancamento' | 'recebimento' | 'sac';

export default function ReturnsModule({ onBack }: ReturnsModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('lancamento');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o menu se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mapeamento das opções para não precisar repetir código
  const menuOptions = [
    { id: 'lancamento', label: 'Lançamento de Devoluções', icon: PackagePlus },
    { id: 'recebimento', label: 'Recebimento Cego (XMLs)', icon: UploadCloud },
    { id: 'sac', label: 'Central SAC & Histórico', icon: Headphones },
  ];

  const ActiveIcon = menuOptions.find(o => o.id === activeSubTab)?.icon || Box;
  const activeLabel = menuOptions.find(o => o.id === activeSubTab)?.label;

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

        {/* Lado Direito: Menu Dropdown Customizado */}
        <div className="relative" ref={dropdownRef}>
          
          {/* BOTÃO PRINCIPAL */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-2 bg-[#002B49] text-white px-3 py-1.5 rounded-md border border-[#002B49] shadow-sm hover:bg-[#003d66] transition-all"
          >
            <ActiveIcon className="w-4 h-4 text-blue-300" />
            <span className="font-bold text-[11px]">{activeLabel}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-blue-300 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* DROPDOWN FLUTUANTE */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-60 bg-white rounded-md shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="py-1">
                {menuOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = activeSubTab === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        setActiveSubTab(option.id as SubTab);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-[#002B49] font-bold border-l-4 border-[#002B49]' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-4 border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#002B49]' : 'text-slate-400'}`} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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