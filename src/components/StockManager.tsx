import React, { useState } from 'react';
import { Search, Package, Printer, ArrowRightLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import SapAlertModal from './SapAlertModal';

interface StockManagerProps {
  onBack: () => void;
}

interface MovementHistory {
  date: string;
  trans: string;
  doc: string;
  nfeRef?: string;
  qty: string;
  returnedQty?: string;
  status: string;
  user: string;
}

interface StockBreakdown {
  type: string;
  qtyNum: number;
  qtyStr: string;
  batch: string;
  locationBin: string;
  status: string;
}

interface ProductInfo {
  sku: string;
  desc: string;
  unit: string;
  ean: string;
  eanLast5: string;
  location: string;
  locationDesc: string;
  binAddress: string;
  unitPrice: number;
  stockQty: number;
  totalValue: number;
  history: MovementHistory[];
  breakdown: StockBreakdown[];
}

const initialDatabase: Record<string, ProductInfo> = {
  '00301': {
    sku: 'SPP-DRP-100',
    desc: 'Gel Analgésico Farmacêutico 500g - SANA',
    unit: 'UN',
    ean: '7891000200301',
    eanLast5: '00301',
    location: 'SPP1',
    locationDesc: 'SPP DC 1 - Armazém Central Curitiba',
    binAddress: 'Rua 04 / Estante 12 / Nível 02',
    unitPrice: 45.80,
    stockQty: 850,
    totalValue: 38930.00,
    history: [
      { date: '28/10/2026 14:10', trans: 'MIGO', doc: 'PED-98420', nfeRef: 'NF-45892', qty: '+120 UN', returnedQty: '-', status: 'Concluído', user: 'OP_LOGISTICA' },
      { date: '26/10/2026 09:30', trans: 'VL01N', doc: 'PED-98410', nfeRef: 'NF-45811', qty: '-50 UN', returnedQty: '-', status: 'Faturado', user: 'SEPARADOR_02' },
      { date: '22/10/2026 11:15', trans: 'ZMM_RET', doc: 'PROT-9988', nfeRef: 'NF-45750 (Recusa Cliente)', qty: '-5 UN', returnedQty: '5 Unidades Avariadas', status: 'Processado / WMS', user: 'CONFERENTE_01' }
    ],
    breakdown: [
      { type: 'Estoque Disponível', qtyNum: 800, qtyStr: '800 UN', batch: 'LOT-2026A', locationBin: 'Rua 04 / Estante 12 / Nível 02', status: 'Livre para Picking / Venda' },
      { type: 'Avaria / Recusa', qtyNum: 30, qtyStr: '30 UN', batch: 'LOT-2026X', locationBin: 'Área de Devoluções (Q-01)', status: 'Aguardando Laudo / NF-45750' },
      { type: 'Estoque Reservado', qtyNum: 15, qtyStr: '15 UN', batch: 'LOT-2026A', locationBin: 'Docas de Expedição', status: 'Separado para Ped-98421' },
      { type: 'Perda / Baixa', qtyNum: 5, qtyStr: '5 UN', batch: 'LOT-2025B', locationBin: 'Descarte / Quarentena', status: 'Baixado no S/4HANA' }
    ]
  },
  '02099': {
    sku: 'SC1005',
    desc: 'Dipirona Sódica 500mg (Cx 50)',
    unit: 'UN',
    ean: '7891000202099',
    eanLast5: '02099',
    location: 'SPP1',
    locationDesc: 'SPP DC 1 - Armazém Central Curitiba',
    binAddress: 'Rua 01 / Estante 03 / Nível 01',
    unitPrice: 28.50,
    stockQty: 420,
    totalValue: 11970.00,
    history: [
      { date: '27/10/2026 10:00', trans: 'ZMM_RET', doc: 'PROT-1022', nfeRef: 'NF-45600 (Avaria Transporte)', qty: '-10 UN', returnedQty: '10 Unidades Danificadas', status: 'Análise SAC', user: 'SUPERVISOR' }
    ],
    breakdown: [
      { type: 'Estoque Disponível', qtyNum: 400, qtyStr: '400 UN', batch: 'EMS-992', locationBin: 'Rua 01 / Estante 03 / Nível 01', status: 'Livre para Venda' },
      { type: 'Avaria / Recusa', qtyNum: 15, qtyStr: '15 UN', batch: 'EMS-992', locationBin: 'Área de Devoluções (Q-01)', status: 'Aguardando NF-45600' },
      { type: 'Estoque Reservado', qtyNum: 5, qtyStr: '5 UN', batch: 'EMS-991', locationBin: 'Expedição', status: 'Separado' },
      { type: 'Perda / Baixa', qtyNum: 0, qtyStr: '0 UN', batch: '-', locationBin: '-', status: 'Nenhum registo' }
    ]
  }
};

export default function StockManager({ onBack }: StockManagerProps) {
  const [database, setDatabase] = useState<Record<string, ProductInfo>>(initialDatabase);
  const [searchCode, setSearchCode] = useState<string>('');
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'breakdown' | 'dados'>('matrix');

  // Estados da Modal de Transferência
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [originType, setOriginType] = useState<string>('Avaria / Recusa');
  const [destType, setDestType] = useState<string>('Estoque Disponível');
  const [transferQty, setTransferQty] = useState<number>(1);

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
    const query = searchCode.trim();
    if (!query) {
      showAlert('Informe o SKU ou os 5 últimos dígitos do EAN para consultar.', 'warning');
      return;
    }

    const found = database[query.toUpperCase()] || database[query.slice(-5)];
    
    if (found) {
      setProduct(found);
    } else {
      showAlert(`Produto não encontrado para "${query}". Dica: Use 00301 ou 02099.`, 'warning');
      setProduct(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const executeTransfer = () => {
    if (!product) return;
    if (transferQty <= 0) {
      showAlert('Informe uma quantidade válida para transferência.', 'warning');
      return;
    }

    const originItem = product.breakdown.find(b => b.type === originType);
    if (!originItem || originItem.qtyNum < transferQty) {
      showAlert(`Quantidade insuficiente na origem ("${originType}"). Disponível: ${originItem ? originItem.qtyNum : 0}`, 'error');
      return;
    }

    if (originType === destType) {
      showAlert('A origem e o destino não podem ser iguais.', 'warning');
      return;
    }

    const updatedBreakdown = product.breakdown.map(b => {
      if (b.type === originType) {
        const newQty = b.qtyNum - transferQty;
        return { ...b, qtyNum: newQty, qtyStr: `${newQty} ${product.unit}` };
      }
      if (b.type === destType) {
        const newQty = b.qtyNum + transferQty;
        return { ...b, qtyNum: newQty, qtyStr: `${newQty} ${product.unit}` };
      }
      return b;
    });

    const now = new Date().toLocaleString('pt-BR');
    const newHistoryItem: MovementHistory = {
      date: now,
      trans: 'MB1B / MIGO (Transferência)',
      doc: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
      nfeRef: 'WMS Internal Transf.',
      qty: `${transferQty} ${product.unit}`,
      returnedQty: `De [${originType}] para [${destType}]`,
      status: 'Executado / S4HANA',
      user: 'OP_LOGISTICA'
    };

    const updatedHistory = [newHistoryItem, ...product.history];
    const updatedProduct: ProductInfo = {
      ...product,
      breakdown: updatedBreakdown,
      history: updatedHistory
    };

    setProduct(updatedProduct);
    setDatabase({ ...database, [product.eanLast5]: updatedProduct });
    setShowTransferModal(false);
    setTransferQty(1);
    showAlert(`Transferência de ${transferQty} ${product.unit} de "${originType}" para "${destType}" realizada com sucesso!`, 'success');
  };

  return (
    <div className="bg-[#E9ECEF] w-full p-2 font-sans text-xs text-gray-800 flex flex-col shadow-inner rounded border border-gray-300 relative">
      
      <SapAlertModal 
        isOpen={alertOpen}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertOpen(false)}
      />

      {/* 1. BARRA DE TÍTULO CLÁSSICA SAP */}
      <div className="bg-[#002B49] text-white px-3 py-1.5 flex items-center justify-between rounded-t shadow-xs">
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="hover:bg-blue-900 px-1.5 py-0.5 rounded text-gray-300 cursor-pointer text-xs">
            &larr;
          </button>
          <span className="font-mono bg-[#1E4D6B] px-1.5 py-0.2 rounded text-[10px] font-bold">DRP / WMS Matrix</span>
          <span className="font-semibold tracking-wide text-xs">Product Planning & Inventory Tracking Overview</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-300 text-[10px] font-mono">
          <span>Plant: BR01</span>
          <span>User: OP_LOGISTICA</span>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS SUPERIOR */}
      <div className="bg-white border-x border-b border-gray-300 p-2.5 grid grid-cols-1 md:grid-cols-4 gap-3 shadow-xs items-center">
        <div className="flex items-center space-x-2">
          <label className="text-gray-600 font-bold whitespace-nowrap w-24 text-right">SKU / 5 EAN:</label>
          <input 
            type="text" 
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite os 5 últimos (ex: 00301)..." 
            className="bg-red-50/50 border border-red-400 px-2 py-1 rounded font-mono font-bold text-blue-900 flex-1 focus:ring-1 focus:ring-blue-800 focus:outline-none text-[11px]"
          />
        </div>
        <div className="flex items-center space-x-2 md:col-span-2">
          <label className="text-gray-600 font-bold whitespace-nowrap w-16 text-right">Location:</label>
          <input type="text" readOnly value={product ? product.location : ''} placeholder="---" className="bg-gray-100 border border-gray-300 px-2 py-1 rounded font-mono w-16 text-center font-bold" />
          <input type="text" readOnly value={product ? product.locationDesc : ''} placeholder="Aguardando consulta..." className="bg-gray-100 border border-gray-300 px-2 py-1 rounded flex-1 text-gray-500 truncate italic" />
        </div>
        <div className="flex items-center justify-end space-x-2">
          <button 
            onClick={handleSearch}
            className="bg-[#002B49] hover:bg-blue-900 text-white px-4 py-1 rounded font-bold flex items-center space-x-1 cursor-pointer w-full md:w-auto justify-center"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Consultar</span>
          </button>
        </div>
      </div>

      {/* 3. ABAS DE NAVEGAÇÃO PADRÃO */}
      <div className="bg-[#F8F9FA] border-x border-gray-300 px-2 py-1.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-1">
          <button onClick={() => setActiveTab('matrix')} className={`px-3 py-1 rounded font-bold cursor-pointer transition text-xs ${activeTab === 'matrix' ? 'bg-[#002B49] text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
            Histórico de Movimentações & Devoluções
          </button>
          <button onClick={() => setActiveTab('breakdown')} className={`px-3 py-1 rounded font-bold cursor-pointer transition text-xs ${activeTab === 'breakdown' ? 'bg-[#002B49] text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
            Detalhes de Estoque
          </button>
          <button onClick={() => setActiveTab('dados')} className={`px-3 py-1 rounded font-bold cursor-pointer transition text-xs ${activeTab === 'dados' ? 'bg-[#002B49] text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
            Dados Cadastrais & Valores
          </button>
        </div>

        {product && (
          <button 
            onClick={() => setShowTransferModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded font-bold shadow-xs transition cursor-pointer flex items-center space-x-1 text-xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Transferir / Ajustar Estoque</span>
          </button>
        )}
      </div>

      {/* 4. CONTEÚDO PRINCIPAL */}
      <div className="bg-white border-x border-b border-gray-300 p-4 shadow-xs space-y-4 min-h-[320px]">
        
        {!product ? (
          <div className="py-20 text-center text-gray-400 font-mono">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-semibold text-gray-600">Nenhum produto selecionado.</p>
            <p className="text-xs text-gray-500 mt-1">Digite os <strong className="text-blue-900">5 últimos dígitos do EAN</strong> (ex: <strong className="text-blue-900">00301</strong> ou <strong className="text-blue-900">02099</strong>) e pressione <strong className="text-gray-700">Enter</strong>.</p>
          </div>
        ) : activeTab === 'matrix' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded border border-gray-200 font-mono text-xs">
              <div><strong className="text-gray-500 font-sans block text-[10px]">PRODUCT SKU:</strong> {product.sku}</div>
              <div><strong className="text-gray-500 font-sans block text-[10px]">DESCRIPTION:</strong> {product.desc}</div>
              <div><strong className="text-gray-500 font-sans block text-[10px]">EAN (LAST 5):</strong> <span className="text-purple-900 font-bold">{product.eanLast5}</span></div>
              <div><strong className="text-gray-500 font-sans block text-[10px]">BIN ADDRESS:</strong> <span className="text-amber-800 font-bold">{product.binAddress}</span></div>
            </div>

            <div className="overflow-y-auto max-h-[300px] border border-gray-300 rounded shadow-inner">
              <table className="w-full text-left text-[11px] border-collapse font-sans">
                <thead className="bg-[#002B49] text-white font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5 border-r border-blue-900">Data / Hora</th>
                    <th className="p-2.5 border-r border-blue-900">Transação WMS</th>
                    <th className="p-2.5 border-r border-blue-900">Documento / Pedido</th>
                    <th className="p-2.5 border-r border-blue-900">Nota Fiscal (NFe Ref.)</th>
                    <th className="p-2.5 border-r border-blue-900 text-center">Quantidade</th>
                    <th className="p-2.5 border-r border-blue-900">Devolução / Avaria Detalhada</th>
                    <th className="p-2.5">Status / Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {product.history.map((h, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#F4F6F8] hover:bg-blue-50/50'}>
                      <td className="p-2.5 border-r border-gray-200 font-mono text-gray-600">{h.date}</td>
                      <td className="p-2.5 border-r border-gray-200 font-mono font-bold text-blue-900">{h.trans}</td>
                      <td className="p-2.5 border-r border-gray-200 font-mono font-semibold text-gray-800">{h.doc}</td>
                      <td className="p-2.5 border-r border-gray-200 font-mono font-bold text-purple-900 bg-purple-50/30">{h.nfeRef || '-'}</td>
                      <td className={`p-2.5 border-r border-gray-200 font-mono font-bold text-center ${h.qty.startsWith('+') ? 'text-green-700' : 'text-red-600'}`}>{h.qty}</td>
                      <td className="p-2.5 border-r border-gray-200 font-medium">
                        {h.returnedQty && h.returnedQty !== '-' ? (
                          <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300 font-mono text-[10px]">
                            {h.returnedQty}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-2.5 text-gray-700 font-mono">
                        <span className="font-bold text-gray-900">{h.status}</span> <span className="text-gray-400">({h.user})</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 font-mono">
              <div className="bg-blue-50/50 p-3 rounded border border-blue-200 text-center">
                <span className="text-gray-500 text-[10px] block uppercase font-sans font-bold">Estoque Atual Físico</span>
                <span className="text-lg font-bold text-blue-900">{product.stockQty} {product.unit}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded border border-gray-200 text-center">
                <span className="text-gray-500 text-[10px] block uppercase font-sans font-bold">Preço Unitário</span>
                <span className="text-lg font-bold text-gray-800">R$ {product.unitPrice.toFixed(2)}</span>
              </div>
              <div className="bg-green-50/50 p-3 rounded border border-green-200 text-center">
                <span className="text-gray-500 text-[10px] block uppercase font-sans font-bold">Valor Total em Estoque</span>
                <span className="text-lg font-bold text-green-800">R$ {product.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        ) : activeTab === 'breakdown' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded border border-gray-200 font-mono text-xs">
              <div><strong className="text-gray-500 font-sans block text-[10px]">PRODUCT SKU:</strong> {product.sku}</div>
              <div><strong className="text-gray-500 font-sans block text-[10px]">DESCRIPTION:</strong> {product.desc}</div>
              <div><strong className="text-gray-500 font-sans block text-[10px]">TOTAL PHYSICAL:</strong> <span className="text-blue-900 font-bold">{product.stockQty} {product.unit}</span></div>
              <div><strong className="text-gray-500 font-sans block text-[10px]">PLANT:</strong> BR01 / {product.location}</div>
            </div>

            <div className="overflow-y-auto max-h-[300px] border border-gray-300 rounded shadow-inner">
              <table className="w-full text-left text-[11px] border-collapse font-sans">
                <thead className="bg-[#002B49] text-white font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5 border-r border-blue-900">Tipo de Estoque</th>
                    <th className="p-2.5 border-r border-blue-900 text-center">Quantidade</th>
                    <th className="p-2.5 border-r border-blue-900">Lote (Batch)</th>
                    <th className="p-2.5 border-r border-blue-900">Localização / Endereço WMS</th>
                    <th className="p-2.5">Status da Categoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-mono">
                  {product.breakdown.map((item, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#F4F6F8] hover:bg-blue-50/50'}>
                      <td className="p-2.5 border-r border-gray-200 font-bold font-sans">
                        <span className={`px-2.5 py-1 rounded text-[10px] inline-block ${
                          item.type.includes('Disponível') ? 'bg-green-100 text-green-800' :
                          item.type.includes('Avaria') ? 'bg-amber-100 text-amber-900' :
                          item.type.includes('Reservado') ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="p-2.5 border-r border-gray-200 text-center font-bold text-gray-900">{item.qtyStr}</td>
                      <td className="p-2.5 border-r border-gray-200 text-blue-900">{item.batch}</td>
                      <td className="p-2.5 border-r border-gray-200 text-gray-700">{item.locationBin}</td>
                      <td className="p-2.5 text-gray-600 font-sans font-medium">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto py-4 font-sans">
            <h3 className="font-bold text-gray-700 border-b border-gray-200 pb-1.5 uppercase tracking-wide text-xs">
              Dados Cadastrais do Material ({product.sku})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-center space-x-3">
                <label className="w-32 text-right font-medium text-gray-600 whitespace-nowrap">Material SKU:</label>
                <input type="text" readOnly value={product.sku} className="bg-gray-100 border border-gray-300 px-2.5 py-1 rounded font-mono font-bold w-full text-xs" />
              </div>
              <div className="flex items-center space-x-3">
                <label className="w-32 text-right font-medium text-gray-600 whitespace-nowrap">EAN (5 Digits):</label>
                <input type="text" readOnly value={product.eanLast5} className="bg-gray-100 border border-gray-300 px-2.5 py-1 rounded font-mono font-bold text-purple-900 w-full text-xs" />
              </div>
              <div className="flex items-center space-x-3">
                <label className="w-32 text-right font-medium text-gray-600 whitespace-nowrap">Description:</label>
                <input type="text" readOnly value={product.desc} className="bg-gray-100 border border-gray-300 px-2.5 py-1 rounded font-medium w-full text-xs" />
              </div>
              <div className="flex items-center space-x-3">
                <label className="w-32 text-right font-medium text-gray-600 whitespace-nowrap">Base Unit:</label>
                <input type="text" readOnly value={product.unit} className="bg-gray-100 border border-gray-300 px-2.5 py-1 rounded font-mono w-full text-xs font-bold text-blue-900" />
              </div>
              <div className="flex items-center space-x-3">
                <label className="w-32 text-right font-medium text-gray-600 whitespace-nowrap">Location Bin:</label>
                <input type="text" readOnly value={product.binAddress} className="bg-amber-50 border border-amber-300 px-2.5 py-1 rounded font-mono text-amber-900 font-bold w-full text-xs" />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 5. RODAPÉ */}
      <div className="bg-[#F8F9FA] border-x border-b border-gray-300 px-3 py-2 flex items-center justify-between rounded-b">
        <span className="text-[10px] text-gray-500 font-mono">Status: S/4HANA WMS Online • Abas de Navegação Padrão Ativas</span>
        <button 
          onClick={() => {
            if (!product) showAlert('Nenhum produto selecionado para exportar.', 'warning');
            else showAlert(`Exportando relatório do produto ${product.sku}...`, 'success');
          }}
          className="bg-[#002B49] hover:bg-blue-900 text-white px-4 py-1 rounded font-bold shadow-xs transition cursor-pointer flex items-center space-x-1 text-[11px]"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimir / Exportar [F8]</span>
        </button>
      </div>

      {/* MODAL DE TRANSFERÊNCIA DE ESTOQUE */}
      {showTransferModal && product && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-gray-300 w-full max-w-lg overflow-hidden">
            <div className="bg-[#002B49] text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs">Transferência de Estoque (WMS / S4HANA)</span>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="text-gray-300 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-blue-50/50 p-2.5 rounded border border-blue-200 text-xs font-mono">
                <div><strong>Produto:</strong> {product.sku} — {product.desc}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Origem:</label>
                  <select value={originType} onChange={(e) => setOriginType(e.target.value)} className="w-full bg-white border border-gray-300 p-2 rounded text-xs font-medium">
                    {product.breakdown.map((b, idx) => (
                      <option key={idx} value={b.type}>{b.type} ({b.qtyStr})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Destino:</label>
                  <select value={destType} onChange={(e) => setDestType(e.target.value)} className="w-full bg-white border border-gray-300 p-2 rounded text-xs font-medium">
                    {product.breakdown.map((b, idx) => (
                      <option key={idx} value={b.type}>{b.type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">Quantidade:</label>
                <input 
                  type="number" 
                  min="1" 
                  value={transferQty} 
                  onChange={(e) => setTransferQty(Number(e.target.value))} 
                  className="w-full bg-white border border-gray-400 p-2 rounded text-xs font-mono font-bold text-blue-900" 
                />
              </div>
            </div>

            <div className="bg-gray-100 px-4 py-3 flex justify-end space-x-2 border-t border-gray-200">
              <button onClick={() => setShowTransferModal(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded font-bold text-xs cursor-pointer">Cancelar</button>
              <button onClick={executeTransfer} className="bg-[#002B49] hover:bg-blue-900 text-white px-5 py-1.5 rounded font-bold text-xs cursor-pointer flex items-center space-x-1.5 shadow">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmar Transferência</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}