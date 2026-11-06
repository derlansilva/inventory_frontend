import React, { useState } from 'react';
import { Search, Headphones, FileText, Printer, ArrowRight, ArrowLeft, Layers, ShieldAlert, PlusCircle, Save, Upload, Trash2, Box, MapPin } from 'lucide-react';
import SapAlertModal from '../SapAlertModal';
import { apiServices } from '../../services/apiServices';

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
  damagedQty: number;
  batch: string;
}

interface InvoiceData {
  nfNumber: string;
  customerName: string;
  salesOrg: string;
  distributionChannel: string;
  items: ReturnItem[];
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
      { code: '74321', desc: 'Dipirona Sódica 500mg/ML Sol Oral', qty: 5, problem: 'Caixa violada com avaria física' },
      { code: '12550', desc: 'Amoxicilina 500mg 30 Capsulas', qty: 2, problem: 'Falta de lacre de segurança' }
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
  
  const [viewingDetails, setViewingDetails] = useState<boolean>(false);
  const [isCreatingReturn, setIsCreatingReturn] = useState<boolean>(false);

  const [manifestCode, setManifestCode] = useState<string>(() => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    return `GAM-${timeStr}`;
  });
  
  const [globalReason, setGlobalReason] = useState<string>('101 - Avaria de Transporte / Caixa Violada');
  const [invoicesList, setInvoicesList] = useState<InvoiceData[]>([]);

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

  const startCreatingReturn = () => {
    setIsCreatingReturn(true);
    setNoReturnFoundNf(null);
    setInvoicesList([]);
    
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    setManifestCode(`GAM-${timeStr}`);
  };

  const handleGlobalReasonChange = (newReason: string) => {
    setGlobalReason(newReason);
    setInvoicesList(prevInvoices => 
      prevInvoices.map(inv => ({
        ...inv,
        items: inv.items.map(item => ({
          ...item,
          specificReason: newReason
        }))
      }))
    );
  };

  const handleXmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(event.target?.result as string, "text/xml");
          
          const nfNumber = xmlDoc.querySelector("nNF")?.textContent || `NF-${Math.floor(10000 + Math.random() * 90000)}`;
          const customerName = xmlDoc.querySelector("dest xNome")?.textContent || 'Cliente Diversos S/A';
          
          const detItens = xmlDoc.querySelectorAll("det");
          const parsedItems: ReturnItem[] = [];

          if (detItens.length > 0) {
            detItens.forEach(det => {
              parsedItems.push({
                code: det.querySelector("cProd")?.textContent || '74321',
                desc: det.querySelector("xProd")?.textContent || 'Produto Importado via XML',
                noteQty: Number(det.querySelector("qCom")?.textContent || 10),
                specificReason: globalReason,
                damagedQty: 0,
                batch: det.querySelector("nLote")?.textContent || 'S/L'
              });
            });
          }

          setInvoicesList(prev => [
            ...prev.filter(inv => inv.nfNumber !== nfNumber),
            { nfNumber, customerName, salesOrg: '1000', distributionChannel: '10', items: parsedItems }
          ]);
        } catch (err) {
          showAlert('Erro ao processar o arquivo XML da Nota Fiscal.', 'error');
        }
      };
      reader.readAsText(file);
    });
  };

  const handleSaveNewReturn = async () => {
    if (invoicesList.length === 0) {
      showAlert('Importe pelo menos um arquivo XML de Nota Fiscal para gerar o romaneio.', 'warning');
      return;
    }

    const payload = {
      manifestCode: manifestCode,
      invoices: invoicesList
    };

    try {
      await apiServices.saveReturnManifest(payload);
      showAlert(`Romaneio ${manifestCode} gerado e estoque de devolução atualizado!`, 'success');
      setIsCreatingReturn(false);
      setSearchQuery('');
    } catch (error: any) {
      console.error("Erro ao enviar romaneio:", error);
      showAlert(`Erro ao gravar romaneio: ${error.message || 'Verifique a ligação com o backend.'}`, 'error');
    }
  };

  return (
    // O SEGREDO ESTÁ AQUI: fixed inset-0 (Prende o componente exatamente no tamanho da tela)
    // e o top-[120px] (dá um espaço para o menu azul escuro do sistema ficar visível em cima)
    <div className="fixed inset-0 top-[120px] bg-slate-100 flex flex-col font-sans text-xs text-slate-700 overflow-hidden z-10 rounded-t-xl shadow-sm">
      
      <SapAlertModal isOpen={alertOpen} message={alertMessage} type={alertType} onClose={() => setAlertOpen(false)} />

      {/* CABEÇALHO DO SISTEMA */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center space-x-2">
          <Box className="w-5 h-5 text-[#002B49]" />
          <h3 className="font-bold text-slate-800 text-lg tracking-tight">Gestão de Devoluções</h3>
          <span className="text-xs text-slate-400 font-medium hidden md:inline-block ml-2 pl-2 border-l border-slate-300">SAC • ZMM_RET</span>
        </div>
        <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-500">
          <div className="flex items-center space-x-1"><MapPin className="w-3.5 h-3.5" /> <span>Mandante: 100</span></div>
          <div className="flex items-center space-x-1"><Headphones className="w-3.5 h-3.5" /> <span>OP_LOGISTICA</span></div>
        </div>
      </div>

      {/* BARRA DE PESQUISA */}
      <div className="bg-white border-b border-slate-200 p-3 px-4 flex gap-3 items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 w-full max-w-2xl">
          <label className="text-slate-600 font-bold whitespace-nowrap text-xs uppercase tracking-wide">Consultar:</label>
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Protocolo (PROT-9988) ou NF..." 
              className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-2 rounded font-mono text-xs text-slate-800 focus:ring-1 focus:ring-[#002B49] outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={startCreatingReturn}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded font-bold flex items-center space-x-1.5 transition-all text-xs"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>Novo Romaneio</span>
          </button>
          <button 
            onClick={handleSearch}
            className="bg-[#002B49] hover:bg-[#003d66] text-white px-5 py-2 rounded font-bold flex items-center space-x-1.5 transition-all text-xs"
          >
            <Search className="w-4 h-4" />
            <span>Consultar</span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL (Aqui o min-h-0 permite o flex-1 funcionar corretamente) */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
        
        {isCreatingReturn ? (
          <div className="flex flex-col flex-1 min-h-0 pb-16"> {/* pb-16 garante que o conteúdo não fique oculto atrás do botão */}
            
            {/* BARRA DO ROMANEIO */}
            <div className="bg-white border-b border-slate-200 p-2 px-4 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setIsCreatingReturn(false)}
                  className="text-slate-500 hover:text-slate-800 px-2 py-1 rounded font-bold text-xs transition-all flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>
                <div className="h-4 w-px bg-slate-300"></div>
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Romaneio:</span>
                  <input 
                    type="text" 
                    value={manifestCode} 
                    onChange={(e) => setManifestCode(e.target.value)} 
                    className="bg-slate-50 border border-slate-300 px-2 py-1 rounded font-mono font-bold text-[#002B49] text-xs w-28 focus:outline-none focus:border-[#002B49]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-1 bg-blue-50 border border-blue-100 px-2 py-1 rounded">
                  <label className="text-[11px] font-bold text-blue-900 uppercase">Motivo:</label>
                  <select 
                    value={globalReason}
                    onChange={(e) => handleGlobalReasonChange(e.target.value)}
                    className="bg-transparent border-none font-semibold text-blue-900 text-[11px] focus:ring-0 outline-none w-48 cursor-pointer"
                  >
                    <option>101 - Avaria / Caixa Violada</option>
                    <option>102 - Divergência (Falta)</option>
                    <option>103 - Lote Vencido</option>
                    <option>104 - Cadeia Fria</option>
                  </select>
                </div>

                <label className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded font-bold text-xs cursor-pointer flex items-center space-x-1 shadow-sm transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importar XML</span>
                  <input type="file" multiple accept=".xml" onChange={handleXmlUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* ÁREA DE NOTAS (ÚNICA PARTE DA TELA QUE VAI ROLAR) */}
            <div className="flex-1 overflow-y-auto p-4">
              {invoicesList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 border-2 border-dashed border-slate-300 rounded-lg bg-white/50 min-h-[200px]">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <p className="text-xs font-bold text-slate-600">Aguardando XML</p>
                </div>
              ) : (
                <div className="space-y-3 max-w-[1400px] mx-auto">
                  <h4 className="font-bold text-slate-500 uppercase tracking-widest text-[10px] flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[#002B49]" />
                    Notas Importadas ({invoicesList.length})
                  </h4>

                  {invoicesList.map((inv, invIdx) => (
                    <div key={invIdx} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="bg-[#002B49] text-white px-2 py-0.5 rounded font-mono font-bold text-[10px]">NF: {inv.nfNumber}</span>
                          <span className="text-slate-700 font-bold text-[11px]">{inv.customerName}</span>
                        </div>
                        <button 
                          onClick={() => setInvoicesList(invoicesList.filter((_, i) => i !== invIdx))}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <table className="w-full text-left text-[11px] border-collapse font-sans">
                        <thead className="bg-white text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-1.5 font-bold uppercase text-[9px]">Material</th>
                            <th className="px-3 py-1.5 font-bold uppercase text-[9px]">Descrição</th>
                            <th className="px-3 py-1.5 font-bold uppercase text-[9px] text-center">Qtd</th>
                            <th className="px-3 py-1.5 font-bold uppercase text-[9px] text-center">Lote</th>
                            <th className="px-3 py-1.5 font-bold uppercase text-[9px] w-48">Motivo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {inv.items.map((item, itemIdx) => (
                            <tr key={itemIdx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-3 py-1 font-mono font-bold text-[#002B49]">{item.code}</td>
                              <td className="px-3 py-1 text-slate-700 truncate max-w-[200px]" title={item.desc}>{item.desc}</td>
                              <td className="px-3 py-1 text-center font-mono font-bold text-slate-800 bg-slate-50/50">{item.noteQty}</td>
                              <td className="px-3 py-1 text-center font-mono text-slate-500">{item.batch}</td>
                              <td className="px-3 py-1">
                                <select 
                                  value={item.specificReason}
                                  onChange={(e) => {
                                    const updated = [...invoicesList];
                                    updated[invIdx].items[itemIdx].specificReason = e.target.value;
                                    setInvoicesList(updated);
                                  }}
                                  className="w-full bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-700 focus:ring-1 focus:ring-[#002B49] outline-none"
                                >
                                  <option>101 - Avaria de Transporte</option>
                                  <option>102 - Divergência (Falta de Item)</option>
                                  <option>103 - Lote Vencido</option>
                                  <option>104 - Cadeia Fria</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : noReturnFoundNf ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="bg-white border border-amber-200 p-6 rounded-lg max-w-sm text-center shadow-sm">
              <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h3 className="font-bold text-amber-900 text-sm mb-1">Nenhum Romaneio</h3>
              <p className="text-[11px] text-slate-500 mb-4">A NF <strong className="font-mono">{noReturnFoundNf}</strong> não possui devoluções.</p>
              <button onClick={startCreatingReturn} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded font-bold text-xs shadow-sm">
                Criar Romaneio
              </button>
            </div>
          </div>
        ) : !selected ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-slate-400">
            <Headphones className="w-10 h-10 text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-500">Aguardando consulta</p>
          </div>
        ) : !viewingDetails ? (
          <div className="p-4 flex-1 overflow-y-auto animate-in fade-in">
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2">
                  <h3 className="font-bold text-slate-800 text-xs">Detalhes do Chamado {selected.protocol}</h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Cliente</span> <span className="font-medium text-slate-700">{selected.customer}</span></div>
                  <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Nota Fiscal</span> <span className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">{selected.nf}</span></div>
                  <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Responsável</span> <span className="font-medium text-slate-700">{selected.responsible}</span></div>
                  <div><span className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Status</span> <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">{selected.status}</span></div>
                  
                  <div className="md:col-span-2 bg-amber-50/50 p-2 rounded border border-amber-100 flex items-center justify-between mt-1">
                    <span className="font-mono text-[11px] font-bold text-slate-700">{selected.reasonCode} - {selected.reasonDesc}</span>
                    <button onClick={() => setViewingDetails(true)} className="text-[#002B49] hover:text-blue-800 font-bold text-[10px] flex items-center gap-1">
                      Ver Movimentações <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 font-bold text-[10px] uppercase">Material</th>
                      <th className="px-4 py-2 font-bold text-[10px] uppercase">Descrição</th>
                      <th className="px-4 py-2 font-bold text-[10px] uppercase text-center">Qtd</th>
                      <th className="px-4 py-2 font-bold text-[10px] uppercase">Relato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selected.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-mono font-bold text-[#002B49]">{item.code}</td>
                        <td className="px-4 py-2 text-slate-700 font-medium">{item.desc}</td>
                        <td className="px-4 py-2 text-center font-mono font-bold text-red-600 bg-red-50/20">{item.qty}</td>
                        <td className="px-4 py-2 text-slate-500 text-[11px]">{item.problem}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 flex-1 overflow-y-auto animate-in fade-in">
            <div className="max-w-3xl mx-auto space-y-3">
              <div className="flex items-center justify-between mb-2">
                <button onClick={() => setViewingDetails(false)} className="text-slate-500 hover:text-slate-800 font-bold text-[11px] flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Voltar
                </button>
                <span className="font-mono text-[10px] text-slate-400 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm">
                  {selected.protocol} | {selected.nf}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 font-bold text-[10px] uppercase">Data/Hora</th>
                      <th className="px-3 py-2 font-bold text-[10px] uppercase">Transação</th>
                      <th className="px-3 py-2 font-bold text-[10px] uppercase">Doc</th>
                      <th className="px-3 py-2 font-bold text-[10px] uppercase text-center">Qtd</th>
                      <th className="px-3 py-2 font-bold text-[10px] uppercase">Status</th>
                      <th className="px-3 py-2 font-bold text-[10px] uppercase">Usuário</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {selected.movements.map((mov, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-500">{mov.date}</td>
                        <td className="px-3 py-2 font-bold text-[#002B49]">{mov.trans}</td>
                        <td className="px-3 py-2 text-slate-700">{mov.doc}</td>
                        <td className="px-3 py-2 text-center font-bold text-red-600">{mov.qty}</td>
                        <td className="px-3 py-2 text-amber-700 font-bold">{mov.status}</td>
                        <td className="px-3 py-2 text-slate-600">{mov.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
{/* BOTÃO FIXO GLOBAL (Ajustado para ficar fino como o botão de Importar) */}
      {isCreatingReturn && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-2 px-6 flex justify-end shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
          <button 
            onClick={handleSaveNewReturn}
            disabled={invoicesList.length === 0}
            className="bg-[#002B49] hover:bg-[#003d66] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded font-bold text-xs shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Gravar Romaneio </span>
          </button>
        </div>
      )}
    </div>
  );
}