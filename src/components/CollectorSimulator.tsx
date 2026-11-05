import React, { useState, useRef, useEffect } from 'react';
import { QrCode, CheckCircle2, AlertTriangle, ArrowLeft, RefreshCw, PackageCheck, Barcode } from 'lucide-react';
import { apiServices } from '../services/apiServices';

interface ScannedItem {
  id?: number;
  materialCode: string;
  description: string;
  expectedQty: number;
  scannedQty: number;
  damagedQty: number;
  batch?: string;
  nfNumber: string;
}

interface CollectorSimulatorProps {
  onBack?: () => void;
}

export default function CollectorSimulator({ onBack }: CollectorSimulatorProps) {
  const [manifestCodeInput, setManifestCodeInput] = useState<string>('');
  const [activeManifest, setActiveManifest] = useState<string>('');
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [barcodeScan, setBarcodeScan] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeManifest && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [activeManifest]);

  const handleFetchManifest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const query = manifestCodeInput.trim().toUpperCase();
    if (!query) {
      setMessage({ text: 'Informe o número do Romaneio.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formattedCode = query.startsWith('ROM-') ? query : `ROM-${query}`;
      const data = await apiServices.getManifestByCode(formattedCode);

      setActiveManifest(data.manifestCode || formattedCode);
      let mappedItems: ScannedItem[] = [];

      if (data.invoices && Array.isArray(data.invoices)) {
        data.invoices.forEach((inv: any) => {
          const itemsList = inv.items || inv.returnItemEntities || [];
          itemsList.forEach((item: any) => {
            mappedItems.push({
              id: item.id,
              materialCode: item.materialCode || item.code || `MAT-${item.id}`,
              description: item.description || 'Produto sem descrição',
              expectedQty: item.noteQty ?? 1,
              scannedQty: item.checkedQty ?? item.scannedQty ?? 0,
              damagedQty: item.damagedQty ?? 0,
              batch: item.batch || 'S/L',
              nfNumber: inv.nfNumber || formattedCode
            });
          });
        });
      }

      setItems(mappedItems);
      setMessage({ text: `Romaneio ${formattedCode} carregado (${mappedItems.length} itens)`, type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: `Romaneio "${query}" não encontrado.`, type: 'error' });
      setItems([]);
      setActiveManifest('');
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeScan.trim().toUpperCase();
    if (!code) return;

    const itemIndex = items.findIndex(
      (it) => it.materialCode.toUpperCase() === code || it.id?.toString() === code
    );

    if (itemIndex !== -1) {
      const updated = [...items];
      const targetItem = updated[itemIndex];

      if (targetItem.scannedQty < targetItem.expectedQty) {
        targetItem.scannedQty += 1;
        setItems(updated);
        setMessage({ text: `Bipado: ${targetItem.description} (${targetItem.scannedQty}/${targetItem.expectedQty})`, type: 'success' });
      } else {
        setMessage({ text: `Item ${targetItem.materialCode} já atingiu a quantidade total da nota!`, type: 'info' });
      }
    } else {
      setMessage({ text: `Produto ${code} não pertence a este romaneio!`, type: 'error' });
    }

    setBarcodeScan('');
  };

  const handleFinishScan = async () => {
    if (!activeManifest) return;

    try {
      setLoading(true);

      // Monta o payload completo com os itens e as quantidades conferidas (scannedQty)
      const payload = {
        manifestCode: activeManifest,
        status: 'EM_CONFERENCIA',
        invoices: [
          {
            nfNumber: items[0]?.nfNumber || activeManifest,
            items: items.map(item => ({
              id: item.id,
              materialCode: item.materialCode,
              description: item.description,
              noteQty: item.expectedQty,
              checkedQty: item.scannedQty, // Quantidade bipada na coletora
              damagedQty: item.damagedQty,
              batch: item.batch
            }))
          }
        ]
      };

      await apiServices.saveManifestBackend(payload);
      setMessage({ text: 'Conferência gravada e atualizada no servidor com sucesso!', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Erro ao enviar conferência ao servidor.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 h-[82vh] max-h-[720px] text-gray-800 font-sans flex flex-col max-w-md mx-auto border border-gray-300 shadow-xl overflow-hidden rounded-lg">
      
      {/* 1. CABEÇALHO AZUL SAP */}
      <div className="bg-[#002B49] text-white px-4 py-3 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center space-x-2">
          <Barcode className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-xs tracking-wide">WMS Coletora Zebra</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {activeManifest && (
            <button 
              onClick={() => { setActiveManifest(''); setItems([]); setManifestCodeInput(''); }} 
              className="text-[11px] bg-[#1E4D6B] hover:bg-[#2A6185] px-2.5 py-1 rounded text-white font-medium flex items-center space-x-1 transition cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Trocar</span>
            </button>
          )}

          {onBack && (
            <button 
              onClick={onBack}
              className="text-[11px] bg-red-700 hover:bg-red-800 px-2.5 py-1 rounded text-white font-medium flex items-center space-x-1 transition cursor-pointer"
            >
              <span>Voltar</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. ÁREA PRINCIPAL COM ALTURA FLEXÍVEL */}
      <div className="p-4 flex-1 flex flex-col min-h-0 space-y-3 overflow-hidden">

        {/* FEEDBACK DE MENSAGENS */}
        {message && (
          <div className={`p-2.5 rounded text-xs font-semibold flex items-center space-x-2 border shadow-xs shrink-0 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border-red-300' :
            'bg-amber-50 text-amber-800 border-amber-300'
          }`}>
            {message.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {message.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* BUSCA DE ROMANEIO (SE NENHUM ESTIVER ATIVO) */}
        {!activeManifest ? (
          <form onSubmit={handleFetchManifest} className="space-y-3 bg-white p-4 rounded border border-gray-300 shadow-xs shrink-0">
            <label className="block text-xs font-bold text-[#002B49] uppercase">Número do Romaneio / Carga:</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={manifestCodeInput}
                onChange={(e) => setManifestCodeInput(e.target.value)}
                placeholder="Ex: 9867 ou ROM-9867"
                className="flex-1 bg-red-50/30 border border-red-400 px-3 py-1.5 rounded font-mono text-xs font-bold text-blue-900 focus:ring-1 focus:ring-blue-800 focus:outline-none shadow-inner"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#002B49] hover:bg-blue-900 text-white font-bold px-4 py-1.5 rounded text-xs flex items-center justify-center shadow transition cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Abrir'}
              </button>
            </div>
          </form>
        ) : (
          /* OPERAÇÃO DE BIPAGEM COM SCROLL EXCLUSIVO NOS ITENS */
          <div className="flex-1 flex flex-col min-h-0 space-y-3 overflow-hidden">
            
            {/* INFORMAÇÕES DO ROMANEIO ATIVO */}
            <div className="bg-white p-3 rounded border border-gray-300 flex justify-between items-center font-mono shadow-xs shrink-0">
              <div>
                <span className="text-[10px] text-gray-500 font-bold block">ROMANEIO ATIVO</span>
                <span className="text-sm font-bold text-blue-900">{activeManifest}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 font-bold block">TOTAL ITENS</span>
                <span className="text-sm font-bold text-gray-800">{items.length}</span>
              </div>
            </div>

            {/* CAMPO DE LEITURA DO SCANNER ZEBRA */}
            <form onSubmit={handleBarcodeSubmit} className="space-y-1 shrink-0">
              <label className="block text-[11px] font-bold text-gray-700 uppercase">Aguardando leitura de EAN/Material:</label>
              <div className="relative">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeScan}
                  onChange={(e) => setBarcodeScan(e.target.value)}
                  placeholder="Bipe o código com a Zebra..."
                  className="w-full bg-white border-2 border-emerald-600 px-3 py-2 rounded text-xs font-mono font-bold text-emerald-900 focus:outline-none shadow-inner"
                />
                <QrCode className="w-4 h-4 text-emerald-600 absolute right-3 top-2.5" />
              </div>
            </form>

            {/* LISTA DE ITENS COM SCROLL INTERNO INDEPENDENTE */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
              {items.map((item, idx) => {
                const isComplete = item.scannedQty >= item.expectedQty;
                return (
                  <div 
                    key={idx} 
                    className={`p-3 rounded border transition shadow-xs ${
                      isComplete ? 'bg-emerald-50/70 border-emerald-300' : 'bg-white border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-xs font-bold text-blue-900">{item.materialCode}</span>
                      <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200 font-mono">
                        NF: {item.nfNumber}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 font-medium line-clamp-1 mb-2">{item.description}</p>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs font-mono">
                      <span className="text-gray-600">Qtd Nota: <strong className="text-gray-900">{item.expectedQty}</strong></span>
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        isComplete ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-amber-800 border border-amber-300'
                      }`}>
                        Bipado: {item.scannedQty} / {item.expectedQty}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* 3. RODAPÉ FIXO NA BASE DA COLETORA */}
      {activeManifest && (
        <div className="p-3 bg-white border-t border-gray-300 shadow-lg shrink-0">
          <button
            onClick={handleFinishScan}
            disabled={loading}
            className="w-full bg-[#002B49] hover:bg-blue-900 text-white font-bold py-2.5 rounded text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow transition cursor-pointer"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Salvar Conferência na Coletora</span>
          </button>
        </div>
      )}

    </div>
  );
}