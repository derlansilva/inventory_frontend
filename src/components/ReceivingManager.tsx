import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  XCircle, 
  History, 
  Printer, 
  AlertTriangle,
  Send,
  Package,
  Info,
  FileSpreadsheet
} from 'lucide-react';
import ReceivingManifest from './ReceivingManifest';

interface AuditLog {
  timestamp: string;
  user: string;
  action: string;
  role: string;
}

interface ManifestItem {
  id: number;
  itemCode: string;
  barcodeEan: string;
  description: string;
  unit: string;
  xmlQty: number;
  conversionFactor: number;
  totalUnits: number;
  packType: 'BOX' | 'FRACTIONED';
  lotNumber?: string;
}

interface Manifest {
  id: string;
  invoiceNumber: string;
  supplier: string;
  totalValue: string;
  status: 'PENDING' | 'CHECKING' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
  currentChecker?: string;
  createdAt: string;
  history: AuditLog[];
  items: ManifestItem[];
}

const OCCURRENCE_DESCRIPTIONS: Record<string, string> = {
  '101': 'Avaria detectada no transporte / Caixa amassada ou violada.',
  '102': 'Divergência de quantidade / Produto em falta em relação à NFe.',
  '103': 'Lote vencido ou divergente do documento fiscal.',
  '104': 'Produto com temperatura fora da especificação técnica (Cadeia Fria).',
  '105': 'Nota fiscal sem autorização de SEFAZ ou divergência de CNPJ.'
};

