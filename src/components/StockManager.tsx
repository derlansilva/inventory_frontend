import React, { useState, useEffect } from 'react';
import { Search, Printer, X, CheckCircle2, History, FileText } from 'lucide-react';

export default function StockManager({ onBack }: { onBack: () => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [item, setItem] = useState<any>(null);
  
  // Apenas 3 abas: geral, vendas e transferencias
  const [activeTab, setActiveTab] = useState<'geral' | 'vendas' | 'transferencias'>('geral');

  // --- ESTADOS DO MODAL F2 ---
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferOrigin, setTransferOrigin] = useState('01');
  const [transferDestination, setTransferDestination] = useState('');
  const [transferQuantity, setTransferQuantity] = useState<number | ''>('');

  const mockItem = {
    materialCode: '124546',
    description: 'COLETOR LOGOTIPADO UNIVERSAL ESTERIL 80 ML',
    category: 'MATERIAL HOSPITALAR',
    value: 1.70,
    barcode: '7898108641507',
  };

  const mockSalesHistory = [
    { date: '15/11/2026', nf: '8218174', client: 'ATEFARMA COM MED LTDA', qty: 2 },
    { date: '14/11/2026', nf: '8117440', client: 'DROGARIA SAO PAULO S/A', qty: 10 },
    { date: '10/11/2026', nf: '8204790', client: 'FARMACIAS NIPON S/A', qty: 5 },
  ];

  const mockTransferHistory = [
    { date: '18/11/2026 14:30', origin: '01 - DISPONÍVEL', destination: '03 - AVARIA', qty: 2, user: 'KETELIN' },
    { date: '17/11/2026 09:15', origin: '07 - SÃO JOSÉ', destination: '01 - MATRIZ', qty: 15, user: 'OPERADOR' },
    { date: '16/11/2026 16:45', origin: '01 - DISPONÍVEL', destination: '04 - PERDA', qty: 1, user: 'KETELIN' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setTimeout(() => setItem(mockItem), 300);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2' && item) {
        e.preventDefault();
        setIsTransferModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item]);

  return (
    <div className="bg-[#E9ECEF] w-full h-full p-2 font-sans text-xs text-slate-800 flex flex-col overflow-hidden">
      
      {/* CONTAINER PRINCIPAL LARGO (Ocupando quase 100% da largura com um respiro mínimo nas laterais) */}
      <div className="bg-white w-[90%] mx-auto flex-1 flex flex-col min-h-0 border border-gray-400 shadow-sm overflow-hidden rounded-none">
        
        {/* BARRA DE TÍTULO */}
        <div className="bg-[#3b6ea5] text-white px-2 py-1 flex items-center justify-between shrink-0 border-b border-gray-500">
          <div className="flex items-center space-x-2">
            <span className="bg-white text-[#3b6ea5] font-mono font-bold px-1.5 py-0.5 rounded-sm text-[9px]">001</span>
            <span className="font-bold text-[11px] tracking-wide">Dados do Cadastro do Item</span>
          </div>
          <div className="text-[10px] font-mono text-white/80">PROD-SIMULATOR</div>
        </div>

        {/* ÁREA DE PESQUISA E DASHBOARD */}
        <div className="flex border-b border-gray-400 shrink-0 bg-[#F0F0F0]">
          <div className="w-[60%] p-1.5 border-r border-gray-300 space-y-1">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <label className="w-16 text-right text-gray-600 font-medium text-[10px]">Código:</label>
              <div className="relative w-40">
                <Search className="w-3 h-3 text-gray-400 absolute left-1 top-1.5" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SKU..." 
                  className="w-full bg-white border border-gray-400 rounded-sm pl-6 pr-1 h-5 font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
              <button type="submit" className="bg-[#e4e4e4] border border-gray-400 rounded-sm px-2 text-[10px] font-medium text-gray-700 hover:bg-[#d4d4d4] transition h-5 flex items-center gap-1">
                <Search className="w-3 h-3" /> Buscar
              </button>
            </form>

            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-2">
                <label className="w-16 text-right text-gray-600 font-medium">Descrição:</label>
                <input type="text" value={item ? item.description : ''} readOnly className="flex-1 bg-white border border-gray-400 rounded-sm px-1 h-5 text-gray-800" placeholder="Aguardando consulta..." />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-16 text-right text-gray-600 font-medium">Categoria:</label>
                <input type="text" value={item ? item.category : ''} readOnly className="flex-1 bg-white border border-gray-400 rounded-sm px-1 h-5 text-gray-800" />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-16 text-right text-gray-600 font-medium">Endereço:</label>
                <input type="text" readOnly className="w-32 bg-white border border-gray-400 rounded-sm px-1 h-5 text-gray-800" />
                <label className="text-right text-gray-600 font-medium w-10">Valor:</label>
                <input type="text" value={item ? `R$ ${item.value.toFixed(2)}` : ''} readOnly className="flex-1 bg-white border border-gray-400 rounded-sm px-1 h-5 text-gray-800" />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-16 text-right text-gray-600 font-medium">Cód. Barras:</label>
                <input type="text" value={item ? item.barcode : ''} readOnly className="flex-1 bg-white border border-gray-400 rounded-sm px-1 h-5 font-mono text-gray-800" />
              </div>
            </div>
          </div>

          {/* GRÁFICO SIMPLES */}
          <div className="w-[40%] p-1.5">
           
          </div>
        </div>

        {/* CHECKBOXES */}
        <div className="px-2 py-1 flex space-x-4 border-b border-gray-300 shrink-0 text-[10px] bg-[#F0F0F0]">
          <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" defaultChecked className="rounded-sm border-gray-400" /> Item de estoque</label>
          <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" defaultChecked className="rounded-sm border-gray-400" /> Item de venda</label>
          <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" defaultChecked className="rounded-sm border-gray-400" /> Item de compra</label>
        </div>

        {/* ABAS (APENAS 3) */}
        <div className="flex border-b border-gray-400 bg-[#F0F0F0] shrink-0 overflow-x-auto pt-1 px-1 gap-1">
          <button 
            onClick={() => setActiveTab('geral')}
            className={`px-2 py-0.5 text-[10px] border border-gray-400 border-b-0 rounded-t-sm transition-colors flex items-center gap-1 whitespace-nowrap ${activeTab === 'geral' ? 'bg-white text-gray-800 font-bold -mb-[1px] pb-[3px]' : 'bg-[#dcdcdc] text-gray-600 hover:bg-[#e4e4e4]'}`}
          >
            Estoque Geral
          </button>
          <button 
            onClick={() => setActiveTab('vendas')}
            className={`px-2 py-0.5 text-[10px] border border-gray-400 border-b-0 rounded-t-sm transition-colors flex items-center gap-1 whitespace-nowrap ${activeTab === 'vendas' ? 'bg-white text-gray-800 font-bold -mb-[1px] pb-[3px]' : 'bg-[#dcdcdc] text-gray-600 hover:bg-[#e4e4e4]'}`}
          >
            <FileText className="w-3 h-3" /> Hist. Vendas
          </button>
          <button 
            onClick={() => setActiveTab('transferencias')}
            className={`px-2 py-0.5 text-[10px] border border-gray-400 border-b-0 rounded-t-sm transition-colors flex items-center gap-1 whitespace-nowrap ${activeTab === 'transferencias' ? 'bg-white text-gray-800 font-bold -mb-[1px] pb-[3px]' : 'bg-[#dcdcdc] text-gray-600 hover:bg-[#e4e4e4]'}`}
          >
            <History className="w-3 h-3" /> Hist. Transf.
          </button>
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-white p-1">
          
          {!item && (
            <div className="flex-1 flex items-center justify-center text-gray-400 italic text-[10px]">
              Insira o código do item acima e pressione Enter para carregar os dados.
            </div>
          )}

          {item && activeTab === 'geral' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-gray-600 font-medium">Aperte <strong className="bg-gray-200 px-1 border border-gray-400 rounded-sm">F2</strong> para transferir.</span>
                <button className="border border-gray-400 px-1.5 py-0.5 rounded-sm text-[10px] font-medium text-gray-700 bg-[#e4e4e4] hover:bg-[#d4d4d4] transition flex items-center gap-1">
                  <Printer className="w-3 h-3" /> Imprimir
                </button>
              </div>
              
              <div className="border border-gray-400 rounded-sm overflow-auto flex-1">
                <table className="w-full text-left text-[10px] border-collapse bg-white">
                  <thead className="bg-[#e4e4e4] text-gray-700 font-medium border-b border-gray-400 sticky top-0 z-10">
                    <tr>
                      <th className="border-r border-gray-300 px-1 py-1 w-48">Filial / Depósito</th>
                      <th className="border-r border-gray-300 px-1 py-1 text-center w-20">Disponível (01)</th>
                      <th className="border-r border-gray-300 px-1 py-1 text-center w-20">Reserva (02)</th>
                      <th className="border-r border-gray-300 px-1 py-1 text-center w-20">Avaria (03)</th>
                      <th className="border-r border-gray-300 px-1 py-1 text-center w-20">Perda (04)</th>
                      <th className="px-1 py-1 text-center w-20">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    <tr className="hover:bg-blue-50">
                      <td className="border-r border-gray-300 px-1 py-0.5 font-bold text-gray-800">01 - MATRIZ</td>
                      <td className="border-r border-gray-300 px-1 py-0.5 text-center text-emerald-700 font-medium text-[10px]">120</td>
                      <td className="border-r border-gray-300 px-1 py-0.5 text-center text-gray-500 font-medium text-[10px]">0</td>
                      <td className="border-r border-gray-300 px-1 py-0.5 text-center text-amber-700 font-medium text-[10px]">5</td>
                      <td className="border-r border-gray-300 px-1 py-0.5 text-center text-red-700 font-medium text-[10px]">2</td>
                      <td className="px-1 py-0.5 text-center font-bold text-[10px] text-gray-800">127</td>
                    </tr>
                    <tr className="hover:bg-blue-50">
                      <td className="border-r border-gray-300 px-1 py-0.5 font-bold text-gray-800">07 - SÃO JOSÉ</td>
                      <td className="border-r border-gray-300 px-1 py-0.5 text-center text-emerald-700 font-medium text-[10px]">45</td>
                      <td className="border-r border-gray-300 px-1 py-0.5 text-center text-gray-500 font-medium text-[10px]">2</td>
                      <td className="border-r border-gray-300 px-1 py-0.5 text-center text-amber-700 font-medium text-[10px]">0</td>
                      <td className="border-r border-gray-300 px-1 py-0.5 text-center text-red-700 font-medium text-[10px]">1</td>
                      <td className="px-1 py-0.5 text-center font-bold text-[10px] text-gray-800">48</td>
                    </tr>
                    <tr className="hover:bg-blue-50">
                      <td className="border-r border-gray-300 px-1 py-0.5 font-bold text-gray-800">05 - CURITIBA</td>
                      <td className="border-r border-gray-300 px-1 py-0.5 text-center text-emerald-700 font-medium text-[10px]">0</td>
                      <td className="border-r border-gray-300 px-1 py-0.5 text-center text-gray-500 font-medium text-[10px]">0</td>
                      <td className="border-r border-gray-300 px-1 py-0.5 text-center text-amber-700 font-medium text-[10px]">3</td>
                      <td className="border-r border-gray-300 px-1 py-0.5 text-center text-red-700 font-medium text-[10px]">0</td>
                      <td className="px-1 py-0.5 text-center font-bold text-[10px] text-gray-800">3</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {item && activeTab === 'vendas' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="border border-gray-400 rounded-sm overflow-auto flex-1">
                <table className="w-full text-left text-[10px] border-collapse bg-white">
                  <thead className="bg-[#e4e4e4] text-gray-700 font-medium border-b border-gray-400 sticky top-0 z-10">
                    <tr>
                      <th className="border-r border-gray-300 px-1 py-1 w-24">Data</th>
                      <th className="border-r border-gray-300 px-1 py-1 w-24">NF</th>
                      <th className="border-r border-gray-300 px-1 py-1">Cliente</th>
                      <th className="px-1 py-1 text-center w-16">Qtd</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    {mockSalesHistory.map((sale, idx) => (
                      <tr key={idx} className="hover:bg-blue-50">
                        <td className="border-r border-gray-300 px-1 py-0.5 text-gray-600">{sale.date}</td>
                        <td className="border-r border-gray-300 px-1 py-0.5 font-mono text-gray-800">{sale.nf}</td>
                        <td className="border-r border-gray-300 px-1 py-0.5 text-gray-600 truncate uppercase">{sale.client}</td>
                        <td className="px-1 py-0.5 text-center text-red-600 font-normal text-[10px]">{sale.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {item && activeTab === 'transferencias' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="border border-gray-400 rounded-sm overflow-auto flex-1">
                <table className="w-full text-left text-[10px] border-collapse bg-white">
                  <thead className="bg-[#e4e4e4] text-gray-700 font-medium border-b border-gray-400 sticky top-0 z-10">
                    <tr>
                      <th className="border-r border-gray-300 px-1 py-1 w-32">Data/Hora</th>
                      <th className="border-r border-gray-300 px-1 py-1">Origem</th>
                      <th className="border-r border-gray-300 px-1 py-1">Destino</th>
                      <th className="border-r border-gray-300 px-1 py-1 text-center w-16">Qtd</th>
                      <th className="px-1 py-1 w-20">Usuário</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    {mockTransferHistory.map((transf, idx) => (
                      <tr key={idx} className="hover:bg-blue-50">
                        <td className="border-r border-gray-300 px-1 py-0.5 text-gray-600">{transf.date}</td>
                        <td className="border-r border-gray-300 px-1 py-0.5 text-gray-800">{transf.origin}</td>
                        <td className="border-r border-gray-300 px-1 py-0.5 text-gray-800">{transf.destination}</td>
                        <td className="border-r border-gray-300 px-1 py-0.5 text-center text-blue-800 font-normal text-[10px]">{transf.qty}</td>
                        <td className="px-1 py-0.5 text-gray-500">{transf.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* RODAPÉ */}
        <div className="bg-[#F0F0F0] border-t border-gray-400 px-1 py-0.5 flex justify-between items-center text-[9px] text-gray-600 shrink-0">
          <span>Sistema Integrado de Gestão V1.0</span>
          <span>Pronto</span>
        </div>

      </div>

      {/* ========================================== */}
      {/* MODAL DE TRANSFERÊNCIA (F2)                */}
      {/* ========================================== */}
      {isTransferModalOpen && item && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          
          <div className="bg-[#F0F0F0] rounded-none shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col border border-gray-500 font-sans">
            
            <div className="bg-[#3b6ea5] text-white px-2 py-1 flex justify-between items-center border-b border-gray-400">
              <span className="font-bold text-[11px] tracking-wide">Transferência de Estoque</span>
              <button onClick={() => setIsTransferModalOpen(false)} className="bg-[#e81123] text-white px-2 hover:bg-red-600 transition">
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-[#e4e4e4] px-2 py-1 border-b border-gray-300 flex gap-2 text-[10px] font-medium text-gray-700">
              <button className="hover:bg-gray-300 px-2 py-0.5 border border-transparent hover:border-gray-400 rounded-sm">➕ Adicionar</button>
              <button className="hover:bg-gray-300 px-2 py-0.5 border border-transparent hover:border-gray-400 rounded-sm">➖ Remover</button>
              <div className="flex-1"></div>
              <button onClick={() => setIsTransferModalOpen(false)} className="hover:bg-gray-300 px-2 py-0.5 border border-transparent hover:border-gray-400 rounded-sm flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Confirmar</button>
            </div>

            <div className="p-3 bg-[#F0F0F0] border-b border-gray-300 flex flex-col gap-2 text-[11px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <label className="w-12 text-right text-gray-600 shrink-0">Item:</label>
                    <input type="text" value={item.materialCode} disabled className="bg-white border border-gray-400 rounded-sm px-2 h-6 font-mono font-bold w-32" />
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-16 text-right text-gray-600 shrink-0">Filial:</label>
                    <select className="bg-white border border-gray-400 rounded-sm px-2 h-6 font-mono font-bold text-blue-800 w-48 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option>01 - MATRIZ</option>
                      <option>07 - SÃO JOSÉ DOS PINHAIS</option>
                      <option>05 - CURITIBA</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <label className="w-12 text-right text-gray-600 shrink-0">Data:</label>
                  <input type="text" value={new Date().toLocaleDateString('pt-BR')} disabled className="bg-white border border-gray-400 rounded-sm px-2 h-6 w-28 text-center font-mono" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <label className="w-12 text-right text-gray-600 shrink-0">Descrição:</label>
                <input type="text" value={item.description} disabled className="bg-white border border-gray-400 rounded-sm px-2 h-6 uppercase w-full" />
              </div>
            </div>

            <div className="bg-white m-2 border border-gray-400 overflow-auto flex-1 min-h-[150px]">
              <table className="w-full text-left text-[10px] border-collapse">
                <thead>
                  <tr className="bg-[#e4e4e4] text-gray-700 font-medium border-b border-gray-400">
                    <th className="border-r border-gray-300 px-1 py-1 w-40">Filial / Depósito</th>
                    <th className="border-r border-gray-300 px-1 py-1 text-center w-20">Disponível (01)</th>
                    <th className="border-r border-gray-300 px-1 py-1 text-center w-20">Reserva (02)</th>
                    <th className="border-r border-gray-300 px-1 py-1 text-center w-20">Avaria (03)</th>
                    <th className="border-r border-gray-300 px-1 py-1 text-center w-20">Perda (04)</th>
                    <th className="px-1 py-1 text-center w-16">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white hover:bg-blue-50">
                    <td className="border-r border-b border-gray-300 px-1 py-0.5 font-bold text-gray-800">01 - MATRIZ</td>
                    <td className="border-r border-b border-gray-300 px-1 py-0.5 text-center text-emerald-700 font-normal text-[10px]">120</td>
                    <td className="border-r border-b border-gray-300 px-1 py-0.5 text-center text-gray-500 font-normal text-[10px]">0</td>
                    <td className="border-r border-b border-gray-300 px-1 py-0.5 text-center text-amber-700 font-normal text-[10px]">5</td>
                    <td className="border-r border-b border-gray-300 px-1 py-0.5 text-center text-red-700 font-normal text-[10px]">2</td>
                    <td className="border-b border-gray-300 px-1 py-0.5 text-center font-normal text-[10px]">127</td>
                  </tr>
                  <tr className="bg-white hover:bg-blue-50">
                    <td className="border-r border-b border-gray-300 px-1 py-0.5 font-bold text-gray-800">07 - SÃO JOSÉ</td>
                    <td className="border-r border-b border-gray-300 px-1 py-0.5 text-center text-emerald-700 font-normal text-[10px]">45</td>
                    <td className="border-r border-b border-gray-300 px-1 py-0.5 text-center text-gray-500 font-normal text-[10px]">2</td>
                    <td className="border-r border-b border-gray-300 px-1 py-0.5 text-center text-amber-700 font-normal text-[10px]">0</td>
                    <td className="border-r border-b border-gray-300 px-1 py-0.5 text-center text-red-700 font-normal text-[10px]">1</td>
                    <td className="border-b border-gray-300 px-1 py-0.5 text-center font-normal text-[10px]">48</td>
                  </tr>
                  <tr className="bg-white hover:bg-blue-50">
                    <td className="border-r border-b border-gray-300 px-1 py-0.5 font-bold text-gray-800">05 - CURITIBA</td>
                    <td className="border-r border-b border-gray-300 px-1 py-0.5 text-center text-emerald-700 font-normal text-[10px]">0</td>
                    <td className="border-r border-b border-gray-300 px-1 py-0.5 text-center text-gray-500 font-normal text-[10px]">0</td>
                    <td className="border-r border-b border-gray-300 px-1 py-0.5 text-center text-amber-700 font-normal text-[10px]">3</td>
                    <td className="border-r border-b border-gray-300 px-1 py-0.5 text-center text-red-700 font-normal text-[10px]">0</td>
                    <td className="border-b border-gray-300 px-1 py-0.5 text-center font-normal text-[10px]">3</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-[#F0F0F0] p-2 border-t border-gray-300 flex items-center justify-start gap-4 text-[10px]">
              <div className="flex items-center gap-1">
                <label className="text-gray-600 font-bold">Estoque Origem:</label>
                <select value={transferOrigin} onChange={(e) => setTransferOrigin(e.target.value)} className="bg-white border border-gray-400 rounded-sm px-1 h-5 w-40 font-mono font-bold text-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="01">01 - DISPONÍVEL</option>
                  <option value="02">02 - RESERVA</option>
                  <option value="03">03 - AVARIA</option>
                  <option value="04">04 - PERDA</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <label className="text-gray-600 font-bold">Estoque Destino:</label>
                <select value={transferDestination} onChange={(e) => setTransferDestination(e.target.value)} className="bg-white border border-gray-400 rounded-sm px-1 h-5 w-40 font-mono font-bold text-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">Selecione...</option>
                  <option value="01">01 - DISPONÍVEL</option>
                  <option value="02">02 - RESERVA</option>
                  <option value="03">03 - AVARIA</option>
                  <option value="04">04 - PERDA</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <label className="text-gray-600 font-bold">Quantidade:</label>
                <input type="text" inputMode="numeric" value={transferQuantity} onChange={(e) => setTransferQuantity(Number(e.target.value.replace(/\D/g, '')))} className="bg-white border border-gray-400 rounded-sm px-1 h-5 w-20 text-right font-mono font-bold text-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="0" />
              </div>
            </div>

            <div className="bg-[#F0F0F0] p-2 border-t border-gray-300 flex justify-end gap-2">
              <button onClick={() => setIsTransferModalOpen(false)} className="px-3 py-1 rounded-sm text-[10px] font-medium text-gray-700 bg-[#e4e4e4] hover:bg-[#d4d4d4] border border-gray-400 transition">
                Cancelar
              </button>
              <button onClick={() => { alert('Transferência realizada!'); setIsTransferModalOpen(false); }} className="px-3 py-1 rounded-sm text-[10px] font-medium text-white bg-[#3b6ea5] hover:bg-[#2c5480] border border-[#2a4e76] transition">
                OK
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}