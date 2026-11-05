import React, { useState } from 'react';
import { ArrowLeft, FilePlus, SearchCheck, ArrowRight } from 'lucide-react';

import ReceivingManifest from './ReceivingManifest';
import ReceivingManager from './ReceivingManager';

export default function ReceivingHub({ onBack }: { onBack: () => void }) {
  const [receivingView, setReceivingView] = useState<'menu' | 'create' | 'consult'>('menu');

  return (
    <div className="w-full font-sans text-gray-800 pb-12 px-8">
      
      {/* ---------------------------------------------------- */}
      {/* 1. MENU PRINCIPAL                                    */}
      {/* ---------------------------------------------------- */}
      {receivingView === 'menu' && (
        <div className="space-y-6 w-full pt-4">
          
          {/* BARRA SUPERIOR SEM BORDA, LARGURA TOTAL (WIDTH 100%) */}
          <div className="flex items-center justify-between w-full pb-3 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <button 
                onClick={onBack} 
                className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                title="Voltar"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h5 className="text-xs font-bold text-gray-900 tracking-wide uppercase">
                Módulo de Recebimento & Notas Fiscais
              </h5>
            </div>

            <span className="font-mono text-[10px] bg-blue-50 text-sap-primary px-2.5 py-1 rounded font-bold border border-blue-100">
              Transação: MIGO / VL32N
            </span>
          </div>

          {/* CARDS CENTRALIZADOS */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Opção 1: Criar Manifesto */}
            <div 
              onClick={() => setReceivingView('create')}
              className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-sap-primary transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-sap-primary group-hover:bg-blue-700 transition"></div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-blue-50 text-sap-primary rounded-lg">
                    <FilePlus className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">ETAPA 01</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5 group-hover:text-sap-primary transition">
                  Criar Manifesto de Recebimento
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Importe o ficheiro XML da NFe enviada pela fornecedora, configure unidades e gere ordens de conferência para as coletoras Android.
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-sap-primary">
                <span>Acessar Assistente</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>

            {/* Opção 2: Consultar Manifesto */}
            <div 
              onClick={() => setReceivingView('consult')}
              className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-amber-600 transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 group-hover:bg-amber-600 transition"></div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
                    <SearchCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">ETAPA 02</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5 group-hover:text-amber-700 transition">
                  Consultar & Gerenciar Manifestos
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Consulte manifestos ativos, analise o histórico de auditoria (quem gerou e quem conferiu), registe ocorrências por número ou cancele registos.
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-amber-700">
                <span>Acessar Central</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>

          </div>
        </div>
      )}

      {receivingView === 'create' && (
        <ReceivingManifest 
          onBack={() => setReceivingView('menu')} 
        />
      )}

      {receivingView === 'consult' && (
        <ReceivingManager 
          onBack={() => setReceivingView('menu')} 
        />
      )}

    </div>
  );
}