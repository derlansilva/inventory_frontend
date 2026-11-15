import React, { useState, useEffect } from 'react';
import { Search, FileText, Printer, ArrowRight, ShieldAlert, Calendar, RefreshCw, Box, X, ChevronDown, ChevronRight } from 'lucide-react';
import SapAlertModal from '../SapAlertModal';
import { apiServices } from '../../services/apiServices';
import { createPortal } from 'react-dom';

// Interfaces atualizadas para suportar itens
interface RomaneioItem {
  materialCode: string;
  description: string;
  noteQuantity: number;
  scannedQuantity: number;
  batch: string;
}

interface RomaneioInvoice {
  invoiceNumber: string;
  status: string;
  customerName: string;
  items: RomaneioItem[];
}

interface Romaneio {
  id: string;
  manifestCode: string;
  nfNumber: string;
  customerName: string;
  date: string;
  status: 'OPEN' | 'CLOSED' | 'WAITING_XML';
  totalVolumes: number;
  scannedItems: number;
  totalItems: number;
  invoices: RomaneioInvoice[]; // Nova propriedade com as NFs e itens
}

export default function CentralSac() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  
  const [romaneios, setRomaneios] = useState<Romaneio[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [selectedRomaneio, setSelectedRomaneio] = useState<Romaneio | null>(null);
  
  // Estado para controlar qual NF está expandida no Modal
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);

  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'warning' | 'error' | 'info'>('info');

  const showAlert = (msg: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setAlertMessage(msg);
    setAlertType(type);
    setAlertOpen(true);
  };

  const fetchRomaneios = async () => {
    setLoading(true);
    try {
      const data = await apiServices.getManifestsWithFilters({
        search: searchQuery,
        status: filterStatus === 'TODOS' ? undefined : filterStatus,
        date: filterDate
      });
      
      const formatted: Romaneio[] = data.map((item: any) => ({
        id: item.id.toString(),
        manifestCode: item.manifestCode,
        nfNumber: item.nfNumber || 'S/ NF',
        customerName: item.customerName || 'Cliente Não Identificado',
        date: item.date,
        status: item.status === 'CLOSED' ? 'CLOSED' : 'OPEN',
        totalVolumes: item.totalVolumes || 0,
        scannedItems: item.scannedItems || 0,
        totalItems: item.totalItems || 0,
        invoices: item.invoices || []
      }));

      setRomaneios(formatted);
    } catch (error) {
      console.error(error);
      showAlert('Erro ao buscar romaneios.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRomaneios();
  }, [filterDate, filterStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-700 text-[10px] font-bold"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/> Em Aberto</span>;
      case 'CLOSED':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/> Concluído</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const toggleInvoice = (invoiceNumber: string) => {
    setExpandedInvoice(prev => prev === invoiceNumber ? null : invoiceNumber);
  };

  return (
    <div className="bg-slate-50 w-full h-full p-4 font-sans text-xs text-slate-700 flex flex-col overflow-hidden">
      
      <SapAlertModal isOpen={alertOpen} message={alertMessage} type={alertType} onClose={() => setAlertOpen(false)} />

      {/* CABEÇALHO DA PÁGINA */}
      <div className="bg-white border border-slate-200 rounded-t-lg p-4 shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-[#354A5F] p-1.5 rounded-md">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Central de Romaneios</h2>
              <p className="text-[11px] text-slate-500">Consulte, filtre e acompanhe as devoluções do dia.</p>
            </div>
          </div>
          <button 
            onClick={fetchRomaneios}
            className="text-slate-500 hover:text-[#354A5F] flex items-center gap-1.5 font-bold text-[11px] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col space-y-1 w-full max-w-md">
            <label className="text-[10px] font-bold text-slate-500 uppercase pl-1">Pesquisar Romaneio / NF / Cliente</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchRomaneios()}
                placeholder="" 
                className="w-full bg-slate-50 border border-slate-300 pl-9 pr-3 py-1.5 rounded text-xs text-slate-800 focus:ring-1 focus:ring-[#354A5F] outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase pl-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Data</label>
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 px-3 py-1.5 rounded text-xs text-slate-800 focus:ring-1 focus:ring-[#354A5F] outline-none transition-all"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase pl-1">Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 px-3 py-1.5 rounded text-xs text-slate-800 focus:ring-1 focus:ring-[#354A5F] outline-none transition-all w-40"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="OPEN">Em Aberto</option>
              <option value="CLOSED">Concluído</option>
            </select>
          </div>

          <button 
            onClick={fetchRomaneios}
            className="bg-[#354A5F] hover:bg-[#2A3A4A] text-white px-5 py-1.5 rounded font-bold shadow-sm transition-all flex items-center gap-1.5 h-[30px]"
          >
            <Search className="w-3.5 h-3.5" />
            Buscar
          </button>
        </div>
      </div>

      {/* TABELA DE RESULTADOS */}
      <div className="bg-white border border-t-0 border-slate-200 rounded-b-lg shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin text-[#354A5F] opacity-50" />
              <p className="text-xs font-bold">Buscando romaneios...</p>
            </div>
          ) : romaneios.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <ShieldAlert className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">Nenhum romaneio encontrado</p>
              <p className="text-xs">Tente mudar a data ou o status do filtro.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Romaneio</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">NF</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Cliente</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Data</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] text-center">Volumes</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] w-40">Progresso</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px] text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {romaneios.map((rom) => (
                  <tr key={rom.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-4 py-3 font-mono font-bold text-[#354A5F]">{rom.manifestCode}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{rom.nfNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-700 uppercase">{rom.customerName}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(rom.date)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-200">
                        {rom.totalVolumes} cx
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${rom.scannedItems === rom.totalItems ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(100, (rom.scannedItems / (rom.totalItems || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-slate-600 w-10 text-right">
                          {rom.scannedItems}/{rom.totalItems}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(rom.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setSelectedRomaneio(rom)}
                        className="text-[#354A5F] hover:text-blue-700 font-bold text-[11px] flex items-center gap-1 justify-end ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Detalhes <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* RODAPÉ DA TABELA */}
        <div className="bg-slate-50 border-t border-slate-200 p-2 px-4 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-500 font-mono">Total: {romaneios.length} registro(s)</span>
          <button 
            onClick={() => showAlert('Aqui você pode exportar um relatório em PDF ou Excel.', 'info')}
            className="text-slate-500 hover:text-[#354A5F] flex items-center gap-1.5 font-bold text-[11px] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Exportar
          </button>
        </div>
      </div>

      {/* MODAL DE DETALHES DO ROMANEIO COM AS NFS E ITENS */}
      {selectedRomaneio && createPortal (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header do Modal */}
            <div className="bg-[#354A5F] p-4 flex justify-between items-center text-white shrink-0">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Box className="w-5 h-5 text-amber-400" />
                  Romaneio: {selectedRomaneio.manifestCode}
                </h3>
                <p className="text-[11px] text-slate-300 mt-1">Detalhes, Notas Fiscais e Itens da conferência.</p>
              </div>
              <button 
                onClick={() => setSelectedRomaneio(null)} 
                className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo do Modal (com scroll) */}
            <div className="p-5 space-y-5 text-slate-700 bg-slate-50 overflow-y-auto flex-1">
              
              {/* Cards de Resumo */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data de Entrada</span>
                  <span className="text-sm font-bold text-slate-800">{formatDate(selectedRomaneio.date)}</span>
                </div>
                <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Volumes Totais</span>
                  <span className="text-sm font-bold text-slate-800">{selectedRomaneio.totalVolumes} caixas</span>
                </div>
                <div className="bg-white p-3 rounded border border-slate-200 shadow-sm flex flex-col justify-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status Atual</span>
                  <div>{getStatusBadge(selectedRomaneio.status)}</div>
                </div>
              </div>

              {/* Progresso Geral */}
              <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Progresso Geral do Romaneio</span>
                  <span className="text-xs font-bold text-slate-600">
                    {selectedRomaneio.scannedItems} de {selectedRomaneio.totalItems} itens bipados
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full ${selectedRomaneio.scannedItems === selectedRomaneio.totalItems ? 'bg-emerald-500' : 'bg-blue-500'} transition-all duration-500`}
                    style={{ width: `${Math.min(100, (selectedRomaneio.scannedItems / (selectedRomaneio.totalItems || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Lista de NFs e Itens */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase border-b pb-1">Notas Fiscais neste Romaneio</h4>
                
                {selectedRomaneio.invoices.map((inv) => (
                  <div key={inv.invoiceNumber} className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                    {/* Cabeçalho da NF (Clicável para expandir) */}
                    <button 
                      onClick={() => toggleInvoice(inv.invoiceNumber)}
                      className="w-full bg-slate-50 hover:bg-slate-100 p-3 flex justify-between items-center transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedInvoice === inv.invoiceNumber ? <ChevronDown className="w-4 h-4 text-[#354A5F]" /> : <ChevronRight className="w-4 h-4 text-[#354A5F]" />}
                        <span className="font-mono font-bold text-[#354A5F]">NF: {inv.invoiceNumber}</span>
                        <span className="text-[11px] text-slate-500 uppercase">{inv.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-600">{inv.items.length} itens</span>
                      </div>
                    </button>

                    {/* Tabela de Itens (Só aparece se estiver expandido) */}
                    {expandedInvoice === inv.invoiceNumber && (
                      <div className="p-3 bg-white border-t border-slate-200 animate-in slide-in-from-top-2">
                        <table className="w-full text-left text-xs">
                          <thead className="text-[10px] text-slate-400 uppercase border-b">
                            <tr>
                              <th className="pb-2">Cód. Material</th>
                              <th className="pb-2">Descrição</th>
                              <th className="pb-2 text-center">Lote</th>
                              <th className="pb-2 text-center">Qtd Nota</th>
                              <th className="pb-2 text-center">Bipado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {inv.items.map((item, idx) => {
                              const isComplete = item.scannedQuantity >= item.noteQuantity;
                              return (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="py-2 font-mono font-bold text-slate-700">{item.materialCode}</td>
                                  <td className="py-2 text-slate-600">{item.description}</td>
                                  <td className="py-2 text-center text-slate-500 font-mono">{item.batch || 'S/L'}</td>
                                  <td className="py-2 text-center font-bold text-slate-700">{item.noteQuantity}</td>
                                  <td className="py-2 text-center">
                                    <span className={`inline-block px-1.5 py-0.5 rounded font-bold text-[10px] ${isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                      {item.scannedQuantity}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>

            {/* Footer do Modal */}
            <div className="bg-white p-3 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button 
                onClick={() => setSelectedRomaneio(null)} 
                className="px-4 py-2 rounded text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                Fechar
              </button>
              <button 
                onClick={() => showAlert('Abrindo tela de impressão...', 'info')}
                className="px-4 py-2 rounded text-xs font-bold text-white bg-[#354A5F] hover:bg-[#2A3A4A] transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Romaneio
              </button>
            </div>

          </div>
        </div>,

         document.body
      )}

    </div>
  );
}