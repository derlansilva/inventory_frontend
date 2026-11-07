import React, { useState } from 'react';
import { Save, X, Search, ShieldAlert, Building2, CheckCircle2, AlertCircle, Layers, DollarSign } from 'lucide-react';
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
  damagedQty: number;
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
          // AQUI ESTÁ O SEGREDO: O nome tem que ser igual ao que o backend envia
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
            damagedQty: i.damagedQty
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
    <div className="bg-[#E9ECEF] w-full h-full p-3 font-sans text-xs text-gray-800 flex flex-col overflow-hidden">
      
      <div className="w-full h-full max-w-[1600px] mx-auto flex flex-col min-h-0">
        
        <SapAlertModal isOpen={alertOpen} message={alertMessage} type={alertType} onClose={() => setAlertOpen(false)} />

        {/* ========================================================= */}
        {/* BLOCO SUPERIOR: DADOS DA NF E OCORRÊNCIA                  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0 mb-3">
          
          {/* PAINEL ESQUERDO: DADOS DA NOTA FISCAL */}
          <div className="bg-white border border-gray-300 rounded shadow-sm">
            <div className="bg-gray-50 border-b border-gray-300 p-1.5 px-3 rounded-t flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-blue-800" />
              <h3 className="text-[10px] font-bold text-gray-700 uppercase">Dados da Nota Fiscal</h3>
            </div>
            
            {/* Inputs em linha para diminuir a altura */}
            <div className="p-2 grid grid-cols-12 gap-2">
              
              {/* Linha 1: NF (menor) e Status */}
              <div className="col-span-5 flex flex-col items-start">
                <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 pl-1">Nota Fiscal</label>
                <div className="relative w-full">
                  <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1.5" />
                  <input 
                    type="text" 
                    value={invoiceInput} 
                    onChange={(e) => setInvoiceInput(e.target.value)}
                    onKeyDown={handleLoadInvoice}
                    placeholder="NF..." 
                    className="w-full bg-gray-50 border border-gray-300 pl-7 pr-2 py-0.5 rounded font-mono text-xs focus:ring-1 focus:ring-gray-400 focus:outline-none text-gray-800 font-bold h-6"
                  />
                </div>
              </div>

              <div className="col-span-7 flex flex-col items-start">
                <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 pl-1">Status Carga</label>
                <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded border w-full h-6 ${
                  manifestStatus.includes('Finalizado') ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'
                }`}>
                  {manifestStatus.includes('Finalizado') ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-amber-600" />}
                  <span className={`font-mono font-bold text-[9px] truncate ${manifestStatus.includes('Finalizado') ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {manifestStatus}
                  </span>
                </div>
              </div>

              {/* Linha 2: Romaneio, CNPJ e Valor */}
              <div className="col-span-4 flex flex-col items-start">
                <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 pl-1">Romaneio</label>
                <input type="text" value={manifesto} readOnly className="w-full bg-gray-50 border border-gray-300 px-2 py-0.5 rounded font-mono text-gray-700 outline-none text-[10px] h-6" placeholder="REC-..." />
              </div>

              <div className="col-span-4 flex flex-col items-start">
                <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 pl-1">CNPJ</label>
                <input type="text" value={companyCnpj} readOnly className="w-full bg-gray-50 border border-gray-300 px-2 py-0.5 rounded font-mono text-gray-700 outline-none text-[10px] h-6" placeholder="00.000.000/0000-00" />
              </div>

              <div className="col-span-4 flex flex-col items-start">
                <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 pl-1">Valor Total</label>
                <div className="flex items-center w-full bg-gray-50 border border-gray-300 rounded px-2 py-0.5 h-6">
                  <DollarSign className="w-3 h-3 text-gray-400 mr-1" />
                  <input type="text" value={totalValue} readOnly className="bg-transparent w-full font-mono text-gray-700 outline-none text-[10px]" placeholder="R$ 0,00" />
                </div>
              </div>

              {/* Linha 3: Empresa */}
              <div className="col-span-12 flex flex-col items-start">
                <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 pl-1">Empresa / Cliente</label>
                <div className="flex items-center w-full bg-gray-50 border border-gray-300 rounded px-2 py-0.5 h-6">
                  <Building2 className="w-3 h-3 text-gray-400 mr-1.5" />
                  <input type="text" value={companyName} readOnly className="bg-transparent w-full font-medium text-gray-700 outline-none text-[10px]" placeholder="Aguardando..." />
                </div>
              </div>
            </div>
          </div>

          {/* PAINEL DIREITO: LANÇAMENTO DE OCORRÊNCIA */}
          <div className="bg-white border border-gray-300 rounded shadow-sm">
            <div className="bg-orange-50 border-b border-orange-200 p-1.5 px-3 rounded-t flex items-center space-x-2">
              <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
              <h3 className="text-[10px] font-bold text-orange-800 uppercase">Lançamento de Ocorrência</h3>
            </div>
            
            <div className="p-2 grid grid-cols-12 gap-2">
              {/* Motivo */}
              <div className="col-span-12 flex flex-col items-start">
                <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 pl-1">Motivo Padrão</label>
                <select 
                  value={ocorrenciaMotivo}
                  onChange={(e) => setOcorrenciaMotivo(e.target.value)}
                  className="w-full bg-white border border-gray-300 px-2 py-0.5 rounded text-[10px] focus:ring-1 focus:ring-orange-500 outline-none font-medium h-6"
                >
                  <option>352 - Falta de Mercadoria (Retornou)</option>
                  <option>351 - Falta de Mercadoria (Perda)</option>
                  <option>101 - Avaria de Transporte</option>
                  <option>103 - Lote Vencido</option>
                </select>
              </div>

              {/* Setor */}
              <div className="col-span-12 flex flex-col items-start">
                <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 pl-1">Setor</label>
                <select 
                  value={ocorrenciaSetor}
                  onChange={(e) => setOcorrenciaSetor(e.target.value)}
                  className="w-full bg-white border border-gray-300 px-2 py-0.5 rounded text-[10px] focus:ring-1 focus:ring-orange-500 outline-none font-medium h-6"
                >
                  <option value="LOGISTICA">Logística / Doca</option>
                  <option value="SAC">SAC</option>
                  <option value="FISCAL">Fiscal</option>
                </select>
              </div>

              {/* Observação */}
              <div className="col-span-12 flex flex-col items-start">
                <label className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 pl-1">Observação Geral</label>
                <textarea 
                  value={ocorrenciaObs}
                  onChange={(e) => setOcorrenciaObs(e.target.value)}
                  placeholder="Descreva detalhes..." 
                  className="w-full bg-white border border-gray-300 px-2 py-1 rounded text-[10px] focus:ring-1 focus:ring-orange-500 outline-none resize-none h-[32px]"
                />
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* BLOCO INFERIOR: TABELA DE ITENS                           */}
        {/* ========================================================= */}
        <div className="bg-white border border-gray-300 rounded shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
          
          {/* BARRA DE ABAS E BOTÕES */}
          <div className="flex border-b border-gray-300 bg-gray-50 px-2 pt-1 shrink-0 items-end justify-between">
            <div className="flex space-x-1">
              <button onClick={() => setActiveTab('items')} className={`px-3 py-1.5 font-bold text-[10px] rounded-t-md transition ${activeTab === 'items' ? 'bg-white text-[#002B49] border border-gray-300 border-b-white -mb-[1px]' : 'text-gray-500 hover:bg-gray-100'}`}>
                Visão Geral de Itens ({returnItems.length})
              </button>
              <button onClick={() => setActiveTab('batch')} className={`px-3 py-1.5 font-bold text-[10px] rounded-t-md transition flex items-center gap-1 ${activeTab === 'batch' ? 'bg-white text-[#002B49] border border-gray-300 border-b-white -mb-[1px]' : 'text-gray-500 hover:bg-gray-100'}`}>
                <Layers className="w-3 h-3" /> Classificação & Lote
              </button>
            </div>

            <div className="flex items-center space-x-2 pb-1">
              <button onClick={handleCancel} className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1 rounded font-bold shadow-sm transition flex items-center space-x-1 text-[10px]">
                <X className="w-3 h-3 text-red-600" />
                <span>Cancelar</span>
              </button>
              <button onClick={handleSave} className="bg-[#002B49] hover:bg-blue-900 text-white px-3 py-1 rounded font-bold shadow-sm transition flex items-center space-x-1 text-[10px]">
                <Save className="w-3 h-3" />
                <span>Gravar</span>
              </button>
            </div>
          </div>

          {/* ÁREA DE SCROLL EXCLUSIVA DA TABELA */}
          <div className="flex-1 overflow-y-auto min-h-0 bg-white">
            {activeTab === 'items' ? (
              <table className="w-full text-left text-[10px] border-collapse relative">
                <thead className="bg-[#002B49] text-white font-semibold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-1 border-r border-blue-900 w-8 text-center">#</th>
                    <th className="p-1 border-r border-blue-900 w-24">Nº Material</th>
                    <th className="p-1 border-r border-blue-900">Descrição</th>
                    <th className="p-1 border-r border-blue-900 text-center w-16">Qtd Nota</th>
                    <th className="p-1 border-r border-blue-900 text-center w-20">Conferido</th>
                    <th className="p-1 border-r border-blue-900 w-56">Motivo do Item</th>
                    <th className="p-1 text-center w-20">Qtd Avariada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {returnItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                        Digite a Nota Fiscal acima para carregar os itens.
                      </td>
                    </tr>
                  ) : (
                    returnItems.map((item, idx) => {
                      const isComplete = item.checkedQty >= item.noteQty;
                      const hasMissing = item.checkedQty < item.noteQty && item.checkedQty > 0;

                      return (
                        <tr key={idx} onClick={() => setSelectedRowIndex(idx)} className={`cursor-pointer transition ${selectedRowIndex === idx ? 'bg-blue-50 border-l-4 border-[#002B49] font-medium' : 'hover:bg-blue-50/50'}`}>
                          <td className="p-1 border-r border-gray-200 text-center font-mono text-gray-500">{idx + 1}</td>
                          <td className="p-1 border-r border-gray-200 font-mono font-bold text-blue-900">{item.code}</td>
                          <td className="p-1 border-r border-gray-200 font-medium text-gray-700">{item.desc}</td>
                          <td className="p-1 border-r border-gray-200 text-center font-mono font-bold">{item.noteQty}</td>
                          <td className={`p-1 border-r border-gray-200 text-center font-mono font-bold ${isComplete ? 'text-emerald-600' : hasMissing ? 'text-amber-600' : 'text-gray-500'}`}>
                            {item.checkedQty}
                          </td>
                          <td className="p-1 border-r border-gray-200">
                            <select
                              value={item.specificReason}
                              onChange={(e) => {
                                const upd = [...returnItems];
                                upd[idx].specificReason = e.target.value;
                                setReturnItems(upd);
                              }}
                              className="w-full bg-white border border-gray-300 px-1 py-0.5 rounded text-[9px] focus:ring-1 focus:ring-blue-500 outline-none font-medium text-gray-700 h-6"
                            >
                              <option>352 - Falta de Mercadoria (Retornou)</option>
                              <option>351 - Falta de Mercadoria (Perda)</option>
                              <option>101 - Avaria de Transporte</option>
                              <option>103 - Lote Vencido</option>
                            </select>
                          </td>
                          <td className="p-1 text-center">
                            <input 
                              type="number" 
                              value={item.damagedQty} 
                              onChange={(e) => { 
                                const upd = [...returnItems]; 
                                upd[idx].damagedQty = Number(e.target.value); 
                                setReturnItems(upd); 
                              }} 
                              className="w-12 bg-red-50 border border-red-300 text-red-700 font-bold px-1 py-0.5 rounded text-center font-mono mx-auto block text-[10px] focus:ring-1 focus:ring-red-500 outline-none h-6" 
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            ) : (
              <div className="p-4 text-gray-400 italic text-center">Nenhum lote carregado.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}