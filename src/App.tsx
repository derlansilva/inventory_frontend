import React, { useState } from 'react';
import ReceivingHub from "./components/ReceivingHub";
import StockManager from "./components/StockManager";
import ReturnsModule from './components/returns/ReturnsModule';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Breadcrumb from './components/layout/Breadcrumb';
import { Calendar, Box, Search, ArrowRightLeft, PackageCheck, ArrowRight } from 'lucide-react';
import './App.css';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModule, setActiveModule] = useState('dashboard');

  return (
    <div className="h-screen w-full bg-[#F4F6F9] font-sans text-slate-800 flex flex-col overflow-hidden">
      
      {/* HEADER  */}
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        setActiveModule={setActiveModule} 
      />

      {/* BREADCRUMB  */}
      <Breadcrumb 
        activeModule={activeModule} 
        setActiveModule={setActiveModule} 
      />

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR */}
        <Sidebar 
          activeModule={activeModule} 
          setActiveModule={setActiveModule} 
        />

        {/* CONTEÚDO DO DASHBOARD */}
        <main className="flex-1 h-full overflow-y-auto relative bg-[#F4F6F9] p-3 animate-in fade-in duration-300">
          {activeModule === 'dashboard' ? (
            <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-3">
              
              <div className="flex justify-between items-end border-b border-slate-300 pb-2 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">Visão Geral de Operações</h3>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-600 bg-white px-2 py-1 rounded-sm border border-slate-300 shadow-sm">
                  <Calendar className="w-3 h-3 text-[#0A6ED1]" />
                  <span>Hoje, 11 de Nov</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                
                <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-3 h-[220px] flex flex-col">
                  <h3 className="text-[11px] font-bold text-slate-800 mb-1 shrink-0">Top 5 Motivos</h3>
                  
                  <div className="flex-1 flex items-center justify-center relative">
                    <svg viewBox="0 0 42 42" className="w-24 h-24 transform -rotate-90">
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="6"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#0A6ED1" strokeWidth="6" strokeDasharray="40 60" strokeDashoffset="0"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-40"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f59e0b" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="-65"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#8b5cf6" strokeWidth="6" strokeDasharray="10 90" strokeDashoffset="-80"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#ef4444" strokeWidth="6" strokeDasharray="10 90" strokeDashoffset="-90"></circle>
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-slate-800">1.420</span>
                      <span className="text-[8px] text-slate-500 uppercase">Total</span>
                    </div>
                  </div>

                  <div className="mt-1 grid grid-cols-2 gap-x-1 gap-y-0.5 text-[9px] shrink-0">
                    <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-sm bg-[#0A6ED1]"></span> 352 - Falta</div>
                    <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-sm bg-emerald-500"></span> 101 - Avaria</div>
                    <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-sm bg-amber-500"></span> 351 - Perda</div>
                    <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-sm bg-violet-500"></span> 103 - Venc.</div>
                  </div>
                </div>

                <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-3 col-span-2 h-[220px] flex flex-col">
                  <div className="flex justify-between items-center mb-1 shrink-0">
                    <h3 className="text-[11px] font-bold text-slate-800">Volume de Transferências (01 → 05)</h3>
                    <span className="text-[8px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-sm">Últimas 8h</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    {[
                      { label: '08h - 09h', value: 120, max: 250 },
                      { label: '09h - 10h', value: 210, max: 250 },
                      { label: '10h - 11h', value: 85, max: 250 },
                      { label: '11h - 12h', value: 240, max: 250 },
                      { label: '12h - 13h', value: 150, max: 250 },
                      { label: '13h - 14h', value: 180, max: 250 },
                      { label: '14h - 15h', value: 90, max: 250 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center text-[9px]">
                        <div className="w-14 text-slate-500 font-mono">{item.label}</div>
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-sm overflow-hidden flex">
                          <div className="bg-[#0A6ED1] h-full rounded-sm transition-all" style={{ width: `${(item.value / item.max) * 100}%` }}></div>
                        </div>
                        <div className="w-6 text-right font-medium text-slate-700 ml-1">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-3 h-[200px] flex flex-col">
                  <h3 className="text-[11px] font-bold text-slate-800 mb-1 shrink-0">Entradas por Cliente</h3>
                  <div className="flex-1 flex flex-col justify-around py-1">
                    {[
                      { name: 'GAM São José', normal: 85, avaria: 15 },
                      { name: 'GAM Matriz', normal: 70, avaria: 30 },
                      { name: 'Distribuidora ABC', normal: 95, avaria: 5 },
                      { name: 'Farmácias Silva', normal: 60, avaria: 40 },
                    ].map((client, idx) => (
                      <div key={idx} className="text-[9px]">
                        <div className="mb-0.5 text-slate-600 font-medium truncate">{client.name}</div>
                        <div className="flex h-2 rounded-sm overflow-hidden">
                          <div className="bg-[#0A6ED1]" style={{ width: `${client.normal}%` }}></div>
                          <div className="bg-red-500" style={{ width: `${client.avaria}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-3 col-span-2 h-[200px] flex flex-col">
                  <h3 className="text-[11px] font-bold text-slate-800 mb-1 shrink-0">Fluxo Operacional</h3>
                  
                  <div className="flex-1 flex items-center justify-between relative px-2">
                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0"></div>

                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0A6ED1] flex items-center justify-center border border-white shadow-sm">
                        <Box className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-medium text-slate-600">Recebimento</span>
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border border-white shadow-sm">
                        <Search className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-medium text-slate-600">Conferência</span>
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border border-white shadow-sm">
                        <ArrowRightLeft className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-medium text-slate-600">Transf. Estoque</span>
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-white shadow-sm">
                        <PackageCheck className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-medium text-slate-600">Finalizado</span>
                    </div>
                  </div>

                  <div className="mt-1 flex justify-end shrink-0">
                     <button 
                        onClick={() => setActiveModule('returns')}
                        className="text-[9px] font-semibold text-[#0A6ED1] hover:text-[#0854A0] flex items-center gap-1 transition"
                      >
                        Acessar Painel <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                  </div>
                </div>

              </div>

            </div>
          ) : activeModule === 'receiving' ? (
            <ReceivingHub onBack={() => setActiveModule('dashboard')} />
          ) : activeModule === 'returns' ? (
            <ReturnsModule onBack={() => setActiveModule('dashboard')} />
          ) : activeModule === 'inventory' ? (
            <StockManager onBack={() => setActiveModule('dashboard')} />
          ) : (
            <div className="p-8 text-center text-slate-500 font-medium bg-white rounded-xl shadow-sm border border-slate-200">
              Módulo em desenvolvimento ou Aguardando integração
            </div>
          )}
        </main>

      </div>
    </div>
  );
}