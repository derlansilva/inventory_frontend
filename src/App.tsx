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
  ChevronLeft,
  Settings,
  CheckCircle2,
  Box,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Activity,
  Layers,
  FileSpreadsheet,
  Truck
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
    { id: 'receiving', label: 'Recebimento (MIGO)', icon: PackageCheck },
    { id: 'picking', label: 'Separação (VL01N)', icon: Boxes },
    { id: 'returns', label: 'Devoluções & SAC (ZMM_RET)', icon: RotateCcw, isAmber: true },
    { id: 'inventory', label: 'Gestão de Estoque (MB52)', icon: BarChart3 },
    { id: 'expedition', label: 'Expedição & Cargas', icon: Truck },
    { id: 'reports', label: 'Relatórios Gerenciais', icon: FileSpreadsheet },
    { id: 'masterdata', label: 'Dados Mestres', icon: Layers },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(menuSearch.toLowerCase())
  );

  return (
    <div className="h-screen w-full bg-slate-100 font-sans text-slate-800 flex flex-col overflow-hidden">
      
      {/* HEADER SUPERIOR */}
      <header className="bg-[#1E293B] text-white h-14 px-4 flex items-center justify-between shadow-md w-full z-50 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveModule('dashboard')}>
            <span className="bg-[#2563EB] text-white text-xs font-bold px-2 py-1 rounded">WMS</span>
            <span className="font-semibold tracking-wide text-sm">Logistics Cloud</span>
          </div>
        </div>

        {/* BARRA DE PESQUISA GLOBAL */}
        <div className="relative w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            ref={searchInputRef}
            type="text"
            className="w-full bg-[#0F172A] text-white text-sm rounded pl-10 pr-4 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400 border border-slate-700"
            placeholder="Buscar transação (ex: MB52, ZMM_RET) ou NF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs text-slate-500 font-mono">
            Ctrl + K
          </span>
        </div>

        {/* PERFIL */}
        <div className="flex items-center space-x-5 text-slate-300">
          <button className="relative hover:text-white transition">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">2</span>
          </button>
          <div className="flex items-center space-x-2 border-l border-slate-600 pl-4 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-white">Operador Logística</span>
          </div>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="bg-[#334155] text-white px-6 py-2 flex items-center justify-between text-xs shadow-sm border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-2 text-slate-300">
          <span className="hover:text-white cursor-pointer transition" onClick={() => setActiveModule('dashboard')}>Home</span>
          <span className="text-slate-500">&gt;</span>
          <span className="font-semibold text-white">{getModuleTitle()}</span>
        </div>
        <div className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Ambiente: PROD-SIMULATOR 
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR SEM BORDAS AZUIS E COM SELEÇÃO LIMPA */}
        <aside 
          className={`${
            isSidebarExpanded ? 'w-60' : 'w-10'
          } bg-[#1E293B] text-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out relative z-40 shrink-0 border-r border-slate-700 select-none`}
        >
          <div className="flex flex-col h-full">
            
            {/* BOTÃO HAMBURGUER */}
            <div className="h-10 flex items-center justify-center border-b border-slate-700/60 shrink-0">
              <button 
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded transition cursor-pointer"
                title={isSidebarExpanded ? "Recolher Menu" : "Expandir Menu"}
              >
                {isSidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

            {/* BARRA DE PESQUISA DO MENU */}
            {isSidebarExpanded && (
              <div className="p-2 border-b border-slate-700/60 animate-in fade-in duration-200">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Pesquisar menu..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="w-full bg-[#0F172A] text-white text-xs rounded pl-8 pr-3 py-1.5 border border-slate-700 focus:outline-none focus:border-blue-500 placeholder-slate-400"
                  />
                </div>
              </div>
            )}

            {/* ITENS DE NAVEGAÇÃO SEM BORDA AZUL */}
            <nav className="flex-1 overflow-y-auto py-2 space-y-1 px-1">
              {filteredMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeModule === item.id;

                return (
                  <div key={item.id} className="relative group flex items-center">
                    <button
                      onClick={() => setActiveModule(item.id)}
                      className={`w-full h-9 flex items-center ${
                        isSidebarExpanded ? 'px-3 justify-start space-x-2.5' : 'justify-center'
                      } rounded text-xs font-medium transition-all ${
                        isActive 
                          ? 'bg-[#0F172A] text-white shadow-sm font-semibold' 
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 shrink-0 ${
                        item.isAmber && !isActive ? 'text-amber-400' : ''
                      }`} />

                      {isSidebarExpanded && (
                        <span className="truncate whitespace-nowrap">{item.label}</span>
                      )}
                    </button>

                    {!isSidebarExpanded && (
                      <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#0F172A] text-white text-xs font-medium rounded shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-700">
                        {item.label}
                        <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-[#0F172A]"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* RODAPÉ DO MENU */}
          <div className="p-1 border-t border-slate-700/60">
            <div className="relative group flex items-center">
              <button 
                className={`w-full h-9 flex items-center ${
                  isSidebarExpanded ? 'px-3 justify-start space-x-2.5' : 'justify-center'
                } rounded text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                {isSidebarExpanded && <span className="truncate">Configurações</span>}
              </button>

              {!isSidebarExpanded && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#0F172A] text-white text-xs font-medium rounded shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-700">
                  Configurações
                  <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-[#0F172A]"></div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ÁREA DE CONTEÚDO PRINCIPAL COM ANIMAÇÃO DE FADE-IN */}
        <main className="flex-1 min-h-0 overflow-y-auto relative bg-[#F4F6F9] p-5 animate-in fade-in duration-300">
          {activeModule === 'dashboard' ? (
            <div className="w-full max-w-[1600px] mx-auto space-y-5">
              
              {/* TOPO: TÍTULO E ATALHOS RÁPIDOS */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Analytics Cloud | Painel de Controle de Devoluções & Avarias
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Monitoramento em tempo real do fluxo logístico de devoluções e perdas de estoque.</p>
                </div>

            
              </div>

              {/* CARDS DE KPI */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <Box className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Romaneios do Dia</p>
                    <h3 className="text-2xl font-bold text-slate-800">238</h3>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Transferidos (01 → 05)</p>
                    <h3 className="text-2xl font-bold text-slate-800">1.420 un</h3>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Avarias Registradas</p>
                    <h3 className="text-2xl font-bold text-amber-600">14</h3>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Perdas / Descarte</p>
                    <h3 className="text-2xl font-bold text-red-600">3 un</h3>
                  </div>
                </div>
              </div>

              {/* GRÁFICOS ANALYTICS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* GRÁFICO 1 */}
                <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      Fluxo de Transferência Atômica (01-DISPONIVEL → 05-DEVOLUCAO)
                    </h3>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">Últimas 12 Horas</span>
                  </div>
                  
                  <div className="h-64 w-full bg-slate-50/50 rounded-lg border border-slate-100 p-4 flex items-end justify-between gap-2">
                    {[45, 80, 30, 95, 110, 60, 75, 130, 85, 90, 140, 95].map((val, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                        <div className="w-full flex gap-1 items-end justify-center h-full">
                          <div 
                            style={{ height: `${val * 1.3}px` }} 
                            className="w-1/2 bg-blue-600 group-hover:bg-blue-700 rounded-t transition-all"
                            title={`Entrada 05-DEVOLUCAO: ${val}`}
                          ></div>
                          <div 
                            style={{ height: `${(val * 0.8)}px` }} 
                            className="w-1/2 bg-slate-300 group-hover:bg-slate-400 rounded-t transition-all"
                            title={`Baixa 01-DISPONIVEL: ${Math.round(val * 0.8)}`}
                          ></div>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 mt-1">{idx + 1}h</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-4 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-600 rounded-sm"></span>
                      <span>Entrada (05-DEVOLUCAO)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-slate-300 rounded-sm"></span>
                      <span>Baixa (01-DISPONIVEL)</span>
                    </div>
                  </div>
                </div>

                {/* GRÁFICO 2 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Distribuição de Avarias & Perdas
                    </h3>
                    
                    <div className="space-y-4 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-600">101 - Avaria de Transporte</span>
                          <span className="font-bold text-slate-800">58%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full w-[58%]"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-600">102 - Pedido em Duplicidade</span>
                          <span className="font-bold text-slate-800">24%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full w-[24%]"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-600">103 - Validade Próxima (FEFO)</span>
                          <span className="font-bold text-slate-800">12%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full w-[12%]"></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-slate-600">104 - Perda / Descarte Total</span>
                          <span className="font-bold text-red-600">6%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-red-500 h-full w-[6%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveModule('returns')}
                    className="w-full mt-6 py-2 bg-slate-50 hover:bg-slate-100 text-blue-600 font-semibold text-xs rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Gerenciar Romaneios e Avarias</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
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
              Módulo em desenvolvimento ou integrado ao S/4HANA.
            </div>
          )}
        </main>

      </div>
    </div>
  );
}