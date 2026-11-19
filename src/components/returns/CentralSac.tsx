import React, { useState, useEffect } from 'react';
import { Search, FileText, Printer, ArrowRight, ShieldAlert, Calendar, RefreshCw, Box, X, ChevronDown, ChevronRight, Plus, Minus, Check, FileSpreadsheet } from 'lucide-react';
import SapAlertModal from '../SapAlertModal';
import { apiServices } from '../../services/apiServices';
import { createPortal } from 'react-dom';

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
  invoices: RomaneioInvoice[];
}

export default function CentralSac() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  
  const [romaneios, setRomaneios] = useState<Romaneio[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [selectedRomaneio, setSelectedRomaneio] = useState<Romaneio | null>(null);
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
        return <span className="px-1.5 py-0.5 rounded-sm border border-amber-300 bg-amber-50 text-amber-800 text-[10px] font-bold">Em Aberto</span>;
      case 'CLOSED':
        return <span className="px-1.5 py-0.5 rounded-sm border border-emerald-300 bg-emerald-50 text-emerald-800 text-[10px] font-bold">Concluído</span>;
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

  // --- FUNÇÃO PARA EXPORTAR PARA EXCEL (CSV COMPATÍVEL COM PT-BR) ---
  const handleExportExcel = () => {
    if (romaneios.length === 0) {
      showAlert('Não há registros para exportar.', 'warning');
      return;
    }

    const headers = ['Romaneio', 'NF', 'Cliente', 'Data', 'Volumes (cx)', 'Itens Bipados', 'Total Itens', 'Status'];
    const rows = romaneios.map(rom => [
      rom.manifestCode,
      rom.nfNumber,
      `"${rom.customerName.replace(/"/g, '""')}"`,
      formatDate(rom.date),
      rom.totalVolumes,
      rom.scannedItems,
      rom.totalItems,
      rom.status === 'CLOSED' ? 'Concluído' : 'Em Aberto'
    ]);

    // Usa ponto e vírgula (;) e BOM UTF-8 (\uFEFF) para abrir direto em colunas no Excel em português
    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `romaneios_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#E9ECEF] w-full h-full p-2 font-sans text-xs text-slate-800 flex flex-col overflow-hidden">
      
      <SapAlertModal isOpen={alertOpen} message={alertMessage} type={alertType} onClose={() => setAlertOpen(false)} />

      {/* CONTAINER PRINCIPAL */}
      <div className="bg-white flex-1 flex flex-col min-h-0 border border-gray-400 shadow-sm overflow-hidden rounded-none">
        
        {/* BARRA DE TÍTULO */}
        <div className="bg-[#3b6ea5] text-white px-2 py-1 flex items-center justify-between shrink-0 border-b border-gray-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[11px] tracking-wide">Central de Romaneios & Histórico</span>
          </div>
          <div className="text-[10px] font-mono text-white/80">PROD-SIMULATOR</div>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="p-2 bg-[#F0F0F0] border-b border-gray-400 shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); fetchRomaneios(); }} className="flex gap-4 items-end">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 mb-0.5 uppercase">Pesquisar</label>
              <div className="relative">
                <Search className="w-3 h-3 text-gray-400 absolute left-1 top-1.5" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Romaneio, NF ou Cliente..."
                  className="bg-white border border-gray-400 rounded-sm pl-6 pr-2 h-6 font-mono text-[11px] w-64 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 mb-0.5 uppercase">Data</label>
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-white border border-gray-400 rounded-sm px-2 h-6 text-[11px] w-32 focus:outline-none focus:ring-1 focus:ring-blue-500" 
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 mb-0.5 uppercase">Status</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-gray-400 rounded-sm px-1 h-6 text-[11px] w-36 focus:outline-none focus:ring-1 focus:ring-blue-500" 
              >
                <option value="TODOS">Todos</option>
                <option value="OPEN">Em Aberto</option>
                <option value="CLOSED">Concluído</option>
              </select>
            </div>

            <button 
              type="submit"
              className="bg-[#e4e4e4] hover:bg-[#d4d4d4] border border-gray-400 rounded-sm px-4 h-6 text-[11px] font-bold text-gray-700 flex items-center gap-1 shadow-sm transition"
            >
              <Search className="w-3 h-3" /> Buscar
            </button>
            
            <button 
              type="button"
              onClick={fetchRomaneios}
              className="bg-white hover:bg-gray-50 border border-gray-400 rounded-sm px-3 h-6 text-[11px] font-bold text-gray-700 flex items-center gap-1 shadow-sm transition ml-auto"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> Atualizar
            </button>
          </form>
        </div>

        {/* TABELA DE RESULTADOS */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-[11px] border-collapse bg-white">
              <thead className="bg-[#e4e4e4] text-gray-700 font-medium border-b border-gray-400 sticky top-0 z-10">
                <tr>
                  <th className="border-r border-gray-300 px-2 py-1.5 w-32">Romaneio</th>
                  <th className="border-r border-gray-300 px-2 py-1.5 w-28">NF</th>
                  <th className="border-r border-gray-300 px-2 py-1.5">Cliente</th>
                  <th className="border-r border-gray-300 px-2 py-1.5 w-24">Data</th>
                  <th className="border-r border-gray-300 px-2 py-1.5 text-center w-20">Volumes</th>
                  <th className="border-r border-gray-300 px-2 py-1.5 w-40">Progresso</th>
                  <th className="border-r border-gray-300 px-2 py-1.5 w-24">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                      Buscando romaneios...
                    </td>
                  </tr>
                ) : romaneios.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                      Nenhum romaneio encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  romaneios.map((rom) => (
                    <tr 
                      key={rom.id} 
                      onClick={() => setSelectedRomaneio(rom)} 
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="border-r border-gray-300 px-2 py-2 font-mono font-bold text-gray-800">{rom.manifestCode}</td>
                      <td className="border-r border-gray-300 px-2 py-2 font-mono text-gray-600">{rom.nfNumber}</td>
                      <td className="border-r border-gray-300 px-2 py-2 uppercase truncate">{rom.customerName}</td>
                      <td className="border-r border-gray-300 px-2 py-2 text-gray-600">{formatDate(rom.date)}</td>
                      <td className="border-r border-gray-300 px-2 py-2 text-center">
                        <span className="bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded-sm font-bold text-gray-700">{rom.totalVolumes} cx</span>
                      </td>
                      <td className="border-r border-gray-300 px-2 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 border border-gray-300 rounded-sm overflow-hidden">
                            <div 
                              className={`h-full ${rom.scannedItems === rom.totalItems ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              style={{ width: `${Math.min(100, (rom.scannedItems / (rom.totalItems || 1)) * 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-gray-600 w-10 text-right">
                            {rom.scannedItems}/{rom.totalItems}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2">{getStatusBadge(rom.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RODAPÉ COM BOTÃO EXPORTAR PARA EXCEL */}
        <div className="bg-[#F0F0F0] border-t border-gray-400 px-2 py-1 flex justify-between items-center text-[10px] text-gray-600 shrink-0">
          <div className="flex items-center gap-3">
            <span>Total: <strong>{romaneios.length}</strong> registro(s)</span>
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={romaneios.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-400 text-white border border-emerald-800 rounded-sm px-2.5 py-0.5 text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar para Excel
            </button>
          </div>
          <span>Sistema Integrado de Gestão V1.0</span>
        </div>

      </div>

      {/* MODAL REESTILIZADO (PADRÃO SAP B1) */}
      {selectedRomaneio && createPortal(
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#F0F0F0] rounded-sm shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col border border-gray-500 font-sans">
            
            {/* Barra de Título do Modal (Estilo Janela ERP) */}
            <div className="bg-[#3b6ea5] text-white px-3 py-1.5 flex justify-between items-center border-b border-gray-600 select-none">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[11px] tracking-wide">Romaneio de Carga - {selectedRomaneio.manifestCode}</span>
              </div>
              <button 
                onClick={() => setSelectedRomaneio(null)} 
                className="bg-[#e81123] hover:bg-red-600 text-white px-2 py-0.5 rounded-sm transition flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Barra de Ferramentas Superior do Modal */}
            <div className="bg-[#E9ECEF] border-b border-gray-400 px-3 py-1 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1 hover:bg-gray-200 px-2 py-1 rounded-sm border border-transparent hover:border-gray-300 text-gray-700 font-medium">
                  <Plus className="w-3.5 h-3.5 text-blue-600" /> Adicionar
                </button>
                <button className="flex items-center gap-1 hover:bg-gray-200 px-2 py-1 rounded-sm border border-transparent hover:border-gray-300 text-gray-700 font-medium">
                  <Minus className="w-3.5 h-3.5 text-red-600" /> Remover
                </button>
              </div>
              <div className="flex items-center gap-1 text-emerald-700 font-bold bg-white px-2 py-0.5 border border-gray-300 rounded-sm">
                <Check className="w-3.5 h-3.5" /> Confirmado
              </div>
            </div>

            {/* Corpo do Formulário (Campos estilo ERP ao estilo SAP) */}
            <div className="p-3 overflow-y-auto flex-1 bg-[#F0F0F0] space-y-3">
              
              {/* Bloco de Cabeçalho / Informações Principais */}
              <div className="bg-[#F0F0F0] border border-gray-300 rounded-sm p-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium w-28">Romaneio:</span>
                  <input 
                    type="text" 
                    readOnly 
                    value={selectedRomaneio.manifestCode} 
                    className="bg-white border border-gray-400 rounded-sm px-2 py-0.5 font-mono text-gray-800 flex-1 ml-2 focus:outline-none" 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium w-28">Data:</span>
                  <input 
                    type="text" 
                    readOnly 
                    value={formatDate(selectedRomaneio.date)} 
                    className="bg-white border border-gray-400 rounded-sm px-2 py-0.5 font-mono text-gray-800 flex-1 ml-2 focus:outline-none" 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium w-28">Cliente:</span>
                  <input 
                    type="text" 
                    readOnly 
                    value={selectedRomaneio.customerName} 
                    className="bg-white border border-gray-400 rounded-sm px-2 py-0.5 uppercase text-gray-800 flex-1 ml-2 focus:outline-none truncate" 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium w-28">Volumes (cx):</span>
                  <input 
                    type="text" 
                    readOnly 
                    value={`${selectedRomaneio.totalVolumes} volumes`} 
                    className="bg-white border border-gray-400 rounded-sm px-2 py-0.5 font-mono text-gray-800 flex-1 ml-2 focus:outline-none" 
                  />
                </div>
              </div>

              {/* Barra de Progresso Geral */}
              <div className="bg-white border border-gray-300 rounded-sm p-2 flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-600">Progresso Geral de Separação:</span>
                <div className="flex items-center gap-3 w-2/3">
                  <div className="flex-1 h-3 bg-gray-200 border border-gray-300 rounded-sm overflow-hidden">
                    <div 
                      className={`h-full ${selectedRomaneio.scannedItems === selectedRomaneio.totalItems ? 'bg-emerald-500' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(100, (selectedRomaneio.scannedItems / (selectedRomaneio.totalItems || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] font-bold text-gray-700">
                    {selectedRomaneio.scannedItems} / {selectedRomaneio.totalItems} itens
                  </span>
                </div>
              </div>

              {/* Seção das Notas Fiscais e Itens (Grid estilo tabela ERP) */}
              <div className="bg-white border border-gray-400 rounded-sm overflow-hidden">
                <div className="bg-[#e4e4e4] px-3 py-1.5 border-b border-gray-400 text-[11px] font-bold text-gray-700 uppercase flex justify-between items-center">
                  <span>Notas Fiscais Vinculadas</span>
                  <span className="text-[10px] font-normal text-gray-600">Clique para expandir os itens</span>
                </div>
                
                <div className="p-2 space-y-2">
                  {selectedRomaneio.invoices.map((inv) => (
                    <div key={inv.invoiceNumber} className="border border-gray-300 rounded-sm overflow-hidden">
                      
                      {/* Cabeçalho da NF (Expansível) */}
                      <button 
                        onClick={() => toggleInvoice(inv.invoiceNumber)}
                        className="w-full bg-[#F0F0F0] hover:bg-[#e4e4e4] px-2 py-1.5 flex justify-between items-center transition-colors border-b border-gray-300"
                      >
                        <div className="flex items-center gap-2 text-[11px]">
                          {expandedInvoice === inv.invoiceNumber ? <ChevronDown className="w-4 h-4 text-gray-700" /> : <ChevronRight className="w-4 h-4 text-gray-700" />}
                          <span className="font-mono font-bold text-gray-800">Nota Fiscal Nº: {inv.invoiceNumber}</span>
                          <span className="text-gray-500 uppercase">- {inv.customerName}</span>
                        </div>
                        <span className="text-[10px] font-bold bg-white border border-gray-300 px-2 py-0.5 rounded-sm text-gray-700">
                          {inv.items.length} item(ns)
                        </span>
                      </button>

                      {/* Tabela de Itens da NF */}
                      {expandedInvoice === inv.invoiceNumber && (
                        <div className="border-t border-gray-300 bg-white">
                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead className="bg-[#E9ECEF] text-gray-700 border-b border-gray-300">
                              <tr>
                                <th className="border-r border-gray-300 px-2 py-1.5">Cód. Material</th>
                                <th className="border-r border-gray-300 px-2 py-1.5">Descrição do Produto</th>
                                <th className="border-r border-gray-300 px-2 py-1.5 text-center w-24">Lote</th>
                                <th className="border-r border-gray-300 px-2 py-1.5 text-center w-20">Qtd Nota</th>
                                <th className="px-2 py-1.5 text-center w-24">Qtd Bipada</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {inv.items.map((item, idx) => {
                                const isComplete = item.scannedQuantity >= item.noteQuantity;
                                return (
                                  <tr key={idx} className="hover:bg-blue-50">
                                    <td className="border-r border-gray-300 px-2 py-1 font-mono text-gray-800">{item.materialCode}</td>
                                    <td className="border-r border-gray-300 px-2 py-1 uppercase">{item.description}</td>
                                    <td className="border-r border-gray-300 px-2 py-1 text-center text-gray-600 font-mono">{item.batch || 'S/L'}</td>
                                    <td className="border-r border-gray-300 px-2 py-1 text-center font-bold text-gray-700">{item.noteQuantity}</td>
                                    <td className="px-2 py-1 text-center">
                                      <span className={`inline-block px-2 py-0.5 border rounded-sm font-bold text-[10px] ${isComplete ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-amber-50 border-amber-300 text-amber-700'}`}>
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

            </div>

            {/* Rodapé do Modal */}
            <div className="bg-[#E9ECEF] p-2.5 border-t border-gray-400 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedRomaneio(null)} 
                className="px-5 py-1.5 rounded-sm text-[11px] font-bold text-gray-700 bg-[#e4e4e4] hover:bg-[#d4d4d4] border border-gray-400 shadow-sm transition"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setSelectedRomaneio(null)} 
                className="px-6 py-1.5 rounded-sm text-[11px] font-bold text-white bg-[#3b6ea5] hover:bg-[#325d8c] border border-[#2b5580] shadow-sm transition"
              >
                OK
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}