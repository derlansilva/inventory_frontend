import React, { useState } from 'react';
import { Save, X, Plus, Trash2, Search, Filter, MessageSquare, Layers, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
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
  expiryDate?: string;
  disposition?: string;
}

interface TimelineEvent {
  step: string;
  authorOrLocation: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending';
}

export default function ReturnsEntry() {
  const [nfInput, setNfInput] = useState<string>('');
  const [manifesto, setManifesto] = useState<string>(''); 
  const [customer, setCustomer] = useState<string>('');
  const [manifestStatus, setManifestStatus] = useState<string>('Aguardando Entrada');
  
  const [salesOrg, setSalesOrg] = useState<string>('');
  const [distributionChannel, setDistributionChannel] = useState<string>('');
  const [generalReason, setGeneralReason] = useState<string>('');

  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState<'items' | 'texts' | 'batch' | 'history'>('items');

  const [driverComments, setDriverComments] = useState<string>('');
  const [sacNotes, setSacNotes] = useState<string>('');
  const [timelineHistory, setTimelineHistory] = useState<TimelineEvent[]>([]);

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
      const query = nfInput.trim().toUpperCase();
      
      if (!query) {
        showAlert('Por favor, informe o número do Romaneio.', 'warning');
        return;
      }

      try {
        // Se o utilizador digitou apenas "8923", adicionamos "ROM-" para coincidir com a BD ("ROM-8923")
        const formattedCode = query.startsWith('ROM-') ? query : `ROM-${query}`;
        
        const data = await apiServices.getManifestByCode(formattedCode);
       console.log("OBJETO COMPLETO DO BACKEND:", data);
console.log("CHAVES DISPONÍVEIS:", Object.keys(data));


        setManifesto(data.manifestCode || formattedCode);
        setManifestStatus(data.status || 'Romaneio em Aberto');
        
        setCustomer(data.customerName || 'CUS9999 - Cliente Cadastrado');
        setSalesOrg(data.salesOrg || '2000 - Pharma Curitiba Logística');

       let mappedItems: ReturnItem[] = [];
        
        if (data.invoices && Array.isArray(data.invoices)) {
          data.invoices.forEach((inv: any) => {
            const itemsList = inv.items || inv.returnItemEntities || inv.returnItems || [];
            
            itemsList.forEach((item: any) => {
              mappedItems.push({
                id: item.id,
                // Varre todas as hipóteses possíveis de nomes que o backend possa estar a usar para o código do material
                code: item.materialCode || item.code || item.productCode || item.sku || item.itemCode || `MAT-${item.id}`,
                desc: item.description || item.desc || item.productName || 'MALBEC DESODORANTE COLONIA 100ML',
                nfNumber: inv.nfNumber || formattedCode,
                noteQty: item.noteQty ?? item.quantity ?? 1,
                specificReason: item.specificReason || '352 - Falta Parcial',
                checkedQty: item.checkedQty ?? 0,
                damagedQty: item.damagedQty ?? 0,
                batch: item.batch || 'LOTE-EMS-880',
                expiryDate: item.expiryDate || '2028-12-31',
                disposition: item.disposition || 'DISPONIVEL'
              });
            });
          });
        }

        setReturnItems(mappedItems);
        setSelectedRowIndex(mappedItems.length > 0 ? 0 : null);

      } catch (error) {
        console.error(error);
        showAlert(`Romaneio "${query}" não encontrado no servidor.`, 'error');
        setReturnItems([]);
      }
    }
  };

  const handleInsertRow = () => {
    const newItem: ReturnItem = {
      code: 'SC2001',
      desc: 'Ibuprofeno 600mg (Cx 30 Comprimidos)',
      nfNumber: nfInput.trim().toUpperCase() || '47845',
      noteQty: 4,
      specificReason: generalReason || 'Geral',
      checkedQty: 0,
      damagedQty: 0,
      batch: 'LOT-2026C',
      expiryDate: '2029-01-10',
      disposition: 'Área de Quarentena (Q-01)'
    };
    setReturnItems([...returnItems, newItem]);
    setSelectedRowIndex(returnItems.length);
  };

  const handleDeleteRow = () => {
    if (selectedRowIndex === null || selectedRowIndex < 0 || selectedRowIndex >= returnItems.length) {
      showAlert('Selecione uma linha na tabela para eliminar.', 'warning');
      return;
    }
    const updated = returnItems.filter((_, idx) => idx !== selectedRowIndex);
    setReturnItems(updated);
    setSelectedRowIndex(updated.length > 0 ? Math.max(0, selectedRowIndex - 1) : null);
  };

  const handleCancel = () => {
    setNfInput('');
    setManifesto('');
    setCustomer('');
    setSalesOrg('');
    setDistributionChannel('');
    setGeneralReason('');
    setReturnItems([]);
    setManifestStatus('Aguardando Entrada');
    setDriverComments('');
    setSacNotes('');
    setTimelineHistory([]);
    setSelectedRowIndex(null);
  };

  const handleSave = async () => {
    if (!manifesto) {
      showAlert('Nenhum romaneio ativo para gravação.', 'warning');
      return;
    }

    try {
      const payload = {
        manifestCode: manifesto,
        status: 'Finalizado'
      };
      
      await apiServices.saveManifestBackend(payload);
      setManifestStatus('Finalizado / Gravado no S/4HANA');
      showAlert('Ocorrências e devoluções gravadas com sucesso!', 'success');
    } catch (error) {
      console.error(error);
      showAlert('Erro ao gravar os dados no servidor.', 'error');
    }
  };

  return (
    <div className="bg-gray-100 w-full py-4 px-6 font-sans text-xs text-gray-800 flex flex-col space-y-3">
      
      <SapAlertModal 
        isOpen={alertOpen}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertOpen(false)}
      />

      {/* 1. BARRA DE TÍTULO CLÁSSICA SAP GUI */}
      <div className="bg-[#002B49] text-white px-4 py-1.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="font-mono bg-[#1E4D6B] px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">ZMM_RET</span>
          <span className="font-semibold tracking-wide text-xs">Visão Geral de Lançamento de Devoluções & Reclamações de Clientes</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-300 text-[10px] font-mono">
          <span>Mandante: 100</span>
          <span>Utilizador: OP_LOGISTICA</span>
        </div>
      </div>

      {/* 2. BARRA DE FERRAMENTAS SUPERIOR */}
      <div className="bg-transparent px-0 py-1 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button onClick={handleSave} className="p-1 hover:bg-gray-200/60 rounded text-gray-700 cursor-pointer flex items-center space-x-1" title="Gravar (Ctrl+S)">
            <Save className="w-3.5 h-3.5 text-blue-900" />
            <span className="text-[11px] font-medium">Gravar</span>
          </button>

          <button onClick={handleCancel} className="p-1 hover:bg-gray-200/60 rounded text-gray-700 cursor-pointer flex items-center space-x-1" title="Cancelar">
            <X className="w-3.5 h-3.5 text-red-700" />
            <span className="text-[11px] font-medium">Cancelar</span>
          </button>

          <div className="h-3.5 w-[1px] bg-gray-300 mx-1"></div>

          <button onClick={handleInsertRow} className="p-1 hover:bg-gray-200/60 rounded text-gray-700 cursor-pointer flex items-center space-x-1" title="Inserir">
            <Plus className="w-3.5 h-3.5 text-green-700" />
            <span className="text-[11px] font-medium">Inserir</span>
          </button>

          <button onClick={handleDeleteRow} className="p-1 hover:bg-gray-200/60 rounded text-gray-700 cursor-pointer flex items-center space-x-1" title="Eliminar">
            <Trash2 className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-[11px] font-medium">Eliminar</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-500 font-mono text-[10px]">Transação:</span>
          <input type="text" readOnly value="ZMM_RET / VA01" className="bg-white/80 border border-gray-300 px-2 py-0.5 rounded text-center font-mono text-[11px] w-28 text-gray-600 focus:outline-none" />
        </div>
      </div>

      {/* 3. CABEÇALHO DE DADOS MESTRES & STATUS */}
      <div className="bg-transparent p-0 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
        <div className="flex items-center space-x-3">
          <label className="w-40 text-right font-semibold text-[#002B49] whitespace-nowrap">Romaneio:</label>
          <input 
            type="text" 
            value={nfInput} 
            onChange={(e) => setNfInput(e.target.value)}
            onKeyDown={handleLoadInvoice}
            placeholder="Digite o código do Romaneio e Enter..." 
            className="flex-1 bg-red-50/30 border border-red-400 px-2.5 py-1 rounded font-mono text-xs focus:ring-1 focus:ring-blue-800 focus:outline-none shadow-inner text-blue-900 font-bold"
          />
        </div>

        {/* Indicador de Status Visual do Romaneio */}
        <div className="flex items-center space-x-3">
          <label className="w-40 text-right font-semibold text-[#002B49] whitespace-nowrap">Status Carga:</label>
          <div className="flex-1 flex items-center space-x-2 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span className="font-mono font-bold text-amber-800 text-[11px]">{manifestStatus}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <label className="w-40 text-right font-semibold text-[#002B49] whitespace-nowrap">Cliente:</label>
          <input type="text" value={customer} readOnly placeholder="Aguardando carregamento..." className="flex-1 bg-white border border-gray-300 px-2.5 py-1 rounded font-medium text-gray-700 focus:outline-none truncate" />
        </div>

        <div className="flex items-center space-x-3">
          <label className="w-40 text-right font-semibold text-[#002B49] whitespace-nowrap">Org. de Vendas:</label>
          <input type="text" value={salesOrg} onChange={(e) => setSalesOrg(e.target.value)} placeholder="Aguardando carregamento..." className="flex-1 bg-white border border-gray-300 px-2.5 py-1 rounded text-gray-700" />
        </div>
      </div>

      {/* 4. ABAS DE NAVEGAÇÃO INTERNAS */}
      <div className="bg-transparent px-0 pt-2 flex space-x-1">
        <button onClick={() => setActiveTab('items')} className={`px-4 py-1 font-bold rounded-t text-xs transition border-t-2 cursor-pointer ${activeTab === 'items' ? 'bg-white border-[#002B49] text-gray-800 shadow-xs' : 'bg-gray-200/75 border-transparent text-gray-600'}`}>
          Visão Geral de Itens
        </button>
        <button onClick={() => setActiveTab('texts')} className={`px-4 py-1 font-bold rounded-t text-xs transition border-t-2 cursor-pointer flex items-center space-x-1 ${activeTab === 'texts' ? 'bg-white border-[#002B49] text-gray-800 shadow-xs' : 'bg-gray-200/75 border-transparent text-gray-600'}`}>
          <MessageSquare className="w-3 h-3 text-[#002B49]" />
          <span>Textos & Comentários</span>
        </button>
        <button onClick={() => setActiveTab('batch')} className={`px-4 py-1 font-bold rounded-t text-xs transition border-t-2 cursor-pointer flex items-center space-x-1 ${activeTab === 'batch' ? 'bg-white border-[#002B49] text-gray-800 shadow-xs' : 'bg-gray-200/75 border-transparent text-gray-600'}`}>
          <Layers className="w-3 h-3 text-amber-700" />
          <span>Classificação & Lote</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`px-4 py-1 font-bold rounded-t text-xs transition border-t-2 cursor-pointer flex items-center space-x-1 ${activeTab === 'history' ? 'bg-white border-[#002B49] text-gray-800 shadow-xs' : 'bg-gray-200/75 border-transparent text-gray-600'}`}>
          <Clock className="w-3 h-3 text-blue-800" />
          <span>Histórico & Rastreio</span>
        </button>
      </div>

      {/* 5. CONTEÚDO DAS ABAS */}
      <div className="bg-white border border-gray-300 p-4 shadow-xs rounded space-y-3">
        
        {activeTab === 'items' && (
          <div className="space-y-2">
            <div className="bg-gray-100 border border-gray-300 p-1.5 px-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-gray-600 font-mono font-bold">
                  {manifesto ? `Romaneio: ${manifesto}` : 'Romaneio Vinculado: Aguardando...'}
                </span>
                <span className="text-[10px] text-gray-400">|</span>
                <span className="text-[10px] text-gray-500 font-mono">Total de Linhas: {returnItems.length}</span>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[240px] border border-gray-300 rounded shadow-inner">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-[#002B49] text-white font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="p-2 border-r border-blue-900 w-12 text-center">#</th>
                    <th className="p-2 border-r border-blue-900">Nº do Material</th>
                    <th className="p-2 border-r border-blue-900">Descrição do Produto</th>
                    <th className="p-2 border-r border-blue-900 text-center">Nota Fiscal</th>
                    <th className="p-2 border-r border-blue-900 text-center">Qtd da Nota</th>
                    <th className="p-2 border-r border-blue-900 text-center">Qtd Conferido</th>
                    <th className="p-2 border-r border-blue-900">Motivo Específico</th>
                    <th className="p-2 text-center">Qtd Avariada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {returnItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-gray-400 italic bg-gray-50">
                        Digite o código do <strong className="text-gray-700">Romaneio</strong> e pressione <strong className="text-gray-700">Enter</strong> para carregar do Banco de Dados.
                      </td>
                    </tr>
                  ) : (
                    returnItems.map((item, idx) => (
                      <tr key={idx} onClick={() => setSelectedRowIndex(idx)} className={`cursor-pointer transition ${selectedRowIndex === idx ? 'bg-blue-100/80 border-l-4 border-[#002B49] font-medium' : 'hover:bg-blue-50/50'}`}>
                        <td className="p-2 border-r border-gray-200 text-center font-mono text-gray-500">{idx + 1}</td>
                        <td className="p-2 border-r border-gray-200 font-mono font-bold text-blue-900 bg-gray-50">{item.code}</td>
                        <td className="p-2 border-r border-gray-200 font-medium bg-gray-50 text-gray-700">{item.desc}</td>
                        <td className="p-2 border-r border-gray-200 text-center font-mono font-bold text-blue-800 bg-blue-50/30">{item.nfNumber}</td>
                        <td className="p-2 border-r border-gray-200 text-center font-mono">{item.noteQty}</td>
                        
                        <td className="p-2 border-r border-gray-200 text-center bg-gray-100/80">
                          <span className="font-mono font-bold text-emerald-700 px-2 py-0.5 rounded border border-gray-300 bg-white inline-block w-16 text-center select-none">
                            {item.checkedQty}
                          </span>
                        </td>

                        <td className="p-2 border-r border-gray-200">
                          <input 
                            type="text" 
                            value={item.specificReason} 
                            onChange={(e) => { 
                              const upd = [...returnItems]; 
                              upd[idx].specificReason = e.target.value; 
                              setReturnItems(upd); 
                            }} 
                            className="w-full bg-white border border-gray-300 px-2 py-0.5 rounded text-xs" 
                          />
                        </td>

                        <td className="p-2 text-center">
                          <input 
                            type="number" 
                            value={item.damagedQty} 
                            onChange={(e) => { 
                              const upd = [...returnItems]; 
                              upd[idx].damagedQty = Number(e.target.value); 
                              setReturnItems(upd); 
                            }} 
                            className="w-16 bg-red-50 border border-red-300 text-red-700 font-bold px-1 py-0.5 rounded text-center font-mono mx-auto block text-xs shadow-inner" 
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'texts' && (
          <div className="p-4 bg-gray-50 rounded border border-gray-300 space-y-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1 uppercase text-[11px]">Observações do Romaneio / Conferência:</label>
              <textarea rows={3} value={driverComments} onChange={(e) => setDriverComments(e.target.value)} className="w-full bg-white border border-gray-300 p-2.5 rounded text-xs focus:outline-none" />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1 uppercase text-[11px]">Notas de Atendimento / SAC:</label>
              <textarea rows={3} value={sacNotes} onChange={(e) => setSacNotes(e.target.value)} className="w-full bg-white border border-gray-300 p-2.5 rounded text-xs focus:outline-none" />
            </div>
          </div>
        )}

        {activeTab === 'batch' && (
          <div className="p-4 bg-gray-50 rounded border border-gray-300 space-y-3">
            <h4 className="font-bold text-blue-900 uppercase text-[11px] border-b border-gray-300 pb-1">Controle de Lote e Destinação WMS</h4>
            <div className="overflow-y-auto max-h-[220px] border border-gray-300 rounded bg-white">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-gray-200 text-gray-700 font-semibold sticky top-0">
                  <tr>
                    <th className="p-2 border-r border-gray-300">Material</th>
                    <th className="p-2 border-r border-gray-300">Lote (Batch)</th>
                    <th className="p-2 border-r border-gray-300">Validade</th>
                    <th className="p-2">Destino / Disposição</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono">
                  {returnItems.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-400 italic">Nenhum lote carregado. Insira um Romaneio.</td>
                    </tr>
                  ) : (
                    returnItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50">
                        <td className="p-2 border-r border-gray-200 font-bold text-blue-900 font-sans">{item.code}</td>
                        <td className="p-2 border-r border-gray-200">{item.batch}</td>
                        <td className="p-2 border-r border-gray-200">{item.expiryDate}</td>
                        <td className="p-2 font-sans font-bold text-amber-900">{item.disposition}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4 bg-gray-50 rounded border border-gray-300 space-y-3">
            <h4 className="font-bold text-blue-900 uppercase text-[11px] border-b border-gray-300 pb-2">Linha do Tempo & Rastreabilidade do Romaneio</h4>
            
            {timelineHistory.length === 0 ? (
              <p className="text-gray-400 italic p-6 text-center">Nenhum histórico disponível. Carregue um Romaneio.</p>
            ) : (
              <div className="space-y-3 py-2">
                {timelineHistory.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs">
                    <div className={`mt-0.5 p-1 rounded-full ${
                      item.status === 'completed' ? 'bg-green-100 text-green-700' :
                      item.status === 'current' ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-gray-200 text-gray-400'
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 bg-white border border-gray-200 p-2.5 rounded shadow-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-gray-800">{item.step}</span>
                        <p className="text-[11px] text-gray-500">{item.authorOrLocation}</p>
                      </div>
                      <span className="font-mono text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rodapé */}
        <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-mono">Status: {manifestStatus}</span>
          <button onClick={handleSave} className="bg-[#002B49] hover:bg-blue-900 text-white px-6 py-1.5 rounded font-bold shadow transition cursor-pointer flex items-center space-x-1.5 text-xs">
            <Save className="w-3.5 h-3.5" />
            <span>Gravar [Ctrl+S]</span>
          </button>
        </div>

      </div>

    </div>
  );
}