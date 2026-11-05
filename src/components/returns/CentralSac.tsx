import React, { useState } from 'react';
import { Search, Headphones, FileText, Printer, ArrowRight, ArrowLeft, Layers, ShieldAlert, CheckCircle2, PlusCircle, Save, X, Plus, Trash2, Filter } from 'lucide-react';
import SapAlertModal from '../SapAlertModal';

interface MovementLog {
  date: string;
  trans: string;
  doc: string;
  qty: string;
  status: string;
  user: string;
}

interface ProtocolItem {
  protocol: string;
  nf: string;
  customer: string;
  responsible: string;
  reasonCode: string;
  reasonDesc: string;
  status: string;
  date: string;
  items: { code: string; desc: string; qty: number; problem: string }[];
  movements: MovementLog[];
}

interface ReturnItem {
  code: string;
  desc: string;
  noteQty: number;
  specificReason: string;
  occurrenceQty: number;
  damagedQty: number;
}

const sacDatabase: Record<string, ProtocolItem> = {
  'PROT-9988': {
    protocol: 'PROT-9988',
    nf: 'NF-45890',
    customer: 'CUS9999 - Drogaria Pacheco S/A (Filial Curitiba)',
    responsible: 'CONFERENTE_01 (Carlos Silva)',
    reasonCode: '101',
    reasonDesc: 'Avaria de Transporte / Caixa Violada',
    status: 'Em Análise SAC',
    date: '27/10/2026',
    items: [
      { code: 'SC1005', desc: 'Dipirona Sódica 500mg (Cx 50)', qty: 5, problem: 'Caixa violada com avaria física' },
      { code: 'SC1084', desc: 'Paracetamol 750mg (Cx 20)', qty: 2, problem: 'Falta de lacre de segurança' }
    ],
    movements: [
      { date: '27/10/2026 09:30', trans: 'ZMM_RET (Recusa)', doc: 'PROT-9988', qty: '-7 UN', status: 'Processado / WMS', user: 'CONFERENTE_01' },
      { date: '27/10/2026 11:15', trans: 'MB1B (Bloqueio Avaria)', doc: 'TR-4021', qty: '7 UN', status: 'Estoque em Quarentena', user: 'FARMACEUTICO' }
    ]
  }
};

