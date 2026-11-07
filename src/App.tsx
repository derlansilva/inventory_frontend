import React, { useState, useEffect, useRef } from 'react';
import ReceivingHub from "./components/ReceivingHub";
import StockManager from "./components/StockManager";
import ReturnsModule from './components/returns/ReturnsModule';
import './App.css';
import { 
  PackageCheck, 
  Boxes, 
  RotateCcw, 
  FileText, 
  Search, 
  Bell, 
  User, 
  AlertTriangle,
  BarChart3
} from 'lucide-react';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModule, setActiveModule] = useState('dashboard');
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

  const modules = [
    { id: 'receiving', title: 'Recebimento & NFe', code: 'MIGO / VL32N', desc: 'Entrada de mercadorias, conferência e ajuste manual.', icon: <PackageCheck className="w-6 h-6 text-[#002B49]" />, badge: '3 Pendentes' },
    { id: 'picking', title: 'Separação & Picking', code: 'VL01N', desc: 'Ordens de saída e roteiro de separação no armazém.', icon: <Boxes className="w-6 h-6 text-[#002B49]" />, badge: '12 Em aberto' },
    { id: 'returns', title: 'Devoluções & SAC', code: 'ZMM_RET', desc: 'Tratamento de recusas, avarias, SAC e código SSW.', icon: <RotateCcw className="w-6 h-6 text-amber-600" />, badge: '2 Alertas' },
    { id: 'inventory', title: 'Gestão de Estoque', code: 'MB52 / MMBE', desc: 'Consulta de lotes, validades e endereçamento físico.', icon: <BarChart3 className="w-6 h-6 text-[#002B49]" />, badge: 'Normal' },
  ];

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'receiving': return 'Módulo de Recebimento & Notas Fiscais';
      case 'picking': return 'Módulo de Separação & Picking';
      case 'returns': return 'Gestão de Devoluções & SAC';
      case 'inventory': return 'Gestão de Estoque';
      default: return 'Visão Geral';
    }
  };

  return (
    // TRAVA A TELA PRINCIPAL NO TAMANHO DO MONITOR
    <div className="h-screen w-full bg-slate-100 font-sans text-slate-800 flex flex-col overflow-hidden">
      
      {/* HEADER CORPORATIVO */}
      <header className="bg-[#1E293B] text-white h-14 px-6 flex items-center justify-between shadow-md w-full z-50 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveModule('dashboard')}>
            <span className="bg-[#2563EB] text-white text-xs font-bold px-2 py-1 rounded">WMS</span>
            <span className="font-semibold tracking-wide text-sm">Logistics Cloud</span>
          </div>
        </div>

        {/* BARRA DE PESQUISA */}
        <div className="relative w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            ref={searchInputRef}
            type="text"
            className="w-full bg-[#0F172A] text-white text-sm rounded pl-10 pr-4 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400 border border-slate-700"
            placeholder="Buscar transação (ex: MB52) ou NF..."
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

      {/* CONTEÚDO PRINCIPAL (Ocupa o resto e rola internamente se precisar) */}
      <main className="w-full flex-1 min-h-0 p-4 m-0 overflow-y-auto overflow-x-hidden relative">
        {activeModule === 'dashboard' ? (
          <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
            <div className="mb-8">
              <h4 className="text-2xl font-bold text-slate-800 tracking-tight">Painel de Operações</h4>
              <p className="text-sm text-slate-500 mt-1">Selecione abaixo o processo que deseja gerenciar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
              {modules.map((mod) => (
                <div 
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-slate-200 group-hover:bg-[#2563EB] transition-colors"></div>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg group-hover:bg-blue-50 transition-colors">
                        {mod.icon}
                      </div>
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-semibold tracking-wide">
                        {mod.code}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1.5 group-hover:text-[#2563EB] transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed h-8">
                      {mod.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                      {mod.badge}
                    </span>
                    <span className="text-[#2563EB] font-semibold flex items-center opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      Acessar &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-[#2563EB]" />
                    Notas Fiscais de Entrada Recentes
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                        <th className="py-2.5 px-3 font-semibold rounded-tl-md">NFe #</th>
                        <th className="py-2.5 px-3 font-semibold">Fornecedor</th>
                        <th className="py-2.5 px-3 font-semibold">Status</th>
                        <th className="py-2.5 px-3 font-semibold text-right rounded-tr-md">Itens</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setActiveModule('receiving')}>
                        <td className="py-3 px-3 font-mono font-bold text-[#2563EB]">NF-45892</td>
                        <td className="py-3 px-3 font-medium text-slate-700">EMS Farmacêutica</td>
                        <td className="py-3 px-3"><span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-semibold">Em Conferência</span></td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">120 / 450</td>
                      </tr>
                      <tr className="hover:bg-slate-50 cursor-pointer transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#2563EB]">NF-45893</td>
                        <td className="py-3 px-3 font-medium text-slate-700">Eurofarma Laboratórios</td>
                        <td className="py-3 px-3"><span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">Concluído</span></td>
                        <td className="py-3 px-3 text-right font-mono text-slate-600">80 / 80</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                  Ocorrências Pendentes
                </h3>
                <div className="space-y-3 text-xs">
                  <div onClick={() => setActiveModule('returns')} className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg cursor-pointer hover:bg-red-100 transition-colors">
                    <div className="font-bold text-slate-800">101 - Avaria no Transporte</div>
                    <p className="text-slate-600 mt-1">Pedido #98421 - Cliente recusou caixa amassada.</p>
                  </div>
                  <div onClick={() => setActiveModule('returns')} className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg cursor-pointer hover:bg-amber-100 transition-colors">
                    <div className="font-bold text-slate-800">102 - Produto em Falta na NF</div>
                    <p className="text-slate-600 mt-1">Pedido #98425 - Divergência na conferência de saída.</p>
                  </div>
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
        ) : null}
      </main>
    </div>
  );
}