export default function ReceivingManager({ onBack }: { onBack: () => void }) {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'details'>('list');
  const [selectedManifest, setSelectedManifest] = useState<Manifest | null>(null);
  const [rightViewTab, setRightViewTab] = useState<'products' | 'history'>('products');

  const [occurrenceCode, setOccurrenceCode] = useState('');
  const [occurrenceDesc, setOccurrenceDesc] = useState('');

  const [manifests, setManifests] = useState<Manifest[]>([
    {
      id: 'MAN-2026-0088',
      invoiceNumber: 'NF-45891',
      supplier: 'Eurofarma Laboratórios S/A',
      totalValue: 'R$ 45.200,00',
      status: 'CHECKING',
      createdBy: 'Carlos Silva (Gestor)',
      currentChecker: 'Marcos Oliveira (Coletora #03)',
      createdAt: '2026-10-27 08:30',
      history: [
        { timestamp: '2026-10-27 08:30', user: 'Carlos Silva', role: 'GESTOR', action: 'Manifesto gerado via importação de XML SEFAZ.' },
        { timestamp: '2026-10-27 09:15', user: 'Marcos Oliveira', role: 'CONFERENTE', action: 'Aberto na coletora Android. Iniciada conferência física.' }
      ],
      items: [
        { id: 1, itemCode: 'PROD-01', barcodeEan: '7896004701234', description: 'AMOXICILINA 500MG 21 CPS', unit: 'CX', xmlQty: 50, conversionFactor: 24, totalUnits: 1200, packType: 'BOX', lotNumber: 'LOTE-EU-101' },
        { id: 2, itemCode: 'PROD-02', barcodeEan: '7896004705678', description: 'DIPIRONA SÓDICA 500MG/ML 20ML', unit: 'UN', xmlQty: 100, conversionFactor: 1, totalUnits: 100, packType: 'FRACTIONED', lotNumber: 'LOTE-EU-102' }
      ]
    },
    {
      id: 'MAN-2026-0087',
      invoiceNumber: 'NF-45890',
      supplier: 'Pfizer Do Brasil Ltda',
      totalValue: 'R$ 98.150,00',
      status: 'COMPLETED',
      createdBy: 'Ana Souza (Gestor)',
      currentChecker: 'João Pedro',
      createdAt: '2026-10-26 14:00',
      history: [
        { timestamp: '2026-10-26 14:00', user: 'Ana Souza', role: 'GESTOR', action: 'Manifesto gerado.' },
        { timestamp: '2026-10-26 15:30', user: 'João Pedro', role: 'CONFERENTE', action: 'Conferência finalizada sem divergências. Estoque atualizado.' }
      ],
      items: [
        { id: 1, itemCode: 'PROD-10', barcodeEan: '7891234567890', description: 'VIAGRA 50MG 2 CPR', unit: 'CX', xmlQty: 30, conversionFactor: 10, totalUnits: 300, packType: 'BOX', lotNumber: 'LOTE-PF-99' }
      ]
    }
  ]);

  const handleManifestCreated = (newInvoiceNumber: string, supplierName: string, totalVal: string) => {
    const newId = `MAN-2026-00${manifests.length + 1}`;
    const created: Manifest = {
      id: newId,
      invoiceNumber: newInvoiceNumber || 'NF-45892',
      supplier: supplierName || 'EMS Farmacêutica S/A',
      totalValue: totalVal || 'R$ 12.775,00',
      status: 'PENDING',
      createdBy: 'Você (Operador Logística)',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      history: [
        { timestamp: new Date().toLocaleString(), user: 'Você', role: 'GESTOR', action: `Manifesto ${newId} gerado com sucesso via XML e liberado para as coletoras.` }
      ],
      items: [
        { id: 1, itemCode: 'EMS-01', barcodeEan: '7896004799999', description: 'PARACETAMOL 750MG 20 CPR', unit: 'CX', xmlQty: 40, conversionFactor: 24, totalUnits: 960, packType: 'BOX', lotNumber: 'LOTE-EMS-880' }
      ]
    };

    setManifests([created, ...manifests]);
    setCurrentView('list');
  };

  const handleCancelManifest = (id: string) => {
    if (window.confirm(`Tem certeza que deseja cancelar o manifesto ${id}?`)) {
      setManifests(manifests.map(m => {
        if (m.id === id) {
          return {
            ...m,
            status: 'CANCELLED',
            history: [
              ...m.history,
              { timestamp: new Date().toLocaleString(), user: 'Você', role: 'GESTOR', action: 'Manifesto cancelado manualmente no painel web.' }
            ]
          };
        }
        return m;
      }));
    }
  };

  const handleAddOccurrence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!occurrenceCode || !selectedManifest) return;

    const standardDesc = OCCURRENCE_DESCRIPTIONS[occurrenceCode] || occurrenceDesc || 'Ocorrência registrada no manifesto.';
    const actionText = `Registo de Ocorrência [Código ${occurrenceCode}]: ${standardDesc}`;

    const newLog: AuditLog = {
      timestamp: new Date().toLocaleString(),
      user: 'Você (Operador Logística)',
      role: 'SUPERVISOR',
      action: actionText
    };

    const updatedManifests = manifests.map(m => {
      if (m.id === selectedManifest.id) {
        const updated = { ...m, history: [newLog, ...m.history] };
        setSelectedManifest(updated);
        return updated;
      }
      return m;
    });

    setManifests(updatedManifests);
    setOccurrenceCode('');
    setOccurrenceDesc('');
    setRightViewTab('history');
  };

  const handleCodeChange = (code: string) => {
    setOccurrenceCode(code);
    if (OCCURRENCE_DESCRIPTIONS[code]) {
      setOccurrenceDesc(OCCURRENCE_DESCRIPTIONS[code]);
    }
  };

  return (
    <div className="w-full font-sans text-gray-800 pb-12 px-8">
      <div className="space-y-6 w-full pt-4">
        
        {/* ---------------------------------------------------- */}
        {/* 1. LISTAGEM DE MANIFESTOS                            */}
        {/* ---------------------------------------------------- */}
        {currentView === 'list' && (
          <div className="space-y-6 w-full">
            
            <div className="flex items-center justify-between w-full pb-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={onBack} 
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                  title="Voltar"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h5 className="text-xs font-bold text-gray-900 tracking-wide uppercase">
                  Gestão de Manifestos de Recebimento
                </h5>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setCurrentView('create')}
                  className="bg-sap-primary text-white text-xs px-3.5 py-1.5 rounded hover:bg-blue-700 transition font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Gerar Novo Manifesto (Via XML)</span>
                </button>

                <span className="font-mono text-[10px] bg-blue-50 text-sap-primary px-2.5 py-1 rounded font-bold border border-blue-100">
                  Transação SAP: VL32N / ZWMS_MANIFEST
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm w-full">
              <div className="flex justify-between items-center mb-3">
                <h5 className="text-xs font-bold text-gray-900 flex items-center">
                  <FileSpreadsheet className="w-4 h-4 mr-1.5 text-sap-primary" />
                  Manifestos Ativos no Armazém GAM ({manifests.length})
                </h5>

                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Filtrar manifesto ou NF..." 
                    className="w-full bg-white border border-gray-300 rounded pl-8 pr-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-sap-primary"
                  />
                </div>
              </div>

              <div className="max-h-[380px] overflow-y-auto w-full border border-gray-100 rounded relative">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-[10px] font-bold shadow-sm">
                      <th className="py-2.5 px-3 bg-gray-100">Manifesto #</th>
                      <th className="py-2.5 px-3 bg-gray-100">NFe / Fornecedor</th>
                      <th className="py-2.5 px-3 bg-gray-100">Valor Total</th>
                      <th className="py-2.5 px-3 bg-gray-100">Estado Atual</th>
                      <th className="py-2.5 px-3 bg-gray-100">Quem Gerou / Quem Conferiu</th>
                      <th className="py-2.5 px-3 bg-gray-100 text-right">Ações de Controle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {manifests.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-sap-primary">{m.id}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-gray-900 block">{m.invoiceNumber}</span>
                          <span className="text-gray-500 text-[10px] truncate max-w-xs block">{m.supplier}</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-gray-800">{m.totalValue}</td>
                        <td className="py-3 px-3">
                          {m.status === 'PENDING' && <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold text-[10px]">Aguardando Coletora</span>}
                          {m.status === 'CHECKING' && <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold text-[10px]">Em Conferência</span>}
                          {m.status === 'COMPLETED' && <span className="bg-green-100 text-green-900 px-2 py-0.5 rounded font-bold text-[10px]">Concluído & Estoque OK</span>}
                          {m.status === 'CANCELLED' && <span className="bg-red-100 text-red-900 px-2 py-0.5 rounded font-bold text-[10px]">Cancelado</span>}
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          <div className="font-bold text-gray-900">Gerado: {m.createdBy}</div>
                          <div className="text-[10px] text-gray-500 font-mono">Conferente: {m.currentChecker || 'Não atribuído'}</div>
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <button 
                            onClick={() => { setSelectedManifest(m); setRightViewTab('products'); setCurrentView('details'); }}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-2.5 py-1 rounded font-bold transition inline-flex items-center space-x-1 text-[11px]"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>Gerenciar</span>
                          </button>

                          {m.status !== 'CANCELLED' && m.status !== 'COMPLETED' && (
                            <button 
                              onClick={() => handleCancelManifest(m.id)}
                              className="bg-red-50 text-red-700 hover:bg-red-100 px-2.5 py-1 rounded font-bold transition inline-flex items-center space-x-1 text-[11px]"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancelar</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* 2. CRIAR NOVO MANIFESTO                              */}
        {/* ---------------------------------------------------- */}
        {currentView === 'create' && (
          <ReceivingManifest 
            onBack={() => setCurrentView('list')} 
            onSuccess={(num, sup, val) => handleManifestCreated(num, sup, val)}
          />
        )}

        {/* ---------------------------------------------------- */}
        {/* 3. GESTÃO / DETALHES DO MANIFESTO                    */}
        {/* ---------------------------------------------------- */}
        {currentView === 'details' && selectedManifest && (
          <div className="space-y-6 w-full">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between w-full pb-3 border-b border-gray-200 gap-3">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setCurrentView('list')} 
                  className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-700 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h5 className="text-xs font-bold text-gray-900 tracking-wide uppercase">
                  Manifesto: <span className="font-mono text-sap-primary">{selectedManifest.id}</span> ({selectedManifest.invoiceNumber})
                </h5>
              </div>

              <button 
                onClick={() => window.print()} 
                className="bg-gray-100 border border-gray-300 text-gray-800 text-xs px-3.5 py-1.5 rounded hover:bg-gray-200 transition font-bold flex items-center space-x-1.5 w-fit"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Relatório</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* COLUNA ESQUERDA: FORMULÁRIO DE OCORRÊNCIA */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
                <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600" />
                  Registar Ocorrência (Código SSW)
                </h5>
                <p className="text-[11px] text-gray-500">
                  Selecione ou digite o código para preencher a descrição oficial.
                </p>

                <form onSubmit={handleAddOccurrence} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Número / Código da Ocorrência</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 101"
                      value={occurrenceCode}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      className="w-full border border-gray-300 rounded p-1.5 text-xs font-mono font-bold focus:ring-1 focus:ring-sap-primary"
                      required
                    />
                  </div>

                  <div className="min-h-[64px] flex flex-col justify-center">
                    {occurrenceCode ? (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs space-y-0.5">
                        <div className="flex items-center space-x-1 text-sap-primary font-bold text-[10px]">
                          <Info className="w-3 h-3 flex-shrink-0" />
                          <span>Descrição Automática:</span>
                        </div>
                        <p className="text-gray-700 font-medium text-[11px] pl-4 leading-tight">
                          {OCCURRENCE_DESCRIPTIONS[occurrenceCode] || 'Código personalizado (insira detalhes abaixo).'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400 italic px-1">
                        * A descrição automática aparecerá aqui ao digitar o código.
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Complemento / Descrição (Opcional)</label>
                    <textarea 
                      placeholder="Detalhes da avaria ou divergência..."
                      value={occurrenceDesc}
                      onChange={(e) => setOccurrenceDesc(e.target.value)}
                      className="w-full border border-gray-300 rounded p-1.5 text-xs focus:ring-1 focus:ring-sap-primary h-20"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-amber-600 text-white text-xs py-2 rounded hover:bg-amber-700 transition font-bold flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Registar Ocorrência</span>
                  </button>
                </form>

                <div className="pt-2 border-t border-gray-100 text-[10px] text-gray-500 space-y-1">
                  <div className="font-bold text-gray-700">Atalhos Rápidos:</div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {Object.keys(OCCURRENCE_DESCRIPTIONS).map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleCodeChange(code)}
                        className="bg-gray-100 hover:bg-sap-primary hover:text-white text-gray-800 px-2 py-1 rounded font-mono font-bold transition border border-gray-200"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* COLUNA DIREITA: NAVEGAÇÃO ENTRE PRODUTOS E HISTÓRICO */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col space-y-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setRightViewTab('products')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border ${
                        rightViewTab === 'products'
                          ? 'bg-sap-primary text-white border-sap-primary shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Produtos Associados ({selectedManifest.items.length})</span>
                    </button>

                    <button
                      onClick={() => setRightViewTab('history')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border ${
                        rightViewTab === 'history'
                          ? 'bg-sap-primary text-white border-sap-primary shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Histórico & Ocorrências ({selectedManifest.history.length})</span>
                    </button>
                  </div>

                  <span className="font-mono text-[10px] text-green-700 bg-green-50 px-2.5 py-1 rounded border border-green-200 font-bold">
                    Total NF: {selectedManifest.totalValue}
                  </span>
                </div>

                {rightViewTab === 'products' && (
                  <div className="max-h-[380px] overflow-y-auto w-full border border-gray-100 rounded relative">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 z-20">
                        <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-[10px] font-bold shadow-sm">
                          <th className="py-2.5 px-3 bg-gray-100">Código / EAN</th>
                          <th className="py-2.5 px-3 bg-gray-100">Descrição do Produto</th>
                          <th className="py-2.5 px-3 bg-gray-100">Lote</th>
                          <th className="py-2.5 px-3 bg-gray-100 text-center">Un.</th>
                          <th className="py-2.5 px-3 bg-gray-100 text-center">Qtd.</th>
                          <th className="py-2.5 px-3 bg-gray-100 text-right">Total Un.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {selectedManifest.items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition">
                            <td className="py-2.5 px-3">
                              <span className="font-mono font-bold text-gray-900 block">{item.itemCode}</span>
                              <span className="font-mono text-[10px] text-gray-500">{item.barcodeEan}</span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-gray-800">{item.description}</td>
                            <td className="py-2.5 px-3 font-mono text-xs text-gray-700">{item.lotNumber}</td>
                            <td className="py-2.5 px-3 text-center font-bold font-mono">{item.unit}</td>
                            <td className="py-2.5 px-3 text-center font-bold font-mono">{item.xmlQty}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-sap-primary">{item.totalUnits} UN</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {rightViewTab === 'history' && (
                  <div className="max-h-[380px] overflow-y-auto w-full border border-gray-100 rounded relative">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 z-20">
                        <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-[10px] font-bold shadow-sm">
                          <th className="py-2.5 px-3 bg-gray-100">Data / Hora</th>
                          <th className="py-2.5 px-3 bg-gray-100">Utilizador / Operador</th>
                          <th className="py-2.5 px-3 bg-gray-100">Perfil</th>
                          <th className="py-2.5 px-3 bg-gray-100">Ação / Descrição da Ocorrência</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {selectedManifest.history.map((log, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition">
                            <td className="py-2.5 px-3 font-mono text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                            <td className="py-2.5 px-3 font-bold text-gray-800">{log.user}</td>
                            <td className="py-2.5 px-3">
                              <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                                {log.role}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-gray-700 font-medium">
                              {log.action.includes('Ocorrência') ? (
                                <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 block font-semibold">
                                  ⚠️ {log.action}
                                </span>
                              ) : (
                                log.action
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}