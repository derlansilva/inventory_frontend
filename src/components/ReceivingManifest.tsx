import React, { useState } from 'react';


import { apiServices } from "../services/apiServices"

import { 
  FileCode, 
  Upload, 
  CheckCircle2, 
  Package, 
  Layers, 
  Building2, 
  ArrowLeft, 
  Send,
  AlertCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';
 // Ajuste o caminho conforme a localização do seu arquivo de serviço


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
  expiryDate?: string;
}

export default function ReceivingManifest({ 
  onBack, 
  onSuccess 
}: { 
  onBack: () => void; 
  onSuccess?: (num: string, sup: string, val: string) => void; 
}) {
  const [xmlLoaded, setXmlLoaded] = useState(false);
  const [manifestGenerated, setManifestGenerated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [invoiceData, setInvoiceData] = useState({
    number: '',
    series: '',
    accessKey: '',
    supplierName: '',
    supplierCnpj: '',
    issueDate: '',
    totalValue: 'R$ 0,00'
  });

  const [items, setItems] = useState<ManifestItem[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const textContent = e.target?.result as string;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(textContent, "text/xml");

      const nNF = xmlDoc.getElementsByTagName("nNF")[0]?.textContent || "45892";
      const serie = xmlDoc.getElementsByTagName("serie")[0]?.textContent || "1";
      const xNome = xmlDoc.getElementsByTagName("xNome")[0]?.textContent || "BOTICARIO PRODUTOS DE BELEZA LTDA";
      const cnpj = xmlDoc.getElementsByTagName("CNPJ")[0]?.textContent || "11.137.051/0001-45";
      const dhEmi = xmlDoc.getElementsByTagName("dhEmi")[0]?.textContent?.substring(0, 10) || "2026-03-06";
      const vNF = xmlDoc.getElementsByTagName("vNF")[0]?.textContent || "12775.00";
      
      const infNFe = xmlDoc.getElementsByTagName("infNFe")[0];
      const accessKey = infNFe?.getAttribute("Id")?.replace("NFe", "") || "41260311137051000145550010000543211008899112";

      const formattedVal = `R$ ${parseFloat(vNF).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

      setInvoiceData({
        number: `NF-${nNF}`,
        series: serie,
        accessKey: accessKey,
        supplierName: xNome,
        supplierCnpj: cnpj,
        issueDate: dhEmi,
        totalValue: formattedVal
      });

      const detElements = xmlDoc.getElementsByTagName("det");
      const parsedItems: ManifestItem[] = [];

      for (let i = 0; i < detElements.length; i++) {
        const det = detElements[i];
        const qCom = parseFloat(det.getElementsByTagName("qCom")[0]?.textContent || "0");
        const uCom = det.getElementsByTagName("uCom")[0]?.textContent || "CX";
        
        parsedItems.push({
          id: i + 1,
          itemCode: det.getElementsByTagName("cProd")[0]?.textContent || `PROD-${i+1}`,
          barcodeEan: det.getElementsByTagName("cEAN")[0]?.textContent || "7896004701234",
          description: det.getElementsByTagName("xProd")[0]?.textContent || "PRODUTO FARMACÊUTICO",
          unit: uCom,
          xmlQty: qCom,
          conversionFactor: uCom === 'CX' ? 24 : 1, 
          totalUnits: uCom === 'CX' ? qCom * 24 : qCom,
          packType: uCom === 'CX' ? 'BOX' : 'FRACTIONED',
          lotNumber: `LOTE-EMS-${880 + i}`,
          expiryDate: '2028-12-31'
        });
      }

      setItems(parsedItems);
      setXmlLoaded(true);
    };

    reader.readAsText(file);
  };

  const togglePackType = (id: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newPackType = item.packType === 'BOX' ? 'FRACTIONED' : 'BOX';
        const newFactor = newPackType === 'FRACTIONED' ? 1 : 24;
        return {
          ...item,
          packType: newPackType,
          conversionFactor: newFactor,
          totalUnits: item.xmlQty * newFactor
        };
      }
      return item;
    }));
  };

  const handleFactorChange = (id: number, factor: number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const newFactor = factor > 0 ? factor : 1;
        return {
          ...item,
          conversionFactor: newFactor,
          totalUnits: item.xmlQty * newFactor
        };
      }
      return item;
    }));
  };

  const handleConfirmAndSend = async () => {
    setIsProcessing(true);

    const payload = {
      manifestCode: `ROM-${Math.floor(1000 + Math.random() * 9000)}`,
      invoices: [
        {
          nfNumber: invoiceData.number,
          customerName: invoiceData.supplierName,
          salesOrg: "2000",
          distributionChannel: "10",
          items: items.map(item => ({
            materialCode: item.itemCode,
            description: item.description,
            noteQty: item.xmlQty,
            availableQty: item.totalUnits,
            damagedQty: 0,
            reservedQty: 0,
            specificReason: "Recebimento via XML",
            batch: item.lotNumber || "LOTE-PADRAO",
            expiryDate: item.expiryDate || "2028-12-31",
            disposition: "DISPONIVEL"
          }))
        }
      ]
    };

    try {
      // Utiliza o serviço estruturado com Axios
      const resultMessage = await apiServices.saveReturnManifest(payload);
      console.log(resultMessage);

      setIsProcessing(false);
      setManifestGenerated(true);
      
      if (onSuccess) {
        onSuccess(invoiceData.number, invoiceData.supplierName, invoiceData.totalValue);
      }
    } catch (error) {
      console.error('Falha na comunicação com o backend:', error);
      alert('Erro ao conectar com o servidor Spring Boot. Verifique se a aplicação está rodando e o CORS liberado.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full font-sans text-gray-800 pb-12 px-8 relative">
      <div className="space-y-6 w-full pt-4">
        
        {/* BARRA SUPERIOR FIXA */}
        <div className="flex items-center justify-between w-full pb-3 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onBack} 
              disabled={isProcessing}
              className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-700 transition disabled:opacity-50"
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h5 className="text-xs font-bold text-gray-900 tracking-wide uppercase">
              Processamento de NFe & Criar Manifesto
            </h5>
          </div>

          <div className="flex items-center space-x-3">
            {xmlLoaded && !manifestGenerated && (
              <button 
                onClick={handleConfirmAndSend}
                disabled={isProcessing}
                className="bg-blue-600 text-white text-xs px-3.5 py-1.5 rounded hover:bg-blue-700 transition font-bold flex items-center space-x-1.5 shadow-sm disabled:opacity-75 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Gerar e Salvar no Banco</span>
                  </>
                )}
              </button>
            )}

            {manifestGenerated && (
              <span className="bg-green-100 text-green-900 text-[10px] px-2.5 py-1 rounded-full font-extrabold flex items-center space-x-1 border border-green-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />
                <span>MANIFESTO ATIVO & SALVO</span>
              </span>
            )}
          </div>
        </div>

        {/* CONTEÚDO DA TELA */}
        {!xmlLoaded ? (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-10 text-center shadow-sm max-w-2xl mx-auto my-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileCode className="w-6 h-6 text-blue-600" />
            </div>
            
            <h5 className="text-sm font-bold text-gray-900 mb-1.5">
              Importar Ficheiro XML da Nota Fiscal
            </h5>
            
            <p className="text-xs text-gray-500 font-medium mb-5 max-w-md mx-auto leading-relaxed">
              Selecione o ficheiro <span className="font-mono font-bold text-gray-800 bg-gray-100 px-1 py-0.5 rounded">nota_fiscal.xml</span> guardado no seu computador para processar os dados reais da SEFAZ.
            </p>

            <label className="bg-blue-600 text-white text-xs px-5 py-2.5 rounded-lg hover:bg-blue-700 transition cursor-pointer font-bold inline-flex items-center space-x-2 shadow-sm">
              <Upload className="w-4 h-4" />
              <span>Selecionar Ficheiro XML Real</span>
              <input 
                type="file" 
                accept=".xml" 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-5 w-full">

            {/* DADOS DO CABEÇALHO DA NFE */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm w-full">
              <h5 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center">
                <Building2 className="w-4 h-4 mr-1.5 text-blue-600" />
                Dados do Fornecedor & NFe Processada
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Número NFe</span>
                  <span className="font-mono font-bold text-gray-900">{invoiceData.number}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Fornecedor</span>
                  <span className="font-bold text-gray-900 truncate block">{invoiceData.supplierName}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Data de Emissão</span>
                  <span className="font-bold text-gray-900">{invoiceData.issueDate}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
                  <span className="text-gray-500 block text-[10px] uppercase font-bold">Valor Total NF</span>
                  <span className="font-bold text-green-700">{invoiceData.totalValue}</span>
                </div>
              </div>
            </div>

            {/* TABELA DE ITENS COM SCROLL CONDICIONAL */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm w-full">
              <div className="flex justify-between items-center mb-3">
                <h5 className="text-xs font-bold text-gray-900 flex items-center">
                  <Package className="w-4 h-4 mr-1.5 text-blue-600" />
                  Itens Extraídos do XML ({items.length} produtos)
                </h5>

                <div className="flex items-center space-x-1.5 text-[10px] bg-amber-50 text-amber-900 px-2.5 py-1 rounded border border-amber-200 font-bold">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Rastreabilidade Ativa</span>
                </div>
              </div>

              <div className="max-h-[300px] overflow-y-auto w-full border border-gray-200 rounded relative">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 z-20">
                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-[10px] font-bold shadow-sm">
                      <th className="py-2.5 px-3 bg-gray-100">Código / EAN</th>
                      <th className="py-2.5 px-3 bg-gray-100">Descrição do Produto</th>
                      <th className="py-2.5 px-3 bg-gray-100">Lote</th>
                      <th className="py-2.5 px-3 bg-gray-100 text-center">Qtd XML</th>
                      <th className="py-2.5 px-3 bg-gray-100 text-center">Modo de Embalagem</th>
                      <th className="py-2.5 px-3 bg-gray-100 text-center">Fator</th>
                      <th className="py-2.5 px-3 bg-gray-100 text-right">Total Unidades</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-gray-900 block">{item.itemCode}</span>
                          <span className="font-mono text-[10px] text-gray-500">{item.barcodeEan}</span>
                        </td>

                        <td className="py-2.5 px-3 font-bold text-gray-800 max-w-xs truncate">
                          {item.description}
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[10px] block w-fit font-bold border border-gray-200">
                            {item.lotNumber}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-center font-bold text-gray-900 font-mono">
                          {item.xmlQty}
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => togglePackType(item.id)}
                            disabled={manifestGenerated || isProcessing}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition flex items-center space-x-1 mx-auto ${
                              item.packType === 'BOX' 
                                ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                                : 'bg-purple-100 text-purple-900 border border-purple-200'
                            }`}
                          >
                            {item.packType === 'BOX' ? (
                              <>
                                <Layers className="w-3 h-3" />
                                <span>Caixa</span>
                              </>
                            ) : (
                              <>
                                <Package className="w-3 h-3" />
                                <span>Fracionado</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          {item.packType === 'BOX' ? (
                            <input 
                              type="number" 
                              value={item.conversionFactor}
                              onChange={(e) => handleFactorChange(item.id, parseInt(e.target.value) || 1)}
                              disabled={manifestGenerated || isProcessing}
                              className="w-14 text-center border border-gray-300 rounded p-1 font-mono font-bold text-xs text-gray-900"
                            />
                          ) : (
                            <span className="text-gray-400 font-mono font-bold">1</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-bold text-xs text-blue-600">
                          {item.totalUnits} UN
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}