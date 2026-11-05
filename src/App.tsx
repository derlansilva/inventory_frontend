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
  ChevronRight, 
  AlertTriangle,
  BarChart3,
  Smartphone
} from 'lucide-react';
import CollectorSimulator from './components/CollectorSimulator';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModule, setActiveModule] = useState('dashboard');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Listener global para o atalho Ctrl + K
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
    { id: 'receiving', title: 'Recebimento & NFe', code: 'MIGO / VL32N', desc: 'Entrada de mercadorias, conferência e ajuste manual.', icon: <PackageCheck className="w-8 h-8 text-sap-primary" />, badge: '3 Pendentes' },
    { id: 'picking', title: 'Separação & Picking', code: 'VL01N', desc: 'Ordens de saída e roteiro de separação no armazém.', icon: <Boxes className="w-8 h-8 text-sap-primary" />, badge: '12 Em aberto' },
    { id: 'returns', title: 'Devoluções & SAC', code: 'ZMM_RET', desc: 'Tratamento de recusas, avarias, SAC e código SSW.', icon: <RotateCcw className="w-8 h-8 text-amber-600" />, badge: '2 Alertas' },
    { id: 'inventory', title: 'Gestão de Estoque', code: 'MB52 / MMBE', desc: 'Consulta de lotes, validades e endereçamento físico.', icon: <BarChart3 className="w-8 h-8 text-sap-primary" />, badge: 'Normal' },
    // NOVO MÓDULO DA COLETORA ADICIONADO AQUI
    { id: 'coletora', title: 'App Coletora (Zebra)', code: 'RF-GUN', desc: 'Interface otimizada para leitura de bipagem e conferência móvel.', icon: <Smartphone className="w-8 h-8 text-emerald-600" />, badge: 'Dispositivo' },
  ];

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'receiving': return 'Módulo de Recebimento & Notas Fiscais';
      case 'picking': return 'Módulo de Separação & Picking';
      case 'returns': return 'Gestão de Devoluções & SAC';
      case 'inventory': return 'Gestão de Estoque';
      case 'coletora': return 'Simulador / Módulo Coletora (Zebra)';
      default: return 'Visão Geral';
    }
  };

  return (
    <div className="min-h-screen w-full bg-sap-bg font-sans text-sap-text flex flex-col">
      
      {/* HEADER CORPORATIVO */}
      <header className="bg-sap-header text-white h-14 px-6 flex items-center justify-between shadow-md w-full">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveModule('dashboard')}>
            <span className="bg-sap-primary text-white text-xs font-bold px-2 py-1 rounded">WMS</span>
            <span className="font-semibold tracking-wide text-sm">Logistics Cloud</span>
          </div>
        </div>

        {/* BARRA DE PESQUISA RÁPIDA COM REF */}
        <div className="relative w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            ref={searchInputRef}
            type="text"
            className="w-full bg-[#263544] text-white text-sm rounded pl-10 pr-4 py-1.5 focus:outline-none focus:ring-1 focus:ring-sap-primary placeholder-gray-400"
            placeholder="Buscar transação (ex: MB52) ou NF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs text-gray-400">
            Ctrl + K
          </span>
        </div>

        {/* PERFIL */}
        <div className="flex items-center space-x-5 text-gray-300">
          <button className="relative hover:text-white transition">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">2</span>
          </button>
          <div className="flex items-center space-x-2 border-l border-gray-600 pl-4 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-sap-primary flex items-center justify-center text-white font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-white">Operador Logística</span>
          </div>
        </div>
      </header>

      {/* Barra de Breadcrumb / Navegação Superior Dinâmica */}
      <div className="bg-[#354a5f] text-white px-4 py-2 flex items-center justify-between text-xs shadow-xs border-b border-blue-950">
        <div className="flex items-center space-x-2 text-gray-200">
          <span className="hover:underline cursor-pointer text-gray-300" onClick={() => setActiveModule('dashboard')}>Home</span>
          <span className="text-gray-400">&gt;</span>
          <span className="font-semibold text-white">{getModuleTitle()}</span>
        </div>
        <div className="text-emerald-400 font-mono text-[11px]">
          Ambiente: PROD-SIMULATOR
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL COM LARGURA FLUIDA (TOTAL) */}
      <main className="w-full p-4 m-0 overflow-x-hidden flex-1">
        {activeModule === 'dashboard' ? (
          <div className="w-full">
            <div className="mb-6">
              <h4 className="text-2xl font-bold text-gray-800">Painel de Operações</h4>
              <p className="text-sm text-gray-500">Selecione abaixo o processo que deseja gerenciar ou iniciar.</p>
            </div>

            {/* GRID DE MÓDULOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 w-full">
              {modules.map((mod) => (
                <div 
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-sap-primary group-hover:bg-blue-700 transition"></div>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-50 rounded-lg">{mod.icon}</div>
                      <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold">{mod.code}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-base mb-1 group-hover:text-sap-primary transition">{mod.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{mod.desc}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">{mod.badge}</span>
                    <span className="text-gray-400 group-hover:translate-x-1 transition font-medium">Acessar &rarr;</span>
                  </div>
                </div>
              ))}
            </div>

            {/* SEÇÃO INFERIOR */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
              <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-sap-primary" />
                  Notas Fiscais de Entrada Recentes (Recebimento)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500 bg-gray-50">
                        <th className="py-2.5 px-3 font-semibold">NFe #</th>
                        <th className="py-2.5 px-3 font-semibold">Fornecedor</th>
                        <th className="py-2.5 px-3 font-semibold">Status</th>
                        <th className="py-2.5 px-3 font-semibold">Itens</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setActiveModule('receiving')}>
                        <td className="py-3 px-3 font-mono font-medium text-blue-600">NF-45892</td>
                        <td className="py-3 px-3">EMS Farmacêutica</td>
                        <td className="py-3 px-3"><span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">Em Conferência</span></td>
                        <td className="py-3 px-3">120 / 450</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-3 px-3 font-mono font-medium">NF-45893</td>
                        <td className="py-3 px-3">Eurofarma Laboratórios</td>
                        <td className="py-3 px-3"><span className="bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">Concluído</span></td>
                        <td className="py-3 px-3">80 / 80</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CARD DE OCORRÊNCIAS */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center text-amber-700">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Ocorrências Pendentes (SSW)
                </h3>
                <div className="space-y-3 text-xs">
                  <div 
                    onClick={() => setActiveModule('returns')}
                    className="p-3 bg-amber-50 border-l-2 border-amber-500 rounded cursor-pointer hover:bg-amber-100 transition"
                  >
                    <div className="font-bold text-gray-800">101 - Avaria no Transporte</div>
                    <p className="text-gray-600 mt-0.5">Pedido #98421 - Cliente recusou caixa amassada.</p>
                  </div>
                  <div 
                    onClick={() => setActiveModule('returns')}
                    className="p-3 bg-red-50 border-l-2 border-red-500 rounded cursor-pointer hover:bg-red-100 transition"
                  >
                    <div className="font-bold text-gray-800">102 - Produto em Falta na NF</div>
                    <p className="text-gray-600 mt-0.5">Pedido #98425 - Divergência na conferência de saída.</p>
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
        ) : activeModule === 'coletora' ? (
         <CollectorSimulator  />
        ) : null}
      </main>

    </div>
  );
}