export default function CentralSac() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selected, setSelected] = useState<ProtocolItem | null>(null);
  const [noReturnFoundNf, setNoReturnFoundNf] = useState<string | null>(null);
  
  // Estados de Navegação Interna
  const [viewingDetails, setViewingDetails] = useState<boolean>(false);
  const [isCreatingReturn, setIsCreatingReturn] = useState<boolean>(false);

  // Estados do Formulário de Nova Devolução
  const [newGeneralReason, setNewGeneralReason] = useState<string>('101 - Avaria de Transporte / Caixa Violada');
  const [newReturnItems, setNewReturnItems] = useState<ReturnItem[]>([]);

  // Estados de Alerta Global
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'warning' | 'error' | 'info'>('info');

  const showAlert = (msg: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setAlertMessage(msg);
    setAlertType(type);
    setAlertOpen(true);
  };

  const handleSearch = () => {
    const query = searchQuery.trim().toUpperCase();
    if (!query) {
      showAlert('Informe um número de Protocolo ou Nota Fiscal para pesquisar.', 'warning');
      return;
    }

    setIsCreatingReturn(false);
    const found = sacDatabase[query] || Object.values(sacDatabase).find(item => item.nf.toUpperCase() === query);

    if (found) {
      setSelected(found);
      setNoReturnFoundNf(null);
      setViewingDetails(false);
    } else if (query.startsWith('NF-') || query.length >= 4) {
      setSelected(null);
      setNoReturnFoundNf(query);
    } else {
      showAlert(`Nenhum registo encontrado para "${searchQuery}".`, 'warning');
      setSelected(null);
      setNoReturnFoundNf(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Iniciar criação de nova devolução para a NF pesquisada
  const startCreatingReturn = (nf: string) => {
    setIsCreatingReturn(true);
    setNoReturnFoundNf(null);
    setNewReturnItems([
      { code: 'SC1005', desc: 'Dipirona Sódica 500mg (Cx 50)', noteQty: 100, specificReason: newGeneralReason, occurrenceQty: 10, damagedQty: 5 },
      { code: 'SC1084', desc: 'Paracetamol 750mg (Cx 20)', noteQty: 50, specificReason: newGeneralReason, occurrenceQty: 5, damagedQty: 2 },
      { code: 'SC1090', desc: 'Amoxicilina 500mg (Frasco)', noteQty: 30, specificReason: newGeneralReason, occurrenceQty: 2, damagedQty: 2 }
    ]);
  };

  const handleSaveNewReturn = () => {
    showAlert('Nova devolução gerada e gravada com sucesso no S/4HANA!', 'success');
    setIsCreatingReturn(false);
    setSearchQuery('');
  };

  return (
    <div className="bg-[#E9ECEF] w-full p-2 font-sans text-xs text-gray-800 flex flex-col shadow-inner rounded  relative">
      
      <SapAlertModal 
        isOpen={alertOpen}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertOpen(false)}
      />

      {/* 1. BARRA DE TÍTULO CLÁSSICA SAP */}
      <div className="bg-[#002B49] text-white px-3 py-1.5 flex items-center justify-between rounded-t shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="font-mono bg-[#1E4D6B] px-1.5 py-0.2 rounded text-[10px] font-bold">ZMM_SAC</span>
          <span className="font-semibold tracking-wide text-xs">Central SAC & Módulo de Gestão de Devoluções</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-300 text-[10px] font-mono">
          <span>Mandante: 100</span>
          <span>Usuário: OP_LOGISTICA</span>
        </div>
      </div>

      {/* 2. BARRA DE PESQUISA SUPERIOR */}
      <div className="bg-white border-x border-b border-gray-300 p-2.5 grid grid-cols-1 md:grid-cols-3 gap-3 shadow-xs items-center">
        <div className="flex items-center space-x-2 md:col-span-2">
          <label className="text-gray-600 font-bold whitespace-nowrap w-28 text-right">Protocolo / NFe:</label>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite o Protocolo (ex: PROT-9988) ou NFe (ex: NF-45890)..." 
            className="bg-red-50/50 border border-red-400 px-2.5 py-1 rounded font-mono font-bold text-blue-900 flex-1 focus:ring-1 focus:ring-blue-800 focus:outline-none text-[11px]"
          />
        </div>
        <div className="flex items-center justify-end">
          <button 
            onClick={handleSearch}
            className="bg-[#002B49] hover:bg-blue-900 text-white px-5 py-1 rounded font-bold flex items-center space-x-1 cursor-pointer w-full md:w-auto justify-center shadow-xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Consultar [F2]</span>
          </button>
        </div>
      </div>

      {/* 3. CONTEÚDO PRINCIPAL */}
      <div className="bg-white border-x border-b border-gray-300 p-4 shadow-xs space-y-4 min-h-[350px] mt-2 rounded-b">
        
        {isCreatingReturn ? (
          /* MÓDULO PARA GERAR NOVA DEVOLUÇÃO COM BASE NA NOTA FISCAL */
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-300 pb-2">
              <button 
                onClick={() => setIsCreatingReturn(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded font-bold text-xs cursor-pointer flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
              <span className="font-mono font-bold text-green-800 text-xs bg-green-50 px-2 py-0.5 rounded border border-green-300">
                Gerando Nova Devolução para: {searchQuery.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded border border-gray-300 text-xs">
              <div className="flex items-center space-x-3">
                <label className="w-36 font-medium text-gray-600">Cliente:</label>
                <input type="text" readOnly value="CUS9999 - Drogaria Pacheco S/A (Filial Curitiba)" className="bg-gray-100 border border-gray-300 px-2 py-1 rounded flex-1 font-medium" />
              </div>
              <div className="flex items-center space-x-3">
                <label className="w-36 font-medium text-gray-600">Motivo da Reclamação:</label>
                <select 
                  value={newGeneralReason} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewGeneralReason(val);
                    setNewReturnItems(newReturnItems.map(i => ({ ...i, specificReason: val })));
                  }}
                  className="bg-white border border-gray-300 px-2 py-1 rounded flex-1 font-semibold text-blue-900"
                >
                  <option>101 - Avaria de Transporte / Caixa Violada</option>
                  <option>102 - Divergência de Quantidade (Falta de Item)</option>
                  <option>103 - Lote Vencido ou Incompatível</option>
                  <option>104 - Cadeia Fria (Temperatura Incorreta)</option>
                </select>
              </div>
            </div>

            {/* TABELA DE ITENS DA NOVA DEVOLUÇÃO */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">Itens e Quantidades para Devolução</h4>
              <div className="overflow-y-auto max-h-[220px] border border-gray-300 rounded shadow-inner">
                <table className="w-full text-left text-[11px] border-collapse font-sans">
                  <thead className="bg-[#002B49] text-white font-semibold sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5 border-r border-blue-900 w-10 text-center">#</th>
                      <th className="p-2.5 border-r border-blue-900">Nº do Material</th>
                      <th className="p-2.5 border-r border-blue-900">Descrição do Produto</th>
                      <th className="p-2.5 border-r border-blue-900 text-center">Qtd da Nota</th>
                      <th className="p-2.5 border-r border-blue-900">Motivo Específico</th>
                      <th className="p-2.5 text-center">Qtd Avariada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {newReturnItems.map((item, idx) => (
                      <tr key={idx} className="bg-white hover:bg-blue-50/50">
                        <td className="p-2.5 border-r border-gray-200 text-center text-gray-500 font-mono">{idx + 1}</td>
                        <td className="p-2.5 border-r border-gray-200 font-mono font-bold text-blue-900">{item.code}</td>
                        <td className="p-2.5 border-r border-gray-200 font-medium">{item.desc}</td>
                        <td className="p-2.5 border-r border-gray-200 text-center font-mono">{item.noteQty}</td>
                        <td className="p-2.5 border-r border-gray-200">
                          <input 
                            type="text" 
                            value={item.specificReason}
                            onChange={(e) => {
                              const updated = [...newReturnItems];
                              updated[idx].specificReason = e.target.value;
                              setNewReturnItems(updated);
                            }}
                            className="w-full bg-white border border-gray-300 px-2 py-0.5 rounded text-xs focus:ring-1 focus:ring-blue-800"
                          />
                        </td>
                        <td className="p-2.5 text-center">
                          <input 
                            type="number" 
                            value={item.damagedQty}
                            onChange={(e) => {
                              const updated = [...newReturnItems];
                              updated[idx].damagedQty = Number(e.target.value);
                              setNewReturnItems(updated);
                            }}
                            className="w-16 bg-red-50 border border-red-300 text-red-700 font-bold px-1 py-0.5 rounded text-center font-mono mx-auto block text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={handleSaveNewReturn}
                className="bg-[#002B49] hover:bg-blue-900 text-white px-6 py-1.5 rounded font-bold text-xs shadow cursor-pointer flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Gravar Devolução no S/4HANA</span>
              </button>
            </div>
          </div>
        ) : noReturnFoundNf ? (
          /* AVISO DE NF SEM DEVOLUÇÃO COM BOTÃO PARA CRIAR */
          <div className="py-16 text-center space-y-4 animate-in fade-in duration-150 max-w-lg mx-auto">
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-lg space-y-2">
              <ShieldAlert className="w-10 h-10 mx-auto text-amber-600" />
              <h3 className="font-bold text-amber-900 text-sm">Nenhuma Devolução Encontrada para esta Nota Fiscal</h3>
              <p className="text-xs text-gray-600">
                A Nota Fiscal <strong className="font-mono text-blue-900">{noReturnFoundNf}</strong> existe no sistema S/4HANA, mas ainda não possui nenhum processo de devolução ou chamado SAC aberto.
              </p>
            </div>
            <div>
              <button 
                onClick={() => startCreatingReturn(noReturnFoundNf)}
                className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded font-bold text-xs shadow cursor-pointer flex items-center space-x-2 mx-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Criar Nova Devolução para {noReturnFoundNf}</span>
              </button>
            </div>
          </div>
        ) : !selected ? (
          <div className="py-24 text-center text-gray-400 font-mono">
            <Headphones className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-semibold text-gray-600">Nenhum protocolo consultado.</p>
            <p className="text-xs text-gray-500 mt-1">Informe o número do protocolo ou Nota Fiscal no campo superior e pressione <strong className="text-gray-700">Enter</strong>.</p>
          </div>
        ) : !viewingDetails ? (
          /* VISÃO GERAL DO PROTOCOLO NO SAC */
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="space-y-2">
              <h3 className="font-bold text-gray-700 border-b border-gray-200 pb-1 uppercase tracking-wide text-xs flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-blue-900" />
                <span>Dados do Chamado SAC ({selected.protocol})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pt-1">
                <div className="flex items-center space-x-3">
                  <label className="w-32 text-right font-medium text-gray-600 whitespace-nowrap">Protocolo:</label>
                  <input type="text" readOnly value={selected.protocol} className="bg-gray-100 border border-gray-300 px-2.5 py-1 rounded font-mono font-bold text-blue-900 w-full text-xs" />
                </div>
                <div className="flex items-center space-x-3">
                  <label className="w-32 text-right font-medium text-gray-600 whitespace-nowrap">Nota Fiscal:</label>
                  <input type="text" readOnly value={selected.nf} className="bg-gray-100 border border-gray-300 px-2.5 py-1 rounded font-mono font-bold text-purple-900 w-full text-xs" />
                </div>
                <div className="md:col-span-2 flex items-center space-x-3">
                  <label className="w-32 text-right font-medium text-gray-600 whitespace-nowrap">Cliente:</label>
                  <input type="text" readOnly value={selected.customer} className="bg-gray-100 border border-gray-300 px-2.5 py-1 rounded font-medium w-full text-xs text-gray-900" />
                </div>
                <div className="flex items-center space-x-3">
                  <label className="w-32 text-right font-medium text-gray-600 whitespace-nowrap">Responsável:</label>
                  <input type="text" readOnly value={selected.responsible} className="bg-blue-50/50 border border-blue-200 px-2.5 py-1 rounded font-mono font-bold text-blue-900 w-full text-xs" />
                </div>
                <div className="flex items-center space-x-3">
                  <label className="w-32 text-right font-medium text-gray-600 whitespace-nowrap">Status:</label>
                  <input type="text" readOnly value={selected.status} className="bg-amber-50 border border-amber-300 px-2.5 py-1 rounded font-bold text-amber-900 w-full text-xs" />
                </div>
                <div className="flex items-center space-x-3 md:col-span-2 bg-amber-50 p-2 rounded border border-amber-300">
                  <label className="w-32 text-right font-bold text-amber-900 whitespace-nowrap">Motivo da Devolução:</label>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-950">{selected.reasonCode} - {selected.reasonDesc}</span>
                    <button 
                      onClick={() => setViewingDetails(true)}
                      className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1 rounded font-bold text-[11px] shadow-xs cursor-pointer flex items-center space-x-1"
                    >
                      <span>Ver Detalhes, Motivos & Movimentações</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px]">Itens Reclamados</h4>
              <div className="border border-gray-300 rounded overflow-hidden">
                <table className="w-full text-left text-[11px] font-sans border-collapse">
                  <thead className="bg-[#002B49] text-white font-semibold">
                    <tr>
                      <th className="p-2 border-r border-blue-900">Material</th>
                      <th className="p-2 border-r border-blue-900">Descrição</th>
                      <th className="p-2 border-r border-blue-900 text-center">Quantidade</th>
                      <th className="p-2">Relato do Problema</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selected.items.map((item, idx) => (
                      <tr key={idx} className="bg-white hover:bg-blue-50/40">
                        <td className="p-2 border-r border-gray-200 font-mono font-bold text-blue-900">{item.code}</td>
                        <td className="p-2 border-r border-gray-200 font-medium">{item.desc}</td>
                        <td className="p-2 border-r border-gray-200 font-mono font-bold text-center text-red-600">{item.qty} UN</td>
                        <td className="p-2 text-gray-700">{item.problem}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* TELA DE DETALHES DE MOTIVOS E MOVIMENTAÇÕES */
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-300 pb-2">
              <button 
                onClick={() => setViewingDetails(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded font-bold text-xs cursor-pointer flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Chamado SAC</span>
              </button>
              <span className="font-mono font-bold text-blue-900 text-xs">Protocolo: {selected.protocol} | NFe: {selected.nf}</span>
            </div>

            <div className="bg-blue-50/50 p-3 rounded border border-blue-200 space-y-2">
              <h4 className="font-bold text-blue-900 uppercase tracking-wide text-xs flex items-center space-x-1">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Detalhamento do Motivo da Devolução & Responsável</span>
              </h4>
              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div><strong>Código SAP do Motivo:</strong> <span className="text-red-700 font-bold">{selected.reasonCode}</span></div>
                <div><strong>Descrição Oficial:</strong> {selected.reasonDesc}</div>
                <div className="col-span-2"><strong>Responsável Técnico / Operacional:</strong> <span className="text-blue-900 font-bold">{selected.responsible}</span></div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px] flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-blue-900" />
                <span>Histórico de Movimentações WMS Relacionadas ao Motivo</span>
              </h4>

              <div className="overflow-y-auto max-h-[220px] border border-gray-300 rounded shadow-inner">
                <table className="w-full text-left text-[11px] border-collapse font-sans">
                  <thead className="bg-[#002B49] text-white font-semibold sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5 border-r border-blue-900">Data / Hora</th>
                      <th className="p-2.5 border-r border-blue-900">Transação WMS</th>
                      <th className="p-2.5 border-r border-blue-900">Documento</th>
                      <th className="p-2.5 border-r border-blue-900 text-center">Quantidade</th>
                      <th className="p-2.5 border-r border-blue-900">Status WMS</th>
                      <th className="p-2.5">Responsável / Utilizador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-mono">
                    {selected.movements.map((mov, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#F4F6F8] hover:bg-blue-50/50'}>
                        <td className="p-2.5 border-r border-gray-200 text-gray-600">{mov.date}</td>
                        <td className="p-2.5 border-r border-gray-200 font-bold text-blue-900">{mov.trans}</td>
                        <td className="p-2.5 border-r border-gray-200 text-gray-800">{mov.doc}</td>
                        <td className="p-2.5 border-r border-gray-200 text-center font-bold text-red-600">{mov.qty}</td>
                        <td className="p-2.5 border-r border-gray-200 text-amber-900 font-bold">{mov.status}</td>
                        <td className="p-2.5 text-blue-900 font-bold">{mov.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 4. RODAPÉ */}
      <div className="bg-[#F8F9FA] border-x border-b border-gray-300 px-3 py-2 flex items-center justify-between rounded-b">
        <span className="text-[10px] text-gray-500 font-mono">Status: Central SAC Online • Geração de Novas Devoluções Ativa</span>
        <button 
          onClick={() => {
            if (!selected) showAlert('Nenhum protocolo selecionado para imprimir.', 'warning');
            else showAlert(`Imprimindo relatório do protocolo ${selected.protocol}...`, 'success');
          }}
          className="bg-[#002B49] hover:bg-blue-900 text-white px-4 py-1 rounded font-bold shadow-xs transition cursor-pointer flex items-center space-x-1 text-[11px]"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimir / Exportar [F8]</span>
        </button>
      </div>

    </div>
  );
}