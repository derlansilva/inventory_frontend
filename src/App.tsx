import React, { useState, useEffect, useRef } from 'react';
import ReceivingHub from "./components/ReceivingHub";
import StockManager from "./components/StockManager";
import ReturnsModule from './components/returns/ReturnsModule';
import './App.css';
import { 
  PackageCheck, 
  Boxes, 
  RotateCcw, 
  Search, 
  Bell, 
  User, 
  BarChart3,
  LayoutDashboard,
  Menu,
  Settings,
  Box,
  ArrowRight,
  FileSpreadsheet,
  Layers,
  Truck,
  Calendar,
  ArrowRightLeft,
  X
} from 'lucide-react';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'receiving': return 'Recebimento & NFe';
      case 'picking': return 'Separação & Picking';
      case 'returns': return 'Devoluções & SAC';
      case 'inventory': return 'Gestão de Estoque';
      default: return 'Painel Geral & Analytics';
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Home / Dashboard', icon: LayoutDashboard },
    { id: 'receiving', label: 'Recebimento ', icon: PackageCheck },
    { id: 'picking', label: 'Separação ', icon: Boxes },
    { id: 'returns', label: 'Devoluções & SAC ', icon: RotateCcw },
    { id: 'inventory', label: 'Gestão de Estoque', icon: BarChart3 },
    { id: 'expedition', label: 'Expedição & Cargas', icon: Truck },
    { id: 'reports', label: 'Relatórios Gerenciais', icon: FileSpreadsheet },
    { id: 'masterdata', label: 'Dados Mestres', icon: Layers },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(menuSearch.toLowerCase())
  );

  return (
    <div className="h-screen w-full bg-[#F4F6F9] font-sans text-slate-800 flex flex-col overflow-hidden">
      
      {/* HEADER SUPERIOR - SAP FIORI AZUL */}
      <header className="bg-[#354A5F] text-white h-12 px-4 flex items-center justify-between shadow-md w-full z-50 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveModule('dashboard')}>
            <span className="bg-white text-[#354A5F] text-xs font-bold px-1.5 py-0.5 rounded-sm">WMS</span>
            <span className="font-semibold tracking-wide text-sm">Logistics Cloud</span>
          </div>
        </div>

                {/* BARRA DE PESQUISA GLOBAL */}
        <div className="relative w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-300">
            <Search className="w-4 h-4" />
          </span>
          <input
            ref={searchInputRef}
            type="text"
            className="w-full bg-[#2A3A4A] text-white text-sm rounded-sm pl-10 pr-14 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-slate-400 border border-[#42586D] transition-colors hover:border-slate-400"
            placeholder="Buscar transação (ex: MB52, ZMM_RET) ou NF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[10px] text-slate-400 font-mono">
            Ctrl + K
          </span>
        </div>

        {/* PERFIL */}
        <div className="flex items-center space-x-5 text-slate-200">
          <button className="relative hover:text-white transition">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">2</span>
          </button>
          <div className="flex items-center space-x-2 border-l border-[#5C6F82] pl-4 cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-[#0A6ED1] flex items-center justify-center text-white font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-white">Operador Logística</span>
          </div>
        </div>
      </header>

      {/* BREADCRUMB - TOM DE AZUL MAIS CLARO (SAP) */}
      <div className="bg-[#42586D] text-slate-200 px-4 py-1.5 flex items-center justify-between text-xs shadow-sm border-b border-[#354A5F] shrink-0">
        <div className="flex items-center space-x-2">
          <span className="hover:text-white cursor-pointer transition" onClick={() => setActiveModule('dashboard')}>Home</span>
          <span className="text-slate-400">&gt;</span>
          <span className="font-semibold text-white">{getModuleTitle()}</span>
        </div>
        <div className="text-[#91C8F2] font-mono text-[10px] flex items-center gap-1.5 bg-[#354A5F] px-2 py-0.5 rounded-sm border border-[#5C6F82]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          PROD-SIMULATOR 
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR - SAP AZUL ESCURO */}
        <aside 
          className={`${
            isSidebarExpanded ? 'w-60' : 'w-12'
          } bg-[#354A5F] text-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out relative z-40 shrink-0 border-r border-[#2A3A4A] select-none`}
        >
          <div className="flex flex-col h-full">
            
            {/* BOTÃO DE MENU */}
            <div className={`h-10 flex items-center border-b border-[#2A3A4A] shrink-0 px-2 ${isSidebarExpanded ? 'justify-end' : 'justify-center'}`}>
              <button 
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="text-slate-300 hover:text-white hover:bg-[#2A3A4A] p-1.5 rounded transition cursor-pointer"
                title={isSidebarExpanded ? "Fechar Menu" : "Abrir Menu"}
              >
                {isSidebarExpanded ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

            {/* BARRA DE PESQUISA DO MENU */}
            {isSidebarExpanded && (
              <div className="p-2 border-b border-[#2A3A4A] animate-in fade-in duration-200">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Pesquisar menu..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="w-full bg-[#2A3A4A] text-white text-xs rounded-sm pl-8 pr-3 py-1.5 border border-[#42586D] focus:outline-none focus:border-blue-400 placeholder-slate-400"
                  />
                </div>
              </div>
            )}

            <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-1">
              {filteredMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeModule === item.id;

                return (
                  <div key={item.id} className="relative group flex items-center">
                    <button
                      onClick={() => setActiveModule(item.id)}
                      className={`w-full h-8 flex items-center ${
                        isSidebarExpanded ? 'px-3 justify-start space-x-2.5' : 'justify-center'
                      } rounded-sm text-xs font-medium transition-all ${
                        isActive 
                          ? 'bg-[#2A3A4A] text-white shadow-inner font-semibold border-l-2 border-[#0A6ED1]' 
                          : 'text-slate-300 hover:bg-[#2A3A4A] hover:text-white border-l-2 border-transparent'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0A6ED1]' : ''}`} />
                      {isSidebarExpanded && (
                        <span className="truncate whitespace-nowrap">{item.label}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* RODAPÉ DA SIDEBAR */}
          <div className="p-1 border-t border-[#2A3A4A]">
            <div className="relative group flex items-center">
              <button 
                className={`w-full h-8 flex items-center ${
                  isSidebarExpanded ? 'px-3 justify-start space-x-2.5' : 'justify-center'
                } rounded-sm text-xs font-medium text-slate-300 hover:bg-[#2A3A4A] hover:text-white transition`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                {isSidebarExpanded && <span className="truncate">Configurações</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* CONTEÚDO DO DASHBOARD */}
        <main className="flex-1 min-h-0 overflow-y-auto relative bg-[#F4F6F9] p-4 animate-in fade-in duration-300">
          {activeModule === 'dashboard' ? (
            <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-4">
              
              {/* HEADER DA PÁGINA */}
              <div className="flex justify-between items-end border-b border-slate-300 pb-2">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800 tracking-tight">Visão Geral de Operações</h3>
    
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-sm border border-slate-300 shadow-sm">
                  <Calendar className="w-3.5 h-3.5 text-[#0A6ED1]" />
                  <span>Hoje, 11 de Nov</span>
                </div>
              </div>

              {/* GRID DE GRÁFICOS - LINHA 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* GRÁFICO DE PIZZA (DONUT) */}
                <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-4 col-span-1 flex flex-col">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Top 5 Motivos de Devolução</h3>
                  
                  <div className="flex-1 flex items-center justify-center relative">
                    <svg viewBox="0 0 42 42" className="w-48 h-48 transform -rotate-90">
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="6"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#0A6ED1" strokeWidth="6" strokeDasharray="40 60" strokeDashoffset="0"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-40"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f59e0b" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="-65"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#8b5cf6" strokeWidth="6" strokeDasharray="10 90" strokeDashoffset="-80"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#ef4444" strokeWidth="6" strokeDasharray="10 90" strokeDashoffset="-90"></circle>
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-slate-800">1.420</span>
                      <span className="text-[10px] text-slate-500 uppercase">Total</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4 text-[11px]">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#0A6ED1]"></span> 352 - Falta</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> 101 - Avaria Transp.</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> 351 - Perda</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-violet-500"></span> 103 - Vencimento</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span> Outros</div>
                  </div>
                </div>

                {/* GRÁFICO DE BARRAS HORIZONTAIS */}
                <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-4 col-span-2 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-slate-800">Volume de Transferências (01 → 05)</h3>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm">Últimas 8h</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-around space-y-3">
                    {[
                      { label: '08:00 - 09:00', value: 120, max: 250, color: 'bg-[#0A6ED1]' },
                      { label: '09:00 - 10:00', value: 210, max: 250, color: 'bg-[#0A6ED1]' },
                      { label: '10:00 - 11:00', value: 85, max: 250, color: 'bg-[#0A6ED1]' },
                      { label: '11:00 - 12:00', value: 240, max: 250, color: 'bg-[#0A6ED1]' },
                      { label: '12:00 - 13:00', value: 150, max: 250, color: 'bg-[#0A6ED1]' },
                      { label: '13:00 - 14:00', value: 180, max: 250, color: 'bg-[#0A6ED1]' },
                      { label: '14:00 - 15:00', value: 90, max: 250, color: 'bg-[#0A6ED1]' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center text-[11px]">
                        <div className="w-28 text-slate-500 font-mono">{item.label}</div>
                        <div className="flex-1 h-4 bg-slate-100 rounded-sm overflow-hidden flex">
                          <div 
                            className={`${item.color} h-full rounded-sm transition-all duration-500 hover:opacity-80`}
                            style={{ width: `${(item.value / item.max) * 100}%` }}
                          ></div>
                        </div>
                        <div className="w-12 text-right font-medium text-slate-700">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* GRID DE GRÁFICOS - LINHA 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* BARRAS HORIZONTAIS AGRUPADAS */}
                <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Entradas por Cliente (Top 4)</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'GAM São José', normal: 85, avaria: 15 },
                      { name: 'GAM Matriz', normal: 70, avaria: 30 },
                      { name: 'Distribuidora ABC', normal: 95, avaria: 5 },
                      { name: 'Farmácias Silva', normal: 60, avaria: 40 },
                    ].map((client, idx) => (
                      <div key={idx} className="text-[11px]">
                        <div className="mb-1 text-slate-600 font-medium">{client.name}</div>
                        <div className="flex h-3 rounded-sm overflow-hidden">
                          <div className="bg-[#0A6ED1] hover:opacity-80 transition-all" style={{ width: `${client.normal}%` }} title="Boa"></div>
                          <div className="bg-red-500 hover:opacity-80 transition-all" style={{ width: `${client.avaria}%` }} title="Avaria"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-4 text-[10px] text-slate-500">
                     <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[#0A6ED1]"></span> Mercadoria Boa</div>
                     <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-red-500"></span> Avaria</div>
                  </div>
                </div>

                {/* PROCESSO FLOW */}
                <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-4 flex flex-col justify-between">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Fluxo Operacional WMS</h3>
                  
                  <div className="flex items-center justify-between text-center relative px-4">
                    <div className="absolute top-5 left-10 right-10 h-0.5 bg-slate-200 z-0"></div>

                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0A6ED1] flex items-center justify-center border-2 border-white shadow-sm">
                        <Box className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-600">Recebimento</span>
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center border-2 border-white shadow-sm">
                        <Search className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-600">Conferência</span>
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center border-2 border-white shadow-sm">
                        <ArrowRightLeft className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-600">Transf. Estoque</span>
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-2 border-white shadow-sm">
                        <PackageCheck className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-600">Finalizado</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                     <button 
                        onClick={() => setActiveModule('returns')}
                        className="text-xs font-semibold text-[#0A6ED1] hover:text-[#0854A0] flex items-center gap-1 transition"
                      >
                        Acessar Painel de Devoluções <ArrowRight className="w-3.5 h-3.5" />
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