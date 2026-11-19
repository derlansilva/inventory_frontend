import React, { useState } from 'react';
import { Save, X, Search, ShieldAlert, Building2, CheckCircle2, AlertCircle, Layers, DollarSign, FileText, History } from 'lucide-react';
import SapAlertModal from '../SapAlertModal';
import { apiServices } from '../../services/apiServices';

interface ReturnItem {
  id?: number;
  code: string;
  desc: string;
  nfNumber: string;
  noteQty: number;
  specificReason: string;
  checkedQty: number;
  damagedQty: string | number;
  batch?: string;
}

interface HistoryEvent {
  date: string;
  status: string;
  message: string;
  user: string;
}

const DICIONARIO_MOTIVOS: Record<string, string> = {
  '352': '352 - Falta de Mercadoria (Retornou)',
  '351': '351 - Falta de Mercadoria (Perda)',
  '101': '101 - Avaria de Transporte',
  '103': '103 - Lote Vencido',
};

export default function ReturnsEntry() {
  const [nfGamInput, setNfGamInput] = useState('');
  const [serieNfGam, setSerieNfGam] = useState('');
  const [nfClienteInput, setNfClienteInput] = useState('');
  const [serieNfCliente, setSerieNfCliente] = useState('');
  
  const [manifesto, setManifesto] = useState<string>('');
  const [manifestStatus, setManifestStatus] = useState<string>('Aguardando Entrada');

  const [companyName, setCompanyName] = useState<string>('');
  const [companyCnpj, setCompanyCnpj] = useState<string>('');
  const [totalValue, setTotalValue] = useState<string>('');

  const [empresaOrigem, setEmpresaOrigem] = useState<string>('07 - GAM SAO JOSE DOS CAMPOS');
  const [periodoPesquisa, setPeriodoPesquisa] = useState<string>('Últimos 4 Meses');

  const [tipoDevolucao, setTipoDevolucao] = useState('cliente');
  const [origem, setOrigem] = useState('');
  const [motivo, setMotivo] = useState('');
  const [detalheMotivo, setDetalheMotivo] = useState(''); 
  const [tipoDevolucaoSap, setTipoDevolucaoSap] = useState('DEV_CLI');

  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  
  const [invoiceHistory, setInvoiceHistory] = useState<HistoryEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'batch' | 'history'>('items');

  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertType, setAlertType] = useState<'success' | 'warning' | 'error' | 'info'>('warning');

  const showAlert = (msg: string, type: 'success' | 'warning' | 'error' | 'info' = 'warning') => {
    setAlertMessage(msg);
    setAlertType(type);
    setAlertOpen(true);
  };

  const handleLoadInvoice = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const query = nfGamInput.trim().toUpperCase() || nfClienteInput.trim().toUpperCase();

      if (!query) {
        showAlert('Por favor, informe o número da NF.', 'warning');
        return;
      }

      try {
        const data = await apiServices.getInvoiceForScanning(query);

        setNfClienteInput(data.invoiceNumber || query);
        setManifesto(data.receivingCode ? data.receivingCode.replace('ROM-', '') : 'REC-AGUARDANDO');
        
        setCompanyName(data.customerName || 'Empresa Não Identificada');
        setCompanyCnpj(data.customerCnpj || '00.000.000/0000-00');
        setTotalValue(data.totalValue ? `R$ ${data.totalValue.toFixed(2)}` : 'R$ 0,00');

        setInvoiceHistory(data.history || []);

        const totalScanned = data.items.reduce((acc: number, item: any) => acc + (item.scannedQuantity || 0), 0);
        const totalExpected = data.items.reduce((acc: number, item: any) => acc + item.noteQuantity, 0);

        if (totalScanned === totalExpected) {
          setManifestStatus('Conferido / Finalizado');
        } else if (totalScanned > 0) {
          setManifestStatus(`Em Conferência (Faltam ${totalExpected - totalScanned} itens)`);
        } else {
          setManifestStatus('Aguardando Conferência');
        }

        let mappedItems: ReturnItem[] = data.items.map((item: any) => ({
          id: item.id,
          code: item.materialCode,
          desc: item.description,
          nfNumber: data.invoiceNumber,
          noteQty: item.noteQuantity,
          specificReason: '', 
          checkedQty: item.scannedQuantity || 0,
          damagedQty: 0,
          batch: item.batch
        }));

        setReturnItems(mappedItems);
        setSelectedRowIndex(mappedItems.length > 0 ? 0 : null);

      } catch (error) {
        console.error(error);
        showAlert(`NF "${query}" não encontrada ou XML não importado.`, 'error');
        setReturnItems([]);
        setCompanyName('');
        setCompanyCnpj('');
        setTotalValue('');
        setInvoiceHistory([]);
      }
    }
  };

  const handleDetalheMotivoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const textDigitado = detalheMotivo.trim();
      const codigo = textDigitado.split('-')[0].trim();
      const nomeCompleto = DICIONARIO_MOTIVOS[codigo] || textDigitado;

      setDetalheMotivo(nomeCompleto); 
      
      if (nomeCompleto) {
        setReturnItems(prev => prev.map(item => ({ ...item, specificReason: nomeCompleto })));
      }
    }
  };

  const handleCancel = () => {
    setNfGamInput('');
    setSerieNfGam('');
    setNfClienteInput('');
    setSerieNfCliente('');
    setManifesto('');
    setCompanyName('');
    setCompanyCnpj('');
    setTotalValue('');
    setReturnItems([]);
    setManifestStatus('Aguardando Entrada');
    setSelectedRowIndex(null);
    setOrigem('');
    setMotivo('');
    setDetalheMotivo('');
    setTipoDevolucaoSap('DEV_CLI');
    setInvoiceHistory([]);
  };

  const handleSave = async () => {
    if (!manifesto) {
      showAlert('Nenhuma NF ativa para gravação.', 'warning');
      return;
    }

    if (!detalheMotivo) {
      showAlert('Digite o Detalhe do Motivo no topo antes de gravar.', 'warning');
      return;
    }

    try {
      const payload = {
        invoiceNumber: nfClienteInput,
        manifestCode: manifesto,
        reason: motivo || detalheMotivo,
        items: returnItems.map(i => ({
          materialCode: i.code,
          damagedQty: Number(i.damagedQty) || 0,
          specificReason: i.specificReason
        }))
      };

      await apiServices.saveOccurrence(payload); 
      
      setManifestStatus('Finalizado / Gravado');
      showAlert('Ocorrências gravadas com sucesso!', 'success');
      
      handleLoadInvoice({ key: 'Enter' } as React.KeyboardEvent<HTMLInputElement>);

    } catch (error) {
      console.error(error);
      showAlert('Erro ao gravar os dados no servidor.', 'error');
    }
  };

  return (
    <div className="bg-[#E9ECEF] w-full h-full p-2 font-sans text-xs text-slate-800 flex flex-col overflow-hidden">
      
      <SapAlertModal isOpen={alertOpen} message={alertMessage} type={alertType} onClose={() => setAlertOpen(false)} />

      {/* CONTAINER PRINCIPAL */}
      <div className="w-full max-w-[1400px] mx-auto h-full flex flex-col min-h-0 bg-white border border-gray-400 shadow-sm overflow-hidden rounded-none">
        
        {/* BARRA DE TÍTULO */}
        <div className="bg-[#3b6ea5] text-white px-2 py-1 flex items-center justify-between shrink-0 border-b border-gray-500">
          <div className="flex items-center space-x-2">
            <span className="bg-white text-[#3b6ea5] font-mono font-bold px-1.5 py-0.5 rounded-sm text-[9px]"> 101 </span>
            <span className="font-bold text-[11px] tracking-wide">Gestão de Devoluções & Tratamento de Ocorrências</span>
          </div>
          <div className="text-[10px] font-mono text-white/80">PROD-SIMULATOR</div>
        </div>

        {/* BARRA DE FERRAMENTAS (TOOLBAR) - APENAS STATUS */}
        <div className="bg-[#e4e4e4] px-2 py-1 border-b border-gray-300 flex justify-between items-center shrink-0">
          <div className="flex gap-2 text-[10px] font-medium text-gray-700">
             <span className="px-2 py-0.5 border border-gray-400 bg-white shadow-sm rounded-sm">{manifestStatus}</span>
          </div>
        </div>

        {/* FORMULÁRIO DE CABEÇALHO */}
        <div className="p-1 bg-[#F0F0F0] border-b border-gray-400 shrink-0 flex gap-1">
          
          {/* PAINEL ESQUERDO: DADOS DA NOTA */}
          <div className="w-[55%] bg-white border border-gray-400 p-1.5 rounded-sm">
            <div className="flex items-center border-b border-gray-300 pb-1 mb-1.5">
              <span className="font-bold text-gray-700 text-[11px] uppercase flex items-center gap-1">
                <span className="w-1 h-3 bg-blue-600 inline-block"></span> 1. Dados da Nota Fiscal & Cabeçalho
              </span>
            </div>

            <div className="flex flex-col gap-1.5 text-[11px]">
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-[80%]">
                  <label className="w-20 text-right text-gray-600 shrink-0">Nr. NFe GAM:</label>
                  <div className="relative w-full">
                    <Search className="w-3 h-3 text-gray-400 absolute left-1 top-1.5" />
                    <input 
                      type="text" 
                      value={nfGamInput} 
                      onChange={(e) => setNfGamInput(e.target.value)}
                      onKeyDown={handleLoadInvoice}
                      className="w-full bg-white border border-gray-400 rounded-sm pl-6 pr-1 h-6 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      placeholder="Bipe a NF ou Chave..." 
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 w-[20%]">
                  <label className="w-10 text-right text-gray-600 shrink-0">Série:</label>
                  <input type="text" value={serieNfGam} onChange={(e) => setSerieNfGam(e.target.value)} className="w-full bg-white border border-gray-400 rounded-sm px-1 h-6 font-mono" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-[48%]">
                  <label className="w-20 text-right text-gray-600 shrink-0">Nota Cli:</label>
                  <input type="text" value={nfClienteInput} onChange={(e) => setNfClienteInput(e.target.value)} className="w-full bg-white border border-gray-400 rounded-sm px-1 h-6 font-mono" />
                </div>
                <div className="flex items-center gap-1 w-[20%]">
                  <label className="w-10 text-right text-gray-600 shrink-0">Série:</label>
                  <input type="text" value={serieNfCliente} onChange={(e) => setSerieNfCliente(e.target.value)} className="w-full bg-white border border-gray-400 rounded-sm px-1 h-6 font-mono" />
                </div>
                <div className="flex items-center gap-1 flex-1">
                  <label className="w-12 text-right text-gray-600 shrink-0">Valor:</label>
                  <input type="text" value={totalValue} readOnly className="w-full bg-[#f9f9f9] border border-gray-400 rounded-sm px-1 h-6 font-mono" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-[48%]">
                  <label className="w-20 text-right text-gray-600 shrink-0">CNPJ:</label>
                  <input type="text" value={companyCnpj} readOnly className="w-full bg-[#f9f9f9] border border-gray-400 rounded-sm px-1 h-6 font-mono" />
                </div>
                <div className="flex items-center gap-1 flex-1">
                  <label className="w-12 text-right text-gray-600 shrink-0">Cliente:</label>
                  <input type="text" value={companyName} readOnly className="w-full bg-[#f9f9f9] border border-gray-400 rounded-sm px-1 h-6 uppercase" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-[48%]">
                  <label className="w-20 text-right text-gray-600 shrink-0">Romaneio:</label>
                  <input type="text" value={manifesto} readOnly className="w-full bg-[#f9f9f9] border border-gray-400 rounded-sm px-1 h-6 font-mono" />
                </div>
                <div className="flex items-center gap-1 flex-1">
                  <label className="w-12 text-right text-gray-600 shrink-0">Período:</label>
                  <select value={periodoPesquisa} onChange={(e) => setPeriodoPesquisa(e.target.value)} className="w-full bg-white border border-gray-400 rounded-sm px-1 h-6">
                    <option>Últimos 4 Meses</option>
                    <option>Últimos 6 Meses</option>
                    <option>Este Ano</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-full">
                  <label className="w-20 text-right text-gray-600 shrink-0">Empresa:</label>
                  <select value={empresaOrigem} onChange={(e) => setEmpresaOrigem(e.target.value)} className="w-full bg-white border border-gray-400 rounded-sm px-1 h-6">
                    <option>07 - GAM SAO JOSE DOS CAMPOS</option>
                    <option>01 - GAM MATRIZ</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          {/* PAINEL DIREITO: MOTIVO DEVOLUÇÃO */}
          <div className="w-[45%] bg-white border border-gray-400 p-1.5 flex flex-col rounded-sm">
             <div className="flex items-center border-b border-gray-300 pb-1 mb-1.5">
              <span className="font-bold text-gray-700 text-[11px] uppercase flex items-center gap-1">
                <span className="w-1 h-3 bg-amber-500 inline-block"></span> 2. Motivo Devolução
              </span>
            </div>

            <div className="flex gap-2 flex-1">
              
              <div className="flex flex-col w-[40%] gap-1 text-[11px]">
                <label className="text-gray-600 font-bold mb-0.5">Tipo Devolução</label>
                <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="tp" checked={tipoDevolucao === 'cliente'} onChange={() => setTipoDevolucao('cliente')} /> Devolução de Cliente</label>
                <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="tp" checked={tipoDevolucao === 'estoque'} onChange={() => setTipoDevolucao('estoque')} /> Estorno Devol. Fornecedor</label>
                <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="tp" checked={tipoDevolucao === 'fornecedor'} onChange={() => setTipoDevolucao('fornecedor')} /> Estorno Devol. Cliente</label>
              </div>

              <div className="flex flex-col w-[60%] gap-1.5 text-[11px]">
                <div className="flex items-center gap-1 w-full">
                  <label className="w-14 text-right text-gray-600">Origem:</label>
                  <select value={origem} onChange={(e) => setOrigem(e.target.value)} className="flex-1 bg-white border border-gray-400 rounded-sm px-1 h-6">
                    <option value="">Selecione...</option>
                    <option value="COMERCIAL">Comercial</option>
                    <option value="LOGISTICA">Logística</option>
                    <option value="FISCAL">Fiscal</option>
                  </select>
                </div>
                <div className="flex items-center gap-1 w-full">
                  <label className="w-14 text-right text-gray-600">Motivo:</label>
                  <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className="flex-1 bg-white border border-gray-400 rounded-sm px-1 h-6">
                    <option value="">Selecione...</option>
                    <option value="AVARIA">Avaria</option>
                    <option value="FALTA">Falta de Mercadoria</option>
                    <option value="ATRASO">Atraso na Entrega</option>
                  </select>
                </div>
                <div className="flex items-center gap-1 w-full">
                  <label className="w-14 text-right text-gray-600">Detalhe:</label>
                  <input 
                    type="text" 
                    value={detalheMotivo} 
                    onChange={(e) => setDetalheMotivo(e.target.value)}
                    onKeyDown={handleDetalheMotivoKeyDown} 
                    className="flex-1 bg-white border border-gray-400 rounded-sm px-1 h-6 focus:ring-1 focus:ring-blue-500" 
                    placeholder="Digite o código e Enter..." 
                  />
                </div>
                <div className="flex items-center gap-1 w-full">
                  <label className="w-14 text-right text-gray-600">Tipo SAP:</label>
                  <select value={tipoDevolucaoSap} onChange={(e) => setTipoDevolucaoSap(e.target.value)} className="flex-1 bg-white border border-gray-400 rounded-sm px-1 h-6">
                    <option value="DEV_CLI">Devolução Cliente</option>
                    <option value="DEV_FOR">Devolução Fornecedor</option>
                  </select>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ABAS ESTILO SAP (PASTAS) */}
        <div className="flex border-b border-gray-400 bg-[#F0F0F0] shrink-0 overflow-x-auto pt-1 px-1 gap-1">
          <button 
            onClick={() => setActiveTab('items')}
            className={`px-3 py-1 text-[11px] border border-gray-400 border-b-0 rounded-t-sm transition-colors flex items-center gap-1 whitespace-nowrap ${activeTab === 'items' ? 'bg-white text-gray-800 font-bold -mb-[1px] pb-[5px]' : 'bg-[#dcdcdc] text-gray-600 hover:bg-[#e4e4e4]'}`}
          >
            Visão Geral de Itens ({returnItems.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 text-[11px] border border-gray-400 border-b-0 rounded-t-sm transition-colors flex items-center gap-1 whitespace-nowrap ${activeTab === 'history' ? 'bg-white text-gray-800 font-bold -mb-[1px] pb-[5px]' : 'bg-[#dcdcdc] text-gray-600 hover:bg-[#e4e4e4]'}`}
          >
            <History className="w-3 h-3" /> Histórico de Devoluções
          </button>
        </div>

        {/* TABELAS */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          
          {activeTab === 'items' && (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-[11px] border-collapse bg-white">
                <thead className="bg-[#e4e4e4] text-gray-700 font-medium border-b border-gray-400 sticky top-0 z-10">
                  <tr>
                    <th className="border-r border-gray-300 px-2 py-1 w-8 text-center">#</th>
                    <th className="border-r border-gray-300 px-2 py-1 w-24">Nº Material</th>
                    <th className="border-r border-gray-300 px-2 py-1">Descrição do Produto (SAP)</th>
                    <th className="border-r border-gray-300 px-2 py-1 text-center w-20">Qtd Nota</th>
                    <th className="border-r border-gray-300 px-2 py-1 text-center w-20">Conferido</th>
                    <th className="border-r border-gray-300 px-2 py-1 w-64">Motivo do Item</th>
                    <th className="border-r border-gray-300 px-2 py-1 text-center w-24">Qtd Avariada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {returnItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                        Digite a NF e aperte Enter para carregar.
                      </td>
                    </tr>
                  ) : (
                    returnItems.map((item, idx) => {
                      const isComplete = item.checkedQty >= item.noteQty;
                      const hasMissing = item.checkedQty < item.noteQty && item.checkedQty > 0;

                      return (
                        <tr key={idx} onClick={() => setSelectedRowIndex(idx)} className={`cursor-pointer transition-colors ${selectedRowIndex === idx ? 'bg-blue-50' : 'hover:bg-gray-100'}`}>
                          <td className="border-r border-gray-300 px-2 py-0.5 text-center text-gray-500">{idx + 1}</td>
                          <td className="border-r border-gray-300 px-2 py-0.5 font-mono text-gray-800">{item.code}</td>
                          <td className="border-r border-gray-300 px-2 py-0.5 uppercase truncate">{item.desc}</td>
                          <td className="border-r border-gray-300 px-2 py-0.5 text-center font-bold">{item.noteQty}</td>
                          <td className={`border-r border-gray-300 px-2 py-0.5 text-center font-bold ${isComplete ? 'text-emerald-700 bg-emerald-50/20' : hasMissing ? 'text-amber-700 bg-amber-50/20' : 'text-gray-600'}`}>
                            {item.checkedQty}
                          </td>
                          <td className="border-r border-gray-300 p-0">
                            <input
                              type="text"
                              value={item.specificReason}
                              onChange={(e) => {
                                const upd = [...returnItems];
                                upd[idx].specificReason = e.target.value;
                                setReturnItems(upd);
                              }}
                              disabled={!detalheMotivo} 
                              className={`w-full h-full p-1 border-none outline-none bg-transparent text-[11px] focus:ring-1 focus:ring-blue-500 rounded-sm ${!detalheMotivo ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                              placeholder="Aguardando..."
                            />
                          </td>
                          <td className="px-2 py-0.5 text-center">
                            <input 
                              type="text" 
                              inputMode="numeric"
                              value={item.damagedQty === 0 ? '' : item.damagedQty}
                              onChange={(e) => { 
                                const onlyNumbers = e.target.value.replace(/\D/g, '');
                                const upd = [...returnItems]; 
                                upd[idx].damagedQty = onlyNumbers; 
                                setReturnItems(upd); 
                              }}
                              onBlur={() => {
                                const upd = [...returnItems];
                                if (upd[idx].damagedQty === '') {
                                   upd[idx].damagedQty = 0;
                                   setReturnItems(upd);
                                }
                              }}
                              className="w-12 bg-white border border-gray-400 rounded-sm text-gray-800 font-mono text-center mx-auto block text-[11px] focus:ring-1 focus:ring-blue-500 outline-none h-5 shadow-sm" 
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="flex-1 overflow-auto p-2">
              <table className="w-full text-left text-[11px] border-collapse bg-white">
                <thead className="bg-[#e4e4e4] text-gray-700 font-medium border-b border-gray-400 sticky top-0 z-10">
                  <tr>
                    <th className="border-r border-gray-300 px-2 py-1 w-40">Data/Hora</th>
                    <th className="border-r border-gray-300 px-2 py-1 w-32">Status</th>
                    <th className="border-r border-gray-300 px-2 py-1">Mensagem / Ocorrência</th>
                    <th className="border-r border-gray-300 px-2 py-1 w-32">Usuário</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {invoiceHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-400 italic font-sans">
                        Nenhum histórico registrado para esta NF.
                      </td>
                    </tr>
                  ) : (
                    invoiceHistory.map((event, idx) => (
                      <tr key={idx} className="hover:bg-gray-100">
                        <td className="border-r border-gray-300 px-2 py-0.5 font-mono text-[11px]">
                          {new Date(event.date).toLocaleString('pt-BR')}
                        </td>
                        <td className="border-r border-gray-300 px-2 py-0.5 font-bold text-[11px] text-gray-800">
                          {event.status}
                        </td>
                        <td className="border-r border-gray-300 px-2 py-0.5 text-gray-700">
                          {event.message}
                        </td>
                        <td className="border-r border-gray-300 px-2 py-0.5 text-[11px]">
                          {event.user}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RODAPÉ COM OS BOTÕES CANCELAR E GRAVAR (SÓ APARECEM SE HOUVER ITENS NA LISTA) */}
        <div className="bg-[#F0F0F0] border-t border-gray-400 px-2 py-0.5 flex justify-between items-center text-[10px] text-gray-600 shrink-0">
          <span>Sistema Integrado de Gestão V1.0</span>
          
          <div className="flex items-center gap-2">
            {returnItems.length > 0 ? (
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handleCancel}
                  className="bg-[#e4e4e4] hover:bg-[#d4d4d4] text-gray-700 border border-gray-400 rounded-sm px-2 py-0.5 font-bold flex items-center gap-1 transition shadow-sm"
                >
                  <X className="w-3 h-3 text-red-600" /> Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  className="bg-[#e4e4e4] hover:bg-[#d4d4d4] text-gray-700 border border-gray-400 rounded-sm px-2 py-0.5 font-bold flex items-center gap-1 transition shadow-sm"
                >
                  <Save className="w-3 h-3 text-blue-700" /> Gravar
                </button>
              </div>
            ) : (
              <span>Pronto</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}