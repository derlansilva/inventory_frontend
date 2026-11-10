import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface StockManagerProps {
  onBack?: () => void;
}

export default function StockManager({ onBack }: StockManagerProps) {
  const [searchSku, setSearchSku] = useState('');
  const [activeTab, setActiveTab] = useState<'geral' | 'compra' | 'vendas' | 'estoque' | 'planejamento' | 'observacoes'>('estoque');
  const [productLoaded, setProductLoaded] = useState(false);

  const [itemData, setItemData] = useState({
    sku: '1525466',
    descricao: 'IBUPROFENO 600MG CX 50 CPR',
    categoria: 'FARMACÊUTICOS / ANALGÉSICOS',
    endereco: 'A-01-02-B',
    valor: 'R$ 48,50',
    codigoBarras: '7891000991005',
    fornecedorPadrao: 'EMS FARMACÊUTICA S/A',
    prazoEntrega: '5 dias úteis',
    comprador: 'João Silva',
    unidadeVenda: 'CX (Caixa com 50)',
    fatorConversao: '1 CX = 50 CPR',
    metodoEstoque: 'Depósito',
    metodoAvaliacao: 'Preço Médio Móvel (PMM)',
    isEstoque: true,
    isVenda: true,
    isCompra: true,
  });

  const depositos = [
    { codigo: '01', nome: 'Depósito Geral', bloqueado: false, posPadrao: 'A-01-02', emEstoque: 450, confirmado: 120, pedido: 50, disponivel: 380 },
    { codigo: '02', nome: 'Depósito de Apoio', bloqueado: false, posPadrao: 'B-02-01', emEstoque: 80, confirmado: 0, pedido: 0, disponivel: 80 },
    { codigo: '03', nome: 'Drop Ship', bloqueado: false, posPadrao: 'DS-01', emEstoque: 0, confirmado: 0, pedido: 0, disponivel: 0 },
    { codigo: '05', nome: '05-DEVOLUCAO (Avarias/Recusas)', bloqueado: false, posPadrao: 'DOCA-05', emEstoque: 15, confirmado: 0, pedido: 0, disponivel: 15 },
    { codigo: 'DEPTERC', nome: 'DEPÓSITO TERCEIROS', bloqueado: true, posPadrao: 'EXT-01', emEstoque: 0, confirmado: 0, pedido: 0, disponivel: 0 },
  ];

  // Dados mensais para o gráfico de barras
  const chartData = [
    { mes: 'Jan', val: 240 },
    { mes: 'Fev', val: 280 },
    { mes: 'Mar', val: 410 },
    { mes: 'Abr', val: 340 },
    { mes: 'Mai', val: 170 },
    { mes: 'Jun', val: 365 },
    { mes: 'Jul', val: 95 },
    { mes: 'Ago', val: 15 },
    { mes: 'Set', val: 10 },
    { mes: 'Out', val: 0 },
    { mes: 'Nov', val: 350 },
    { mes: 'Dez', val: 330 },
  ];

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchSku.trim()) {
        setProductLoaded(true);
      }
    }
  };

  return (
    <div className="w-full h-full bg-[#D6DCE5] flex flex-col p-2 font-sans text-xs text-slate-800 select-none overflow-y-auto">
      
      {/* 1. BARRA SUPERIOR DO MÓDULO */}
      <div className="bg-[#1E293B] text-white px-3 py-1.5 rounded-t flex items-center justify-between shadow-sm shrink-0 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <span className="bg-[#2563EB] text-white font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">MOD-ITEM</span>
          <span className="font-bold tracking-wide text-xs">Dados do Cadastro do Item - Sistema de Gestão</span>
        </div>
        <div className="text-[10px] font-mono text-slate-300 flex items-center gap-3">
          <span>Filial: <strong className="text-white">BR01</strong></span>
          <span>Usuário: <strong className="text-white">OP_LOGISTICA</strong></span>
        </div>
      </div>

      {/* CONTAINER PRINCIPAL */}
      <div className="bg-[#F4F6F9] border border-slate-400 rounded-b shadow-sm flex flex-col flex-1 p-2 gap-2">
        
        {/* 2. CABEÇALHO DIVIDIDO 50/50 COM GRÁFICO DE BARRAS À DIREITA */}
        <div className="bg-white border border-slate-300 rounded p-2.5 shadow-sm grid grid-cols-12 gap-x-4 gap-y-1.5 shrink-0 items-center">
          
          {/* Lado Esquerdo: 50% (col-span-6) */}
          <div className="col-span-6 grid grid-cols-12 gap-1.5 items-center text-[11px]">
            
            <label className="col-span-2 font-bold text-slate-500 text-right pr-2">Código:</label>
            <div className="col-span-10 flex items-center gap-2">
              <div className="relative w-44">
                <input 
                  type="text" 
                  value={searchSku}
                  onChange={(e) => setSearchSku(e.target.value)}
                  onKeyDown={handleSearch}
                  placeholder="SKU ou EAN..." 
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-0.5 font-mono text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 shadow-sm"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1" />
              </div>
              <button 
                onClick={() => { if(searchSku) setProductLoaded(true); }}
                className="px-3 py-0.5 bg-[#1E293B] hover:bg-blue-700 text-white rounded font-bold text-xs shadow-sm transition cursor-pointer"
              >
                Buscar
              </button>
            </div>

            <label className="col-span-2 font-bold text-slate-500 text-right pr-2">Descrição:</label>
            <div className="col-span-10">
              <input 
                type="text" 
                value={productLoaded ? itemData.descricao : ''} 
                readOnly 
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-0.5 font-semibold text-slate-800 shadow-sm" 
                placeholder="Aguardando consulta do item..."
              />
            </div>

            <label className="col-span-2 font-bold text-slate-500 text-right pr-2">Categoria:</label>
            <div className="col-span-10">
              <input 
                type="text" 
                value={productLoaded ? itemData.categoria : ''} 
                readOnly 
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-0.5 font-medium text-slate-700 shadow-sm" 
              />
            </div>

            <label className="col-span-2 font-bold text-slate-500 text-right pr-2">Endereço:</label>
            <div className="col-span-4">
              <input 
                type="text" 
                value={productLoaded ? itemData.endereco : ''} 
                readOnly 
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-0.5 font-mono font-semibold text-blue-800 shadow-sm" 
              />
            </div>

            <label className="col-span-2 font-bold text-slate-500 text-right pr-2">Valor:</label>
            <div className="col-span-4">
              <input 
                type="text" 
                value={productLoaded ? itemData.valor : ''} 
                readOnly 
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-0.5 font-mono font-bold text-emerald-700 shadow-sm" 
              />
            </div>

            <label className="col-span-2 font-bold text-slate-500 text-right pr-2">Cód. barras:</label>
            <div className="col-span-10">
              <input 
                type="text" 
                value={productLoaded ? itemData.codigoBarras : ''} 
                readOnly 
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-0.5 font-mono text-slate-700 shadow-sm" 
              />
            </div>

          </div>

          {/* Lado Direito: 50% (col-span-6) - Gráfico de Barras Estilo Dashboard */}
          <div className="col-span-6 border-l border-slate-200 pl-4 flex flex-col justify-between h-full bg-slate-50/50 p-2 rounded border border-slate-200">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wide">
                Serviços / Vendas Aprovadas (Mês)
              </span>
              <span className="text-[10px] font-mono text-slate-500">2026</span>
            </div>

            {/* GRÁFICO DE BARRAS VERTICAIS */}
            <div className="w-full h-28 relative my-1 flex items-end justify-between px-1 pt-4">
              
              {/* Linhas de Grade de Fundo Horizontales */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30 pt-4">
                <div className="border-b border-slate-300 w-full text-[8px] text-right pr-1 text-slate-400">500</div>
                <div className="border-b border-slate-300 w-full text-[8px] text-right pr-1 text-slate-400">375</div>
                <div className="border-b border-slate-300 w-full text-[8px] text-right pr-1 text-slate-400">250</div>
                <div className="border-b border-slate-300 w-full text-[8px] text-right pr-1 text-slate-400">125</div>
                <div className="border-b border-slate-300 w-full"></div>
              </div>

              {/* Barras */}
              {chartData.map((item, index) => {
                // Altura proporcional baseada em 500 max
                const heightPercent = Math.max((item.val / 500) * 100, 4);
                return (
                  <div key={index} className="flex flex-col items-center z-10 group relative h-full justify-end w-[6%]" title={`${item.mes}: ${item.val}`}>
                    {/* Barra Azul */}
                    <div 
                      style={{ height: `${heightPercent}%` }} 
                      className="w-full bg-[#38BDF8] hover:bg-blue-600 transition-all rounded-t-sm shadow-sm"
                    ></div>
                    {/* Rótulo do Mês */}
                    <span className="text-[8px] font-mono text-slate-600 mt-1 transform -rotate-45 sm:rotate-0 origin-top-left">
                      {item.mes.charAt(0)}
                    </span>
                  </div>
                );
              })}

            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-200 mt-1">
              <span className="font-semibold text-slate-600">Desempenho Anual Comparativo</span>
              <span className="text-blue-600 font-bold">Total: 2.895 un</span>
            </div>

          </div>

          {/* Checkboxes inferiores */}
          <div className="col-span-12 border-t border-slate-100 pt-1.5 mt-0.5 flex items-center justify-start space-x-6 text-[11px] px-2 text-slate-700">
            <label className="flex items-center space-x-1.5 font-bold cursor-pointer">
              <input type="checkbox" checked={itemData.isEstoque} readOnly className="rounded border-slate-300 text-blue-600" />
              <span>Item de estoque</span>
            </label>
            <label className="flex items-center space-x-1.5 font-bold cursor-pointer">
              <input type="checkbox" checked={itemData.isVenda} readOnly className="rounded border-slate-300 text-blue-600" />
              <span>Item de venda</span>
            </label>
            <label className="flex items-center space-x-1.5 font-bold cursor-pointer">
              <input type="checkbox" checked={itemData.isCompra} readOnly className="rounded border-slate-300 text-blue-600" />
              <span>Item de compra</span>
            </label>
          </div>

        </div>

        {/* 3. ABAS NAVEGÁVEIS */}
        <div className="flex flex-col flex-1 border border-slate-300 rounded bg-white overflow-hidden shadow-sm">
          
          <div className="bg-[#E2E8F0] px-2 pt-1 border-b border-slate-300 flex items-center justify-between shrink-0 overflow-x-auto">
            <div className="flex space-x-1">
              {[
                { id: 'geral', label: 'Geral' },
                { id: 'compra', label: 'Dados de compra' },
                { id: 'vendas', label: 'Dados de vendas' },
                { id: 'estoque', label: 'Dados de estoque' },
                { id: 'planejamento', label: 'Dados de planejamento' },
                { id: 'observacoes', label: 'Observações' }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1 rounded-t text-xs font-bold transition border-t border-x cursor-pointer ${
                    activeTab === tab.id 
                      ? 'bg-white text-[#1E293B] border-slate-400 -mb-[1px] shadow-sm' 
                      : 'text-slate-600 border-transparent hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="pb-1">
              <button className="px-3 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded font-bold text-xs shadow-sm transition">
                Imprimir Relatório
              </button>
            </div>
          </div>

          {/* CONTEÚDO DINÂMICO CONFORME A ABA SELECIONADA */}
          <div className="flex-1 p-3 overflow-y-auto bg-white flex flex-col justify-between">
            
            {activeTab === 'estoque' && (
              <div className="flex flex-col flex-1">
                <div className="grid grid-cols-12 gap-4 mb-3 text-[11px] border-b border-slate-200 pb-3 shrink-0">
                  <div className="col-span-5 flex items-center space-x-2">
                    <label className="font-bold text-slate-600">Definir método do estoque:</label>
                    <input type="text" value={itemData.metodoEstoque} readOnly className="bg-slate-100 border border-slate-300 rounded px-2 py-0.5 font-semibold text-slate-700 flex-1" />
                  </div>
                  <div className="col-span-5 flex items-center space-x-2">
                    <label className="font-bold text-slate-600">Método de avaliação:</label>
                    <input type="text" value={itemData.metodoAvaliacao} readOnly className="bg-slate-100 border border-slate-300 rounded px-2 py-0.5 font-semibold text-slate-700 flex-1" />
                  </div>
                </div>

                {/* TABELA POR DEPÓSITO */}
                <div className="flex-1 overflow-x-auto border border-slate-300 rounded">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#1E293B] text-white font-mono text-[10px] tracking-wide">
                        <th className="py-1 px-2 border-r border-slate-700/60 w-8 text-center font-normal">#</th>
                        <th className="py-1 px-2 border-r border-slate-700/60 w-28 font-normal">Código do depósito</th>
                        <th className="py-1 px-2 border-r border-slate-700/60 font-normal">Nome do depósito</th>
                        <th className="py-1 px-2 border-r border-slate-700/60 w-20 text-center font-normal">Bloqueado</th>
                        <th className="py-1 px-2 border-r border-slate-700/60 w-36 font-normal">Posição padrão</th>
                        <th className="py-1 px-2 border-r border-slate-700/60 w-24 text-right font-normal">Em estoque</th>
                        <th className="py-1 px-2 border-r border-slate-700/60 w-24 text-right font-normal">Confirmado</th>
                        <th className="py-1 px-2 border-r border-slate-700/60 w-24 text-right font-normal">Pedido</th>
                        <th className="py-1 px-2 w-24 text-right font-bold text-emerald-300">Disponível</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                      {!productLoaded ? (
                        <tr>
                          <td colSpan={9} className="p-10 text-center text-slate-400 italic font-sans">
                            Insira o código do item acima e pressione Enter para carregar o saldo por depósito.
                          </td>
                        </tr>
                      ) : (
                        depositos.map((dep, idx) => (
                          <tr key={dep.codigo} className="hover:bg-blue-50/60 transition-colors">
                            <td className="py-1 px-2 text-center text-slate-500 border-r border-slate-200">{idx + 1}</td>
                            <td className="py-1 px-2 font-bold text-blue-700 border-r border-slate-200">{dep.codigo}</td>
                            <td className="py-1 px-2 font-sans font-medium text-slate-800 border-r border-slate-200">{dep.nome}</td>
                            <td className="py-1 px-2 text-center border-r border-slate-200">
                              <input type="checkbox" checked={dep.bloqueado} readOnly className="rounded border-slate-300" />
                            </td>
                            <td className="py-1 px-2 border-r border-slate-200 text-slate-600">{dep.posPadrao}</td>
                            <td className="py-1 px-2 text-right font-bold text-slate-800 border-r border-slate-200">{dep.emEstoque}</td>
                            <td className="py-1 px-2 text-right text-slate-600 border-r border-slate-200">{dep.confirmado}</td>
                            <td className="py-1 px-2 text-right text-slate-600 border-r border-slate-200">{dep.pedido}</td>
                            <td className="py-1 px-2 text-right font-bold text-emerald-700 bg-emerald-50/40">{dep.disponivel}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'geral' && (
              <div className="p-6 space-y-4 max-w-2xl text-[11px]">
                <h4 className="font-bold text-slate-700 text-xs uppercase border-b pb-1">Parâmetros Gerais do Item</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Unidade de Medida de Estoque</label>
                    <input type="text" value="CX (Caixas)" readOnly className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 font-semibold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Gerenciado por</label>
                    <input type="text" value="Lotes / Validade (FEFO)" readOnly className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 font-semibold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Preço Unitário Padrão</label>
                    <input type="text" value={itemData.valor} readOnly className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 font-semibold text-blue-700" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Moeda Principal</label>
                    <input type="text" value="BRL (Real Brasileiro)" readOnly className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 font-semibold" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'compra' && (
              <div className="p-6 space-y-4 max-w-2xl text-[11px]">
                <h4 className="font-bold text-slate-700 text-xs uppercase border-b pb-1">Dados de Aquisição e Fornecedor</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Fornecedor Preferencial</label>
                    <input type="text" value={itemData.fornecedorPadrao} readOnly className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 font-semibold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Prazo Médio de Entrega</label>
                    <input type="text" value={itemData.prazoEntrega} readOnly className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 font-semibold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Comprador Responsável</label>
                    <input type="text" value={itemData.comprador} readOnly className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 font-semibold" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vendas' && (
              <div className="p-6 space-y-4 max-w-2xl text-[11px]">
                <h4 className="font-bold text-slate-700 text-xs uppercase border-b pb-1">Dados Comerciais e Unidades de Venda</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Unidade de Medida de Venda</label>
                    <input type="text" value={itemData.unidadeVenda} readOnly className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 font-semibold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Fator de Conversão</label>
                    <input type="text" value={itemData.fatorConversao} readOnly className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 font-semibold" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'planejamento' && (
              <div className="p-6 space-y-4 max-w-2xl text-[11px]">
                <h4 className="font-bold text-slate-700 text-xs uppercase border-b pb-1">Planejamento de Reposição (MRP)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Estoque Mínimo</label>
                    <input type="text" value="100 CX" readOnly className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 font-semibold" />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Estoque Máximo</label>
                    <input type="text" value="1.000 CX" readOnly className="w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 font-semibold" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'observacoes' && (
              <div className="p-6 space-y-4 max-w-2xl text-[11px]">
                <h4 className="font-bold text-slate-700 text-xs uppercase border-b pb-1">Notas e Observações Logísticas</h4>
                <textarea 
                  readOnly 
                  value="Produto controlado com rastreabilidade obrigatória por lote e validade (FEFO). Manter em local fresco e arejado." 
                  className="w-full bg-slate-100 border border-slate-300 rounded p-2 h-24 text-slate-700 resize-none font-sans"
                />
              </div>
            )}

            {/* Rodapé da Aba */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200 font-mono shrink-0">
              <span>Sistema Integrado de Gestão v1.0</span>
              <button className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded font-bold font-sans transition cursor-pointer">
                Definir depósito padrão
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}