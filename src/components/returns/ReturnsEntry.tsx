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
  
  // Estado para o histórico da NF
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

        // Preenche o histórico vindo do backend
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
        setInvoiceHistory([]); // Limpa o histórico no erro
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
    setInvoiceHistory([]); // Limpa o histórico
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

      // Como você mudou para a arquitetura de Service no back, a rota correta é a save-occurrence
      await apiServices.saveOccurrence(payload); 
      
      setManifestStatus('Finalizado / Gravado');
      showAlert('Ocorrências gravadas com sucesso!', 'success');
      
      // Opcional: Recarregar o histórico para mostrar a ação "FINALIZADA" que acabou de ser criada
      handleLoadInvoice({ key: 'Enter' } as React.KeyboardEvent<HTMLInputElement>);

    } catch (error) {
      console.error(error);
      showAlert('Erro ao gravar os dados no servidor.', 'error');
    }
  };

  return (
    <div className="bg-[#E9ECEF] w-full h-full p-3 font-sans text-xs text-slate-800 flex flex-col overflow-hidden">
      
      <div className="w-full h-full max-w-[1600px] mx-auto flex flex-col min-h-0 bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
        
        <SapAlertModal isOpen={alertOpen} message={alertMessage} type={alertType} onClose={() => setAlertOpen(false)} />

        <div className="bg-[#1E293B] text-white px-3 py-1.5 flex items-center justify-between shrink-0 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <span className="bg-[#2563EB] text-white font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">ZMM_RET</span>
            <span className="font-bold tracking-wide uppercase text-xs">Gestão de Devoluções & Tratamento de Ocorrências</span>
          </div>
          <div className="text-[10px] font-mono text-slate-300">
             PROD-SIMULATOR
          </div>
        </div>

        <div className="p-2 flex flex-col flex-1 min-h-0 bg-[#F8FAFC] gap-2">
          
          {/* BLOCO SUPERIOR: DADOS DA NF E OCORRÊNCIA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 shrink-0">
            
            {/* PAINEL ESQUERDO: DADOS DA NOTA FISCAL */}
            <div className="lg:col-span-7 bg-white border border-slate-300 rounded shadow-sm p-2 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
                <span className="font-bold text-[#1E293B] flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  1. Dados da Nota Fiscal & Cabeçalho
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 border ${
                  manifestStatus.includes('Finalizado') ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  {manifestStatus.includes('Finalizado') ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-amber-600" />}
                  {manifestStatus}
                </span>
              </div>
              
              <div className="grid grid-cols-12 gap-1.5">
                <div className="col-span-5 flex flex-col items-start">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">Nr. NFe GAM</label>
                  <div className="relative w-full">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
                    <input 
                      type="text" 
                      value={nfGamInput} 
                      onChange={(e) => setNfGamInput(e.target.value)}
                      onKeyDown={handleLoadInvoice}
                      placeholder="Bipe a NF..." 
                      className="w-full bg-white border border-slate-300 pl-7 pr-2 py-1 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-800 font-bold h-6 shadow-sm"
                    />
                  </div>
                </div>
                <div className="col-span-2 flex flex-col items-start">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">Série NFe</label>
                  <input type="text" value={serieNfGam} onChange={(e) => setSerieNfGam(e.target.value)} className="w-full bg-white border border-slate-300 px-2 py-1 rounded font-mono text-xs h-6 shadow-sm" placeholder="1" />
                </div>
                <div className="col-span-3 flex flex-col items-start">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">Nr. Nota Cliente</label>
                  <input type="text" value={nfClienteInput} onChange={(e) => setNfClienteInput(e.target.value)} className="w-full bg-white border border-slate-300 px-2 py-1 rounded font-mono text-xs h-6 shadow-sm" placeholder="NF..." />
                </div>
                <div className="col-span-2 flex flex-col items-start">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">Série</label>
                  <input type="text" value={serieNfCliente} onChange={(e) => setSerieNfCliente(e.target.value)} className="w-full bg-white border border-slate-300 px-2 py-1 rounded font-mono text-xs h-6 shadow-sm" placeholder="1" />
                </div>

                <div className="col-span-5 flex flex-col items-start mt-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">CNPJ Emitente</label>
                  <input type="text" value={companyCnpj} readOnly className="w-full bg-slate-100 border border-slate-300 px-2 py-1 rounded font-mono text-slate-700 outline-none text-xs h-6" placeholder="00.000.000/0000-00" />
                </div>
                <div className="col-span-7 flex flex-col items-start mt-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">Cliente / Razão Social</label>
                  <div className="flex items-center w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 h-6">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                    <input type="text" value={companyName} readOnly className="bg-transparent w-full font-medium text-slate-800 outline-none text-xs uppercase truncate" placeholder="Aguardando carga de dados..." />
                  </div>
                </div>
                
                <div className="col-span-4 flex flex-col items-start mt-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">Valor Total</label>
                  <div className="flex items-center w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 h-6">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 mr-1" />
                    <input type="text" value={totalValue} readOnly className="bg-transparent w-full font-mono text-slate-700 outline-none text-xs font-semibold" placeholder="R$ 0,00" />
                  </div>
                </div>
                <div className="col-span-4 flex flex-col items-start mt-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">Romaneio (SSW)</label>
                  <input type="text" value={manifesto} readOnly className="w-full bg-slate-100 border border-slate-300 px-2 py-1 rounded font-mono text-slate-700 outline-none text-xs font-semibold h-6" placeholder="REC-..." />
                </div>
                <div className="col-span-4 flex flex-col items-start mt-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">Período Pesquisa</label>
                  <select value={periodoPesquisa} onChange={(e) => setPeriodoPesquisa(e.target.value)} className="w-full bg-slate-100 border border-slate-300 px-2 py-1 rounded text-xs h-6">
                    <option>Últimos 4 Meses</option>
                    <option>Últimos 6 Meses</option>
                    <option>Este Ano</option>
                  </select>
                </div>

                <div className="col-span-12 flex flex-col items-start mt-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">Empresa de Origem NFe</label>
                  <select value={empresaOrigem} onChange={(e) => setEmpresaOrigem(e.target.value)} className="w-full bg-slate-100 border border-slate-300 px-2 py-1 rounded text-xs font-medium text-slate-700 h-6">
                    <option>07 - GAM SAO JOSE DOS CAMPOS</option>
                    <option>01 - GAM MATRIZ</option>
                  </select>
                </div>

              </div>
            </div>

            {/* PAINEL DIREITO: MOTIVO DEVOLUÇÃO */}
            <div className="lg:col-span-5 bg-white border border-slate-300 rounded shadow-sm p-2 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-2">
                <span className="font-bold text-[#1E293B] flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  2. Motivo Devolução
                </span>
              </div>
              
              <div className="grid grid-cols-12 gap-2">
                
                <div className="col-span-5 flex flex-col">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 text-left">Tipo Devolução</label>
                  <div className="flex flex-col gap-1.5 items-start mt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs w-full text-left">
                      <input type="radio" name="tipoDev" value="cliente" checked={tipoDevolucao === 'cliente'} onChange={() => setTipoDevolucao('cliente')} className="w-3 h-3 shrink-0" /> 
                      <span className="truncate">Devolução de Cliente</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs w-full text-left">
                      <input type="radio" name="tipoDev" value="estoque" checked={tipoDevolucao === 'estoque'} onChange={() => setTipoDevolucao('estoque')} className="w-3 h-3 shrink-0" /> 
                      <span className="truncate">Estorno Devol. Fornecedor</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs w-full text-left">
                      <input type="radio" name="tipoDev" value="fornecedor" checked={tipoDevolucao === 'fornecedor'} onChange={() => setTipoDevolucao('fornecedor')} className="w-3 h-3 shrink-0" /> 
                      <span className="truncate">Estorno Devol. Cliente</span>
                    </label>
                  </div>
                </div>

                <div className="col-span-7 flex flex-col gap-1.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block text-left">Origem</label>
                    <select 
                      value={origem} onChange={(e) => setOrigem(e.target.value)}
                      className="w-full bg-white border border-slate-300 px-2 py-1 rounded text-xs outline-none font-medium text-slate-800 h-6 shadow-sm"
                    >
                      <option value="">Selecione...</option>
                      <option value="COMERCIAL">Comercial</option>
                      <option value="LOGISTICA">Logística</option>
                      <option value="FISCAL">Fiscal</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block text-left">Motivo</label>
                    <select 
                      value={motivo} onChange={(e) => setMotivo(e.target.value)}
                      className="w-full bg-white border border-slate-300 px-2 py-1 rounded text-xs outline-none font-medium text-slate-800 h-6 shadow-sm"
                    >
                      <option value="">Selecione...</option>
                      <option value="AVARIA">Avaria</option>
                      <option value="FALTA">Falta de Mercadoria</option>
                      <option value="ATRASO">Atraso na Entrega</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block text-left">Detalhe do Motivo (Enter p/ preencher)</label>
                    <input 
                      type="text" 
                      value={detalheMotivo} 
                      onChange={(e) => setDetalheMotivo(e.target.value)}
                      onKeyDown={handleDetalheMotivoKeyDown} 
                      className="w-full bg-white border border-slate-300 px-2 py-1 rounded text-xs outline-none font-medium text-slate-800 h-6 shadow-sm focus:ring-1 focus:ring-amber-500 border-amber-300"
                      placeholder="Digite o código..." 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block text-left">Tipo Devolução (SAP)</label>
                    <select 
                      value={tipoDevolucaoSap} onChange={(e) => setTipoDevolucaoSap(e.target.value)}
                      className="w-full bg-white border border-slate-300 px-2 py-1 rounded text-xs outline-none font-medium text-slate-800 h-6 shadow-sm"
                    >
                      <option value="">Selecione...</option>
                      <option value="DEV_CLI">Devolução Cliente</option>
                      <option value="DEV_FOR">Devolução Fornecedor</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* BLOCO INFERIOR: TABELAS */}
          <div className="bg-white border border-slate-300 rounded shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
            
            <div className="flex border-b border-slate-300 bg-slate-100 px-3 pt-1 shrink-0 items-center justify-between">
              <div className="flex space-x-1">
                <button onClick={() => setActiveTab('items')} className={`px-3.5 py-1 font-bold text-xs rounded-t transition border-t border-x ${activeTab === 'items' ? 'bg-white text-[#1E293B] border-slate-300 -mb-[1px] shadow-sm' : 'text-slate-500 border-transparent hover:bg-slate-200'}`}>
                  Visão Geral de Itens ({returnItems.length})
                </button>
                
                <button onClick={() => setActiveTab('history')} className={`px-3.5 py-1 font-bold text-xs rounded-t transition border-t border-x flex items-center gap-1.5 ${activeTab === 'history' ? 'bg-white text-[#1E293B] border-slate-300 -mb-[1px] shadow-sm' : 'text-slate-500 border-transparent hover:bg-slate-200'}`}>
                  <History className="w-3.5 h-3.5 text-blue-600" /> Histórico de Devoluções
                </button>
              </div>

              <div className="flex items-center space-x-2 pb-1">
                <button onClick={handleCancel} className="bg-white hover:bg-red-50 text-slate-700 border border-slate-300 px-3 py-0.5 rounded font-bold shadow-sm transition flex items-center space-x-1 text-xs cursor-pointer">
                  <X className="w-3 h-3 text-red-600" />
                  <span>Cancelar</span>
                </button>
                <button onClick={handleSave} className="bg-[#1E293B] hover:bg-blue-700 text-white px-3 py-0.5 rounded font-bold shadow-sm transition flex items-center space-x-1 text-xs cursor-pointer">
                  <Save className="w-3 h-3 text-emerald-400" />
                  <span>Gravar</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 bg-white">
              {activeTab === 'items' && (
                <table className="w-full text-left text-xs border-collapse relative">
                  <thead className="bg-[#1E293B] text-white font-mono font-semibold sticky top-0 z-10 shadow-sm text-[10px]">
                    <tr>
                      <th className="py-1 px-2 border-r border-slate-700 w-10 text-center">#</th>
                      <th className="py-1 px-2 border-r border-slate-700 w-28">Nº Material</th>
                      <th className="py-1 px-2 border-r border-slate-700">Descrição do Produto (SAP)</th>
                      <th className="py-1 px-2 border-r border-slate-700 text-center w-20">Qtd Nota</th>
                      <th className="py-1 px-2 border-r border-slate-700 text-center w-20">Conferido</th>
                      <th className="py-1 px-2 border-r border-slate-700 w-56">Motivo do Item</th>
                      <th className="py-1 px-2 text-center w-24">Qtd Avariada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    {returnItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 italic font-sans">
                          Digite a NF e aperte Enter para carregar.
                        </td>
                      </tr>
                    ) : (
                      returnItems.map((item, idx) => {
                        const isComplete = item.checkedQty >= item.noteQty;
                        const hasMissing = item.checkedQty < item.noteQty && item.checkedQty > 0;

                        return (
                          <tr key={idx} onClick={() => setSelectedRowIndex(idx)} className={`cursor-pointer transition h-7 ${selectedRowIndex === idx ? 'bg-blue-50/80 border-l-4 border-blue-600 font-medium' : 'hover:bg-slate-50'}`}>
                            <td className="py-0.5 px-2 border-r border-slate-200 text-center text-slate-500">{idx + 1}</td>
                            <td className="py-0.5 px-2 border-r border-slate-200 font-bold text-slate-700">{item.code}</td>
                            <td className="py-0.5 px-2 border-r border-slate-200 font-sans font-medium text-slate-800 truncate max-w-[200px]">{item.desc}</td>
                            <td className="py-0.5 px-2 border-r border-slate-200 text-center font-bold text-slate-700">{item.noteQty}</td>
                            <td className={`py-0.5 px-2 border-r border-slate-200 text-center font-bold ${isComplete ? 'text-emerald-700 bg-emerald-50/20' : hasMissing ? 'text-amber-700 bg-amber-50/20' : 'text-slate-600'}`}>
                              {item.checkedQty}
                            </td>
                            <td className="py-0.5 px-2 border-r border-slate-200 font-sans">
                              <input
                                type="text"
                                value={item.specificReason}
                                onChange={(e) => {
                                  const upd = [...returnItems];
                                  upd[idx].specificReason = e.target.value;
                                  setReturnItems(upd);
                                }}
                                disabled={!detalheMotivo} 
                                className={`w-full bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[11px] focus:ring-1 focus:ring-blue-500 outline-none font-medium text-slate-800 h-5 shadow-sm ${!detalheMotivo ? 'opacity-70 cursor-not-allowed bg-slate-50' : ''}`}
                                placeholder="Aguardando..."
                              />
                            </td>
                            <td className="py-0.5 px-2 text-center">
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
                                className="w-12 bg-red-50 border border-red-300 text-red-700 font-bold px-1 py-0.5 rounded text-center font-mono mx-auto block text-[11px] focus:ring-1 focus:ring-red-500 outline-none h-5 shadow-sm" 
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'history' && (
                <div className="p-4">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-300 text-[11px]">
                      <tr>
                        <th className="py-1.5 px-3 border-r border-slate-200 w-40">Data/Hora</th>
                        <th className="py-1.5 px-3 border-r border-slate-200 w-32">Status</th>
                        <th className="py-1.5 px-3 border-r border-slate-200">Mensagem / Ocorrência</th>
                        <th className="py-1.5 px-3 border-r border-slate-200 w-32">Usuário</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {invoiceHistory.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-slate-400 italic font-sans">
                            Nenhum histórico registrado para esta NF.
                          </td>
                        </tr>
                      ) : (
                        invoiceHistory.map((event, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 border-r border-slate-200 font-mono text-[11px]">
                              {new Date(event.date).toLocaleString('pt-BR')}
                            </td>
                            <td className="py-1.5 px-3 border-r border-slate-200 font-bold text-[11px] text-blue-800">
                              {event.status}
                            </td>
                            <td className="py-1.5 px-3 border-r border-slate-200 text-slate-700">
                              {event.message}
                            </td>
                            <td className="py-1.5 px-3 border-r border-slate-200 text-[11px]">
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
          </div>

        </div>

      </div>
    </div>
  );
}