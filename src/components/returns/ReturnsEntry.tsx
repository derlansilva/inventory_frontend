import React, { useState } from 'react';
import { Save, X, Search, ShieldAlert, Building2, CheckCircle2, AlertCircle, Layers, DollarSign, FileText } from 'lucide-react';
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
  damagedQty: string | number; // Alterado para aceitar string durante a digitação
  batch?: string;
}

export default function ReturnsEntry() {
  const [invoiceInput, setInvoiceInput] = useState<string>('');
  const [manifesto, setManifesto] = useState<string>('');
  const [manifestStatus, setManifestStatus] = useState<string>('Aguardando Entrada');

  const [companyName, setCompanyName] = useState<string>('');
  const [companyCnpj, setCompanyCnpj] = useState<string>('');
  const [totalValue, setTotalValue] = useState<string>('');

  const [ocorrenciaMotivo, setOcorrenciaMotivo] = useState<string>('352 - Falta de Mercadoria (Retornou)');
  const [ocorrenciaSetor, setOcorrenciaSetor] = useState<string>('LOGISTICA');
  const [ocorrenciaObs, setOcorrenciaObs] = useState<string>('');

  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'batch'>('items');

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
      const query = invoiceInput.trim().toUpperCase();

      if (!query) {
        showAlert('Por favor, informe o número da NF.', 'warning');
        return;
      }

      try {
        const data = await apiServices.getInvoiceForScanning(query);

        setManifesto(data.receivingCode || 'REC-AGUARDANDO');
        setCompanyName(data.customerName || 'Empresa Não Identificada');
        setCompanyCnpj(data.customerCnpj || '00.000.000/0000-00');
        setTotalValue(data.totalValue ? `R$ ${data.totalValue.toFixed(2)}` : 'R$ 0,00');

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
          specificReason: '352 - Falta de Mercadoria (Retornou)',
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
      }
    }
  };

  const handleCancel = () => {
    setInvoiceInput('');
    setManifesto('');
    setCompanyName('');
    setCompanyCnpj('');
    setTotalValue('');
    setReturnItems([]);
    setManifestStatus('Aguardando Entrada');
    setSelectedRowIndex(null);
  };

  const handleSave = async () => {
    if (!manifesto) {
      showAlert('Nenhuma NF ativa para gravação.', 'warning');
      return;
    }

    try {
      const payload = {
        manifestCode: manifesto,
        status: 'Finalizado',
        ocorrencia: {
          motivoGeral: ocorrenciaMotivo,
          setor: ocorrenciaSetor,
          observacao: ocorrenciaObs,
          itens: returnItems.map(i => ({
            materialCode: i.code,
            motivoIndividual: i.specificReason,
            damagedQty: Number(i.damagedQty) || 0 // Converte para número na hora de salvar
          }))
        }
      };

      await apiServices.saveManifestBackend(payload);
      setManifestStatus('Finalizado / Gravado');
      showAlert('Ocorrências gravadas com sucesso!', 'success');
    } catch (error) {
      console.error(error);
      showAlert('Erro ao gravar os dados no servidor.', 'error');
    }
  };

  return (
    <div className="bg-[#E9ECEF] w-full h-full p-3 font-sans text-xs text-slate-800 flex flex-col overflow-hidden">
      
      <div className="w-full h-full max-w-[1600px] mx-auto flex flex-col min-h-0 bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
        
        <SapAlertModal isOpen={alertOpen} message={alertMessage} type={alertType} onClose={() => setAlertOpen(false)} />

        {/* CABEÇALHO DA TRANSAÇÃO SAP */}
        <div className="bg-[#1E293B] text-white px-3 py-1.5 flex items-center justify-between shrink-0 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <span className="bg-[#2563EB] text-white font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">ZMM_RET</span>
            <span className="font-bold tracking-wide uppercase text-xs">Gestão de Devoluções & Tratamento de Ocorrências</span>
          </div>
          <div className="text-[10px] font-mono text-slate-300">
             PROD-SIMULATOR
          </div>
        </div>

        <div className="p-3 flex flex-col flex-1 min-h-0 bg-[#F8FAFC] gap-3">
          
          {/* BLOCO SUPERIOR: DADOS DA NF E OCORRÊNCIA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0">
            
            {/* PAINEL ESQUERDO: DADOS DA NOTA FISCAL */}
            <div className="bg-white border border-slate-300 rounded shadow-sm p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2.5">
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
              
              <div className="grid grid-cols-12 gap-2">
                
                {/* Nota Fiscal */}
                <div className="col-span-5 flex flex-col items-start">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">Nota Fiscal</label>
                  <div className="relative w-full">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                    <input 
                      type="text" 
                      value={invoiceInput} 
                      onChange={(e) => setInvoiceInput(e.target.value)}
                      onKeyDown={handleLoadInvoice}
                      placeholder="NF..." 
                      className="w-full bg-white border border-slate-300 pl-7 pr-2 py-1 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-800 font-bold h-7 shadow-sm"
                    />
                  </div>
                </div>

                {/* Romaneio */}
                <div className="col-span-7 flex flex-col items-start">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">Romaneio</label>
                  <input type="text" value={manifesto} readOnly className="w-full bg-slate-100 border border-slate-300 px-2 py-1 rounded font-mono text-slate-700 outline-none text-xs font-semibold h-7" placeholder="REC-..." />
                </div>

                {/* CNPJ */}
                <div className="col-span-6 flex flex-col items-start mt-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">CNPJ Emitente</label>
                  <input type="text" value={companyCnpj} readOnly className="w-full bg-slate-100 border border-slate-300 px-2 py-1 rounded font-mono text-slate-700 outline-none text-xs h-7" placeholder="00.000.000/0000-00" />
                </div>

                {/* Valor Total */}
                <div className="col-span-6 flex flex-col items-start mt-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">Valor Total</label>
                  <div className="flex items-center w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 h-7">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 mr-1" />
                    <input type="text" value={totalValue} readOnly className="bg-transparent w-full font-mono text-slate-700 outline-none text-xs font-semibold" placeholder="R$ 0,00" />
                  </div>
                </div>

                {/* Empresa / Cliente */}
                <div className="col-span-12 flex flex-col items-start mt-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">Cliente / Razão Social</label>
                  <div className="flex items-center w-full bg-slate-100 border border-slate-300 rounded px-2 py-1 h-7">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                    <input type="text" value={companyName} readOnly className="bg-transparent w-full font-medium text-slate-800 outline-none text-xs uppercase truncate" placeholder="Aguardando carga de dados..." />
                  </div>
                </div>
              </div>
            </div>

            {/* PAINEL DIREITO: LANÇAMENTO DE OCORRÊNCIA */}
            <div className="bg-white border border-slate-300 rounded shadow-sm p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2.5">
                <span className="font-bold text-[#1E293B] flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  2. Parâmetros de Ocorrência SAP
                </span>
              </div>
              
              <div className="grid grid-cols-12 gap-2">
                

                

                {/* Setor */}
                <div className="col-span-12 flex flex-col items-start mt-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">Setor / Destino</label>
                  <select 
                    value={ocorrenciaSetor}
                    onChange={(e) => setOcorrenciaSetor(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-2 py-1 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none font-medium text-slate-800 h-7 shadow-sm"
                  >
                    <option value="LOGISTICA">Logística / Doca (05-DEVOLUCAO)</option>
                    <option value="SAC">SAC</option>
                    <option value="FISCAL">Fiscal</option>
                  </select>
                </div>

                {/* Setor */}
                <div className="col-span-12 flex flex-col items-start mt-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">Setor / Destino</label>
                  <select 
                    value={ocorrenciaSetor}
                    onChange={(e) => setOcorrenciaSetor(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-2 py-1 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none font-medium text-slate-800 h-7 shadow-sm"
                  >
                    <option value="LOGISTICA">Logística / Doca (05-DEVOLUCAO)</option>
                    <option value="SAC">SAC</option>
                    <option value="FISCAL">Fiscal</option>
                  </select>
                </div>



                {/* Motivo */}
                <div className="col-span-12 flex flex-col items-start">
                  <label className="text-[10px] font-bold text-slate-600 uppercase mb-1">Motivo Padrão</label>
                  <select 
                    value={ocorrenciaMotivo}
                    onChange={(e) => setOcorrenciaMotivo(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-2 py-1 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none font-medium text-slate-800 h-7 shadow-sm"
                  >
                    <option>352 - Falta de Mercadoria (Retornou)</option>
                    <option>351 - Falta de Mercadoria (Perda)</option>
                    <option>101 - Avaria de Transporte</option>
                    <option>103 - Lote Vencido</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* BLOCO INFERIOR: TABELA DE ITENS */}
          <div className="bg-white border border-slate-300 rounded shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
            
            {/* BARRA DE ABAS E BOTÕES */}
            <div className="flex border-b border-slate-300 bg-slate-100 px-3 pt-1.5 shrink-0 items-center justify-between">
              <div className="flex space-x-1">
                <button onClick={() => setActiveTab('items')} className={`px-3.5 py-1.5 font-bold text-xs rounded-t transition border-t border-x ${activeTab === 'items' ? 'bg-white text-[#1E293B] border-slate-300 -mb-[1px] shadow-sm' : 'text-slate-500 border-transparent hover:bg-slate-200'}`}>
                  Visão Geral de Itens ({returnItems.length})
                </button>
                <button onClick={() => setActiveTab('batch')} className={`px-3.5 py-1.5 font-bold text-xs rounded-t transition border-t border-x flex items-center gap-1.5 ${activeTab === 'batch' ? 'bg-white text-[#1E293B] border-slate-300 -mb-[1px] shadow-sm' : 'text-slate-500 border-transparent hover:bg-slate-200'}`}>
                  <Layers className="w-3.5 h-3.5 text-blue-600" /> Classificação & Lotes (05-DEVOLUCAO)
                </button>
              </div>

              <div className="flex items-center space-x-2 pb-1.5">
                <button onClick={handleCancel} className="bg-white hover:bg-red-50 text-slate-700 border border-slate-300 px-3 py-1 rounded font-bold shadow-sm transition flex items-center space-x-1 text-xs cursor-pointer">
                  <X className="w-3.5 h-3.5 text-red-600" />
                  <span>Cancelar</span>
                </button>
                <button onClick={handleSave} className="bg-[#1E293B] hover:bg-blue-700 text-white px-4 py-1 rounded font-bold shadow-sm transition flex items-center space-x-1.5 text-xs cursor-pointer">
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Gravar</span>
                </button>
              </div>
            </div>

            {/* ÁREA DE SCROLL EXCLUSIVA DA TABELA */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-white">
              {activeTab === 'items' ? (
                <table className="w-full text-left text-xs border-collapse relative">
                  <thead className="bg-[#1E293B] text-white font-mono font-semibold sticky top-0 z-10 shadow-sm text-[11px]">
                    <tr>
                      <th className="py-1.5 px-3 border-r border-slate-700 w-12 text-center">#</th>
                      <th className="py-1.5 px-3 border-r border-slate-700 w-32">Nº Material</th>
                      <th className="py-1.5 px-3 border-r border-slate-700">Descrição do Produto</th>
                      <th className="py-1.5 px-3 border-r border-slate-700 text-center w-24">Qtd Nota</th>
                      <th className="py-1.5 px-3 border-r border-slate-700 text-center w-24">Conferido</th>
                      <th className="py-1.5 px-3 border-r border-slate-700 w-64">Motivo do Item</th>
                      <th className="py-1.5 px-3 text-center w-28">Qtd Avariada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-xs">
                    {returnItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-10 text-center text-slate-400 italic font-sans">
                          Digite o número da Nota Fiscal acima e pressione Enter para carregar os itens.
                        </td>
                      </tr>
                    ) : (
                      returnItems.map((item, idx) => {
                        const isComplete = item.checkedQty >= item.noteQty;
                        const hasMissing = item.checkedQty < item.noteQty && item.checkedQty > 0;

                        return (
                          <tr key={idx} onClick={() => setSelectedRowIndex(idx)} className={`cursor-pointer transition h-8 ${selectedRowIndex === idx ? 'bg-blue-50/80 border-l-4 border-blue-600 font-medium' : 'hover:bg-slate-50'}`}>
                            <td className="py-1 px-3 border-r border-slate-200 text-center text-slate-500 text-[11px]">{idx + 1}</td>
                            <td className="py-1 px-3 border-r border-slate-200 font-bold text-slate-700 text-[11px]">{item.code}</td>
                            <td className="py-1 px-3 border-r border-slate-200 font-sans font-medium text-slate-800 text-[11px]">{item.desc}</td>
                            <td className="py-1 px-3 border-r border-slate-200 text-center font-bold text-slate-700 text-[11px]">{item.noteQty}</td>
                            <td className={`py-1 px-3 border-r border-slate-200 text-center font-bold text-[11px] ${isComplete ? 'text-emerald-700 bg-emerald-50/20' : hasMissing ? 'text-amber-700 bg-amber-50/20' : 'text-slate-600'}`}>
                              {item.checkedQty}
                            </td>
                            <td className="py-1 px-3 border-r border-slate-200 font-sans">
                              <select
                                value={item.specificReason}
                                onChange={(e) => {
                                  const upd = [...returnItems];
                                  upd[idx].specificReason = e.target.value;
                                  setReturnItems(upd);
                                }}
                                className="w-full bg-white border border-slate-300 px-1.5 py-0.5 rounded text-[11px] focus:ring-1 focus:ring-blue-500 outline-none font-medium text-slate-800 h-6 shadow-sm"
                              >
                                <option>352 - Falta de Mercadoria (Retornou)</option>
                                <option>351 - Falta de Mercadoria (Perda)</option>
                                <option>101 - Avaria de Transporte</option>
                                <option>103 - Lote Vencido</option>
                              </select>
                            </td>
                            <td className="py-1 px-3 text-center">
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
                                className="w-14 bg-red-50 border border-red-300 text-red-700 font-bold px-1.5 py-0.5 rounded text-center font-mono mx-auto block text-[11px] focus:ring-1 focus:ring-red-500 outline-none h-6 shadow-sm" 
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-slate-400 italic text-center font-sans">Nenhum lote carregado na transação.</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}